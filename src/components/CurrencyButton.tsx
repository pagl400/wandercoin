import { Pressable, StyleSheet, Text, View } from 'react-native';

import { currencyToFlag } from '../utils/flags';

interface CurrencyButtonProps {
  code: string;
  name?: string;
  onPress?: () => void;
}

export function CurrencyButton({ code, name, onPress }: CurrencyButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.flag}>{currencyToFlag(code)}</Text>
      <View style={styles.text}>
        <Text style={styles.code}>{code}</Text>
        {name !== undefined && name.length > 0 ? (
          <Text style={styles.name} numberOfLines={1}>
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
    backgroundColor: '#f3f4f6',
  },
  pressed: { opacity: 0.6 },
  flag: { fontSize: 28 },
  text: { flexShrink: 1 },
  code: { fontSize: 16, fontWeight: '600', color: '#111' },
  name: { fontSize: 11, color: '#666' },
});
