# Backlog

## Coding functions mutate their options

`iso1A2Code()` and the other single-code functions set `opts.withProp` on the options object they're given. That changes the caller's object, and when no options are passed it changes the shared `defaultOpts`, so the next call leaks into later ones: after `iso1N3Code('Q145')`, `feature([21, 42.6])` no longer returns Kosovo (which has no ISO numeric code). Fix by passing a copy, e.g. `feature(query, { ...opts, withProp: 'iso1A2' })`, and add a test that calls `feature()` after a coding function. Best fixed before 6.0.0.

## Convert `scripts/format-json.js` to TypeScript

It's the only file that isn't type-checked, and it rewrites `src/data/borders.json`.

## Replace union-narrowing casts with type guards

`locArray()` and the `query as Location` / `as Bbox` casts in `feature()` and `featuresContaining()` narrow after a runtime check. Small guards like `isBbox()` and `isPointFeature()` would let TypeScript check those branches.

## Smaller bundle

Issue #108: load `borders.json` dynamically. Worth another look now that the package is ESM only.
