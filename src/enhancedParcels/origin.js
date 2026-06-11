export function mergeOriginInfo(...items) {
  const origin = {};

  for (const item of items) {
    origin.countryCode ||= item?.countryCode || '';
    origin.countryName ||= item?.countryName || '';
    origin.transportName ||= item?.transportName || '';
    origin.transportType ||= item?.transportType || '';
  }

  return origin;
}

export function mergeCountryInfo(...items) {
  const origin = {};

  for (const item of items) {
    origin.countryCode ||= item?.countryCode || '';
    origin.countryName ||= item?.countryName || '';
  }

  return origin;
}

export function hasOriginInfo(origin) {
  return Boolean(
    origin?.countryCode || origin?.countryName || origin?.transportName || origin?.transportType,
  );
}

export function getOriginLabel(origin) {
  const flag = getCountryFlag(origin);
  const transport = getTransportEmoji(getOriginTransportType(origin));
  if (flag || transport) return [flag, transport].filter(Boolean).join(' ');

  const labels = { air: 'Air', road: 'Road', sea: 'Sea' };
  return labels[getOriginTransportType(origin)] || origin.transportName || '';
}

export function getOriginTransportType(origin) {
  const transportType = normalizeTransportType(origin?.transportType);
  if (transportType) return transportType;

  const transportName = origin?.transportName || '';
  if (/air|flight|plane/i.test(transportName)) return 'air';
  if (/road|ground|land|truck|car/i.test(transportName)) return 'road';
  if (/sea|ocean|ship/i.test(transportName)) return 'sea';

  return '';
}

export function normalizeTransportType(value) {
  const types = { 1: 'air', 4: 'road', air: 'air', road: 'road', sea: 'sea' };
  const key = String(value || '')
    .trim()
    .toLowerCase();
  return types[key] || '';
}

export function getOriginTooltip(origin) {
  return [origin.countryName, origin.transportName].filter(Boolean).join(' · ');
}

function getTransportEmoji(transportType) {
  const icons = { air: '✈️', road: '🚚', sea: '🚢' };
  return icons[transportType] || '';
}

function getCountryFlag(origin) {
  const code = getFlagCountryCode(origin?.countryCode || getCountryCodeByName(origin?.countryName));
  if (!/^[A-Z]{2}$/.test(code)) return '';

  return [...code]
    .map((letter) => String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65))
    .join('');
}

function getFlagCountryCode(code) {
  if (!code) return '';

  const normalized = code.trim().toUpperCase();
  return normalized === 'UK' ? 'GB' : normalized;
}

function getCountryCodeByName(countryName) {
  const countries = {
    USA: 'US',
    'United States': 'US',
    'United Kingdom': 'GB',
    China: 'CN',
    Turkey: 'TR',
    Germany: 'DE',
    Greece: 'GR',
    Italy: 'IT',
    Spain: 'ES',
    Poland: 'PL',
    Cyprus: 'CY',
    Georgia: 'GE',
  };

  return countries[countryName] || '';
}
