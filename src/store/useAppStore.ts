import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  DEFAULT_AMOUNT,
  DEFAULT_DECIMALS,
  DEFAULT_FAVORITES,
  DEFAULT_FROM,
  DEFAULT_TO,
} from '../constants';

export type Theme = 'system' | 'light' | 'dark';
export type Decimals = 0 | 2 | 4;

interface AppState {
  from: string;
  to: string;
  amount: string;
  favorites: string[];
  theme: Theme;
  decimals: Decimals;

  setFrom: (c: string) => void;
  setTo: (c: string) => void;
  setAmount: (a: string) => void;
  swap: () => void;
  toggleFavorite: (c: string) => void;
  setTheme: (t: Theme) => void;
  setDecimals: (d: Decimals) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      from: DEFAULT_FROM,
      to: DEFAULT_TO,
      amount: DEFAULT_AMOUNT,
      favorites: [...DEFAULT_FAVORITES],
      theme: 'system',
      decimals: DEFAULT_DECIMALS,

      setFrom: (c) => set({ from: c }),
      setTo: (c) => set({ to: c }),
      setAmount: (a) => set({ amount: a }),
      swap: () => set((s) => ({ from: s.to, to: s.from })),
      toggleFavorite: (c) =>
        set((s) => ({
          favorites: s.favorites.includes(c)
            ? s.favorites.filter((x) => x !== c)
            : [...s.favorites, c],
        })),
      setTheme: (t) => set({ theme: t }),
      setDecimals: (d) => set({ decimals: d }),
    }),
    {
      name: 'wandercoin-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
