function now(): string {
  return new Date().toISOString();
}

function nowMs(): number {
  return Date.now();
}

function monotonicMs(): number {
  const performanceLike = (globalThis as {
      performance?: { now?: () => number };
  }).performance;
  return Number(
    performanceLike && typeof performanceLike.now === "function"
    ? performanceLike.now()
    : Date.now(),
  );
}

function isExpired(iso: unknown): boolean {
  const value = String(iso ?? "").trim();
  if (value === "") return true;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return true;
  return Date.now() >= ms;
}

function toDateMs(value: unknown): number {
  const text = String(value ?? "").trim();
  if (!text) return 0;
  const ms = Date.parse(text);
  return Number.isFinite(ms) ? ms : 0;
}

function parseDateMsOrNull(value: unknown): number | null {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const ms = Date.parse(text);
  return Number.isFinite(ms) ? ms : null;
}

function parseDateMs(value: unknown, fallback = 0): number {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  if (typeof value === "number" && Number.isFinite(value)) {
    if (value === 0) return null;
    return new Date(value);
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (!text || text === "null" || text === "undefined") return null;
    if (/^\d+$/u.test(text)) {
      const number = Number(text);
      if (!Number.isFinite(number) || number === 0) return null;
      return new Date(number);
    }
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function elapsedMsSince(startedAt: unknown): number {
  const startedMs =
  typeof startedAt === "number" ? startedAt : toDateMs(startedAt);
  if (!Number.isFinite(startedMs)) return 0;
  return Math.max(0, Date.now() - startedMs);
}

function elapsedMsBetween(startedAt: unknown, endedAt: unknown): number {
  const startedMs =
  typeof startedAt === "number" ? startedAt : toDateMs(startedAt);
  const endedMs = typeof endedAt === "number" ? endedAt : toDateMs(endedAt);
  if (!Number.isFinite(startedMs) || !Number.isFinite(endedMs)) return 0;
  return Math.max(0, endedMs - startedMs);
}

function waitMs(ms: unknown): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, Math.max(0, Number(ms) || 0)),
  );
}

function isoOrEmpty(value: unknown): string {
  const ms = toDateMs(value);
  if (!Number.isFinite(ms) || ms <= 0) return "";
  return new Date(ms).toISOString();
}

type TimeStyle =
"rel_short" |
"rel_long" |
"abs_date" |
"abs_month_year" |
"abs_datetime" |
"iso";

type TimeFormatOptions = {
  fallback?: string;
  locale?: unknown;
  seconds?: boolean;
  tz?: string;
  withTime?: boolean;
};

function time(
  input: unknown,
  style: TimeStyle | string = "rel_short",
  opts: TimeFormatOptions = {},
): string {
  const fallback =
  typeof opts.fallback === "string" ? opts.fallback : "unknown";
  const date = toDate(input);
  if (!date) return fallback;

  switch (style) {
    case "rel_short":
    return formatRelative(date, "short");
    case "rel_long":
    return formatRelative(date, "long");
    case "abs_date":
    return formatAbsolute(date, { ...opts, withTime: false });
    case "abs_month_year":
    return formatMonthYear(date, opts);
    case "abs_datetime":
    return formatAbsolute(date, {
        ...opts,
        seconds: opts.seconds !== false,
        withTime: true,
    });
    case "iso":
    return formatISO(date, opts.tz);
    default:
    return formatRelative(date, "short");
  }
}

function browserLocale(): string | undefined {
  const doc = (globalThis as { document?: { documentElement?: { lang?: string } } }).document;
  return doc && doc.documentElement ? doc.documentElement.lang || undefined : undefined;
}

function formatAbsoluteDateTimeLabel(
  value: unknown,
  fallback = "unknown",
  invalidFallback: string | null = null,
  options: { locale?: unknown } = {},
): string {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  const nextFallback = invalidFallback == null ? raw : invalidFallback;
  return String(
    time(raw, "abs_datetime", {
        fallback: nextFallback,
        locale: Object.prototype.hasOwnProperty.call(options, "locale")
        ? options.locale
        : browserLocale(),
    }) || nextFallback,
  );
}

function formatClockTimeLabel(value: unknown, fallback = ""): string {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  try {
    const text = new Date(raw).toLocaleTimeString();
    return text || fallback;
  } catch {
    return fallback;
  }
}

