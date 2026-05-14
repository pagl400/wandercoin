import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface SkeletonProps {
  width: number | `${number}%`;
  height: number;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width, height, radius = 8, style }: SkeletonProps) {
  const c = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius: radius, backgroundColor: c.surfaceAlt, opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {},
});
