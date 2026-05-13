import { FRANKFURTER_BASE } from '../constants';
import type { Currencies, LatestRate, RateMap, TimeSeries } from '../types/currency';

export class FrankfurterError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'FrankfurterError';
    this.cause = cause;
  }
}

async function request<T>(path: string, label: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${FRANKFURTER_BASE}${path}`);
  } catch (e) {
    throw new FrankfurterError(`Network error: ${label}`, e);
  }
  if (!res.ok) {
    throw new FrankfurterError(`HTTP ${res.status}: ${label}`);
  }
  try {
    return (await res.json()) as T;
  } catch (e) {
    throw new FrankfurterError(`Invalid JSON: ${label}`, e);
  }
}

export async function fetchLatest(from: string, to: string[]): Promise<LatestRate> {
  const path = `/latest?from=${from}&to=${to.join(',')}`;
  const data = await request<{ date: string; base: string; rates: RateMap }>(path, 'latest');
  return { date: data.date, base: data.base, rates: data.rates };
}

export async function fetchCurrencies(): Promise<Currencies> {
  return request<Currencies>('/currencies', 'currencies');
}

export async function fetchTimeSeries(
  from: string,
  to: string,
  start: string,
  end: string,
): Promise<TimeSeries> {
  const path = `/${start}..${end}?from=${from}&to=${to}`;
  const data = await request<{ rates: Record<string, RateMap> }>(path, 'timeseries');
  return Object.entries(data.rates)
    .map(([date, rates]) => ({ date, rate: rates[to] }))
    .filter((p): p is { date: string; rate: number } => typeof p.rate === 'number')
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}
