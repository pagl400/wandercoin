export function formatAmount(value: number, decimals: number, locale = 'en-US'): string {
  if (!Number.isFinite(value)) return '–';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function parseAmount(input: string): number {
  const normalized = input.replace(',', '.').trim();
  if (normalized === '') return 0;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}
