type PlainRecord = Record<string, unknown>;

function isRecord(value: unknown): value is PlainRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isPlainObject(value: unknown): value is PlainRecord {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function toObject(value: unknown): PlainRecord {
  return isRecord(value) ? value : {};
}

function hasOwn(value: unknown, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(toObject(value), key);
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
  if (value == null) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function clonePlain(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(clonePlain);
  if (!isPlainObject(value)) return value;

  const out: PlainRecord = {};
  for (const key of Object.keys(value)) out[key] = clonePlain(value[key]);
  return out;
}

export {
  clonePlain,
  compactRecord,
  cloneJson,
  freezeRecord,
  hasOwn,
  isPlainObject,
  isRecord,
  objectEntries,
  toObject,
};
export type { PlainRecord };
