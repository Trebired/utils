function toArray<T=any>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function arrayFromValue<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function compactArray<T>(value: readonly(T | null | undefined)[]): T[] {
  return value.filter((item): item is T => item != null);
}

function firstItem<T>(value: readonly T[], fallback: T): T {
  return value.length > 0 ? value[0] as T : fallback;
}

export { arrayFromValue, compactArray, firstItem, toArray };
