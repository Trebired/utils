# @trebired/utils

Shared Trebired utility helpers for pure value normalization, environment files, package metadata, and product identity.

The package keeps the root import pure:

```ts
import { clonePlain, toString, toObject, slugText } from "@trebired/utils";
```

Node and filesystem helpers are explicit subpath imports:

```ts
import { readEnvFile } from "@trebired/utils/env";
import { readPackageJson } from "@trebired/utils/package-json";
import { readProductIdentity } from "@trebired/utils/product";
import { assertCompatibleForVersion } from "@trebired/utils/version";
```

## Exports

- `@trebired/utils`: pure value, text, and record helpers.
- `@trebired/utils/env`: env text parsing, env file reads/writes, and process env helpers.
- `@trebired/utils/package-json`: package manifest reads and metadata normalization.
- `@trebired/utils/product`: product identity and product naming helpers.
- `@trebired/utils/version`: package `forVersion` validation helpers.