function formatRelative(date: Date, mode: "short" | "long"): string {
  const nowDate = new Date();
  let diffSec = Math.floor((nowDate.getTime() - date.getTime()) / 1000);
  const future = diffSec < 0;
  diffSec = Math.abs(diffSec);

  const table: Array<[string, number, string]> = [
    ["year", 31_104_000, "y"],
    ["month", 2_592_000, "mo"],
    ["day", 86_400, "d"],
    ["hour", 3_600, "h"],
    ["minute", 60, "m"],
    ["second", 1, "s"],
  ];

  for (const [label, unit, short] of table) {
    if (diffSec >= unit || label === "second") {
      const val = Math.floor(diffSec / unit);
      if (mode === "short") return future ? `in ${val}${short}` : `${val}${short}`;
      const suffix = val === 1 ? "" : "s";
      return future
      ? `in ${val} ${label}${suffix}`
      : `${val} ${label}${suffix} ago`;
    }
  }

  return "";
}

function formatAbsolute(
  date: Date,
  options: TimeFormatOptions = {},
): string {
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  if (options.withTime) {
    opts.hour = "2-digit";
    opts.minute = "2-digit";
    opts.hourCycle = "h23";
    if (options.seconds) opts.second = "2-digit";
  }

  if (options.tz) opts.timeZone = String(options.tz);
  return formatIntl(date, options.locale, opts);
}

function formatMonthYear(date: Date, options: TimeFormatOptions = {}): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: "long",
    year: "numeric",
  };
  if (options.tz) opts.timeZone = String(options.tz);
  return formatIntl(date, options.locale, opts);
}

function formatISO(date: Date, tz?: string): string {
  if (!tz) return date.toISOString();

  const parts = formatDateParts(date, tz, {
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      month: "2-digit",
      second: "2-digit",
      year: "numeric",
  });

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

function formatDateParts(
  date: Date,
  tz: string | undefined,
  opts: Intl.DateTimeFormatOptions,
): Record<string, string> {
  const df = new Intl.DateTimeFormat(undefined, {
      numberingSystem: "latn",
      timeZone: tz,
      ...opts,
  });
  const parts: Record<string, string> = {};

  for (const part of df.formatToParts(date)) {
    parts[part.type] = part.value;
  }

  for (const key of ["month", "day", "hour", "minute", "second"]) {
    if (parts[key]) parts[key] = String(parts[key]).padStart(2, "0");
  }

  return parts;
}

function formatIntl(
  date: Date,
  locale: unknown,
  opts: Intl.DateTimeFormatOptions,
): string {
  const normalizedLocale = normalizeLocale(locale);

  try {
    return new Intl.DateTimeFormat(normalizedLocale || undefined, opts).format(date);
  } catch {
    const fallbackOpts = { ...opts };
    delete fallbackOpts.timeZone;
    return new Intl.DateTimeFormat(
      normalizedLocale || undefined,
      fallbackOpts,
    ).format(date);
  }
}

function normalizePartitionTimestamp(value: unknown = null): string {
  const text = String(value == null ? "" : value).trim();
  if (!text) return "";
  return Number.isNaN(Date.parse(text)) ? "" : text;
}

function formatUtcHourPartitionKey(value: unknown = null): string {
  const timestamp = normalizePartitionTimestamp(value);
  if (!timestamp) return "";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  return `${year}-${month}-${day}-${hour}-0000`;
}

function normalizeLocale(input: unknown): string {
  const raw = String(input == null ? "" : input).trim();
  if (!raw) return "";

  try {
    const supported = Intl.DateTimeFormat.supportedLocalesOf([raw]);
    return supported[0] || "";
  } catch {
    return "";
  }
}

export {
  elapsedMsBetween,
  elapsedMsSince,
  formatAbsoluteDateTimeLabel,
  formatClockTimeLabel,
  formatUtcHourPartitionKey,
  isExpired,
  isoOrEmpty,
  monotonicMs,
  normalizeLocale,
  now,
  nowMs,
  parseDateMs,
  parseDateMsOrNull,
  time,
  toDate,
  toDateMs,
  waitMs,
};
export type { TimeFormatOptions, TimeStyle };
