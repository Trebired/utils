function toArray<T=unknown>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function compactArray<T>(value: readonly(T | null | undefined)[]): T[] {
  return value.filter((item): item is T => item != null);
}

function firstItem<T>(value: readonly T[], fallback: T): T {
  return value.length > 0 ? value[0] as T : fallback;
}

export { compactArray, firstItem, toArray };
