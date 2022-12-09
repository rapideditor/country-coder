## Release Checklist

#### Update version, tag, and publish
- [ ] git checkout main
- [ ] git pull origin
- [ ] npm install
- [ ] npm run all
- [ ] Update version number in `package.json`
- [ ] Update CHANGELOG.md
- [ ] git add . && git commit -m 'vA.B.C'
- [ ] git tag vA.B.C
- [ ] git push origin main vA.B.C
- [ ] npm publish
- [ ] Go to GitHub and link the release notes to the changelog