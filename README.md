# @trebired/utils

Shared Trebired utility helpers.

The package exposes shared helpers from the root import:

```ts
import {
  clonePlain,
  normalizers,
  readTextFile,
  readEnvFile,
  readPackageJson,
  readProductIdentity,
  sha256Hex,
  slugText,
  time,
  toObject,
  toString,
} from "@trebired/utils";
```

## Exports

- `@trebired/utils`: pure value, env, filesystem, hashing, package metadata, product identity, and version helpers.
- Platform-style trimming and strict parsing helpers are exposed through `normalizers` and explicit names such as `toTrimmedString` and `toStrictInteger`.
