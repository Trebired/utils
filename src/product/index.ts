import { toObject } from "#uknlf3i5jtc0";
import {
  envToken,
  firstString,
  slugText,
  toTrimmedString,
} from "#zzc604sab5c7";
import {
  findPackageJson,
  readPackageJsonPath,
} from "#v4q9hvcepeuc";
import type { PackageJson } from "#v4q9hvcepeuc";

type ProductIdentity = {
  displayName: string;
  domain: string;
  envPrefix: string;
  name: string;
  packageName: string;
  repository: string;
  slug: string;
  version: string;
  website: string;
};
type ProductIdentityOptions = {
  fallbackName?: string;
  packageJson?: PackageJson | null;
  packageJsonPath?: string;
  startDir?: string;
};

function readProductConfig(packageJson: PackageJson | null): Record<string, unknown> {
  return toObject(toObject(packageJson?.config).product);
}

function normalizeProductVersion(value: unknown): string {
  const text = toTrimmedString(value);
  if (!text) return "";
  return text.startsWith("v") ? text : `v${text}`;
}

function productSlug(value: unknown): string {
  return slugText(value, "product");
}

function productEnvPrefix(value: unknown): string {
  return envToken(value, "PRODUCT");
}

function repositoryUrl(packageJson: PackageJson | null): string {
  const repository = packageJson?.repository;
  return typeof repository === "string"
  ? repository
  : toTrimmedString(toObject(repository).url);
}

function resolveProductPackageJson(options: ProductIdentityOptions): PackageJson | null {
  if (options.packageJson) return options.packageJson;
  if (options.packageJsonPath) return readPackageJsonPath(options.packageJsonPath);
  const found = findPackageJson(options.startDir);
  return found ? readPackageJsonPath(found) : null;
}

function readProductIdentity(options: ProductIdentityOptions = {}): ProductIdentity {
  const packageJson = resolveProductPackageJson(options);
  const config = readProductConfig(packageJson);
  const name = firstString([
      config.name,
      packageJson?.name,
      options.fallbackName,
    ], "Product");
  const displayName = firstString([config.displayName, name]);
  const website = firstString([config.website, packageJson?.homepage]);
  const domain = website.replace(/^https?:\/\//u, "");
  const slug = productSlug(name);
  return {
    displayName,
    domain,
    envPrefix: productEnvPrefix(name),
    name,
    packageName: toTrimmedString(packageJson?.name),
    repository: repositoryUrl(packageJson),
    slug,
    version: normalizeProductVersion(packageJson?.version),
    website,
  };
}

export {
  productEnvPrefix,
  productSlug,
  readProductIdentity,
};
export type { ProductIdentity, ProductIdentityOptions };
