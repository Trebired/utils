import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { isRecord } from "./../pure/records.js";
import { toTrimmedString } from "./../pure/text.js";
import { readOrganizationIdentity } from "./../organization/index.js";
import { assertCompatibleForVersion } from "./../version/index.js";

type PresetRecord = Record<string, unknown>;

type PresetReference = {
  id: string;
  packageName: string;
  preset: string;
  tool: string;
};

type PresetToolOptions = {
  importModule: (file: string) => Promise<unknown>;
  label: string;
  packageName: string;
  packageVersion: string;
  projectRoot: string;
};

type LoadPresetsOptions = PresetToolOptions& {
  presets: unknown;
};

type ApplyPresetsOptions = PresetToolOptions& {
  merge?: (base: PresetRecord, override: PresetRecord) => PresetRecord;
};

type LoadedPreset = {
  config: PresetRecord;
  file: string;
  id: string;
};

type AppliedPresets = {
  config: unknown;
  presets: LoadedPreset[];
};

const PACKAGE_NAME_PATTERN = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/iu;
const SEGMENT_PATTERN = /^[a-z0-9][a-z0-9._-]*$/iu;

function presetError(code: string, message: string): Error {
  return new Error(`${code} :: ${message}`);
}

function parsePresetId(value: unknown): PresetReference {
  const id = typeof value === "string" ? value.trim() : "";
  const parts = id.split("/");
  const packageParts = id.startsWith("@") ? 2 : 1;
  const packageName = parts.slice(0, packageParts).join("/");
  const [tool = "", preset = "", ...extra] = parts.slice(packageParts);
  if (!PACKAGE_NAME_PATTERN.test(packageName) || !SEGMENT_PATTERN.test(tool) || !SEGMENT_PATTERN.test(preset) || extra.length) {
    throw presetError("preset-invalid-id", `presets.use must name <package>/<tool>/<preset>, found ${String(value)}`);
  }
  return { id, packageName, preset, tool };
}

function presetReferences(presets: unknown): PresetReference[] {
  if (presets === undefined) return [];
  if (!isRecord(presets)) throw presetError("preset-invalid-config", "presets must be an object");
  for (const key of Object.keys(presets)) {
    if (key !== "use") throw presetError("preset-invalid-config", `presets.${key} is not supported`);
  }
  const entries = presets.use === undefined ? [] : Array.isArray(presets.use) ? presets.use : [presets.use];
  const references = new Map<string, PresetReference>();
  for (const entry of entries) {
    const reference = parsePresetId(entry);
    references.set(reference.id, reference);
  }
  return [...references.values()];
}

async function packageNamed(dir: string, name: string): Promise<boolean> {
  try {
    return JSON.parse(await fs.readFile(path.join(dir, "package.json"), "utf8"))?.name === name;
  } catch {
    return false;
  }
}

async function resolvePresetPackageRoot(packageName: string, projectRoot: string): Promise<string> {
  const installed = path.join(projectRoot, "node_modules", ...packageName.split("/"));
  if (await packageNamed(installed, packageName)) return installed;
  try {
    let current = path.dirname(createRequire(path.join(projectRoot, "package.json")).resolve(packageName));
    while (current !== path.dirname(current)) {
      if (await packageNamed(current, packageName)) return current;
      current = path.dirname(current);
    }
  } catch {
  }
  throw presetError("preset-not-installed", `preset package ${packageName} is not installed`);
}

async function resolvePresetFile(reference: PresetReference, toolName: string, projectRoot: string): Promise<string> {
  if (reference.tool !== toolName) {
    throw presetError("preset-wrong-tool", `preset ${reference.id} is for ${reference.tool}, not ${toolName}`);
  }
  const root = await resolvePresetPackageRoot(reference.packageName, projectRoot);
  const organization = toTrimmedString(readOrganizationIdentity({ packageJsonPath: path.join(root, "package.json") }).name);
  if (!organization) throw presetError("preset-not-found", `preset package ${reference.packageName} declares no organization`);
  const relative = path.join(`.${organization}`, reference.tool, reference.preset, "config.ts");
  const file = path.join(root, relative);
  const exists = await fs.access(file).then(() => true, () => false);
  if (!exists) throw presetError("preset-not-found", `preset ${reference.id} has no ${relative}`);
  return file;
}

function readPresetConfig(reference: PresetReference, file: string, imported: unknown, options: PresetToolOptions): PresetRecord {
  const exported = isRecord(imported) && "default"in imported && isRecord(imported.default) ? imported.default : imported;
  if (!isRecord(exported)) throw presetError("preset-invalid-config", `preset ${reference.id} must default-export a config object`);
  if ("presets"in exported) throw presetError("preset-invalid-config", `preset ${reference.id} cannot declare presets`);
  assertCompatibleForVersion({
      config: exported,
      configPath: file,
      forVersion: exported.forVersion,
      label: `${options.label} preset ${reference.id}`,
      packageVersion: options.packageVersion,
  });
  const config = { ...exported };
  delete config.forVersion;
  return config;
}

async function loadPresets(options: LoadPresetsOptions): Promise<LoadedPreset[]> {
  const loaded: LoadedPreset[] = [];
  for (const reference of presetReferences(options.presets)) {
    const file = await resolvePresetFile(reference, options.packageName, options.projectRoot);
    const config = readPresetConfig(reference, file, await options.importModule(file), options);
    loaded.push({ config, file, id: reference.id });
  }
  return loaded;
}

function mergePresetConfig(base: PresetRecord, override: PresetRecord): PresetRecord {
  const merged: PresetRecord = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    const current = merged[key];
    merged[key] = isRecord(current) && isRecord(value) ? mergePresetConfig(current, value) : value;
  }
  return merged;
}

async function applyPresets(config: unknown, options: ApplyPresetsOptions): Promise<AppliedPresets> {
  if (!isRecord(config) || !("presets"in config)) return { config, presets: [] };
  const { forVersion, presets, ...own } = config;
  const loaded = await loadPresets({ ...options, presets });
  const merge = options.merge ?? mergePresetConfig;
  let merged: PresetRecord = {};
  for (const preset of loaded) merged = merge(merged, preset.config);
  return {
    config: { ...(forVersion === undefined ? {} : { forVersion }), ...merge(merged, own) },
    presets: loaded,
  };
}

export { applyPresets, loadPresets, mergePresetConfig, parsePresetId, resolvePresetFile };
export type { AppliedPresets, ApplyPresetsOptions, LoadedPreset, LoadPresetsOptions, PresetReference, PresetToolOptions };
