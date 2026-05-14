import { useColorScheme } from 'react-native';

import { useAppStore } from '../store/useAppStore';

import { darkColors, lightColors, type Palette } from './colors';

export function useTheme(): Palette {
  const themePref = useAppStore((s) => s.theme);
  const systemScheme = useColorScheme();
  const effective = themePref === 'system' ? (systemScheme ?? 'light') : themePref;
  return effective === 'dark' ? darkColors : lightColors;
}
