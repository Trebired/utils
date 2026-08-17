type StringListOptions = {
  objectValues?: boolean;
  scalar?: boolean;
};

type UniqueStringListOptions = StringListOptions& {
  caseInsensitive?: boolean;
  lowerCase?: boolean;
  skip?: readonly string[];
};

type UniqueTextOptions = {
  exclude?: readonly unknown[];
  lowerCase?: boolean;
};

function toString(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  const text = String(value);
  return text || fallback;
}

function toTrimmedString(value: unknown, fallback = ""): string {
  const text = toString(value).trim();
  return text || fallback;
}

function onlyString(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function toLowerString(value: unknown): string {
  return toTrimmedString(value).toLowerCase();
}

function normalizedStringList(
  value: unknown,
  options: StringListOptions = {},
): string[] {
  const values = Array.isArray(value)
  ? value
  : options.objectValues && value && typeof value === "object"
  ? Object.values(value as Record<string, unknown>)
  : options.scalar === false
  ? []
  : [value];
  return values.map((entry) => toTrimmedString(entry)).filter(Boolean);
}

function uniqueStringList(
  value: unknown,
  options: UniqueStringListOptions = {},
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const skipped = new Set(
    (options.skip || []).map((entry) => toLowerString(entry)),
  );

  for (const entry of normalizedStringList(value, options)) {
    const text = options.lowerCase ? entry.toLowerCase() : entry;
    const key =
    options.caseInsensitive || options.lowerCase ? text.toLowerCase() : text;
    if (!text || skipped.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }

  return out;
}

function normalizedEntryValue(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const record = value as Record<string, unknown>;
  return (
    onlyString(record.entry) ||
      onlyString(record.normalized) ||
      onlyString(record.value) ||
      null
  );
}

function slugText(value: unknown, fallback = "value"): string {
  const text = toTrimmedString(value, fallback).toLowerCase();
  const slug = text.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || slugText(fallback === value ? "value" : fallback, "value");
}

function envToken(value: unknown, fallback = "VALUE"): string {
  const text = toTrimmedString(value, fallback).toUpperCase();
  const token = text.replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return token || envToken(fallback === value ? "VALUE" : fallback, "VALUE");
}

function uniqueStrings(values: readonly unknown[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const text = toTrimmedString(value);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  return out;
}

function uniqueText(
  values: unknown = [],
  options: UniqueTextOptions | null = null,
): string[] {
  const cfg = options && typeof options === "object" ? options : {};
  const exclude = new Set(
    (Array.isArray(cfg.exclude) ? cfg.exclude : [])
    .map((value) => toTrimmedString(value))
    .filter(Boolean),
  );

  return uniqueStrings(Array.isArray(values) ? values : [])
  .map((value) => (cfg.lowerCase === true ? value.toLowerCase() : value))
  .filter((value) => value && !exclude.has(value));
}

function errorMessage(error: unknown): string {
  return error && typeof error === "object" && "message"in error
  ? String((error as { message?: unknown }).message)
  : String(error);
}

function firstString(values: readonly unknown[], fallback = ""): string {
  for (const value of values) {
    const text = toTrimmedString(value);
    if (text) return text;
  }
  return fallback;
}

function toAcronym(value: unknown): string {
  const parts = toTrimmedString(value);
  if (!parts) return "";
  return parts
  .split(/\s+/)
  .filter(Boolean)
  .map((part) => part[0] || "")
  .join("")
  .toUpperCase();
}

function toTitleCase(value: unknown): string {
  return toTrimmedString(value)
  .replace(/[_-]+/g, " ")
  .replace(/\b\w/gu, (match) => match.toUpperCase());
}

function safeDomId(value: unknown, fallback = "item"): string {
  const safeFallback = toTrimmedString(fallback, "item");
  return (
    toTrimmedString(value, safeFallback)
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "") || safeFallback
  );
}

function productVersionLabel(value: unknown, fallback = "unknown"): string {
  const text = toTrimmedString(value);
  return text ? `v${text.replace(/^v/iu, "")}` : toTrimmedString(fallback);
}

function titleSuffixText(value: unknown, fallback = ""): string {
  const raw = String(value == null ? "" : value);
  const next = raw.trim() ? raw : String(fallback == null ? "" : fallback);
  const trimmed = next.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("|") ? ` ${trimmed}` : trimmed;
}

function searchText(value: unknown): string {
  const parts = Array.isArray(value) ? value : [value];
  return parts
  .map((entry) => toTrimmedString(entry))
  .filter(Boolean)
  .join(" ")
  .trim()
  .toLowerCase();
}

function tokenPreview(value: unknown): string {
  const text = toTrimmedString(value);
  if (!text) return "";
  if (text.length <= 12) return text;
  return `${text.slice(0, 8)}...${text.slice(-4)}`;
}

function prefixIfMissing(
  value: unknown,
  prefix: string,
  fallback = "",
): string {
  const parts = toTrimmedString(value);
  if (!parts) return fallback;
  return parts.startsWith(prefix) ? parts : `${prefix}${parts}`;
}

function packageScope(name: string): string {
  return /^@([^/]+)\//u.exec(name)?.[1] ?? "";
}

function packageSlug(name: string): string {
  return name.replace(/^@[^/]+\//u, "").trim();
}

function joinLogGroup(...parts: unknown[]): string {
  return parts.map((part) => toTrimmedString(part)).filter(Boolean).join(".");
}

export {
  envToken,
  errorMessage,
  firstString,
  joinLogGroup,
  normalizedEntryValue,
  normalizedStringList,
  onlyString,
  packageScope,
  packageSlug,
  prefixIfMissing,
  productVersionLabel,
  safeDomId,
  searchText,
  slugText,
  titleSuffixText,
  toAcronym,
  toLowerString,
  tokenPreview,
  toTitleCase,
  toString,
  toTrimmedString,
  uniqueStringList,
  uniqueText,
  uniqueStrings,
};
export type { StringListOptions, UniqueStringListOptions, UniqueTextOptions };
