import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "trebired-utils-"));
const root = await importDist("index.js");

function importDist(relativePath) {
  return import(pathToFileURL(path.join(rootDir, "dist", relativePath)).href);
}

function verifyPureHelpers() {
  verifyStringAndNumberHelpers();
  verifyObjectAndRuntimeHelpers();
}

function verifyStringAndNumberHelpers() {
  const {
    errorMessage,
    escapeHtml,
    envToken,
    formatBytes,
    formatUtcHourPartitionKey,
    firstString,
    normalizers,
    resultMetaText,
    sha256Hex,
    safeDomId,
    slugText,
    time,
    toPositiveInteger,
    toStrictInteger,
    toArray,
    toString,
    toTrimmedString,
    uniquePositiveIntegers,
    uniqueText,
  } = root;
  const defaultArray = toArray([1, 2]);
  defaultArray.push(3);
  assert.equal(toString(null, "fallback"), "fallback");
  assert.equal(toString("  value  "), "  value  ");
  assert.equal(toTrimmedString("  value  "), "value");
  assert.equal(normalizers.toString("  value  "), "value");
  assert.equal(toStrictInteger("1.5", null), null);
  assert.equal(slugText("Hello, World"), "hello-world");
  assert.equal(safeDomId("A B"), "A_B");
  assert.equal(envToken("hello-world"), "HELLO_WORLD");
  assert.equal(firstString(["", "next"]), "next");
  assert.equal(formatBytes(1024), "1.0 KB");
  assert.equal(errorMessage(new Error("failed")), "failed");
  assert.equal(escapeHtml("<tag>"), "&lt;tag&gt;");
  assert.equal(formatUtcHourPartitionKey("2026-08-15T12:34:56.000Z"), "2026-08-15-12-0000");
  assert.equal(resultMetaText({ meta: { stdout: "ok" } }, "stdout"), "ok");
  assert.equal(sha256Hex("value").length, 64);
  assert.equal(time("2026-08-15T12:34:56.000Z", "iso"), "2026-08-15T12:34:56.000Z");
  assert.equal(toPositiveInteger("0", 3), 3);
  assert.deepEqual(defaultArray, [1, 2, 3]);
  assert.deepEqual(uniquePositiveIntegers([1, "2", 2, 0]), [1, 2]);
  assert.deepEqual(uniqueText(["A", "A", "B"], { exclude: ["B"] }), ["A"]);
}

function verifyObjectAndRuntimeHelpers() {
  const {
    clonePlain,
    compactArray,
    compactRecord,
    graphRightDetails,
    isPlainObject,
    isTruthy,
    randomToken,
  } = root;
  assert.equal(graphRightDetails(100).length, 5);
  assert.equal(typeof randomToken(8), "string");
  assert.equal(isPlainObject(Object.create(null)), true);
  assert.equal(isPlainObject(new Date()), false);
  assert.equal(isTruthy("yes"), true);
  assert.deepEqual(compactArray([1, null, 2]), [1, 2]);
  assert.deepEqual(compactRecord({ a: "", b: 2, c: null }), { b: 2 });
  assert.deepEqual(clonePlain({ a: [{ b: 1 }] }), { a: [{ b: 1 }] });
}

async function verifyEnvHelpers() {
  const {
    parseEnvText,
    readEnvFile,
    readProcessEnvValue,
    writeEnvFileObject,
    writeEnvFileValue,
    writeProcessEnvObject,
  } = root;
  const envFile = path.join(tempRoot, ".env");
  assert.deepEqual(parseEnvText("export A=1\nB=\"two\"\n# skip\n"), { A: "1", B: "two" });
  writeEnvFileValue(envFile, "NAME", "Example App");
  writeEnvFileValue(envFile, "PORT", 3100);
  assert.equal(readEnvFile(envFile).PORT, "3100");
  writeEnvFileObject(envFile, { A: 1, B: "two", ENV_FILE: "skip" });
  assert.deepEqual(readEnvFile(envFile).A, "1");
  writeProcessEnvObject({ TREBIRED_UTILS_VERIFY: "ok" });
  assert.equal(readProcessEnvValue("TREBIRED_UTILS_VERIFY"), "ok");
  delete process.env.TREBIRED_UTILS_VERIFY;
}

