import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CurrencyCard } from '../components/CurrencyCard';
import { ErrorBanner } from '../components/ErrorBanner';
import { InlineChart } from '../components/InlineChart';
import { Logo } from '../components/Logo';
import { RateLine } from '../components/RateLine';
import { Skeleton } from '../components/Skeleton';
import { SwapButton } from '../components/SwapButton';
import { TimeRangeTabs } from '../components/TimeRangeTabs';
import { useCurrencies } from '../hooks/useCurrencies';
import { useLatestRate } from '../hooks/useLatestRate';
import { useTimeSeries } from '../hooks/useTimeSeries';
import type { Side } from '../store/useAppStore';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/useTheme';
import type { RootStackParamList } from '../types/navigation';
import type { TimeRange } from '../utils/dates';
import { formatAmount, parseAmount } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Converter'>;

function rawNumber(n: number, maxDecimals = 4): string {
  if (!Number.isFinite(n)) return '0';
  const fixed = n.toFixed(maxDecimals);
  return fixed.replace(/\.?0+$/, '') || '0';
}

export function ConverterScreen() {
  const navigation = useNavigation<Nav>();
  const c = useTheme();
  const systemScheme = useColorScheme();

  const from = useAppStore((s) => s.from);
  const to = useAppStore((s) => s.to);
  const amount = useAppStore((s) => s.amount);
  const activeSide = useAppStore((s) => s.activeSide);
  const decimals = useAppStore((s) => s.decimals);
  const themePref = useAppStore((s) => s.theme);
  const setAmount = useAppStore((s) => s.setAmount);
  const setActiveSide = useAppStore((s) => s.setActiveSide);
  const swap = useAppStore((s) => s.swap);
  const setTheme = useAppStore((s) => s.setTheme);

  const [range, setRange] = useState<TimeRange>('1M');

  const fromRef = useRef<TextInput>(null);
  const toRef = useRef<TextInput>(null);

  const { data: latest, error: latestErr, stale } = useLatestRate(from, to);
  useCurrencies();
  const { data: series } = useTimeSeries(from, to, range);

  const currentRate = latest?.rates[to];
  const numericAmount = parseAmount(amount);

  const fromConverted = currentRate !== undefined ? numericAmount / currentRate : 0;
  const toConverted = currentRate !== undefined ? numericAmount * currentRate : 0;

  const fromDisplay =
    activeSide === 'from'
      ? formatAmount(numericAmount, Math.max(decimals, 2))
      : currentRate !== undefined
        ? formatAmount(fromConverted, Math.max(decimals, 2))
        : '—';
  const toDisplay =
    activeSide === 'to'
      ? formatAmount(numericAmount, Math.max(decimals, 2))
      : currentRate !== undefined
        ? formatAmount(toConverted, Math.max(decimals, 2))
        : '—';

  const seriesValues = useMemo(() => series.map((p) => p.rate), [series]);
  const seriesDates = useMemo(() => series.map((p) => p.date), [series]);
  const deltaPct = useMemo(() => {
    if (seriesValues.length < 2) return null;
    const first = seriesValues[0];
    const last = seriesValues[seriesValues.length - 1];
    if (first === 0) return null;
    return ((last - first) / first) * 100;
  }, [seriesValues]);

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32;
  const chartHeight = 110;

  const handleTap = (side: Side) => {
    const ref = side === 'from' ? fromRef : toRef;
    if (side === activeSide) {
      ref.current?.focus();
      return;
    }
    if (currentRate !== undefined && amount !== '') {
      const newRaw =
        side === 'from' ? rawNumber(fromConverted) : rawNumber(toConverted);
      setAmount(newRaw);
    }
    setActiveSide(side);
    setTimeout(() => ref.current?.focus(), 0);
  };

  const handleClear = () => setAmount('');

  const toggleTheme = () => {
    const effective = themePref === 'system' ? (systemScheme ?? 'light') : themePref;
    setTheme(effective === 'dark' ? 'light' : 'dark');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.bg }]} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Logo size={c.platform === 'android' ? 28 : 30} />
          <Text style={[styles.appName, { color: c.text }]}>Wandercoin</Text>
        </View>
        <View style={styles.topBarRight}>
          <Pressable
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel="Toggle theme"
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: c.surfaceAlt, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Ionicons
              name={c.scheme === 'dark' ? 'sunny-outline' : 'moon-outline'}
              size={16}
              color={c.text}
            />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: c.surfaceAlt, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Ionicons name="settings-outline" size={16} color={c.text} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {stale && latest !== null ? (
            <View style={styles.bannerWrap}>
              <ErrorBanner message={`Offline · last updated ${latest.date}`} />
            </View>
          ) : null}

          <View style={styles.cardsWrap}>
            <CurrencyCard
              ref={fromRef}
              code={from}
              amount={amount}
              displayValue={fromDisplay}
              active={activeSide === 'from'}
              onTap={() => handleTap('from')}
              onChangeText={setAmount}
              onTapCurrency={() => navigation.navigate('CurrencyPicker', { field: 'from' })}
              canClear={activeSide === 'from' && amount.length > 0}
              onClear={handleClear}
            />
            <View style={{ height: 8 }} />
            <CurrencyCard
              ref={toRef}
              code={to}
              amount={amount}
              displayValue={toDisplay}
              active={activeSide === 'to'}
              onTap={() => handleTap('to')}
              onChangeText={setAmount}
              onTapCurrency={() => navigation.navigate('CurrencyPicker', { field: 'to' })}
              canClear={activeSide === 'to' && amount.length > 0}
              onClear={handleClear}
            />
            <View style={styles.swapWrap} pointerEvents="box-none">
              <SwapButton onPress={swap} />
            </View>
          </View>

          {currentRate !== undefined ? (
            <RateLine from={from} to={to} rate={currentRate} deltaPct={deltaPct} range={range} />
          ) : latestErr !== null && latest === null ? (
            <Text style={[styles.error, { color: c.neg }]}>{latestErr}</Text>
          ) : (
            <View style={styles.skeletonRate}>
              <Skeleton width={140} height={14} />
            </View>
          )}

          {seriesValues.length >= 2 ? (
            <InlineChart
              data={seriesValues}
              dates={seriesDates}
              width={chartWidth}
              height={chartHeight}
            />
          ) : (
            <View style={{ height: chartHeight }} />
          )}

          <TimeRangeTabs value={range} onChange={setRange} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    minHeight: 44,
    gap: 12,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 },
  appName: { fontSize: 19, fontWeight: '600', letterSpacing: -0.3 },
  topBarRight: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  bannerWrap: { paddingBottom: 12 },
  cardsWrap: { position: 'relative' },
  swapWrap: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -19 }],
    zIndex: 2,
  },
  error: { paddingVertical: 14, fontSize: 13, textAlign: 'center' },
  skeletonRate: { paddingVertical: 12, alignItems: 'flex-end', paddingHorizontal: 4 },
});
