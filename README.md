# @trebired/utils

Shared Trebired utility helpers for pure value normalization, environment files, package metadata, and product identity.

The package exposes shared helpers from the root import:

```ts
import {
  clonePlain,
  readEnvFile,
  readPackageJson,
  readProductIdentity,
  slugText,
  toObject,
  toString,
} from "@trebired/utils";
```

## Exports

- `@trebired/utils`: pure value, env, package metadata, product identity, and version helpers.
- `@trebired/utils/env`: env helper subpath for explicit consumers.
- `@trebired/utils/package-json`: package metadata helper subpath for explicit consumers.
- `@trebired/utils/product`: product identity helper subpath for explicit consumers.
- `@trebired/utils/version`: package `forVersion` helper subpath for explicit consumers.
