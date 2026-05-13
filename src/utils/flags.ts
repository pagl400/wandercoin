const COUNTRY_BY_CURRENCY: Record<string, string> = {
  AUD: 'AU',
  BGN: 'BG',
  BRL: 'BR',
  CAD: 'CA',
  CHF: 'CH',
  CNY: 'CN',
  CZK: 'CZ',
  DKK: 'DK',
  EUR: 'EU',
  GBP: 'GB',
  HKD: 'HK',
  HUF: 'HU',
  IDR: 'ID',
  ILS: 'IL',
  INR: 'IN',
  ISK: 'IS',
  JPY: 'JP',
  KRW: 'KR',
  MXN: 'MX',
  MYR: 'MY',
  NOK: 'NO',
  NZD: 'NZ',
  PHP: 'PH',
  PLN: 'PL',
  RON: 'RO',
  SEK: 'SE',
  SGD: 'SG',
  THB: 'TH',
  TRY: 'TR',
  USD: 'US',
  ZAR: 'ZA',
};

const REGIONAL_INDICATOR_OFFSET = 0x1f1e6 - 'A'.charCodeAt(0);

function countryToFlag(country: string): string {
  if (country.length !== 2) return '🏳️';
  return country
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET))
    .join('');
}

export function currencyToFlag(code: string): string {
  const country = COUNTRY_BY_CURRENCY[code] ?? code.slice(0, 2);
  return countryToFlag(country);
}
