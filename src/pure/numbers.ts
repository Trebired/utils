function toNumber(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toInteger(value: unknown, fallback = 0): number {
  const number = toNumber(value, fallback);
  return Number.isFinite(number) ? Math.trunc(number) : fallback;
}

function toPositiveInteger(value: unknown, fallback = 1): number {
  const number = toInteger(value, fallback);
  return number > 0 ? number : fallback;
}

function toNonNegativeNumber(value: unknown, fallback = 0): number {
  const number = toNumber(value, fallback);
  return number >= 0 ? number : fallback;
}

function toStrictInteger<T=null>(
  value: unknown,
  fallback: T = null as T,
): number | T {
  const number = Number(value);
  return Number.isInteger(number) ? number : fallback;
}

function toFiniteNumber<T=null>(
  value: unknown,
  fallback: T = null as T,
): number | T {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toNumberOrZero(value: unknown): number {
  return toFiniteNumber(value, 0);
}

function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: unknown = value,
): number {
  const next = toFiniteNumber(value, null);
  const fallbackNumber = toFiniteNumber(fallback, min);
  const resolved = next == null ? fallbackNumber : next;
  return Math.min(Math.max(resolved, min), max);
}

type LimitedIntegerOptions = {
  belowMin?: "clamp" | "fallback";
  max?: number;
  min?: number;
};

function toLimitedInteger(
  value: unknown,
  fallback: number,
  options: LimitedIntegerOptions = {},
): number {
  const parsed = Number.parseInt(String(value == null ? "" : value).trim(), 10);
  const safeFallback = Number.isFinite(Number(fallback))
  ? Math.floor(Number(fallback))
  : 0;
  if (!Number.isFinite(parsed)) return safeFallback;

  const min = Number.isFinite(Number(options.min))
  ? Math.floor(Number(options.min))
  : null;
  if (min != null && parsed < min) {
    return options.belowMin === "clamp" ? min : safeFallback;
  }

  const max = Number.isFinite(Number(options.max))
  ? Math.floor(Number(options.max))
  : null;
  return max == null ? Math.floor(parsed) : Math.min(Math.floor(parsed), max);
}

function clampPercent(value: unknown, fallback: unknown = 0): number {
  return clampNumber(value, 0, 100, fallback);
}

function clampPercentOrNull(value: unknown): number | null {
  const next = toFiniteNumber(value, null);
  return next == null ? null : clampPercent(next);
}

function roundedPercentOrNull(
  value: unknown,
  digits = 1,
): number | null {
  const next = toFiniteNumber(value, null);
  if (next == null) return null;
  const precision = Number.isInteger(digits) && digits >= 0 ? digits : 1;
  return clampPercent(Number(next.toFixed(precision)));
}

type MibToBytesOptions = {
  allowZero?: boolean;
  fallback?: number | null;
};

function mibToBytes(
  value: unknown,
  options: MibToBytesOptions = {},
): number | null {
  const next = Number(value);
  const fallback = Object.prototype.hasOwnProperty.call(options, "fallback")
  ? (options.fallback as number | null)
  : 0;
  if (!Number.isFinite(next) || next < 0) return fallback;
  if (next === 0 && options.allowZero !== true) return fallback;
  return Math.round(next * 1024 * 1024);
}

export {
  clampNumber,
  clampPercent,
  clampPercentOrNull,
  mibToBytes,
  roundedPercentOrNull,
  toFiniteNumber,
  toInteger,
  toLimitedInteger,
  toNonNegativeNumber,
  toNumber,
  toNumberOrZero,
  toPositiveInteger,
  toStrictInteger,
};
export type { LimitedIntegerOptions, MibToBytesOptions };
