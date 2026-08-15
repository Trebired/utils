import {
  toArray,
} from "./arrays.js";
import {
  toObject,
} from "./records.js";

function normalizeTreePath(value: unknown): string {
  return String(value == null ? "" : value)
  .trim()
  .replace(/\\/gu, "/")
  .replace(/^\/+/u, "")
  .replace(/\/+/gu, "/")
  .replace(/\/+$/u, "");
}

function findTreeNodeByPath(
  nodesInput: unknown,
  pathInput: unknown,
): Record<string, unknown>|null {
  const nodes = toArray<Record<string, unknown>>(nodesInput);
  const targetPath = normalizeTreePath(pathInput);
  if (!targetPath) return null;

  for (const nodeInput of nodes) {
    const node = toObject(nodeInput);
    const relPath = normalizeTreePath(
      (node as any).rel_path || (node as any).path,
    );
    if (relPath && relPath === targetPath) return node;

    const nested = findTreeNodeByPath((node as any).children, targetPath);
    if (nested) return nested;
  }

  return null;
}

export { findTreeNodeByPath, normalizeTreePath };
