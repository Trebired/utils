import {
  isRecord,
  toObject,
  toObjectOrNull,
} from "./records.js";

function resultDataObject(value: unknown): Record<string, any> {
  return toObject((value as any)?.data);
}

function okResultDataObject<T=Record<string, any>>(
  value: unknown,
): T | null {
  return (value as any)?.ok === true
  ? toObjectOrNull<T>((value as any).data)
  : null;
}

function okResultList<T=any>(value: unknown): T[] {
  if ((value as any)?.ok !== true) return [];
  const data = (value as any).data;
  if (Array.isArray(data)) return data as T[];
  if (!isRecord(data)) return [];
  if (Array.isArray(data.data)) return data.data as T[];
  if (isRecord(data.data) && Array.isArray(data.data.data)) {
    return data.data.data as T[];
  }
  if (Array.isArray(data.items)) return data.items as T[];
  if (Array.isArray(data.list)) return data.list as T[];
  return [];
}

function appendHistory<T=unknown>(
  history: unknown,
  entry: unknown,
  limit: number,
): T[] {
  const current = Array.isArray(history) ? history as T[] : [];
  const maxItems =
  Number.isInteger(limit) && limit > 0 ? limit : current.length;
  if (!entry || typeof entry !== "object") return current.slice(-maxItems);
  return [...current, entry as T].slice(-maxItems);
}

export {
  appendHistory,
  okResultDataObject,
  okResultList,
  resultDataObject,
};
