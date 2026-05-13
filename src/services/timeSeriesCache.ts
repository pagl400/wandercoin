import type { TimeSeries } from '../types/currency';
import { dayAfter, dayBefore } from '../utils/dates';

import { getRaw, setRaw } from './cache';
import { fetchTimeSeries } from './frankfurterApi';

interface TimeSeriesBucket {
  points: Record<string, number>;
  minDate: string | null;
  maxDate: string | null;
  lastRecentFetchAt: number;
}

const RECENT_THROTTLE_MS = 60 * 60 * 1000;

const emptyBucket = (): TimeSeriesBucket => ({
  points: {},
  minDate: null,
  maxDate: null,
  lastRecentFetchAt: 0,
});

function bucketKey(from: string, to: string): string {
  return `ts:${from}:${to}`;
}

function mergeSeries(bucket: TimeSeriesBucket, series: TimeSeries): void {
  for (const pt of series) {
    bucket.points[pt.date] = pt.rate;
  }
  if (series.length === 0) return;
  const minNew = series[0].date;
  const maxNew = series[series.length - 1].date;
  bucket.minDate =
    bucket.minDate === null || minNew < bucket.minDate ? minNew : bucket.minDate;
  bucket.maxDate =
    bucket.maxDate === null || maxNew > bucket.maxDate ? maxNew : bucket.maxDate;
}

export async function getMergedTimeSeries(
  from: string,
  to: string,
  start: string,
  end: string,
): Promise<TimeSeries> {
  if (from === to) {
    return [
      { date: start, rate: 1 },
      { date: end, rate: 1 },
    ];
  }

  const key = bucketKey(from, to);
  const bucket = (await getRaw<TimeSeriesBucket>(key)) ?? emptyBucket();

  const fetches: { s: string; e: string; isRecent: boolean }[] = [];

  if (bucket.minDate === null || bucket.maxDate === null) {
    fetches.push({ s: start, e: end, isRecent: true });
  } else {
    if (start < bucket.minDate) {
      fetches.push({ s: start, e: dayBefore(bucket.minDate), isRecent: false });
    }
    if (end > bucket.maxDate) {
      const throttled = Date.now() - bucket.lastRecentFetchAt < RECENT_THROTTLE_MS;
      if (!throttled) {
        fetches.push({ s: dayAfter(bucket.maxDate), e: end, isRecent: true });
      }
    }
  }

  let touched = false;
  let lastError: unknown = null;

  for (const { s, e, isRecent } of fetches) {
    if (s > e) continue;
    try {
      const series = await fetchTimeSeries(from, to, s, e);
      mergeSeries(bucket, series);
      if (isRecent) bucket.lastRecentFetchAt = Date.now();
      touched = true;
    } catch (err) {
      lastError = err;
    }
  }

  if (touched) {
    await setRaw(key, bucket);
  }

  const cached = Object.entries(bucket.points)
    .filter(([d]) => d >= start && d <= end)
    .map(([date, rate]) => ({ date, rate }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  if (cached.length === 0 && lastError !== null) {
    throw lastError;
  }

  return cached;
}
