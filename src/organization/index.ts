import { toObject } from "#uknlf3i5jtc0";
import { firstString } from "#zzc604sab5c7";
import {
  findPackageJson,
  readPackageJsonPath,
} from "#v4q9hvcepeuc";
import type { PackageJson } from "#v4q9hvcepeuc";

type OrganizationIdentity = {
  displayName: string;
  name: string;
  website: string;
};
type OrganizationIdentityOptions = {
  packageJson?: PackageJson | null;
  packageJsonPath?: string;
  startDir?: string;
};

function readOrganizationConfig(packageJson: PackageJson | null): Record<string, unknown> {
  return toObject(toObject(packageJson?.config).organization);
}

function resolveOrganizationPackageJson(options: OrganizationIdentityOptions): PackageJson | null {
  if (options.packageJson) return options.packageJson;
  if (options.packageJsonPath) return readPackageJsonPath(options.packageJsonPath);
  const found = findPackageJson(options.startDir);
  return found ? readPackageJsonPath(found) : null;
}

function readOrganizationIdentity(options: OrganizationIdentityOptions = {}): OrganizationIdentity {
  const packageJson = resolveOrganizationPackageJson(options);
  const config = readOrganizationConfig(packageJson);
  return {
    displayName: firstString([config.displayName]),
    name: firstString([config.name]),
    website: firstString([config.website]),
  };
}

export { readOrganizationIdentity };
export type { OrganizationIdentity, OrganizationIdentityOptions };
