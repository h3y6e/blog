const TUKEY_K = 1.5;

export const median = (values: number[]): number => {
  if (values.length === 0) return Number.NaN;
  const sorted = values.toSorted((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 === 1
    ? (sorted[mid] ?? Number.NaN)
    : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
};

/** Linearly interpolated quantile. */
export const quantile = (values: number[], q: number): number => {
  const sorted = values.toSorted((a, b) => a - b);
  if (sorted.length === 0) return Number.NaN;
  if (sorted.length === 1) return sorted[0] ?? Number.NaN;
  const pos = q * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.min(lo + 1, sorted.length - 1);
  const frac = pos - lo;
  return (sorted[lo] ?? 0) * (1 - frac) + (sorted[hi] ?? 0) * frac;
};

export type Band = { warnMin: number; warnMax: number; hardMin: number; hardMax: number };

/**
 * warn = median ± max(IQR, floor); hard = observed extremes ∪ Tukey fence.
 *
 * `floor` keeps the warn band from collapsing on metrics that barely vary.
 * hard reaches the extremes so the posts used for calibration never fail.
 */
export const band = (values: number[], floor: number, isRatio: boolean): Band => {
  const q1 = quantile(values, 0.25);
  const q3 = quantile(values, 0.75);
  const center = median(values);
  const width = Math.max(q3 - q1, floor);
  const lowest = Math.min(...values);
  const fence = TUKEY_K * (q3 - q1);
  const hardMax = Math.max(Math.max(...values), q3 + fence);
  return {
    warnMin: Math.max(center - width, 0),
    warnMax: isRatio ? Math.min(center + width, 1) : center + width,
    hardMin: lowest >= 0 ? Math.max(Math.min(lowest, q1 - fence), 0) : Math.min(lowest, q1 - fence),
    hardMax: isRatio ? Math.min(hardMax, 1) : hardMax,
  };
};
