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
    <View style={[styles.container, { backgroundColor: c.card }]}>
      {TIME_RANGES.map((r) => {
        const active = r === value;
        return (
          <Pressable
            key={r}
            onPress={() => onChange(r)}
            style={[styles.tab, active && { backgroundColor: c.bg }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[
                styles.label,
                {
                  color: active ? c.text : c.textMuted,
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
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  label: { fontSize: 13 },
});
