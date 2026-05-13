export const FRANKFURTER_BASE = 'https://api.frankfurter.dev/v1';

export const LATEST_TTL_MS = 60 * 60 * 1000;
export const CURRENCIES_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const TIMESERIES_TTL_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_FROM = 'EUR';
export const DEFAULT_TO = 'USD';
export const DEFAULT_AMOUNT = '100';
export const DEFAULT_FAVORITES = ['EUR', 'USD', 'GBP', 'JPY', 'CHF'] as const;
export const DEFAULT_DECIMALS = 2 as const;
