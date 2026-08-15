import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toObject } from "#uknlf3i5jtc0";
import { toTrimmedString } from "#zzc604sab5c7";

type PackageJson = Record<string, unknown>& {
  config?: Record<string, unknown>;
  description?: string;
  homepage?: string;
  name?: string;
  repository?: string | Record<string, unknown>;
  version?: string;
};

function packageJsonObject(value: unknown): PackageJson | null {
  const record = toObject(value);
  return Object.keys(record).length ? record as PackageJson : null;
}

function readJsonFile(filePath: unknown): unknown {
  const target = toTrimmedString(filePath);
  if (!target) return null;
  try {
    return JSON.parse(fs.readFileSync(target, "utf8"));
  } catch {
    return null;
  }
}

function readPackageJson(workspaceDir: unknown): PackageJson | null {
  const safeWorkspaceDir = toTrimmedString(workspaceDir);
  if (!safeWorkspaceDir) return null;
  return packageJsonObject(readJsonFile(path.join(safeWorkspaceDir, "package.json")));
}

function readPackageJsonPath(packageJsonPath: unknown): PackageJson | null {
  const direct = packageJsonObject(readJsonFile(packageJsonPath));
  if (direct) return direct;
  const target = toTrimmedString(packageJsonPath);
  if (path.basename(target) !== "package.json") return null;
  const found = findPackageJson(path.dirname(target));
  return found && found !== target ? packageJsonObject(readJsonFile(found)) : null;
}

function readPackageJsonUrl(packageJsonUrl: string | URL): PackageJson | null {
  const target = packageJsonUrl instanceof URL ? fileURLToPath(packageJsonUrl) : packageJsonUrl;
  return readPackageJsonPath(target);
}

function findPackageJson(startDir: unknown = process.cwd()): string | null {
  let current = path.resolve(toTrimmedString(startDir, process.cwd()));
  for (;; ) {
    const candidate = path.join(current, "package.json");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function normalizeRepositoryUrl(value: unknown): string {
  const record = toObject(value);
  return toTrimmedString(record.url || value);
}

function normalizePackageMetadata(value: unknown): PackageJson {
  const source = toObject(value);
  return {
    ...source,
    homepage: toTrimmedString(source.homepage),
    name: toTrimmedString(source.name),
    repository: normalizeRepositoryUrl(source.repository),
    version: toTrimmedString(source.version),
  };
}

export {
  findPackageJson,
  normalizePackageMetadata,
  readJsonFile,
  readPackageJson,
  readPackageJsonPath,
  readPackageJsonUrl,
};
export type { PackageJson };
