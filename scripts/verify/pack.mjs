import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "trebired-utils-pack-"));
const npmCacheDir = path.join(tempRoot, "npm-cache");
const tscBin = path.join(rootDir, "node_modules", "typescript", "bin", "tsc");
const nodeTypesDir = path.join(rootDir, "node_modules", "@types", "node");

async function main() {
  await fs.mkdir(npmCacheDir, { recursive: true });
  const tarballPath = packPackage();
  const tarballEntries = listTarEntries(tarballPath);
  const packageJson = readPackedPackageJson(tarballPath);
  validatePackedEntrypoints(packageJson, tarballEntries);
  validatePackedImports(packageJson, tarballEntries);
  await runConsumerSmokeTest(tarballPath);
  console.log("Pack verification succeeded.");
}

function packPackage() {
  const output = execFileSync("npm", ["pack", "--json", "--pack-destination", tempRoot], {
      ...createNpmOptions(rootDir),
      encoding: "utf8",
  });
  const [entry] = JSON.parse(output);
  if (!entry?.filename) throw new Error("npm pack did not return a tarball filename.");
  return path.join(tempRoot, entry.filename);
}

function listTarEntries(tarballPath) {
  const stdout = execFileSync("tar", ["-tf", tarballPath], { encoding: "utf8" });
  return new Set(stdout.split("\n").map((entry) => entry.trim()).filter(Boolean));
}

function readPackedPackageJson(tarballPath) {
  const stdout = execFileSync("tar", ["-xOf", tarballPath, "package/package.json"], {
      encoding: "utf8",
  });
  return JSON.parse(stdout);
}

function validatePackedEntrypoints(packageJson, tarballEntries) {
  const targets = collectEntrypointTargets(packageJson);
  for (const target of targets) {
    assertTarEntryExists(tarballEntries, target, `Missing packed entrypoint target: ${target}`);
  }
}

function collectEntrypointTargets(packageJson) {
  const targets = new Set();
  addTarget(targets, packageJson.main);
  addTarget(targets, packageJson.types);
  for (const value of Object.values(packageJson.exports || {})) collectExportTargets(value, targets);
  return targets;
}

function collectExportTargets(value, targets) {
  if (!value) return;
  if (typeof value === "string") return addTarget(targets, value);
  for (const nested of Object.values(value)) collectExportTargets(nested, targets);
}

function addTarget(targets, value) {
  if (typeof value === "string" && value.length > 0) targets.add(value);
}

function validatePackedImports(packageJson, tarballEntries) {
  for (const [alias, target] of Object.entries(packageJson.imports || {})) {
    if (typeof target !== "string") continue;
    if (target.includes("./src/")) throw new Error(`Packed import ${alias} points at source.`);
    assertTarEntryExists(tarballEntries, target, `Packed import is missing for ${alias}: ${target}`);
  }
}

function assertTarEntryExists(tarballEntries, packagePath, message) {
  const normalized = `package/${String(packagePath).replace(/^\.\//u, "")}`;
  if (!tarballEntries.has(normalized)) throw new Error(message);
}

async function runConsumerSmokeTest(tarballPath) {
  const consumerDir = path.join(tempRoot, "consumer");
  await fs.mkdir(consumerDir, { recursive: true });
  await writeConsumerPackageJson(consumerDir, tarballPath);
  await writeConsumerSourceFiles(consumerDir);
  await writeConsumerTsconfig(consumerDir);
  runConsumerInstall(consumerDir);
  runConsumerTypecheck(consumerDir);
  runConsumerRuntime(consumerDir);
}

async function writeConsumerPackageJson(consumerDir, tarballPath) {
  await fs.writeFile(path.join(consumerDir, "package.json"), JSON.stringify({
        name: "utils-pack-smoke",
        private: true,
        type: "module",
        dependencies: {
          "@trebired/utils": `file:${tarballPath}`,
        },
        devDependencies: {
          "@types/node": `file:${nodeTypesDir}`,
        },
      }, null, 2));
}

async function writeConsumerSourceFiles(consumerDir) {
  await fs.writeFile(path.join(consumerDir, "index.ts"), [
      'import { slugText } from "@trebired/utils";',
      'import { parseEnvText } from "@trebired/utils/env";',
      'import { readProductIdentity } from "@trebired/utils/product";',
      "",
      'const slug: string = slugText("Hello App");',
      'const env = parseEnvText("A=1");',
      "const identity = readProductIdentity({ packageJson: { name: '@scope/app', version: '1.0.0' } });",
      "void slug;",
      "void env;",
      "void identity;",
    ].join("\n"));
  await fs.writeFile(path.join(consumerDir, "runtime.mjs"), [
      'import { slugText } from "@trebired/utils";',
      'import { parseEnvText } from "@trebired/utils/env";',
      'import { readProductIdentity } from "@trebired/utils/product";',
      "",
      "const identity = readProductIdentity({ packageJson: { name: '@scope/app', version: '1.0.0' } });",
      "console.log(slugText('Hello App'), parseEnvText('A=1').A, identity.version);",
    ].join("\n"));
}

async function writeConsumerTsconfig(consumerDir) {
  await fs.writeFile(path.join(consumerDir, "tsconfig.json"), JSON.stringify({
        compilerOptions: {
          lib: ["ES2022"],
          module: "ESNext",
          moduleResolution: "Bundler",
          noEmit: true,
          target: "ES2022",
          types: ["node"],
        },
        include: ["./index.ts"],
      }, null, 2));
}

function runConsumerInstall(consumerDir) {
  execFileSync("npm", ["install", "--ignore-scripts"], {
      ...createNpmOptions(consumerDir),
      stdio: "inherit",
  });
}

function runConsumerTypecheck(consumerDir) {
  execFileSync(process.execPath, [tscBin, "-p", "tsconfig.json"], {
      cwd: consumerDir,
      stdio: "inherit",
  });
}

function runConsumerRuntime(consumerDir) {
  execFileSync(process.execPath, ["runtime.mjs"], { cwd: consumerDir, stdio: "inherit" });
}

function createNpmOptions(cwd) {
  return {
    cwd,
    env: {
      ...process.env,
      npm_config_cache: npmCacheDir,
    },
  };
}

await main();
