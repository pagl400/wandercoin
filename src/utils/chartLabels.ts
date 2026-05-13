import { format, parseISO } from 'date-fns';

import type { TimeRange } from './dates';

export function pickLabelIndices(targetCount: number, totalPoints: number): Set<number> {
  const indices = new Set<number>();
  if (totalPoints === 0) return indices;
  if (totalPoints <= targetCount) {
    for (let i = 0; i < totalPoints; i++) indices.add(i);
    return indices;
  }
  const step = (totalPoints - 1) / (targetCount - 1);
  for (let i = 0; i < targetCount; i++) {
    indices.add(Math.round(i * step));
  }
  return indices;
}

export function formatXAxisLabel(iso: string, range: TimeRange): string {
  const d = parseISO(iso);
  switch (range) {
    case '1W':
      return format(d, 'EEE');
    case '1M':
    case '3M':
      return format(d, 'MMM d');
    case '6M':
    case '1Y':
    case '5Y':
      return format(d, 'MMM yy');
  }
}
