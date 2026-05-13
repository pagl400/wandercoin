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

import { useCurrencies } from '../hooks/useCurrencies';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../types/navigation';
import { currencyToFlag } from '../utils/flags';

interface Row {
  code: string;
  name: string;
  favorite: boolean;
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'CurrencyPicker'>;
type PickerRoute = RouteProp<RootStackParamList, 'CurrencyPicker'>;

export function CurrencyPickerScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<PickerRoute>();
  const field = params.field;

  const { data: currencies, loading, error } = useCurrencies();
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const setFrom = useAppStore((s) => s.setFrom);
  const setTo = useAppStore((s) => s.setTo);

  const [query, setQuery] = useState('');

  const rows = useMemo<Row[]>(() => {
    if (currencies === null) return [];
    const q = query.trim().toLowerCase();
    return Object.entries(currencies)
      .map(([code, name]) => ({ code, name, favorite: favorites.includes(code) }))
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
    if (field === 'from') setFrom(code);
    else setTo(code);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Select currency</Text>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.close}>Done</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Search code or name"
        placeholderTextColor="#9ca3af"
        autoCorrect={false}
        autoCapitalize="none"
      />

      {error !== null ? (
        <Text style={styles.error}>{error}</Text>
      ) : loading && currencies === null ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => r.code}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => select(item.code)}
            >
              <Text style={styles.flag}>{currencyToFlag(item.code)}</Text>
              <View style={styles.rowText}>
                <Text style={styles.code}>{item.code}</Text>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
              <Pressable
                hitSlop={12}
                onPress={() => toggleFavorite(item.code)}
                accessibilityRole="button"
                accessibilityLabel={item.favorite ? 'Remove favorite' : 'Add favorite'}
              >
                <Text style={[styles.star, item.favorite && styles.starActive]}>★</Text>
              </Pressable>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No currencies match &ldquo;{query}&rdquo;.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111' },
  close: { fontSize: 16, color: '#0a84ff', fontWeight: '600' },
  search: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    fontSize: 16,
    color: '#111',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  rowPressed: { backgroundColor: '#f9fafb' },
  flag: { fontSize: 24 },
  rowText: { flex: 1 },
  code: { fontSize: 16, fontWeight: '600', color: '#111' },
  name: { fontSize: 12, color: '#666' },
  star: { fontSize: 22, color: '#d1d5db' },
  starActive: { color: '#fbbf24' },
  empty: { textAlign: 'center', color: '#888', marginTop: 32 },
  error: { textAlign: 'center', color: '#c00', marginTop: 32, paddingHorizontal: 20 },
  loader: { marginTop: 24 },
});
