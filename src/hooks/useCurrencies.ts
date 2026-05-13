import { useEffect, useState } from 'react';

import { CURRENCIES_TTL_MS } from '../constants';
import { getCached } from '../services/cache';
import { fetchCurrencies } from '../services/frankfurterApi';
import type { Currencies } from '../types/currency';

interface CurrenciesState {
  data: Currencies | null;
  error: string | null;
  loading: boolean;
}

export function useCurrencies(): CurrenciesState {
  const [state, setState] = useState<CurrenciesState>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await getCached('currencies', CURRENCIES_TTL_MS, fetchCurrencies);
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
  }, []);

  return state;
}
