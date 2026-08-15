# @trebired/utils

Shared Trebired utility helpers.

The package exposes shared helpers from the root import:

```ts
import {
  clonePlain,
  normalizers,
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
- Platform-style trimming and strict parsing helpers are exposed through `normalizers` and explicit names such as `toTrimmedString` and `toStrictInteger`.
