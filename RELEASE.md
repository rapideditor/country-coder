## Release Checklist

#### Update version, tag, and publish

```bash
# Make sure your main branch is up to date and all tests pass
git checkout main
git pull origin
npm install
npm run all

# Pick a version, see https://semver.org/ - for example: 'A.B.C' or 'A.B.C-pre.D'
# Update version number in `package.json`
# Update CHANGELOG.md

export VERSION=vA.B.C-pre.D
git add . && git commit -m  "$VERSION"
git tag "$VERSION"
git push origin main "$VERSION"
npm publish
```

Set as latest release on GitHub:
- Open https://github.com/rapideditor/country-coder/blob/main/CHANGELOG.md and copy the URL to the new release
- Open https://github.com/rapideditor/country-coder/tags and pick the new tag you just pushed
- There should be a link like "create a release from the tag", click that, and paste in the link to the changelog.


### Purge JSDelivr CDN cache
Include any URLs that anyone might request.

```bash
curl 'https://purge.jsdelivr.net/npm/@rapideditor/country-coder/dist/country-coder.iife.js'
curl 'https://purge.jsdelivr.net/npm/@rapideditor/country-coder/dist/country-coder.iife.min.js'
curl 'https://purge.jsdelivr.net/npm/@rapideditor/country-coder@5/dist/country-coder.iife.js'
curl 'https://purge.jsdelivr.net/npm/@rapideditor/country-coder@5/dist/country-coder.iife.min.js'
curl 'https://purge.jsdelivr.net/npm/@rapideditor/country-coder@5.4/dist/country-coder.iife.js'
curl 'https://purge.jsdelivr.net/npm/@rapideditor/country-coder@5.4/dist/country-coder.iife.min.js'
```
