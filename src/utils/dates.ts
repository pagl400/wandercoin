import { addDays, format, parseISO, subDays, subMonths, subYears } from 'date-fns';

export type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';

export const TIME_RANGES: readonly TimeRange[] = ['1W', '1M', '3M', '6M', '1Y', '5Y'] as const;

export function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function rangeFor(range: TimeRange, now: Date = new Date()): { start: string; end: string } {
  const end = isoDate(now);
  let start: string;
  switch (range) {
    case '1W':
      start = isoDate(subDays(now, 7));
      break;
    case '1M':
      start = isoDate(subMonths(now, 1));
      break;
    case '3M':
      start = isoDate(subMonths(now, 3));
      break;
    case '6M':
      start = isoDate(subMonths(now, 6));
      break;
    case '1Y':
      start = isoDate(subYears(now, 1));
      break;
    case '5Y':
      start = isoDate(subYears(now, 5));
      break;
  }
  return { start, end };
}

export function dayAfter(iso: string): string {
  return isoDate(addDays(parseISO(iso), 1));
}

export function dayBefore(iso: string): string {
  return isoDate(addDays(parseISO(iso), -1));
}
