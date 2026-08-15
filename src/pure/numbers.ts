function toNumber(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toInteger(value: unknown, fallback = 0): number {
  const number = toNumber(value, fallback);
  return Number.isFinite(number) ? Math.trunc(number) : fallback;
}

function toPositiveInteger(value: unknown, fallback = 1): number {
  const number = toInteger(value, fallback);
  return number > 0 ? number : fallback;
}

function toNonNegativeNumber(value: unknown, fallback = 0): number {
  const number = toNumber(value, fallback);
  return number >= 0 ? number : fallback;
}

export {
  toInteger,
  toNonNegativeNumber,
  toNumber,
  toPositiveInteger,
};
