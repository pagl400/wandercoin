import { useEffect, useState } from 'react';

import { getMergedTimeSeries } from '../services/timeSeriesCache';
import type { TimeSeries } from '../types/currency';
import type { TimeRange } from '../utils/dates';
import { rangeFor } from '../utils/dates';

interface TimeSeriesState {
  data: TimeSeries;
  error: string | null;
  loading: boolean;
}

export function useTimeSeries(from: string, to: string, range: TimeRange): TimeSeriesState {
  const [state, setState] = useState<TimeSeriesState>({
    data: [],
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    void (async () => {
      try {
        const { start, end } = rangeFor(range);
        const data = await getMergedTimeSeries(from, to, start, end);
        if (!cancelled) setState({ data, error: null, loading: false });
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          setState({ data: [], error: msg, loading: false });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [from, to, range]);

  return state;
}
