import {
  isRecord,
  toObject,
  toObjectOrNull,
} from "./records.js";
import { toTrimmedString } from "./text.js";

function resultMeta(value: unknown): Record<string, any> {
  const meta = (value as any)?.meta;
  return meta && typeof meta === "object" && !Array.isArray(meta) ? meta : {};
}

function resultData(value: unknown): Record<string, any> {
  const data = (value as any)?.data;
  return data && typeof data === "object" && !Array.isArray(data) ? data : {};
}

function resultDetails(value: unknown): string {
  const meta = resultMeta(value);
  return toTrimmedString(
    (value as any)?.details || meta.detail || meta.stderr || meta.stdout,
  );
}

function resultMetaText(value: unknown, key: string, fallback = ""): string {
  const meta = resultMeta(value);
  return toTrimmedString(meta[key], fallback);
}

function resultCommandPath(value: unknown, fallback = ""): string {
  return resultMetaText(value, "command_path", fallback);
}

function resultCommandOutput(value: unknown): string {
  return resultDetails(value);
}

function resultMetaFlag(value: unknown, key: string): boolean {
  return resultMeta(value)[key] === true;
}

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
  resultCommandOutput,
  resultCommandPath,
  resultData,
  resultDataObject,
  resultDetails,
  resultMeta,
  resultMetaFlag,
  resultMetaText,
};
