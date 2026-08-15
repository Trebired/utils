import { toTrimmedString } from "#zzc604sab5c7";

type VersionCompatibility = "exact" | "major-minor";
type VersionParts = {
  build: string;
  major: number;
  minor: number;
  normalized: string;
  patch: number;
  prerelease: string;
  raw: string;
};
type ForVersionValidationOptions = {
  compatibility?: VersionCompatibility;
  configPath?: unknown;
  currentVersion?: unknown;
  expectedVersion?: unknown;
  forVersion?: unknown;
  label?: unknown;
  packageName?: unknown;
  packageVersion?: unknown;
  requireForVersion?: boolean;
};

function parseVersion(value: unknown): VersionParts | null {
  const raw = toTrimmedString(value).replace(/^v/u, "");
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/u.exec(raw);
  if (!match) return null;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (!Number.isSafeInteger(major) || !Number.isSafeInteger(minor) || !Number.isSafeInteger(patch)) {
    return null;
  }
  return {
    build: match[5] || "",
    major,
    minor,
    normalized: `${major}.${minor}.${patch}`,
    patch,
    prerelease: match[4] || "",
    raw,
  };
}

function assertCompatibleForVersion(options: ForVersionValidationOptions): string {
  const source = describeVersionSource(options);
  const label = versionLabel(options);
  const expectedText = expectedVersionText(options);
  const forVersionText = toTrimmedString(options.forVersion);
  if (!forVersionText) {
    if (options.requireForVersion === false) return expectedText;
    throw new Error(`${label} config is missing forVersion: ${source}`);
  }
  const expected = parseVersion(expectedText);
  const actual = parseVersion(forVersionText);
  if (!actual) throw new Error(`${label} config forVersion is invalid: ${source}`);
  if (!expected) return forVersionText;
  if (!isCompatibleVersion(actual, expected, options.compatibility)) {
    throw new Error(`${label} config targets ${forVersionText} but package is ${expectedText}`);
  }
  return forVersionText;
}

function resolveForVersion(options: ForVersionValidationOptions): string {
  return assertCompatibleForVersion(options);
}

function isCompatibleVersion(
  actual: VersionParts | unknown,
  expected: VersionParts | unknown,
  compatibility: VersionCompatibility = "major-minor",
): boolean {
  const actualVersion = isVersionParts(actual) ? actual : parseVersion(actual);
  const expectedVersion = isVersionParts(expected) ? expected : parseVersion(expected);
  if (!actualVersion || !expectedVersion) return false;
  if (compatibility === "exact") {
    return actualVersion.normalized === expectedVersion.normalized &&
      actualVersion.prerelease === expectedVersion.prerelease;
  }
  return actualVersion.major === expectedVersion.major &&
    actualVersion.minor === expectedVersion.minor;
}

function expectedVersionText(options: ForVersionValidationOptions): string {
  return toTrimmedString(
    options.packageVersion ||
      options.expectedVersion ||
      options.currentVersion,
  );
}

function describeVersionSource(options: ForVersionValidationOptions): string {
  return toTrimmedString(options.configPath) || "inline";
}

function versionLabel(options: ForVersionValidationOptions): string {
  return toTrimmedString(options.label || options.packageName) || "package";
}

function isVersionParts(value: unknown): value is VersionParts {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof(value as VersionParts).major === "number" &&
      typeof(value as VersionParts).minor === "number" &&
      typeof(value as VersionParts).patch === "number",
  );
}

export {
  assertCompatibleForVersion,
  isCompatibleVersion,
  parseVersion,
  resolveForVersion,
};
export type {
  ForVersionValidationOptions,
  VersionCompatibility,
  VersionParts,
};
