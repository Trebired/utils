import { clampPercent } from "./numbers.js";
import { toTrimmedString } from "./text.js";

function countLabel(
  count: unknown,
  singular: unknown,
  plural?: unknown,
): string {
  const value = Number.isFinite(Number(count))
  ? Math.max(0, Math.trunc(Number(count)))
  : 0;
  const singularText = toTrimmedString(singular);
  const pluralText = toTrimmedString(plural) || `${singularText}s`;
  return `${value} ${value === 1 ? singularText : pluralText}`.trim();
}

type FormatCountOptions = {
  fallback?: string;
  locale?: false | string;
  round?: boolean;
};

function formatCount(value: unknown, options: FormatCountOptions = {}): string {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return toTrimmedString(options.fallback, "0");

  const count = Math.max(0, options.round === true ? Math.round(raw) : raw);
  if (options.locale === false) return String(count);

  return count.toLocaleString(toTrimmedString(options.locale, "en-US"));
}

type FormatPercentOptions = {
  clamp?: boolean;
  decimals?: number;
  fallback?: string;
  round?: boolean;
  suffix?: string;
  trim?: boolean;
};

function formatPercent(
  value: unknown,
  options: FormatPercentOptions = {},
): string {
  let num = Number(value);
  if (!Number.isFinite(num)) return toTrimmedString(options.fallback, "unknown");
  if (options.clamp === true) num = clampPercent(num);

  const suffix = toTrimmedString(options.suffix, "%");
  if (options.round === true) return `${Math.round(num)}${suffix}`;

  const rawDecimals = Number(options.decimals);
  const decimals = Number.isInteger(rawDecimals)
  ? Math.max(0, Math.min(20, rawDecimals))
  : 1;
  const formatted = num.toFixed(decimals);
  const text =
  options.trim === true ? formatted.replace(/\.?0+$/u, "") : formatted;
  return `${text}${suffix}`;
}

type FormatTemperatureOptions = {
  bounded?: boolean;
  decimals?: number;
  fallback?: string;
  suffix?: string;
};

function formatTemperature(
  value: unknown,
  options: FormatTemperatureOptions = {},
): string {
  const num = Number(value);
  const fallback = toTrimmedString(options.fallback, "unknown");
  if (!Number.isFinite(num)) return fallback;
  if (options.bounded !== false && (num <= 0 || num >= 250)) return fallback;

  const rawDecimals = Number(options.decimals);
  const decimals = Number.isInteger(rawDecimals)
  ? Math.max(0, Math.min(20, rawDecimals))
  : 1;
  return `${num.toFixed(decimals)}${toTrimmedString(options.suffix, "\u00b0C")}`;
}

function formatRemainingDuration(value: unknown): string {
  const ms = Number(value);
  if (!Number.isFinite(ms) || ms <= 0) return "expired";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];

  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

type FormatBytesOptions = {
  fallback?: string;
  invalid?: "fallback" | "zero";
  negative?: "fallback" | "signed" | "zero";
  precision?: "compact" | "upload" | "wide";
  trim?: boolean;
  units?: string[];
  zero?: string;
};

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"];
const COMPACT_BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"];

function bytePrecision(
  size: number,
  unitIndex: number,
  style: FormatBytesOptions["precision"],
): number {
  if (unitIndex === 0) return 0;
  if (style === "wide") return size >= 100 ? 0 : size >= 10 ? 1 : 2;
  if (style === "upload") return size < 10 ? 2 : size < 100 ? 1 : 0;
  return size >= 10 ? 0 : 1;
}

function formatBytes(value: unknown, options: FormatBytesOptions = {}): string {
  const zero = toTrimmedString(options.zero, "0 B");
  const fallback = toTrimmedString(options.fallback, "unknown");
  const raw = Number(value);
  if (!Number.isFinite(raw)) {
    return options.invalid === "zero" ? zero : fallback;
  }

  const num = resolveByteValue(raw, options);
  if (num == null) return fallback;
  if (num === 0) return zero;

  return formatByteValue(num, options);
}

function resolveByteValue(
  raw: number,
  options: FormatBytesOptions,
): number | null {
  if (raw >= 0) return raw;
  if (options.negative === "zero") return 0;
  if (options.negative === "signed") return raw;
  return null;
}

function formatByteValue(num: number, options: FormatBytesOptions): string {
  const units =
  Array.isArray(options.units) && options.units.length
  ? options.units
  : BYTE_UNITS;
  let size = Math.abs(num);
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const precision = bytePrecision(
    size,
    unitIndex,
    options.precision || "compact",
  );
  const formatted = size.toFixed(precision);
  const normalized =
  options.trim === true ? formatted.replace(/\.?0+$/u, "") : formatted;
  return `${num < 0 ? "-" : ""}${normalized} ${units[unitIndex] || ""}`.trim();
}

function formatCompactBytes(value: unknown): string {
  return formatBytes(value, {
      invalid: "zero",
      negative: "signed",
      units: COMPACT_BYTE_UNITS,
  });
}

export {
  countLabel,
  formatBytes,
  formatCompactBytes,
  formatCount,
  formatPercent,
  formatRemainingDuration,
  formatTemperature,
};
export type {
  FormatBytesOptions,
  FormatCountOptions,
  FormatPercentOptions,
  FormatTemperatureOptions,
};
