# @trebired/utils

Shared utility helpers for Trebired packages and applications.

This package owns small reusable normalization, env, filesystem, package metadata, product identity, version compatibility, hashing, formatting, time, and plain-object helpers. Callers own domain-specific data models, validation policy, persistence, and application behavior.

## Install

Runtime support: Bun 1+.

```sh
bun i @trebired/utils
```

## Quick Start

```ts
import {
  readEnvFile,
  readProductIdentity,
  toTrimmedString,
} from "@trebired/utils";

const env = readEnvFile(".env");
const product = readProductIdentity();
const name = toTrimmedString(env.NAME, product.name);
```

## Concepts

### Root-Only API

The package exposes its public helpers from the root import. It does not publish utility subpaths.

### Version Compatibility

Package config loaders use the version helpers to require matching major and minor versions while allowing patch drift when the package chooses that policy.

### Presets

Every Trebired package that accepts presets resolves them here, so a preset reads the same in every tool. A config names presets under `presets.use` as `<package>/<tool>/<preset>`:

```ts
presets: {
  use: ["@trebired/configs/code-discipline/preset_01"],
},
```

The name points at `.<organization>/<tool>/<preset>/config.ts` inside that package, where `<organization>` is the preset package's own `config.organization.name`, so one package carries named presets for any number of tools. Every preset has a name, and a tool accepts only presets for itself: a frontend config naming a code-discipline preset is refused. A preset default-exports a config object with its own `forVersion`, checked against the calling tool's version, and may not declare presets.

`applyPresets(config, { importModule, label, packageName, packageVersion, projectRoot, merge })` loads the presets in order, merges them, merges the config over them, and returns the result with the loaded preset files. `packageName` is the calling tool's folder name. The tool passes its own `importModule` and, when its arrays combine rather than replace, its own `merge`; `mergePresetConfig` is the default, merging objects key by key and replacing every other value. `loadPresets`, `resolvePresetFile` and `parsePresetId` expose the steps.

## Runtime

Filesystem, env, package-json, and product identity helpers are Node/Bun runtime helpers. Pure value helpers remain browser-safe through the root browser condition.

## Public API

The root export includes pure value helpers, env helpers, filesystem helpers, hashing helpers, package metadata helpers, preset helpers, product identity helpers, result metadata helpers, time helpers, and version compatibility helpers.

## What It Does Not Do

This package does not:

- Own domain validation or persistence.
- Replace package-specific config loaders.
- Provide application-specific product metadata.
- Expose utility subpaths as public API.
