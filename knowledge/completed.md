# Completed

## November 2026

- **Modernized the toolchain for 6.0.0.** Synced the agent-practices scaffold (prompts became skills in `.claude/skills/`), replaced ESLint with oxlint, and upgraded to TypeScript 7. `bun audit` went from 25 advisories to none, all of which came from ESLint's dependencies.
- **Strict, fully typed code.** All strictness flags are on, there's no `any` left, and scripts and tests are now type-checked too (they never were, which hid 13 test type errors).
- **Better public types.** All types are exported, there's a `Level` type, `withProp` takes a property name, and point inputs accept `@types/geojson` values.
- **ESM only, with package checks.** Dropped the CommonJS build. publint and arethetypeswrong now run on the packed tarball in `bun run all`; that work also found that `@types/geojson` needed to be a dependency.
- **Fixed invalid codes matching real features** (#152, #173): `de-by` no longer resolves to Belarus.
