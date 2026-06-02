const ROOT_CLASS = 'inex-address-page';
const OBSERVED_ATTRIBUTES = ['class', 'style', 'hidden', 'aria-selected', 'data-state'];
const TARIFFS_URL = '/api/v1/front/tariffs/1/list/1/countries';

let observer;
let addressTimer;
let historyPatched = false;
let tariffsPromise;
let tariffsByCountry = new Map();
let tariffsLoaded = false;

export function applyAddressPage() {
  patchHistory();
  updateAddressPage();
  onReady(() => {
    observeDom();
    updateAddressPage();
  });
  window.addEventListener('popstate', updateAddressPage);
}

function onReady(callback) {
  if (document.body) {
    callback();
    return;
  }

  document.addEventListener('DOMContentLoaded', callback, { once: true });
}

function isAddressesPath() {
  return /^\/(?:en|ka|ru)\/profile\/(?:addresses|foreign-addresses)\/?$/.test(
    window.location.pathname,
  );
}

function updateAddressPage() {
  const active = isAddressesPath();

  document.documentElement.classList.toggle(ROOT_CLASS, active);
  document.body?.classList.toggle(ROOT_CLASS, active);

  if (active) scheduleEnhanceAddresses();
}

function observeDom() {
  if (observer || !document.body) return;

  observer = new MutationObserver(scheduleEnhanceAddresses);
  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    attributeFilter: OBSERVED_ATTRIBUTES,
  });
}

function patchHistory() {
  if (historyPatched) return;

  historyPatched = true;
  for (const method of ['pushState', 'replaceState']) {
    const original = window.history[method];
    window.history[method] = function patchedAddressHistoryMethod(...args) {
      const result = original.apply(this, args);
      window.dispatchEvent(new Event('inex-address-location-change'));
      return result;
    };
  }

  window.addEventListener('inex-address-location-change', updateAddressPage);
}

function scheduleEnhanceAddresses() {
  if (!document.documentElement.classList.contains(ROOT_CLASS) || addressTimer) return;

  addressTimer = requestAnimationFrame(() => {
    addressTimer = undefined;
    enhanceAddresses();
  });
}

function enhanceAddresses() {
  ensureTariffs();

  for (const tab of document.querySelectorAll('[class*="border-b-2"][class*="cursor-pointer"]')) {
    const countryCode = getTabCountryCode(tab);

    tab.classList.add('inex-address-tab');
    tab.classList.toggle('inex-address-tab--active', isActiveTab(tab));
    if (countryCode) tab.dataset.inexCountry = countryCode;
    updatePriceLine(tab, tariffsByCountry.get(countryCode));
  }
}

function isActiveTab(tab) {
  return (
    tab.getAttribute('aria-selected') === 'true' ||
    tab.classList.contains('text-secondary-base') ||
    tab.classList.contains('border-b-secondary-base')
  );
}

function getTabCountryCode(tab) {
  return (
    tab.querySelector('img[src*="/country-flags/"]')?.src.match(/\/([A-Z]{2})\.svg$/)?.[1] || ''
  );
}

function updatePriceLine(tab, prices) {
  ensureLabel(tab);

  let priceLine = tab.querySelector(':scope > .inex-address-tab-price');
  if (!prices) {
    priceLine?.remove();
    return;
  }

  if (!priceLine) {
    priceLine = document.createElement('span');
    priceLine.className = 'inex-address-tab-price';
    tab.append(priceLine);
  }

  priceLine.textContent = prices;
}

function ensureLabel(tab) {
  if (tab.querySelector(':scope > .inex-address-tab-label')) return;

  const textNode = [...tab.childNodes].find(
    (node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim(),
  );
  if (!textNode) return;

  const label = document.createElement('span');
  label.className = 'inex-address-tab-label';
  label.textContent = textNode.nodeValue.trim();
  textNode.replaceWith(label);
}

function ensureTariffs() {
  if (tariffsLoaded || tariffsPromise) return;

  tariffsPromise = fetch(TARIFFS_URL, { headers: getTariffHeaders() })
    .then((response) => (response.ok ? response.json() : null))
    .then((payload) => {
      tariffsByCountry = parseTariffs(payload);
      tariffsLoaded = true;
      requestAnimationFrame(enhanceAddresses);
    })
    .catch(() => {
      tariffsLoaded = true;
    })
    .finally(() => {
      tariffsPromise = undefined;
    });
}

function getTariffHeaders() {
  const token =
    localStorage.getItem('accessToken') || sessionStorage.getItem('session_accessToken');
  const tokenType =
    localStorage.getItem('tokenType') || sessionStorage.getItem('session_tokenType') || 'Bearer';
  return token ? { Authorization: `${tokenType} ${token}`, 'Accept-Language': 'ka' } : {};
}

function parseTariffs(payload) {
  return new Map(
    (payload?.data || [])
      .map((country) => [
        country.attributes?.code,
        formatTariff(country.relationships?.shipmentTypes?.data || []),
      ])
      .filter(([countryCode, tariff]) => countryCode && tariff),
  );
}

function formatTariff(shipmentTypes) {
  return shipmentTypes
    .map((shipmentType) => {
      const type = shipmentType.attributes?.shipmentType;
      const range = shipmentType.relationships?.ranges?.data?.[0]?.attributes;
      const currency = shipmentType.relationships?.currency?.data?.attributes?.currencySymbol || '';
      const icon = type === 1 ? '✈️' : type === 4 ? '🚐' : '';
      if (!icon || !range?.tariff) return '';

      return `${icon} ${formatAmount(range.tariff)}${currency}`;
    })
    .filter(Boolean)
    .join(' / ');
}

function formatAmount(value) {
  return Number(value).toLocaleString('en', { maximumFractionDigits: 2 });
}
