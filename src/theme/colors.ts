export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceHi: string;
  border: string;
  text: string;
  textSec: string;
  textTer: string;
  accent: string;
  accentSoft: string;
  pos: string;
  neg: string;
  numpadBg: string;
  numpadKeyBg: string;
  numpadKeyShadow: string | null;
  scheme: 'light' | 'dark';
  platform: 'ios' | 'android';
}

const ACCENT = '#0a84ff';

const lightIos: Palette = {
  bg: '#f2f2f7',
  surface: '#ffffff',
  surfaceAlt: '#f2f2f7',
  surfaceHi: '#e5e5ea',
  border: 'rgba(0,0,0,0.06)',
  text: '#000000',
  textSec: 'rgba(60,60,67,0.6)',
  textTer: 'rgba(60,60,67,0.3)',
  accent: ACCENT,
  accentSoft: ACCENT + '1f',
  pos: '#16a34a',
  neg: '#dc2626',
  numpadBg: '#d1d3d9',
  numpadKeyBg: '#fcfcfe',
  numpadKeyShadow: 'rgba(0,0,0,0.15)',
  scheme: 'light',
  platform: 'ios',
};

const darkIos: Palette = {
  bg: '#000000',
  surface: '#1c1c1e',
  surfaceAlt: '#2c2c2e',
  surfaceHi: '#3a3a3c',
  border: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  textSec: 'rgba(235,235,245,0.6)',
  textTer: 'rgba(235,235,245,0.35)',
  accent: ACCENT,
  accentSoft: ACCENT + '26',
  pos: '#34c759',
  neg: '#ff453a',
  numpadBg: '#000000',
  numpadKeyBg: '#636366',
  numpadKeyShadow: 'rgba(0,0,0,0.15)',
  scheme: 'dark',
  platform: 'ios',
};

const lightAndroid: Palette = {
  bg: '#fbf8ff',
  surface: '#ffffff',
  surfaceAlt: '#eee8f4',
  surfaceHi: '#e7e0ec',
  border: 'rgba(0,0,0,0.06)',
  text: '#1c1b1f',
  textSec: 'rgba(60,60,67,0.6)',
  textTer: 'rgba(60,60,67,0.3)',
  accent: ACCENT,
  accentSoft: ACCENT + '1f',
  pos: '#16a34a',
  neg: '#dc2626',
  numpadBg: '#f0eaf6',
  numpadKeyBg: '#ffffff',
  numpadKeyShadow: null,
  scheme: 'light',
  platform: 'android',
};

const darkAndroid: Palette = {
  bg: '#101014',
  surface: '#1c1b1f',
  surfaceAlt: '#2a282d',
  surfaceHi: '#36343a',
  border: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  textSec: 'rgba(235,235,245,0.6)',
  textTer: 'rgba(235,235,245,0.35)',
  accent: ACCENT,
  accentSoft: ACCENT + '26',
  pos: '#34c759',
  neg: '#ff453a',
  numpadBg: '#16151a',
  numpadKeyBg: '#2a282d',
  numpadKeyShadow: null,
  scheme: 'dark',
  platform: 'android',
};

export function paletteFor(scheme: 'light' | 'dark', platform: 'ios' | 'android'): Palette {
  if (platform === 'android') return scheme === 'dark' ? darkAndroid : lightAndroid;
  return scheme === 'dark' ? darkIos : lightIos;
}