async function writePackageJsonFixture(packageDir) {
  await fs.mkdir(path.join(packageDir, "nested"), { recursive: true });
  await fs.writeFile(path.join(packageDir, "package.json"), JSON.stringify({
        config: {
          organization: {
            displayName: "Example Org",
            name: "example-org",
            website: "https://example-org.test",
          },
          product: {
            displayName: "Example App",
            name: "Example App",
            website: "https://example.test",
          },
        },
        homepage: "https://fallback.test",
        name: "@scope/example",
        repository: { url: "git@example.test/repo.git" },
        version: "1.2.3",
  }));
}

function verifyIdentityHelpers(packageDir) {
  const { readOrganizationIdentity, readPackageIdentity, readPackageJsonPath, readProductIdentity } = root;
  const identity = readProductIdentity({ startDir: path.join(packageDir, "nested") });
  assert.equal(identity.name, "Example App");
  assert.equal(identity.displayName, "Example App");
  assert.equal(identity.domain, "example.test");
  assert.equal(identity.slug, "example-app");
  assert.equal(identity.envPrefix, "EXAMPLE_APP");
  assert.equal(identity.version, "v1.2.3");

  const organization = readOrganizationIdentity({ startDir: path.join(packageDir, "nested") });
  assert.equal(organization.displayName, "Example Org");
  assert.equal(organization.name, "example-org");
  assert.equal(organization.website, "https://example-org.test");

  const packageIdentity = readPackageIdentity({
      fallbackSlug: "example",
      packageJson: readPackageJsonPath(path.join(packageDir, "package.json")),
  });
  assert.equal(packageIdentity.organizationName, "example-org");
}

async function verifyPackageJsonHelpers() {
  const { ensureParentDir, findPackageJson, pathExists, readPackageJsonPath, readTextFile, readTrimmedFile, removePath, writeJsonFile } = root;
  const packageDir = path.join(tempRoot, "package");
  await writePackageJsonFixture(packageDir);
  assert.equal(findPackageJson(path.join(packageDir, "nested")), path.join(packageDir, "package.json"));
  assert.equal(readPackageJsonPath(path.join(packageDir, "package.json"))?.name, "@scope/example");
  assert.equal(readPackageJsonPath(path.join(packageDir, "nested", "package.json"))?.name, "@scope/example");
  verifyIdentityHelpers(packageDir);

  const dataFile = path.join(packageDir, "nested", "data", "item.json");
  ensureParentDir(dataFile);
  writeJsonFile(dataFile, { ok: true });
  assert.equal(pathExists(dataFile), true);
  assert.equal(readTextFile(dataFile).includes("\"ok\": true"), true);
  assert.equal(readTrimmedFile(dataFile).endsWith("}"), true);
  removePath(path.dirname(dataFile), { recursive: true });
  assert.equal(pathExists(dataFile), false);
}

function verifyVersionHelpers() {
  const {
    assertCompatibleForVersion,
    isCompatibleVersion,
    parseVersion,
    resolveForVersion,
  } = root;
  assert.equal(parseVersion("v6.5.1")?.normalized, "6.5.1");
  assert.equal(isCompatibleVersion("6.5.0", "6.5.99"), true);
  assert.equal(isCompatibleVersion("6.6.0", "6.5.99"), false);
  assert.equal(assertCompatibleForVersion({
        forVersion: "6.5.0",
        label: "verify",
        packageVersion: "6.5.99",
    }), "6.5.0");
  assert.equal(resolveForVersion({
        packageVersion: "1.2.3",
        requireForVersion: false,
    }), "1.2.3");
  assert.throws(() => assertCompatibleForVersion({
        forVersion: "6.6.0",
        label: "verify",
        packageVersion: "6.5.99",
    }), /targets 6\.6\.0/u);
}

async function main() {
  assert.ok(rootDir);
  verifyPureHelpers();
  await verifyEnvHelpers();
  await verifyPackageJsonHelpers();
  verifyVersionHelpers();
  console.log("Runtime verification succeeded.");
}

await main();
