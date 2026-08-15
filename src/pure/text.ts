function toString(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  const text = String(value);
  return text || fallback;
}

function toTrimmedString(value: unknown, fallback = ""): string {
  const text = toString(value).trim();
  return text || fallback;
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

function firstString(values: readonly unknown[], fallback = ""): string {
  for (const value of values) {
    const text = toTrimmedString(value);
    if (text) return text;
  }
  return fallback;
}

export {
  envToken,
  firstString,
  slugText,
  toString,
  toTrimmedString,
  uniqueStrings,
};
