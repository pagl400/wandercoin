import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import type { TimeRange } from '../utils/dates';
import { TIME_RANGES } from '../utils/dates';

interface TimeRangeTabsProps {
  value: TimeRange;
  onChange: (r: TimeRange) => void;
}

export function TimeRangeTabs({ value, onChange }: TimeRangeTabsProps) {
  const c = useTheme();
  return (
    <View style={styles.row}>
      {TIME_RANGES.map((r) => {
        const active = r === value;
        return (
          <Pressable
            key={r}
            onPress={() => onChange(r)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.pill,
              {
                backgroundColor: active ? c.accentSoft : 'transparent',
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: active ? c.accent : c.textSec,
                  fontWeight: active ? '600' : '500',
                },
              ]}
            >
              {r}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    paddingTop: 6,
    paddingBottom: 12,
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  label: { fontSize: 13 },
});
