import { useEffect, useState } from 'react';

import { LATEST_TTL_MS } from '../constants';
import { getCached, getStale } from '../services/cache';
import { fetchLatest } from '../services/frankfurterApi';
import type { LatestRate } from '../types/currency';

interface LatestRateState {
  data: LatestRate | null;
  error: string | null;
  loading: boolean;
  stale: boolean;
}

export function useLatestRate(from: string, to: string): LatestRateState {
  const [state, setState] = useState<LatestRateState>({
    data: null,
    error: null,
    loading: true,
    stale: false,
  });

  useEffect(() => {
    let cancelled = false;

    if (from === to) {
      setState({
        data: {
          date: new Date().toISOString().slice(0, 10),
          base: from,
          rates: { [to]: 1 },
        },
        error: null,
        loading: false,
        stale: false,
      });
      return () => {
        cancelled = true;
      };
    }

    const cacheKey = `latest:${from}:${to}`;
    setState((s) => ({ ...s, loading: true, error: null }));
    void (async () => {
      try {
        const data = await getCached(cacheKey, LATEST_TTL_MS, () => fetchLatest(from, [to]));
        if (!cancelled) setState({ data, error: null, loading: false, stale: false });
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        const stale = await getStale<LatestRate>(cacheKey);
        if (cancelled) return;
        if (stale !== null) {
          setState({ data: stale, error: msg, loading: false, stale: true });
        } else {
          setState({ data: null, error: msg, loading: false, stale: false });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [from, to]);

  return state;
}
