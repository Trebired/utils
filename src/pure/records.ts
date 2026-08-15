type PlainRecord = Record<string, unknown>;

function isRecord(value: unknown): value is PlainRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
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

export {
  compactRecord,
  cloneJson,
  freezeRecord,
  hasOwn,
  isRecord,
  objectEntries,
  toObject,
};
export type { PlainRecord };
