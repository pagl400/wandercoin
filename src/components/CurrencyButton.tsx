import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import { currencyToFlag } from '../utils/flags';

interface CurrencyButtonProps {
  code: string;
  name?: string;
  onPress?: () => void;
}

export function CurrencyButton({ code, name, onPress }: CurrencyButtonProps) {
  const c = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? c.cardPressed : c.card },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.flag}>{currencyToFlag(code)}</Text>
      <View style={styles.text}>
        <Text style={[styles.code, { color: c.text }]}>{code}</Text>
        {name !== undefined && name.length > 0 ? (
          <Text style={[styles.name, { color: c.textMuted }]} numberOfLines={1}>
            {name}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  flag: { fontSize: 28 },
  text: { flexShrink: 1 },
  code: { fontSize: 16, fontWeight: '600' },
  name: { fontSize: 11 },
});
