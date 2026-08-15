import { toArray } from "./arrays.js";

function resolveGraphRoof(valuesInput: unknown): number {
  const values = toArray(valuesInput)
  .map((item: any) =>
    Number(item && typeof item === "object" ? item.value : item),
  )
  .filter(Number.isFinite);
  const maxValue = values.length ? Math.max(...values, 0) : 0;
  const padded = maxValue > 0 ? maxValue * 1.15 : 10;
  const power = Math.pow(10, Math.floor(Math.log10(Math.max(padded, 1))));
  const normalized = padded / power;
  return niceGraphRoof(normalized) * power;
}

function niceGraphRoof(normalized: number): number {
  if (normalized <= 1) return 1;
  if (normalized <= 2) return 2;
  if (normalized <= 2.5) return 2.5;
  if (normalized <= 5) return 5;
  return 10;
}

function numericPointValues(pointsInput: unknown): number[] {
  return toArray(pointsInput)
  .map((point: any) =>
    Number(point && typeof point === "object" ? point.value : point),
  )
  .filter(Number.isFinite);
}

function averagePointValue(pointsInput: unknown): number | null {
  const values = numericPointValues(pointsInput);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function peakPointValue(pointsInput: unknown): number | null {
  const values = numericPointValues(pointsInput);
  if (!values.length) return null;
  return Math.max(...values);
}

function graphRightDetails(roofInput: unknown): number[] {
  const roof = Number(roofInput);
  const maxValue = Number.isFinite(roof) && roof > 0 ? roof : 0;
  const step = maxValue / 4;
  return [
    maxValue,
    maxValue - step,
    maxValue - step * 2,
    maxValue - step * 3,
    0,
  ];
}

function graphRightDetailsForPoints(pointsInput: unknown): number[] {
  return graphRightDetails(resolveGraphRoof(pointsInput));
}

function percentGraphRightDetails(): number[] {
  return graphRightDetails(100);
}

export {
  averagePointValue,
  graphRightDetails,
  graphRightDetailsForPoints,
  numericPointValues,
  peakPointValue,
  percentGraphRightDetails,
  resolveGraphRoof,
};
