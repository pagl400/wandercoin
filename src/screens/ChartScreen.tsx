import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TimeRangeTabs } from '../components/TimeRangeTabs';
import { useTimeSeries } from '../hooks/useTimeSeries';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../types/navigation';
import { formatXAxisLabel, pickLabelIndices } from '../utils/chartLabels';
import { computeYScale } from '../utils/chartScale';
import type { TimeRange } from '../utils/dates';
import { formatAmount } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Chart'>;

interface PointerItem {
  value: number;
  label?: string;
  originalRate?: number;
  originalDate?: string;
}

export function ChartScreen() {
  const navigation = useNavigation<Nav>();
  const from = useAppStore((s) => s.from);
  const to = useAppStore((s) => s.to);

  const [range, setRange] = useState<TimeRange>('1M');
  const { data, loading, error } = useTimeSeries(from, to, range);

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const rates = data.map((p) => p.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    return { min, max, avg };
  }, [data]);

  const outerPadding = 16;
  const yAxisLabelWidth = 56;
  const plotWidth = Dimensions.get('window').width - outerPadding * 2 - yAxisLabelWidth;
  const rates = data.map((p) => p.rate);
  const { yMin, yRange } = computeYScale(rates);

  const chartData = data.map((pt) => ({
    value: pt.rate - yMin,
    originalRate: pt.rate,
    originalDate: pt.date,
  }));
  const spacing = chartData.length > 1 ? plotWidth / (chartData.length - 1) : 0;

  const sections = 4;
  const yAxisLabelTexts = Array.from({ length: sections + 1 }, (_, i) =>
    formatAmount(yMin + (yRange * i) / sections, 4),
  );

  const labelCount = 5;
  const labelIndices = [...pickLabelIndices(labelCount, data.length)].sort((a, b) => a - b);
  const xLabels = labelIndices.map((i) => formatXAxisLabel(data[i].date, range));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerSide}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>
          {from} → {to}
        </Text>
        <View style={styles.headerSide} />
      </View>

      <View style={styles.tabs}>
        <TimeRangeTabs value={range} onChange={setRange} />
      </View>

      <View style={styles.chartArea}>
        {error !== null ? (
          <Text style={styles.error}>{error}</Text>
        ) : loading && data.length === 0 ? (
          <ActivityIndicator />
        ) : chartData.length < 2 ? (
          <Text style={styles.empty}>Not enough data for this range.</Text>
        ) : (
          <View style={{ width: plotWidth + yAxisLabelWidth }}>
            <LineChart
              data={chartData}
              width={plotWidth}
              height={220}
              spacing={spacing}
              initialSpacing={0}
              endSpacing={0}
              maxValue={yRange}
              noOfSections={sections}
              yAxisLabelTexts={yAxisLabelTexts}
              yAxisLabelWidth={yAxisLabelWidth}
              xAxisLabelsHeight={0}
              hideDataPoints
              curved
              thickness={2}
              color="#0a84ff"
              startFillColor="#0a84ff"
              startOpacity={0.18}
              endOpacity={0}
              areaChart
              disableScroll
              yAxisTextStyle={styles.axisText}
              xAxisColor="#e5e7eb"
              yAxisColor="#e5e7eb"
              rulesColor="#f3f4f6"
              pointerConfig={{
                pointerColor: '#0a84ff',
                radius: 5,
                activatePointersOnLongPress: false,
                autoAdjustPointerLabelPosition: true,
                pointerLabelComponent: (items: PointerItem[]) => {
                  const item = items[0];
                  if (item === undefined) return null;
                  const displayed = item.originalRate ?? item.value + yMin;
                  const dateLabel = item.originalDate ?? item.label;
                  return (
                    <View style={styles.tooltip}>
                      {dateLabel !== undefined && dateLabel.length > 0 ? (
                        <Text style={styles.tooltipDate}>{dateLabel}</Text>
                      ) : null}
                      <Text style={styles.tooltipRate}>{formatAmount(displayed, 4)}</Text>
                    </View>
                  );
                },
              }}
            />
            <View
              style={[styles.xLabelRow, { marginLeft: yAxisLabelWidth, width: plotWidth }]}
            >
              {xLabels.map((label, i) => (
                <Text
                  key={`${i}-${label}`}
                  style={[
                    styles.xLabel,
                    i === 0 && styles.xLabelStart,
                    i === xLabels.length - 1 && styles.xLabelEnd,
                  ]}
                >
                  {label}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>

      {stats !== null ? (
        <View style={styles.stats}>
          <Stat label="Min" value={formatAmount(stats.min, 4)} />
          <Stat label="Max" value={formatAmount(stats.max, 4)} />
          <Stat label="Avg" value={formatAmount(stats.avg, 4)} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerSide: { minWidth: 60 },
  back: { fontSize: 16, color: '#0a84ff', fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  tabs: { paddingHorizontal: 20, paddingBottom: 16 },
  chartArea: {
    paddingHorizontal: 16,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  axisText: { color: '#999', fontSize: 11 },
  xLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  xLabel: { fontSize: 11, color: '#999', flexShrink: 0 },
  xLabelStart: { textAlign: 'left' },
  xLabelEnd: { textAlign: 'right' },
  error: { color: '#c00', textAlign: 'center', paddingHorizontal: 24 },
  empty: { color: '#888' },
  tooltip: {
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  tooltipDate: { color: '#fff', fontSize: 10 },
  tooltipRate: { color: '#fff', fontSize: 14, fontWeight: '600' },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  stat: { alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 12, color: '#666' },
  statValue: { fontSize: 16, fontWeight: '600', color: '#111' },
});
