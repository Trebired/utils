import { toArray } from "./arrays.js";
import { stableStringify } from "./records.js";
import { toTrimmedString } from "./text.js";

function findByIdOrIndex<T=any>(
  itemsInput: unknown,
  idInput: unknown,
  indexInput: unknown,
): T | null {
  const items = toArray<T>(itemsInput);
  const id = toTrimmedString(idInput);
  const index = Number(indexInput);
  return (
    items.find((item: any) => toTrimmedString(item?.id) === id) ||
      (Number.isInteger(index) ? items[index] : null) ||
      null
  );
}

function sortByTextDesc<T>(
  items: T[],
  readText: (item: T) => unknown,
): T[] {
  return items
  .slice()
  .sort((left, right) =>
    toTrimmedString(readText(right))
    .localeCompare(toTrimmedString(readText(left))),
  );
}

function recordMatchesWhere(record: unknown, where: unknown): boolean {
  const filters =
  where && typeof where === "object" && !Array.isArray(where)
  ? where as Record<string, unknown>
  : {};
  if (!Object.keys(filters).length) return true;

  const item =
  record && typeof record === "object" && !Array.isArray(record)
  ? record as Record<string, unknown>
  : null;
  if (!item) return false;

  return Object.entries(filters).every(([key, value]) =>
    recordValueMatches(item[key], value),
  );
}

function recordValueMatches(current: unknown, expected: unknown): boolean {
  if (expected && typeof expected === "object") {
    return stableStringify(current) === stableStringify(expected);
  }
  return current === expected;
}

export { findByIdOrIndex, recordMatchesWhere, sortByTextDesc };
