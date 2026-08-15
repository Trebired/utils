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
  const {
    clonePlain,
    compactArray,
    compactRecord,
    escapeHtml,
    envToken,
    formatBytes,
    firstString,
    graphRightDetails,
    isPlainObject,
    isTruthy,
    normalizers,
    randomToken,
    safeDomId,
    slugText,
    toPositiveInteger,
    toStrictInteger,
    toString,
    toTrimmedString,
  } = root;
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
  assert.equal(escapeHtml("<tag>"), "&lt;tag&gt;");
  assert.equal(graphRightDetails(100).length, 5);
  assert.equal(typeof randomToken(8), "string");
  assert.equal(isPlainObject(Object.create(null)), true);
  assert.equal(isPlainObject(new Date()), false);
  assert.equal(isTruthy("yes"), true);
  assert.equal(toPositiveInteger("0", 3), 3);
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
  writeEnvFileValue(envFile, "NAME", "Operlorn");
  writeEnvFileValue(envFile, "PORT", 3100);
  assert.equal(readEnvFile(envFile).PORT, "3100");
  writeEnvFileObject(envFile, { A: 1, B: "two", ENV_FILE: "skip" });
  assert.deepEqual(readEnvFile(envFile).A, "1");
  writeProcessEnvObject({ TREBIRED_UTILS_VERIFY: "ok" });
  assert.equal(readProcessEnvValue("TREBIRED_UTILS_VERIFY"), "ok");
  delete process.env.TREBIRED_UTILS_VERIFY;
}

async function verifyPackageJsonHelpers() {
  const { findPackageJson, readPackageJsonPath, readProductIdentity } = root;
  const packageDir = path.join(tempRoot, "package");
  await fs.mkdir(path.join(packageDir, "nested"), { recursive: true });
  await fs.writeFile(path.join(packageDir, "package.json"), JSON.stringify({
        config: {
          productDomain: "example.test",
          productName: "Example App",
          productWebsite: "https://example.test",
        },
        homepage: "https://fallback.test",
        name: "@scope/example",
        repository: { url: "git@example.test/repo.git" },
        version: "1.2.3",
  }));
  assert.equal(findPackageJson(path.join(packageDir, "nested")), path.join(packageDir, "package.json"));
  assert.equal(readPackageJsonPath(path.join(packageDir, "package.json"))?.name, "@scope/example");
  assert.equal(readPackageJsonPath(path.join(packageDir, "nested", "package.json"))?.name, "@scope/example");
  const identity = readProductIdentity({ startDir: path.join(packageDir, "nested") });
  assert.equal(identity.name, "Example App");
  assert.equal(identity.slug, "example-app");
  assert.equal(identity.envPrefix, "EXAMPLE_APP");
  assert.equal(identity.version, "v1.2.3");
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
