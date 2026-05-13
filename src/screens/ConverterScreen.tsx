import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmountInput } from '../components/AmountInput';
import { CurrencyButton } from '../components/CurrencyButton';
import { ResultDisplay } from '../components/ResultDisplay';
import { SwapButton } from '../components/SwapButton';
import { useCurrencies } from '../hooks/useCurrencies';
import { useLatestRate } from '../hooks/useLatestRate';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../types/navigation';
import { parseAmount } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Converter'>;

export function ConverterScreen() {
  const navigation = useNavigation<Nav>();
  const from = useAppStore((s) => s.from);
  const to = useAppStore((s) => s.to);
  const amount = useAppStore((s) => s.amount);
  const decimals = useAppStore((s) => s.decimals);
  const setAmount = useAppStore((s) => s.setAmount);
  const swap = useAppStore((s) => s.swap);

  const { data: rate, error: rateErr, loading: rateLoading } = useLatestRate(from, to);
  const { data: currencies } = useCurrencies();

  const numericAmount = parseAmount(amount);
  const rateValue = rate?.rates[to];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Wandercoin</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AmountInput value={amount} onChangeText={setAmount} />

        <View style={styles.row}>
          <View style={styles.flex}>
            <CurrencyButton
              code={from}
              name={currencies?.[from]}
              onPress={() => navigation.navigate('CurrencyPicker', { field: 'from' })}
            />
          </View>
          <SwapButton onPress={swap} />
          <View style={styles.flex}>
            <CurrencyButton
              code={to}
              name={currencies?.[to]}
              onPress={() => navigation.navigate('CurrencyPicker', { field: 'to' })}
            />
          </View>
        </View>

        <View style={styles.resultArea}>
          {rateErr !== null ? (
            <Text style={styles.error}>{rateErr}</Text>
          ) : rateValue !== undefined && rate !== null ? (
            <ResultDisplay
              amount={numericAmount}
              rate={rateValue}
              from={from}
              to={to}
              decimals={decimals}
              stale={rateLoading}
            />
          ) : (
            <ActivityIndicator />
          )}
        </View>

        {rate !== null ? (
          <Text style={styles.footer}>Data: ECB · As of {rate.date}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  content: { paddingHorizontal: 24, gap: 24, paddingBottom: 48 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  resultArea: { minHeight: 80, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#c00', textAlign: 'center' },
  footer: { textAlign: 'center', fontSize: 12, color: '#888' },
});
