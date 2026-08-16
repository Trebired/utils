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

## Runtime

Filesystem, env, package-json, and product identity helpers are Node/Bun runtime helpers. Pure value helpers remain browser-safe through the root browser condition.

## Public API

The root export includes pure value helpers, env helpers, filesystem helpers, hashing helpers, package metadata helpers, product identity helpers, result metadata helpers, time helpers, and version compatibility helpers.

## What It Does Not Do

This package does not:

- Own domain validation or persistence.
- Replace package-specific config loaders.
- Provide application-specific product metadata.
- Expose utility subpaths as public API.
