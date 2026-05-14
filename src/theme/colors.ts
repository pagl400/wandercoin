export interface Palette {
  bg: string;
  card: string;
  cardPressed: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  accent: string;
  danger: string;
  swapBg: string;
  swapFg: string;
  star: string;
  starActive: string;
  inputBg: string;
  inputText: string;
  inputPlaceholder: string;
  chartLine: string;
  chartFill: string;
  chartAxis: string;
  chartRules: string;
  tooltipBg: string;
  tooltipFg: string;
  scheme: 'light' | 'dark';
}

export const lightColors: Palette = {
  bg: '#ffffff',
  card: '#f2f2f7',
  cardPressed: '#e5e5ea',
  text: '#000000',
  textMuted: '#3c3c43cc',
  textFaint: '#3c3c4399',
  border: '#3c3c432e',
  accent: '#007aff',
  danger: '#ff3b30',
  swapBg: '#000000',
  swapFg: '#ffffff',
  star: '#d1d1d6',
  starActive: '#ffcc00',
  inputBg: '#f2f2f7',
  inputText: '#000000',
  inputPlaceholder: '#3c3c4399',
  chartLine: '#007aff',
  chartFill: '#007aff',
  chartAxis: '#e5e5ea',
  chartRules: '#f2f2f7',
  tooltipBg: '#1c1c1e',
  tooltipFg: '#ffffff',
  scheme: 'light',
};

export const darkColors: Palette = {
  bg: '#1c1c1e',
  card: '#2c2c2e',
  cardPressed: '#3a3a3c',
  text: '#ffffff',
  textMuted: '#ebebf5cc',
  textFaint: '#ebebf599',
  border: '#54545899',
  accent: '#0a84ff',
  danger: '#ff453a',
  swapBg: '#ffffff',
  swapFg: '#000000',
  star: '#48484a',
  starActive: '#ffd60a',
  inputBg: '#2c2c2e',
  inputText: '#ffffff',
  inputPlaceholder: '#ebebf599',
  chartLine: '#0a84ff',
  chartFill: '#0a84ff',
  chartAxis: '#38383a',
  chartRules: '#2c2c2e',
  tooltipBg: '#2c2c2e',
  tooltipFg: '#ffffff',
  scheme: 'dark',
};
