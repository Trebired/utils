function parseBoolean(value: unknown, fallback = false): boolean {
  const text = String(value == null ? "" : value).trim().toLowerCase();
  if (!text) return fallback;
  if (["1", "true", "yes", "on"].includes(text)) return true;
  if (["0", "false", "no", "off"].includes(text)) return false;
  return fallback;
}

function isTruthy(value: unknown): boolean {
  return parseBoolean(value, Boolean(value));
}

export { isTruthy, parseBoolean };
