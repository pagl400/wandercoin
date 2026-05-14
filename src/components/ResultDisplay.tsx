import { StyleSheet, Text, View } from 'react-native';

import { DEFAULT_DECIMALS } from '../constants';
import { useTheme } from '../theme/useTheme';
import { formatAmount } from '../utils/format';

interface ResultDisplayProps {
  amount: number;
  rate: number;
  from: string;
  to: string;
  decimals?: number;
  stale?: boolean;
}

export function ResultDisplay({
  amount,
  rate,
  from,
  to,
  decimals = DEFAULT_DECIMALS,
  stale = false,
}: ResultDisplayProps) {
  const c = useTheme();
  const converted = amount * rate;
  return (
    <View style={styles.container}>
      <Text style={[styles.amount, { color: stale ? c.textFaint : c.text }]}>
        {formatAmount(converted, decimals)} {to}
      </Text>
      <Text style={[styles.rate, { color: c.textMuted }]}>
        1 {from} = {formatAmount(rate, 4)} {to}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 4 },
  amount: { fontSize: 36, fontWeight: '700' },
  rate: { fontSize: 13 },
});
