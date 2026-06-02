export const COUNTRY_NAMES = {
  US: 'USA',
  UK: 'United Kingdom',
  GB: 'United Kingdom',
  CN: 'China',
  TR: 'Turkey',
  DE: 'Germany',
  GR: 'Greece',
  IT: 'Italy',
  ES: 'Spain',
  PL: 'Poland',
  CY: 'Cyprus',
  GE: 'Georgia',
};

export const COUNTRY_PATTERNS = [
  ['US', /(?:^|[^a-z])(?:us|usa)(?:$|[^a-z])|america|united states|აშშ|ამერიკა|сша|америк/i],
  ['UK', /(?:^|[^a-z])(?:uk|gb)(?:$|[^a-z])|britain|united kingdom|დიდი ბრიტანეთი|британ/i],
  ['CN', /(?:^|[^a-z])cn(?:$|[^a-z])|china|ჩინეთი|китай/i],
  ['TR', /(?:^|[^a-z])tr(?:$|[^a-z])|turkey|თურქეთი|турци/i],
  ['DE', /(?:^|[^a-z])de(?:$|[^a-z])|germany|გერმანია|герман/i],
  ['GR', /(?:^|[^a-z])gr(?:$|[^a-z])|greece|საბერძნეთი|греци/i],
  ['IT', /(?:^|[^a-z])it(?:$|[^a-z])|italy|იტალია|итали/i],
  ['ES', /(?:^|[^a-z])es(?:$|[^a-z])|spain|ესპანეთი|испан/i],
  ['PL', /(?:^|[^a-z])pl(?:$|[^a-z])|poland|პოლონეთი|польш/i],
  ['CY', /(?:^|[^a-z])cy(?:$|[^a-z])|cyprus|კვიპროსი|кипр/i],
  ['GE', /(?:^|[^a-z])ge(?:$|[^a-z])|georgia|საქართველო|грузи/i],
];

export function getCountryFromText(text) {
  for (const [code, pattern] of COUNTRY_PATTERNS) {
    if (pattern.test(text)) return code;
  }

  return '';
}

export function getCountryName(countryCode) {
  return COUNTRY_NAMES[countryCode] || '';
}
