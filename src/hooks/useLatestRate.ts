import { useEffect, useState } from 'react';

import { LATEST_TTL_MS } from '../constants';
import { getCached } from '../services/cache';
import { fetchLatest } from '../services/frankfurterApi';
import type { LatestRate } from '../types/currency';

interface LatestRateState {
  data: LatestRate | null;
  error: string | null;
  loading: boolean;
}

export function useLatestRate(from: string, to: string): LatestRateState {
  const [state, setState] = useState<LatestRateState>({
    data: null,
    error: null,
    loading: true,
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
      });
      return () => {
        cancelled = true;
      };
    }

    setState((s) => ({ ...s, loading: true, error: null }));
    void (async () => {
      try {
        const data = await getCached(`latest:${from}:${to}`, LATEST_TTL_MS, () =>
          fetchLatest(from, [to]),
        );
        if (!cancelled) setState({ data, error: null, loading: false });
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          setState({ data: null, error: msg, loading: false });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [from, to]);

  return state;
}
