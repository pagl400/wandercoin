export type CurrencyCode = string;

export type RateMap = Record<CurrencyCode, number>;

export interface LatestRate {
  date: string;
  base: CurrencyCode;
  rates: RateMap;
}

export type Currencies = Record<CurrencyCode, string>;

export type TimeSeriesPoint = { date: string; rate: number };
export type TimeSeries = TimeSeriesPoint[];
