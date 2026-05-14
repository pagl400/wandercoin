import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { useCurrencies } from '../hooks/useCurrencies';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/useTheme';
import type { RootStackParamList } from '../types/navigation';
import { currencyToFlag } from '../utils/flags';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CurrencyPicker'>;
type PickerRoute = RouteProp<RootStackParamList, 'CurrencyPicker'>;

interface Row {
  code: string;
  name: string;
  favorite: boolean;
}

export function CurrencyPickerScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<PickerRoute>();
  const field = params.field;
  const c = useTheme();
  const isAndroid = c.platform === 'android';

  const { data: currencies, loading, error } = useCurrencies();
  const from = useAppStore((s) => s.from);
  const to = useAppStore((s) => s.to);
  const favorites = useAppStore((s) => s.favorites);
  const setFrom = useAppStore((s) => s.setFrom);
  const setTo = useAppStore((s) => s.setTo);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  const [query, setQuery] = useState('');

  const currentForField = field === 'from' ? from : to;
  const otherForField = field === 'from' ? to : from;

  const rows = useMemo<Row[]>(() => {
    if (currencies === null) return [];
    const q = query.trim().toLowerCase();
    return Object.entries(currencies)
      .map(([code, name]) => ({
        code,
        name,
        favorite: favorites.includes(code),
      }))
      .filter(
        ({ code, name }) =>
          q === '' || code.toLowerCase().includes(q) || name.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
        return a.code.localeCompare(b.code);
      });
  }, [currencies, query, favorites]);

  const select = (code: string) => {
    if (code === otherForField) {
      if (field === 'from') {
        setTo(from);
        setFrom(code);
      } else {
        setFrom(to);
        setTo(code);
      }
    } else if (field === 'from') {
      setFrom(code);
    } else {
      setTo(code);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: c.surface }]}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <View style={styles.handleWrap}>
        <View style={[styles.handle, { backgroundColor: c.textTer }]} />
      </View>

      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: c.text }]}>Select currency</Text>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={[styles.done, { color: c.accent }]}>Done</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.searchField, { backgroundColor: c.surfaceAlt }]}>
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Circle cx={11} cy={11} r={7} stroke={c.textSec} strokeWidth={2.5} fill="none" />
            <Path
              d="M21 21l-4.3-4.3"
              stroke={c.textSec}
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={c.textSec}
            autoCorrect={false}
            autoCapitalize="none"
            style={[styles.searchInput, { color: c.text }]}
          />
        </View>
      </View>

      {error !== null ? (
        <Text style={[styles.error, { color: c.neg }]}>{error}</Text>
      ) : loading && currencies === null ? (
        <ActivityIndicator style={styles.loader} color={c.text} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => r.code}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const active = item.code === currentForField;
            return (
              <Pressable
                onPress={() => select(item.code)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: active
                      ? c.accentSoft
                      : pressed
                        ? c.surfaceAlt
                        : 'transparent',
                    borderRadius: isAndroid ? 14 : 14,
                  },
                ]}
              >
                <View style={styles.flagWrap}>
                  <Text style={styles.flag}>{currencyToFlag(item.code)}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.code, { color: active ? c.accent : c.text }]}>
                    {item.code}
                  </Text>
                  <Text style={[styles.name, { color: c.textSec }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <Pressable
                  hitSlop={10}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.code);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={item.favorite ? 'Remove favorite' : 'Add favorite'}
                  style={styles.starBtn}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: item.favorite ? c.accent : c.textTer,
                    }}
                  >
                    {item.favorite ? '★' : '☆'}
                  </Text>
                </Pressable>
                {active ? (
                  <Svg width={20} height={20} viewBox="0 0 24 24">
                    <Path
                      d="M5 12l5 5L20 7"
                      stroke={c.accent}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </Svg>
                ) : (
                  <View style={styles.checkSpacer} />
                )}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: c.textTer }]}>
              No currencies match &ldquo;{query}&rdquo;.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handleWrap: { paddingTop: 6, paddingBottom: 10, alignItems: 'center' },
  handle: { width: 36, height: 5, borderRadius: 3 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  title: { fontSize: 19, fontWeight: '600' },
  done: { fontSize: 15, fontWeight: '500' },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  listContent: { paddingHorizontal: 8, paddingBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  flagWrap: { width: 36, alignItems: 'center' },
  flag: { fontSize: 28, lineHeight: 30 },
  rowText: { flex: 1 },
  code: { fontSize: 16, fontWeight: '600' },
  name: { fontSize: 13, marginTop: 1 },
  starBtn: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSpacer: { width: 20 },
  empty: { textAlign: 'center', marginTop: 32 },
  error: { textAlign: 'center', marginTop: 32, paddingHorizontal: 20 },
  loader: { marginTop: 24 },
});
