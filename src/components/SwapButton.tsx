import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface SwapButtonProps {
  onPress: () => void;
}

export function SwapButton({ onPress }: SwapButtonProps) {
  const c = useTheme();

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: c.swapBg, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Swap currencies"
    >
      <Text style={[styles.icon, { color: c.swapFg }]}>⇅</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 20, fontWeight: '600' },
});
