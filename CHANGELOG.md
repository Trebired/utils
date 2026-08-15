# Changelog

All notable package changes are documented here.

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
