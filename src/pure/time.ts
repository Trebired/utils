function now(): string {
  return new Date().toISOString();
}

function nowMs(): number {
  return Date.now();
}

function monotonicMs(): number {
  const performanceLike = (globalThis as {
      performance?: { now?: () => number };
  }).performance;
  return Number(
    performanceLike && typeof performanceLike.now === "function"
    ? performanceLike.now()
    : Date.now(),
  );
}

function isExpired(iso: unknown): boolean {
  const value = String(iso ?? "").trim();
  if (value === "") return true;

  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return true;

  return Date.now() >= ms;
}

function toDateMs(value: unknown): number {
  const text = String(value ?? "").trim();
  if (!text) return 0;
  const ms = Date.parse(text);
  return Number.isFinite(ms) ? ms : 0;
}

function parseDateMsOrNull(value: unknown): number | null {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const ms = Date.parse(text);
  return Number.isFinite(ms) ? ms : null;
}

function elapsedMsSince(startedAt: unknown): number {
  const startedMs =
  typeof startedAt === "number" ? startedAt : toDateMs(startedAt);
  if (!Number.isFinite(startedMs)) return 0;
  return Math.max(0, Date.now() - startedMs);
}

function elapsedMsBetween(startedAt: unknown, endedAt: unknown): number {
  const startedMs =
  typeof startedAt === "number" ? startedAt : toDateMs(startedAt);
  const endedMs = typeof endedAt === "number" ? endedAt : toDateMs(endedAt);
  if (!Number.isFinite(startedMs) || !Number.isFinite(endedMs)) return 0;
  return Math.max(0, endedMs - startedMs);
}

function waitMs(ms: unknown): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, Math.max(0, Number(ms) || 0)),
  );
}

function isoOrEmpty(value: unknown): string {
  const ms = toDateMs(value);
  if (!Number.isFinite(ms) || ms <= 0) return "";
  return new Date(ms).toISOString();
}

function normalizeLocale(input: unknown): string {
  const raw = String(input == null ? "" : input).trim();
  if (!raw) return "";

  try {
    const supported = Intl.DateTimeFormat.supportedLocalesOf([raw]);
    return supported[0] || "";
  } catch {
    return "";
  }
}

export {
  elapsedMsBetween,
  elapsedMsSince,
  isExpired,
  isoOrEmpty,
  monotonicMs,
  normalizeLocale,
  now,
  nowMs,
  parseDateMsOrNull,
  toDateMs,
  waitMs,
};
