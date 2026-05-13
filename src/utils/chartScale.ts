export interface YScale {
  yMin: number;
  yMax: number;
  yRange: number;
}

export function computeYScale(values: readonly number[]): YScale {
  if (values.length === 0) {
    return { yMin: 0, yMax: 1, yRange: 1 };
  }
  let min = values[0];
  let max = values[0];
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const span = max - min;
  const pad = span > 0 ? span * 0.15 : Math.max(max * 0.005, 0.0001);
  const yMin = min - pad;
  const yMax = max + pad;
  return { yMin, yMax, yRange: yMax - yMin };
}
