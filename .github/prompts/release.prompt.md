---
description: Prepare a new release (CHANGELOG, version bump)
argument-hint: version number, for example: `A.B.C` or `A.B.C-pre.D`
---

You are preparing release **${input:version}** for this repo. Do the following steps in order:

1. **Confirm the version** — the new release version is `${input:version}`. Read `package.json` to verify this is a valid bump from the current version.
   - The version must follow semver format, for example: `A.B.C` or `A.B.C-pre.D`
   - It must be strictly greater than the current version in `package.json`
   - If either check fails, stop immediately and explain the problem clearly — do not proceed with any further steps.

2. **Identify commits since the last release** by running:
   ```
   git log --oneline
   ```
   Find the commit that corresponds to the previous release (look for the version bump or a release tag) and note all commits after it.

3. **Look up PR numbers** by fetching:
   ```
   https://github.com/rapideditor/country-coder/pulls?q=is%3Apr+is%3Aclosed
   ```
   Match each commit to its PR number.  PR titles listed there are authoritative — prefer them over raw commit messages.

4. **Update `CHANGELOG.md`** — insert a new section immediately above the previous release heading. Follow the existing format exactly:
   - Header: `# ${input:version}`
   - Date: `##### YYYY-Mon-DD` (use today's date)
   - Bullet points for each user-visible change (new features, fixes, improvements)
   - For bug/fix commits, write a plain bullet
   - Internal/dev-only commits (CI config, agent setup, etc.) can be omitted or grouped into a single terse bullet
   - Add reference links at the bottom of the section:
     - PR links: `[#NNN]: https://github.com/rapideditor/country-coder/issues/NNN`

5. **Update `package.json`** — set `"version"` to `"${input:version}"`.
