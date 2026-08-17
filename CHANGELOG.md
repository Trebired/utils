# Changelog

All notable package changes are documented here.

## 0.6.0

- Removed `readPackageIdentity()`, `PackageIdentity`, and `PackageIdentityOptions`. Compose `readPackageJsonUrl()`/`readPackageJsonPath()`, `readOrganizationIdentity()`, and the new pure helpers below directly instead.
- Added `packageScope()` and `packageSlug()` to the root and browser exports (moved out of the removed `package-identity` module; unchanged behavior).
- Added `joinLogGroup(...parts)`, a pure helper that trims and joins non-empty parts with `.` for building dotted log-group names.
- Removed `config.creator` from `package.json`; unused by any code. `author` remains the only creator/authorship field.

## 0.5.0

- Added `readOrganizationIdentity()` and `OrganizationIdentity`/`OrganizationIdentityOptions` types, reading `package.json#config.organization.{displayName,name,website}`.
- Changed `readProductIdentity()` to read the nested `package.json#config.product.{displayName,name,website}` shape instead of the flat `config.productName`/`config.productWebsite`/`config.productDomain` keys, matching `config.organization`'s shape. Added `displayName` to `ProductIdentity`.
- Changed `readPackageIdentity()` to derive `organizationName` through `readOrganizationIdentity()` instead of duck-typing `config.organization.name` itself.

## 0.4.4

- Made package `forVersion` validation failures emit compact config diagnostics instead of uncaught `Error` source-frame dumps.

## 0.4.3

- Extended `nowIso()` to accept existing date, timestamp, or ISO-compatible string inputs.

## 0.4.2

- Added shared package identity/log-group metadata helpers and explicit date/ISO time helpers for package runtimes.

## 0.4.1

- Added shared runtime label helpers, local listening-port helpers, and configurable env assignment formatting.

## 0.4.0

- Added shared text error/unique helpers, numeric integer set helpers, result metadata helpers, date label/partition formatting helpers, Node filesystem helpers, and SHA-256 hashing.
- Expanded browser-safe exports for pure text, result, number, and time helpers.

## 0.3.1

- Made `toArray()` default to `any[]` for compatibility with older object utility imports.

## 0.3.0

- Added shared normalizer, formatting, record, graph, HTML, id, time, timer, and small logic helpers to the root API.
- Kept public exports root-only while expanding the browser-safe root bundle.

## 0.2.5

- Added a root-only browser condition so browser bundles use the browser-safe helper surface.

## 0.2.4

- Made the package public API root-only and removed helper subpath exports.

## 0.2.3

- Re-exported env, package-json, product, and version helpers from the root package import.

## 0.2.2

- Made package-json URL reads fall back to the nearest package manifest when promoted dist files resolve beside `dist`.

## 0.2.1

- Added shared plain-object detection and recursive plain cloning helpers.

## 0.2.0

- Added shared version parsing and package `forVersion` validation helpers.

## 0.1.0

- Added the first utility package with pure helpers plus explicit env, package-json, and product subpath exports.
