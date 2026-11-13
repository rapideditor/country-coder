# Backlog

## Convert `scripts/format-json.js` to TypeScript

It's the only file that isn't type-checked, and it rewrites `src/data/borders.json`.

## Replace union-narrowing casts with type guards

`locArray()` and the `query as Location` / `as Bbox` casts in `feature()` and `featuresContaining()` narrow after a runtime check. Small guards like `isBbox()` and `isPointFeature()` would let TypeScript check those branches.

## Smaller bundle

Issue #108: load `borders.json` dynamically. Worth another look now that the package is ESM only.
