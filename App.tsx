import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { DEFAULT_FROM, DEFAULT_TO, LATEST_TTL_MS } from './src/constants';
import { getCached } from './src/services/cache';
import { fetchLatest } from './src/services/frankfurterApi';
import type { LatestRate } from './src/types/currency';

export function App() {
  const [rate, setRate] = useState<LatestRate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await getCached(
          `latest:${DEFAULT_FROM}:${DEFAULT_TO}`,
          LATEST_TTL_MS,
          () => fetchLatest(DEFAULT_FROM, [DEFAULT_TO]),
        );
        console.log('[Phase 1] EUR→USD', data);
        setRate(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn('[Phase 1] fetch failed:', msg);
        setError(msg);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Wandercoin · Phase 1</Text>
      {error !== null ? (
        <Text style={styles.error}>{error}</Text>
      ) : rate !== null ? (
        <>
          <Text style={styles.rate}>
            1 {DEFAULT_FROM} = {rate.rates[DEFAULT_TO]?.toFixed(4)} {DEFAULT_TO}
          </Text>
          <Text style={styles.date}>Stand: {rate.date}</Text>
        </>
      ) : (
        <ActivityIndicator />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  title: { fontSize: 18, fontWeight: '600', color: '#444' },
  rate: { fontSize: 28, fontWeight: '700' },
  date: { fontSize: 14, color: '#777' },
  error: { color: '#c00', textAlign: 'center' },
});
