import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import type { TimeRange } from '../utils/dates';
import { formatAmount } from '../utils/format';

interface RateLineProps {
  from: string;
  to: string;
  rate: number;
  deltaPct: number | null;
  range: TimeRange;
}

export function RateLine({ from, to, rate, deltaPct, range }: RateLineProps) {
  const c = useTheme();
  const positive = deltaPct === null ? null : deltaPct >= 0;
  const deltaColor = positive === null ? c.textSec : positive ? c.pos : c.neg;

  return (
    <View style={styles.row}>
      <Text style={[styles.rate, { color: c.textSec }]} numberOfLines={1}>
        1 {from} = {formatAmount(rate, 4)} {to}
      </Text>
      {deltaPct !== null ? (
        <View style={styles.deltaGroup}>
          <Text style={[styles.deltaArrow, { color: deltaColor }]}>{positive ? '▲' : '▼'}</Text>
          <Text style={[styles.deltaValue, { color: deltaColor }]}>
            {Math.abs(deltaPct).toFixed(2)}%
          </Text>
          <Text style={[styles.range, { color: c.textSec }]}>{range}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    paddingTop: 14,
  },
  rate: { fontSize: 13, flexShrink: 1 },
  deltaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  deltaArrow: { fontSize: 13, fontWeight: '600' },
  deltaValue: { fontSize: 13, fontWeight: '600' },
  range: { fontSize: 13, fontWeight: '400', marginLeft: 4 },
});
