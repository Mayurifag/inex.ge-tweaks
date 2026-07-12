import { mergeOriginInfo, normalizeTransportType } from './origin.js';

const API_BASE = 'https://inex.ge/api/v1';
const CACHE_STORAGE_KEY = 'inex_enhanced_parcels_data_v9';
const EVENT_FETCH_CONCURRENCY = 6;
const ARRIVED_EVENT_TYPES = new Set(['DistributionInPickupLocation']);

export const DATA_TTL = 5 * 60_000;

export async function loadParcelData(cachedInfo, takeoutStatus) {
  const token =
    localStorage.getItem('accessToken') || sessionStorage.getItem('session_accessToken');
  if (!token) return null;

  const tokenType =
    localStorage.getItem('tokenType') || sessionStorage.getItem('session_tokenType') || 'Bearer';
  const headers = { Authorization: `${tokenType} ${token}`, 'Accept-Language': 'en' };
  const list = await fetchJson(`${API_BASE}/front/cabinet/parcels?perPage=100`, { headers });
  const parcels = flattenParcels(list);
  const activeParcels = parcels.filter((parcel) => parcel.status !== Number(takeoutStatus));

  await mapWithConcurrency(activeParcels, EVENT_FETCH_CONCURRENCY, async (parcel) => {
    const cached = cachedInfo.get(parcel.tracking);
    try {
      const events = await fetchParcelEvents(parcel.id, headers);
      parcel.latestEvent = events.latestEvent;
      parcel.eventCount = events.eventCount;
    } catch {
      parcel.latestEvent = cached?.latestEvent || null;
      parcel.eventCount = cached?.eventCount || 0;
    }
  });

  return new Map(
    parcels.map((parcel) => {
      const next = {
        ...parcel,
        arrived: isArrivedParcel(parcel),
        previewStatusText: getEventLabel(parcel.latestEvent),
        processText: getProcessText(parcel),
      };
      return [parcel.tracking, next];
    }),
  );
}

export function readParcelDataCache() {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_STORAGE_KEY));
    if (!cache?.fetchedAt || !Array.isArray(cache.parcels)) return null;

    return {
      fetchedAt: cache.fetchedAt,
      info: new Map(cache.parcels.map((parcel) => [parcel.tracking, parcel])),
    };
  } catch {
    return null;
  }
}

export function writeParcelDataCache(info) {
  try {
    localStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify({ fetchedAt: Date.now(), parcels: [...info.values()] }),
    );
  } catch {
    return;
  }
}

export function clearParcelDataCache() {
  localStorage.removeItem(CACHE_STORAGE_KEY);
}

export function parseDate(value) {
  if (!value) return null;

  const normalized = /^\d{4}-\d{2}-\d{2} /.test(value) ? value.replace(' ', 'T') : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

async function mapWithConcurrency(items, limit, callback) {
  let index = 0;

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (index < items.length) {
        const currentIndex = index++;
        await callback(items[currentIndex]);
      }
    }),
  );
}

function flattenParcels(list) {
  const parcels = [];

  for (const flight of list?.data || []) {
    const expectedArrival = flight.attributes?.expectedArrivedDate;
    const flightOrigin = getOriginInfo(flight);
    for (const locationType of ['deliveryLocations', 'locations']) {
      for (const location of flight.relationships?.[locationType]?.data || []) {
        const locationOrigin = getOriginInfo(location);
        for (const customer of location.relationships?.customers?.data || []) {
          for (const parcel of customer.relationships?.parcels?.data || []) {
            const parcelOrigin = getOriginInfo(parcel);

            parcels.push({
              id: parcel.id,
              status: Number(parcel.attributes?.status),
              tracking: parcel.relationships?.parcelTrackings?.data?.[0]?.attributes?.tracking,
              description: getParcelDescription(parcel.attributes),
              expectedArrival,
              origin: mergeOriginInfo(parcelOrigin, locationOrigin, flightOrigin),
            });
          }
        }
      }
    }
  }

  return parcels.filter((parcel) => parcel.tracking);
}

function getParcelDescription(attributes) {
  for (const key of ['description', 'comment', 'title', 'name', 'itemDescription', 'productName']) {
    const value = attributes?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return '';
}

function getOriginInfo(item) {
  return mergeOriginInfo(getCountryInfo(item?.attributes), getTransportInfo(item?.attributes));
}

function getCountryInfo(attributes) {
  const countryCode = getShipmentRouteCountry(attributes?.name);
  if (!countryCode) return {};

  return { countryCode, countryName: getCountryName(countryCode) };
}

function getShipmentRouteCountry(name) {
  const routeCode = String(name || '').match(/^([A-Z]{2})(?:-|$)/)?.[1];
  const countries = {
    CH: 'CN',
    CN: 'CN',
    GR: 'GR',
    TK: 'TR',
    TR: 'TR',
    US: 'US',
  };

  return countries[routeCode] || '';
}

function getCountryName(countryCode) {
  const countries = {
    CN: 'China',
    GR: 'Greece',
    TR: 'Turkey',
    US: 'USA',
  };

  return countries[countryCode] || '';
}

function getTransportInfo(attributes) {
  const transportType = normalizeTransportType(attributes?.shipmentType);
  if (!transportType) return {};

  const names = { air: 'Air', road: 'Road', sea: 'Sea' };
  return { transportType, transportName: names[transportType] };
}

async function fetchParcelEvents(parcelId, headers) {
  const events = await fetchJson(`${API_BASE}/front/cabinet/parcels/${parcelId}/events`, {
    headers,
  });
  const event = events?.data?.[0];
  if (!event) return { latestEvent: null, eventCount: 0 };

  return {
    latestEvent: {
      name: event.relationships?.logisticEvent?.data?.attributes?.name,
      type: event.relationships?.logisticEvent?.data?.attributes?.type,
      date: event.attributes?.eventHappenedAt,
    },
    eventCount: events.data.length,
  };
}

function getProcessText(parcel) {
  const parts = [];
  const eventDate = formatDateTime(parcel.latestEvent?.date);
  const eta = formatDate(parcel.expectedArrival);

  if (eventDate) parts.push(eventDate);
  if (eta) parts.push(`ETA ${eta}`);

  return parts.join(' · ');
}

function isArrivedParcel(parcel) {
  if (!parcel.eventCount) return false;
  return ARRIVED_EVENT_TYPES.has(parcel.latestEvent?.type || parcel.latestEvent?.name);
}

function getEventLabel(event) {
  const type = event?.type || event?.name;
  const labels = {
    Received: 'Warehouse',
    Departure: 'In transit',
    Sent: 'Sent',
    Landed: 'Landed',
    DestinationTerminalProcessStarted: 'Terminal',
    DestinationTerminalProcessFinished: 'Terminal done',
    DestinationClearanceStarted: 'Customs',
    DestinationClearanceFinished: 'Customs done',
    DistributionInHub: 'Hub',
    DistributionInPickupLocation: 'Pickup soon',
  };

  return labels[type] || event?.name?.replace(/ Process /g, ' ') || '';
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return '';

  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(date);
}

function formatDateTime(value) {
  const date = parseDate(value);
  if (!date) return '';

  const dayLabel = formatRelativeDay(date);
  const time = new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
  }).format(date);

  return `${dayLabel}, ${time}`;
}

function formatRelativeDay(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - day.getTime()) / 86_400_000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}
