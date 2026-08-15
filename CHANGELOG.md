# Changelog

All notable package changes are documented here.

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
