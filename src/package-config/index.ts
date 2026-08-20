import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { toTrimmedString } from "#zzc604sab5c7";
import { readOrganizationIdentity } from "#hv1ifufl3hsm";

type FindPackageConfigOptions = {
  cwd?: string;
  organizationName?: string;
};

type LoadPackageConfigOptions = {
  configPath?: string;
  cwd?: string;
  defaultIfMissing?: boolean;
  organizationName?: string;
};

type LoadedPackageConfig<T> = {
  config: T | null;
  configPath: string | null;
};

async function pathExists(filePath: string): Promise<boolean> {
  return fs.access(filePath).then(() => true, () => false);
}

function resolveOrganizationDirName(cwd: string, organizationName?: string): string {
  const explicit = toTrimmedString(organizationName);
  if (explicit) return explicit;
  return toTrimmedString(readOrganizationIdentity({ startDir: cwd }).name);
}

function packageConfigRelativePath(organizationDirName: string, packageName: string): string {
  return path.join(`.${organizationDirName}`, toTrimmedString(packageName), "config.ts");
}

async function findPackageConfigPath(
  packageName: string,
  options: FindPackageConfigOptions = {},
): Promise<string|null> {
  const cwd = path.resolve(options.cwd || process.cwd());
  const organizationDirName = resolveOrganizationDirName(cwd, options.organizationName);
  if (!organizationDirName) return null;
  const relative = packageConfigRelativePath(organizationDirName, packageName);
  let current = cwd;
  for (;; ) {
    const candidate = path.join(current, relative);
    if (await pathExists(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

async function importPackageConfigModule(filePath: string): Promise<unknown> {
  const imported = await import(pathToFileURL(filePath).href);
  return (imported as { default?: unknown }).default ??null;
}

async function loadPackageConfig<T=unknown>(
  packageName: string,
  options: LoadPackageConfigOptions = {},
): Promise<LoadedPackageConfig<T>> {
  const configPath = options.configPath
  ? path.resolve(options.cwd || process.cwd(), options.configPath)
  : await findPackageConfigPath(packageName, {
      cwd: options.cwd,
      organizationName: options.organizationName,
  });

  if (!configPath) {
    if (options.defaultIfMissing === false) {
      throw new Error(`package-config-not-found :: ${packageName}`);
    }
    return { config: null, configPath: null };
  }

  if (!await pathExists(configPath)) {
    throw new Error(`package-config-not-found :: ${configPath}`);
  }

  const config = await importPackageConfigModule(configPath) as T;
  return { config, configPath };
}

export { findPackageConfigPath, loadPackageConfig };
export type { FindPackageConfigOptions, LoadedPackageConfig, LoadPackageConfigOptions };
