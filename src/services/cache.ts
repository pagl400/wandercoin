import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  value: T;
  cachedAt: number;
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
  const now = Date.now();
  const entry: CacheEntry<T> = { value, cachedAt: now, expiresAt: now + ttlMs };
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

export async function getCacheMeta(
  key: string,
): Promise<{ cachedAt: number; expiresAt: number } | null> {
  const raw = await AsyncStorage.getItem(PREFIX + key);
  if (raw === null) return null;
  try {
    const entry = JSON.parse(raw) as Partial<CacheEntry<unknown>>;
    if (typeof entry.expiresAt !== 'number') return null;
    return {
      cachedAt: typeof entry.cachedAt === 'number' ? entry.cachedAt : entry.expiresAt,
      expiresAt: entry.expiresAt,
    };
  } catch {
    return null;
  }
}

export async function getLatestSyncTime(
  from: string,
  to: string,
): Promise<number | null> {
  if (from === to) return null;
  const meta = await getCacheMeta(`latest:${from}:${to}`);
  return meta?.cachedAt ?? null;
}
