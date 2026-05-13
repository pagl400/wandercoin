import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const PREFIX = 'wandercoin:cache:';

export async function getCached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const fullKey = PREFIX + key;
  const raw = await AsyncStorage.getItem(fullKey);
  if (raw !== null) {
    try {
      const entry = JSON.parse(raw) as CacheEntry<T>;
      if (entry.expiresAt > Date.now()) return entry.value;
    } catch {
      // corrupt entry — fall through and refetch
    }
  }
  const value = await fetcher();
  const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs };
  await AsyncStorage.setItem(fullKey, JSON.stringify(entry));
  return value;
}

export async function clearCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((k) => k.startsWith(PREFIX));
  if (ours.length > 0) await AsyncStorage.multiRemove(ours);
}
