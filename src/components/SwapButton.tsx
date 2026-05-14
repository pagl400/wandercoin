import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '../theme/useTheme';

interface SwapButtonProps {
  onPress: () => void;
  size?: number;
}

export function SwapButton({ onPress, size = 38 }: SwapButtonProps) {
  const c = useTheme();

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Swap currencies"
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: c.accent,
          borderWidth: 3,
          borderColor: c.bg,
          opacity: pressed ? 0.8 : 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 14,
          elevation: 6,
        },
      ]}
    >
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path
          d="M7 4v16M7 4l-3 3M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3"
          stroke="#ffffff"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
});
