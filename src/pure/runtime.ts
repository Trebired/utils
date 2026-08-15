import { toTrimmedString } from "./text.js";

function normalizeRuntimeKey(value: unknown, fallback = ""): string {
  const text = toTrimmedString(value).toLowerCase();
  if (text === "node" || text === "nodejs") return "nodejs";
  if (text === "npm" || text === "bun" || text === "deno") return text;
  return toTrimmedString(fallback).toLowerCase();
}

function runtimeLabel(value: unknown, fallback = "Runtime"): string {
  const key = normalizeRuntimeKey(value);
  if (key === "nodejs") return "Node.js";
  if (key === "npm") return "npm";
  if (key === "bun") return "Bun";
  if (key === "deno") return "Deno";
  return toTrimmedString(fallback) || "Runtime";
}

export { normalizeRuntimeKey, runtimeLabel };
