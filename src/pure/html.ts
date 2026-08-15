import { toTrimmedString } from "./text.js";

function stringifyJsonForHtml(value: unknown): string {
  return JSON.stringify(value == null ? null : value).replace(/</gu, "\\u003c");
}

function escapeHtml(value: unknown): string {
  return toTrimmedString(value)
  .replace(/&/gu, "&amp;")
  .replace(/</gu, "&lt;")
  .replace(/>/gu, "&gt;")
  .replace(/"/gu, "&quot;")
  .replace(/'/gu, "&#39;");
}

function graphUnitAttrs(
  graphId: unknown,
  value: unknown,
  unit = "graph",
  precision = 2,
): string {
  const num = Number(value);
  const rawValue = Number.isFinite(num) ? num : 0;
  return [
    `data-graph-unit-source="${escapeHtml(graphId)}"`,
    `data-graph-unit-kind="${escapeHtml(unit)}"`,
    `data-graph-unit-value="${escapeHtml(rawValue)}"`,
    `data-graph-unit-precision="${escapeHtml(precision)}"`,
  ].join(" ");
}

export { escapeHtml, graphUnitAttrs, stringifyJsonForHtml };
