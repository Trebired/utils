import { toTrimmedString } from "#zzc604sab5c7";
import {
  readPackageJsonPath,
  readPackageJsonUrl,
} from "#v4q9hvcepeuc";
import type { PackageJson } from "#v4q9hvcepeuc";
import { readOrganizationIdentity } from "#hv1ifufl3hsm";

type PackageIdentity = {
  buildLogGroup: (...parts: unknown[]) => string;
  name: string;
  organizationName: string;
  slug: string;
  version: string;
  workspaceConfigDir: string;
};

type PackageIdentityOptions = {
  fallbackSlug: string;
  fallbackVersion?: string;
  packageJson?: PackageJson | null;
  packageJsonPath?: string;
  packageJsonUrl?: string | URL;
};

function packageScope(name: string): string {
  return /^@([^/]+)\//u.exec(name)?.[1] ?? "";
}

function packageSlug(name: string): string {
  return name.replace(/^@[^/]+\//u, "").trim();
}

function resolvePackageIdentityJson(
  options: PackageIdentityOptions,
): PackageJson | null {
  if (options.packageJson) return options.packageJson;
  if (options.packageJsonUrl) return readPackageJsonUrl(options.packageJsonUrl);
  if (options.packageJsonPath) return readPackageJsonPath(options.packageJsonPath);
  return null;
}

function readPackageIdentity(
  options: PackageIdentityOptions,
): PackageIdentity {
  const fallbackSlug = toTrimmedString(options.fallbackSlug, "package");
  const packageJson = resolvePackageIdentityJson(options);
  const packageJsonName = toTrimmedString(packageJson?.name);
  const organizationName =
  readOrganizationIdentity({ packageJson }).name || packageScope(packageJsonName);
  const name =
  packageJsonName ||
    (organizationName ? `@${organizationName}/${fallbackSlug}` : fallbackSlug);
  const slug = packageSlug(name) || fallbackSlug;
  const version =
  toTrimmedString(packageJson?.version) ||
    toTrimmedString(options.fallbackVersion);

  return {
    buildLogGroup: (...parts: unknown[]) =>
    [organizationName, slug, ...parts]
    .map((part) => toTrimmedString(part))
    .filter(Boolean)
    .join("."),
    name,
    organizationName,
    slug,
    version,
    workspaceConfigDir: organizationName ? `.${organizationName}` : "",
  };
}

export { packageScope, packageSlug, readPackageIdentity };
export type { PackageIdentity, PackageIdentityOptions };
