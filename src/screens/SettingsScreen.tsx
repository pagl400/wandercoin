import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clearCache, getLatestSyncTime } from '../services/cache';
import { useAppStore } from '../store/useAppStore';
import type { Decimals, Theme } from '../store/useAppStore';
import { useTheme } from '../theme/useTheme';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const APP_VERSION = '1.0.0';

const PRIVACY_URL = 'https://pagl400.github.io/wandercoin/privacy/';
const IMPRINT_URL = 'https://pagl400.github.io/wandercoin/impressum/';

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const DECIMAL_OPTIONS: { value: Decimals; label: string }[] = [
  { value: 0, label: '0' },
  { value: 2, label: '2' },
  { value: 4, label: '4' },
];

function formatSyncTime(d: Date): string {
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  return sameDay ? `Today, ${format(d, 'HH:mm')}` : format(d, 'MMM d, HH:mm');
}

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const c = useTheme();

  const theme = useAppStore((s) => s.theme);
  const decimals = useAppStore((s) => s.decimals);
  const from = useAppStore((s) => s.from);
  const to = useAppStore((s) => s.to);
  const setTheme = useAppStore((s) => s.setTheme);
  const setDecimals = useAppStore((s) => s.setDecimals);

  const [lastSync, setLastSync] = useState<Date | null>(null);

  const reloadSync = useCallback(() => {
    void (async () => {
      const ts = await getLatestSyncTime(from, to);
      setLastSync(ts !== null ? new Date(ts) : null);
    })();
  }, [from, to]);

  useFocusEffect(
    useCallback(() => {
      reloadSync();
    }, [reloadSync]),
  );

  const handleResetCache = () => {
    Alert.alert('Reset cache?', 'All locally stored rates and currencies will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await clearCache();
            setLastSync(null);
          })();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerSide}>
          <Text style={[styles.back, { color: c.accent }]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: c.text }]}>Settings</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Appearance" textColor={c.textSec}>
          <Segmented
            options={THEME_OPTIONS}
            value={theme}
            onChange={setTheme}
            palette={c}
          />
        </Section>

        <Section title="Decimals" textColor={c.textSec}>
          <Segmented
            options={DECIMAL_OPTIONS}
            value={decimals}
            onChange={setDecimals}
            palette={c}
          />
        </Section>

        <Section title="Data" textColor={c.textSec}>
          <View style={[styles.row, { backgroundColor: c.surfaceAlt }]}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Last sync</Text>
            <Text style={[styles.rowValue, { color: c.textSec }]}>
              {lastSync !== null ? formatSyncTime(lastSync) : 'Never'}
            </Text>
          </View>
          <View style={[styles.row, { backgroundColor: c.surfaceAlt }]}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Refresh cadence</Text>
            <Text style={[styles.rowValue, { color: c.textSec }]}>≤ 1× per hour</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: pressed ? c.surfaceHi : c.surfaceAlt },
            ]}
            onPress={handleResetCache}
          >
            <Text style={[styles.rowLabel, { color: c.neg }]}>Reset cache</Text>
          </Pressable>
        </Section>

        <Section title="About" textColor={c.textSec}>
          <View style={[styles.row, { backgroundColor: c.surfaceAlt }]}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Data source</Text>
            <Text style={[styles.rowValue, { color: c.textSec }]}>ECB via Frankfurter</Text>
          </View>
          <View style={[styles.row, { backgroundColor: c.surfaceAlt }]}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Version</Text>
            <Text style={[styles.rowValue, { color: c.textSec }]}>{APP_VERSION}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: pressed ? c.surfaceHi : c.surfaceAlt },
            ]}
            onPress={() => {
              void Linking.openURL(PRIVACY_URL);
            }}
          >
            <Text style={[styles.rowLabel, { color: c.text }]}>Privacy policy</Text>
            <Text style={[styles.rowValue, { color: c.accent }]}>Open</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: pressed ? c.surfaceHi : c.surfaceAlt },
            ]}
            onPress={() => {
              void Linking.openURL(IMPRINT_URL);
            }}
          >
            <Text style={[styles.rowLabel, { color: c.text }]}>Impressum</Text>
            <Text style={[styles.rowValue, { color: c.accent }]}>Open</Text>
          </Pressable>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SectionProps {
  title: string;
  textColor: string;
  children: React.ReactNode;
}

function Section({ title, textColor, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

interface SegmentedProps<T extends string | number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  palette: ReturnType<typeof useTheme>;
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  palette,
}: SegmentedProps<T>) {
  return (
    <View style={[styles.segmented, { backgroundColor: palette.surfaceAlt }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            style={[styles.segment, active && { backgroundColor: palette.surface }]}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[
                styles.segmentLabel,
                {
                  color: active ? palette.text : palette.textSec,
                  fontWeight: active ? '600' : '500',
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerSide: { minWidth: 60 },
  back: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 24 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', paddingLeft: 8 },
  sectionBody: { borderRadius: 12, overflow: 'hidden', gap: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: { fontSize: 16 },
  rowValue: { fontSize: 14 },
  segmented: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentLabel: { fontSize: 14 },
});
