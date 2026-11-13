# Decisions

## ESM only

Since 6.0.0 the package ships only an ES module (`dist/country-coder.mjs`). The `require` condition points at the same `.mjs`, because Node 20.19+ and 22.12+ can `require()` an ES module, and one build avoids dual-package hazards. There's deliberately no `engines.node` (Yarn 1 fails installs on a mismatch); the README names the Node versions instead. The IIFE bundle stays for `<script>` and CDN users. The ES module must not use top-level `await`, or `require()` can't load it.

## Types the published declarations import are dependencies

The `.d.ts` files import from `geojson`, so `@types/geojson` is in `dependencies`, not `devDependencies`. Otherwise users get "Cannot find module 'geojson'", or silently get `any` with `skipLibCheck`. publint and arethetypeswrong don't catch this; check the bare imports in `dist/*.d.ts` when adding a type dependency.

## Two tsconfigs

`tsconfig.json` is check-only (`noEmit`) and covers `src`, `scripts` and `test` with Bun's types. `tsconfig.build.json` extends it to emit the published declarations from `src/country-coder.ts` only, with `types: []` so library code can't use Bun globals (it runs in browsers and Node too), and with `isolatedDeclarations`. TypeScript 7 requires `rootDir` there, because the sources live in `src/`.

## Lookups of IDs from the data use `knownFeature()`

Group, member and which-polygon result IDs always come from the data itself, so they're always in `_featuresByCode` once loading is done. `knownFeature()` states that once, with one non-null assertion, instead of scattering `!` across ~25 call sites. It has no runtime check on purpose: a branch that can never run would just be an uncovered line. Lookups of user input (`featureForID`, `countryFeature`) still handle a missing feature.

## Public types live in `src/types.ts`

`country-coder.ts` imports them with `import type` and re-exports them with `export type *`, like location-conflation. Consumers therefore need TypeScript 5.0+. `IdentifierProp` stays in `country-coder.ts` because it's internal, and `export type *` would make it public.

## `Level` is a union, separate from the `levels` array

`levels` in `country-coder.ts` is the ordering used to rank features; `Level` in `types.ts` is the set of allowed values. A types-only file can't hold the runtime array, so the list exists twice. `levels` is typed `ReadonlyArray<Level>`, which catches a misspelled entry, but not a level added to the union and missing from the array. Levels change rarely, so that was judged acceptable.

## Short words are stripped from names, not codes

`canonicalID` only removes punctuation. Short words (and/the/of/el/la/de) are stripped only in the separate English-name index (`_featuresByName`), which is checked after the code index misses. Stripping them from everything made invalid codes like `de-by` resolve to Belarus (#152, fixed in #173).

## Lint with oxlint

oxlint replaced ESLint and typescript-eslint, which didn't support TypeScript 7 and brought in all of `bun audit`'s advisories. `.oxlintrc.json` keeps the old rules where oxlint has them; formatting rules and a few rules oxlint lacks were dropped (listed in bf08c4c).

## Tests import `node:assert`

`bun:assert` works at runtime but has no type declarations, and seems to be an undocumented alias. `node:assert` is documented, Bun supports it, and its types come with `@types/bun`.
