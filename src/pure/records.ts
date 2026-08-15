type PlainRecord = Record<string, unknown>;
type AnyRecord = Record<string, any>;

function isRecord(value: unknown): value is AnyRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isPlainObject(value: unknown): value is PlainRecord {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function hasOwn(value: unknown, key: string): boolean {
  return hasOwnProperty(value, key);
}

function hasOwnProperty(value: unknown, key: PropertyKey): boolean {
  if (!value || (typeof value !== "object" && typeof value !== "function")) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(value, key);
}

function toObject<T=AnyRecord>(value: unknown): T | AnyRecord {
  return isRecord(value) ? value as T : {};
}

function toObjectOr(value: unknown, fallback: null): AnyRecord | null;
function toObjectOr<T>(value: unknown, fallback: T): T&AnyRecord;
function toObjectOr<T>(
  value: unknown,
  fallback: T,
): T | AnyRecord | null {
  return isRecord(value) ? value : fallback;
}

function objectEntries(value: unknown): Array<[string, unknown]> {
  return Object.entries(toObject(value));
}

function freezeRecord<T extends PlainRecord>(value: T): Readonly<T> {
  return Object.freeze({ ...value });
}

function compactRecord(value: unknown): PlainRecord {
  const out: PlainRecord = {};
  for (const [key, item] of objectEntries(value)) {
    if (item == null) continue;
    if (typeof item === "string" && !item.trim()) continue;
    out[key] = item;
  }
  return out;
}

function cloneJson<T>(value: T): T {
  if (!value || typeof value !== "object") return value;
  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return value;
  }
}

function clonePlain(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(clonePlain);
  if (!isPlainObject(value)) return value;

  const out: PlainRecord = {};
  for (const key of Object.keys(value)) out[key] = clonePlain(value[key]);
  return out;
}

function toObjectOrNull<T=AnyRecord>(value: unknown): T | null {
  return isRecord(value) ? value as T : null;
}

function hasObjectFields(value: unknown): boolean {
  return Object.keys(toObject(value)).length > 0;
}

function truthyArray<T=any>(value: unknown): T[] {
  return toArrayValue<T>(value).filter(Boolean);
}

function valuesFromCollection<T=any>(value: unknown): T[] {
  if (Array.isArray(value)) return value.filter(Boolean) as T[];
  if (isRecord(value)) return Object.values(value).filter(Boolean) as T[];
  return [];
}

function toArrayValue<T=any>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function stableStringify(input: unknown): string {
  if (input == null || typeof input !== "object") {
    return JSON.stringify(input) || "";
  }

  if (Array.isArray(input)) {
    return `[${input.map((item) => stableStringify(item)).join(",")}]`;
  }

  const record = input as PlainRecord;
  const keys = Object.keys(record).sort();
  const body = keys
  .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
  .join(",");
  return `{${body}}`;
}

function jsonText(input: unknown): string {
  try {
    return JSON.stringify(input) || "";
  } catch {
    return "";
  }
}

export {
  clonePlain,
  compactRecord,
  cloneJson,
  freezeRecord,
  hasOwn,
  hasObjectFields,
  hasOwnProperty,
  isPlainObject,
  isRecord,
  jsonText,
  objectEntries,
  stableStringify,
  toArrayValue,
  toObject,
  toObjectOr,
  toObjectOrNull,
  truthyArray,
  valuesFromCollection,
};
export { isRecord as isObj };
export type { AnyRecord, PlainRecord };
