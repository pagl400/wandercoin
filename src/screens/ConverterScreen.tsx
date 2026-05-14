import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmountInput } from '../components/AmountInput';
import { CurrencyButton } from '../components/CurrencyButton';
import { ErrorBanner } from '../components/ErrorBanner';
import { MiniChart } from '../components/MiniChart';
import { ResultDisplay } from '../components/ResultDisplay';
import { Skeleton } from '../components/Skeleton';
import { SwapButton } from '../components/SwapButton';
import { useCurrencies } from '../hooks/useCurrencies';
import { useLatestRate } from '../hooks/useLatestRate';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/useTheme';
import type { RootStackParamList } from '../types/navigation';
import { parseAmount } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Converter'>;

export function ConverterScreen() {
  const navigation = useNavigation<Nav>();
  const c = useTheme();

  const from = useAppStore((s) => s.from);
  const to = useAppStore((s) => s.to);
  const amount = useAppStore((s) => s.amount);
  const decimals = useAppStore((s) => s.decimals);
  const setAmount = useAppStore((s) => s.setAmount);
  const swap = useAppStore((s) => s.swap);

  const { data: rate, error: rateErr, loading: rateLoading, stale } = useLatestRate(from, to);
  const { data: currencies } = useCurrencies();

  const numericAmount = parseAmount(amount);
  const rateValue = rate?.rates[to];

  const showSkeleton = rate === null && rateLoading;
  const showHardError = rate === null && rateErr !== null;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: c.bg }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]}>Wandercoin</Text>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <Ionicons name="settings-outline" size={22} color={c.text} />
        </Pressable>
      </View>

      {stale && rate !== null ? (
        <View style={styles.bannerWrap}>
          <ErrorBanner message={`Offline · last updated ${rate.date}`} />
        </View>
      ) : null}

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
          {showSkeleton ? (
            <View style={styles.skeletonGroup}>
              <Skeleton width={220} height={42} />
              <Skeleton width={140} height={14} />
            </View>
          ) : showHardError ? (
            <Text style={[styles.error, { color: c.danger }]}>{rateErr}</Text>
          ) : rateValue !== undefined && rate !== null ? (
            <ResultDisplay
              amount={numericAmount}
              rate={rateValue}
              from={from}
              to={to}
              decimals={decimals}
              stale={rateLoading}
            />
          ) : null}
        </View>

        <Pressable
          onPress={() => navigation.navigate('Chart')}
          accessibilityRole="button"
          accessibilityLabel="Open chart"
        >
          <MiniChart from={from} to={to} width={Dimensions.get('window').width - 48} />
        </Pressable>

        {rate !== null && !stale ? (
          <Text style={[styles.footer, { color: c.textFaint }]}>
            Data: ECB · As of {rate.date}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '700' },
  bannerWrap: { paddingHorizontal: 24, paddingBottom: 12 },
  content: { paddingHorizontal: 24, gap: 24, paddingBottom: 48 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  resultArea: { minHeight: 80, alignItems: 'center', justifyContent: 'center' },
  skeletonGroup: { alignItems: 'center', gap: 8 },
  error: { textAlign: 'center' },
  footer: { textAlign: 'center', fontSize: 12 },
});
