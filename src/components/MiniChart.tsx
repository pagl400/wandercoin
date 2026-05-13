import { StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { useTimeSeries } from '../hooks/useTimeSeries';
import { computeYScale } from '../utils/chartScale';

interface MiniChartProps {
  from: string;
  to: string;
  width: number;
  height?: number;
}

export function MiniChart({ from, to, width, height = 60 }: MiniChartProps) {
  const { data } = useTimeSeries(from, to, '1M');

  if (data.length < 2) {
    return <View style={[styles.placeholder, { width, height }]} />;
  }

  const rates = data.map((p) => p.rate);
  const { yMin, yRange } = computeYScale(rates);
  const chartData = data.map((pt) => ({ value: pt.rate - yMin }));
  const spacing = width / Math.max(1, chartData.length - 1);

  return (
    <View style={[styles.container, { width, height }]}>
      <LineChart
        data={chartData}
        width={width}
        height={height}
        spacing={spacing}
        initialSpacing={0}
        endSpacing={0}
        maxValue={yRange}
        hideAxesAndRules
        hideRules
        hideDataPoints
        hideYAxisText
        xAxisColor="transparent"
        yAxisColor="transparent"
        curved
        thickness={2}
        color="#0a84ff"
        startFillColor="#0a84ff"
        startOpacity={0.18}
        endOpacity={0}
        areaChart
        disableScroll
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  placeholder: { backgroundColor: 'transparent' },
});
