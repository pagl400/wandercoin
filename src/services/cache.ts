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

export async function getRaw<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(PREFIX + key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setRaw<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export async function getStale<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(PREFIX + key);
  if (raw === null) return null;
  try {
    const entry = JSON.parse(raw) as CacheEntry<T>;
    return entry.value;
  } catch {
    return null;
  }
}
