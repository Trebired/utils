import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const TOOL = "verify-tool";

async function writePresetPackage(projectRoot) {
  const packageRoot = path.join(projectRoot, "node_modules", "@example", "presets");
  const toolDir = path.join(packageRoot, ".example-org", TOOL);
  await fs.mkdir(path.join(toolDir, "base"), { recursive: true });
  await fs.mkdir(path.join(toolDir, "dense"), { recursive: true });
  await fs.mkdir(path.join(toolDir, "nested"), { recursive: true });
  await fs.writeFile(path.join(projectRoot, "package.json"), JSON.stringify({ name: "preset-app" }));
  await fs.writeFile(path.join(packageRoot, "package.json"), JSON.stringify({
        config: { organization: { name: "example-org" } },
        name: "@example/presets",
        version: "1.0.0",
  }));
  await fs.writeFile(path.join(toolDir, "base", "config.ts"), "export default { forVersion: \"2.1.0\", look: { size: \"md\", tone: \"light\" } };");
  await fs.writeFile(path.join(toolDir, "dense", "config.ts"), "export default { forVersion: \"2.1.0\", look: { size: \"sm\" }, list: [1] };");
  await fs.writeFile(path.join(toolDir, "nested", "config.ts"), "export default { forVersion: \"2.1.0\", presets: { use: [\"x\"] } };");
}

function toolOptions(projectRoot, packageVersion = "2.1.4") {
  return {
    importModule: (file) => import(pathToFileURL(file).href),
    label: TOOL,
    packageName: TOOL,
    packageVersion,
    projectRoot,
  };
}

async function verifyPresetMerge(root, projectRoot) {
  const config = { forVersion: "2.1.0", presets: { use: [
        "@example/presets/verify-tool/base",
        "@example/presets/verify-tool/dense"
      ] }, look: { tone: "dark" }, list: [2] };
  const applied = await root.applyPresets(config, toolOptions(projectRoot));
  assert.deepEqual(Object.keys(applied.config)[0], "forVersion");
  assert.deepEqual(applied.config.look, { size: "sm", tone: "dark" });
  assert.deepEqual(applied.config.list, [2]);
  assert.deepEqual(applied.presets.map((preset) => preset.id), ["@example/presets/verify-tool/base", "@example/presets/verify-tool/dense"]);
  assert.ok(applied.presets[1].file.endsWith(path.join(".example-org", TOOL, "dense", "config.ts")));
  assert.deepEqual(root.parsePresetId("@example/presets/verify-tool/dense"), {
      id: "@example/presets/verify-tool/dense",
      packageName: "@example/presets",
      preset: "dense",
      tool: "verify-tool",
  });
  assert.deepEqual(root.parsePresetId("plain/tool/name").packageName, "plain");
}

async function verifyPresetRefusals(root, projectRoot) {
  const apply = (use, version) => root.applyPresets({ presets: { use } }, toolOptions(projectRoot, version));
  await assert.rejects(() => apply(["@example/presets/verify-tool/nested"]), /cannot declare presets/u);
  await assert.rejects(() => apply(["@example/presets/verify-tool/missing"]), /preset-not-found/u);
  await assert.rejects(() => apply(["@example/absent/verify-tool/base"]), /preset-not-installed/u);
  await assert.rejects(() => apply(["@example/presets/verify-tool/base"], "3.0.0"), /targets 2\.1\.0/u);
  await assert.rejects(() => apply(["@example/presets/other-tool/base"]), /is for other-tool, not verify-tool/u);
  await assert.rejects(() => apply(["@example/presets"]), /preset-invalid-id/u);
  await assert.rejects(() => apply(["@example/presets/verify-tool"]), /preset-invalid-id/u);
  await assert.rejects(() => apply(["../escape"]), /preset-invalid-id/u);
  await assert.rejects(() => root.applyPresets({ presets: { other: [] } }, toolOptions(projectRoot)), /presets\.other is not supported/u);
}

async function verifyPresets(root, tempRoot) {
  const projectRoot = path.join(tempRoot, "preset-app");
  await writePresetPackage(projectRoot);
  await verifyPresetMerge(root, projectRoot);
  await verifyPresetRefusals(root, projectRoot);
}

export { verifyPresets };
