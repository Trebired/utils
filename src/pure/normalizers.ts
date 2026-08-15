import {
  parseBoolean,
} from "./booleans.js";
import {
  clampNumber,
  clampPercent,
  clampPercentOrNull,
  mibToBytes,
  roundedPercentOrNull,
  toFiniteNumber,
  toLimitedInteger,
  toNumberOrZero,
  toStrictInteger,
} from "./numbers.js";
import {
  normalizedEntryValue,
  normalizedStringList,
  onlyString,
  toLowerString,
  toTrimmedString,
  uniqueStringList,
} from "./text.js";

function toBooleanFlag(value: unknown): boolean {
  return toBooleanFlagOr(value, false);
}

function toBooleanFlagOr(value: unknown, fallback = false): boolean {
  return parseBoolean(value, Boolean(fallback));
}

function readBooleanFlag(
  policy: unknown,
  key: string,
  fallback = true,
): boolean {
  if (
    !policy ||
      typeof policy !== "object" ||
      Array.isArray(policy) ||
      !(key in policy)
  ) {
    return Boolean(fallback);
  }
  return toBooleanFlag((policy as Record<string, unknown>)[key]);
}

const normalizers = Object.freeze({
    clampNumber,
    clampPercent,
    clampPercentOrNull,
    mibToBytes,
    normalizedEntryValue,
    normalizedStringList,
    onlyString,
    readBooleanFlag,
    roundedPercentOrNull,
    toBooleanFlag,
    toBooleanFlagOr,
    toFiniteNumber,
    toInteger: toStrictInteger,
    toLimitedInteger,
    toLowerString,
    toNumberOrZero,
    toString: toTrimmedString,
    uniqueStringList,
});

export {
  normalizers,
  readBooleanFlag,
  toBooleanFlag,
  toBooleanFlagOr,
};
