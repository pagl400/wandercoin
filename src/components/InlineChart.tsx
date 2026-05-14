import * as Haptics from 'expo-haptics';
import { useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  type GestureResponderEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { useTheme } from '../theme/useTheme';
import { formatAmount } from '../utils/format';

interface InlineChartProps {
  data: number[];
  dates: string[];
  width: number;
  height: number;
}

const PAD_X = 6;
const PAD_Y = 8;

function buildPath(points: [number, number][]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const cx = (x0 + x1) / 2;
    d += ` Q ${cx} ${y0} ${cx} ${(y0 + y1) / 2} T ${x1} ${y1}`;
  }
  return d;
}

export function InlineChart({ data, dates, width, height }: InlineChartProps) {
  const c = useTheme();
  const dark = c.scheme === 'dark';
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const lastIndex = useRef<number | null>(null);

  const { points, lineD, fillD, last } = useMemo(() => {
    if (data.length < 2) {
      return { points: [] as [number, number][], lineD: '', fillD: '', last: null };
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const stepX = (width - PAD_X * 2) / (data.length - 1);
    const pts: [number, number][] = data.map((v, i) => [
      PAD_X + i * stepX,
      PAD_Y + (1 - (v - min) / span) * (height - PAD_Y * 2),
    ]);
    const line = buildPath(pts);
    const lastPt = pts[pts.length - 1];
    const firstPt = pts[0];
    const fill = `${line} L ${lastPt[0]} ${height} L ${firstPt[0]} ${height} Z`;
    return { points: pts, lineD: line, fillD: fill, last: lastPt };
  }, [data, width, height]);

  const indexFromX = (x: number): number => {
    if (data.length < 2) return 0;
    const ratio = (x - PAD_X) / (width - 2 * PAD_X);
    const idx = Math.round(ratio * (data.length - 1));
    return Math.max(0, Math.min(data.length - 1, idx));
  };

  const updateScrub = (x: number) => {
    const idx = indexFromX(x);
    if (idx !== lastIndex.current) {
      lastIndex.current = idx;
      void Haptics.selectionAsync();
    }
    setScrubIndex(idx);
  };

  const releaseScrub = () => {
    lastIndex.current = null;
    setScrubIndex(null);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => data.length >= 2,
        onMoveShouldSetPanResponder: () => data.length >= 2,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e: GestureResponderEvent) => updateScrub(e.nativeEvent.locationX),
        onPanResponderMove: (e: GestureResponderEvent) => updateScrub(e.nativeEvent.locationX),
        onPanResponderRelease: releaseScrub,
        onPanResponderTerminate: releaseScrub,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.length, width, height],
  );

  if (data.length < 2 || last === null) {
    return <View style={{ width, height: height + 44 }} />;
  }

  const gradId = 'wc-inline-grad';
  const scrubPoint = scrubIndex !== null ? points[scrubIndex] : null;
  const scrubValue = scrubIndex !== null ? data[scrubIndex] : null;
  const scrubDate = scrubIndex !== null ? dates[scrubIndex] : null;

  return (
    <View>
      <View style={styles.valueRow}>
        <Text
          style={[styles.valueText, { color: c.text, opacity: scrubValue !== null ? 1 : 0 }]}
          numberOfLines={1}
        >
          {scrubValue !== null ? formatAmount(scrubValue, 4) : '0'}
        </Text>
      </View>
      <View {...panResponder.panHandlers} style={{ width, height }}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={c.accent} stopOpacity={dark ? 0.35 : 0.22} />
              <Stop offset="100%" stopColor={c.accent} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Line
            x1={PAD_X}
            y1={height - PAD_Y / 2}
            x2={width - PAD_X}
            y2={height - PAD_Y / 2}
            stroke={c.border}
            strokeWidth={1}
          />
          <Path d={fillD} fill={`url(#${gradId})`} />
          <Path
            d={lineD}
            fill="none"
            stroke={c.accent}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {scrubPoint !== null ? (
            <>
              <Line
                x1={scrubPoint[0]}
                y1={PAD_Y}
                x2={scrubPoint[0]}
                y2={height - PAD_Y / 2}
                stroke={c.accent}
                strokeOpacity={0.4}
                strokeWidth={1}
              />
              <Circle cx={scrubPoint[0]} cy={scrubPoint[1]} r={6} fill={c.accent} opacity={0.25} />
              <Circle cx={scrubPoint[0]} cy={scrubPoint[1]} r={4} fill={c.accent} />
            </>
          ) : (
            <>
              <Circle cx={last[0]} cy={last[1]} r={6} fill={c.accent} opacity={0.2} />
              <Circle cx={last[0]} cy={last[1]} r={3.5} fill={c.accent} />
            </>
          )}
        </Svg>
      </View>
      <View style={styles.dateRow}>
        <Text
          style={[styles.dateText, { color: c.textSec, opacity: scrubDate !== null ? 1 : 0 }]}
          numberOfLines={1}
        >
          {scrubDate ?? ' '}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  valueRow: {
    height: 26,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  valueText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  dateRow: {
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
