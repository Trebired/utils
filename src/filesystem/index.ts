import fs from "node:fs";
import path from "node:path";
import { toTrimmedString } from "#zzc604sab5c7";

type PathExistsFs = {
  existsSync(targetPath: unknown): boolean;
};

type WriteJsonFileOptions = {
  mode?: number;
};

type RemovePathOptions = {
  recursive?: boolean;
};

function pathExists(targetPath: unknown, fsImpl: PathExistsFs = fs): boolean {
  try {
    return fsImpl.existsSync(targetPath);
  } catch {
    return false;
  }
}

function ensureDir(dirPath: unknown): void {
  const target = toTrimmedString(dirPath);
  if (!target) return;
  fs.mkdirSync(target, { recursive: true });
}

function ensureDirectory(dirPath: unknown): void {
  ensureDir(dirPath);
}

function ensureParentDir(filePath: unknown): void {
  const target = toTrimmedString(filePath);
  if (!target) return;
  ensureDir(path.dirname(target));
}

function readTextFile(filePath: unknown): string {
  const target = toTrimmedString(filePath);
  if (!target) return "";
  try {
    return String(fs.readFileSync(target, "utf8") || "");
  } catch {
    return "";
  }
}

function readTrimmedFile(filePath: unknown): string {
  return readTextFile(filePath).trim();
}

function uniqueAbsolutePaths(values: unknown): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const value of Array.isArray(values) ? values : []) {
    const text = toTrimmedString(value);
    if (!text || !path.isAbsolute(text) || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }

  return out;
}

function writeJsonFile(
  filePath: unknown,
  payload: unknown,
  options: WriteJsonFileOptions | null = null,
): boolean {
  const target = toTrimmedString(filePath);
  const cfg = options && typeof options === "object" ? options : {};
  if (!target) return false;

  ensureParentDir(target);
  fs.writeFileSync(
    target,
    `${JSON.stringify(payload || {}, null, 2)}\n`,
    "utf8",
  );
  const mode = cfg.mode;
  if (Number.isInteger(mode)) fs.chmodSync(target, mode as number);
  return true;
}

function removeFile(filePath: unknown): void {
  const target = toTrimmedString(filePath);
  if (!target) return;

  try {
    fs.rmSync(target, { force: true });
  } catch {}
}

function removePath(
  filePath: unknown,
  options: RemovePathOptions | null = null,
): void {
  const target = toTrimmedString(filePath);
  if (!target) return;
  const cfg = options && typeof options === "object" ? options : {};

  try {
    fs.rmSync(target, {
        force: true,
        recursive: cfg.recursive === true,
    });
  } catch {}
}

export {
  ensureDir,
  ensureDirectory,
  ensureParentDir,
  pathExists,
  readTextFile,
  readTrimmedFile,
  removeFile,
  removePath,
  uniqueAbsolutePaths,
  writeJsonFile,
};
export type { PathExistsFs, RemovePathOptions, WriteJsonFileOptions };
