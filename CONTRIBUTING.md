# Contributing

This project uses **GitHub** to track issues and manage our source code.
- Check out the [Git Guides](https://github.com/git-guides) to learn more.

This project uses the **JavaScript** programming language.
- [MDN's JavaScript guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) is a great resource for learning about JavaScript.

This project uses the **TypeScript** programming language.
- Check out the [TypeScript Docs](https://www.typescriptlang.org/docs/) to learn more.
- (It's a superset of JavaScript, so knowing that already will help you a lot).

This project uses **Bun** as our development environment.
- Check out the [Bun Docs](https://bun.com/docs) to learn more.
- (It's similar to other JavaScript tools like Node/Jest/Esbuild/Vite, so knowing any of those already will help you a lot).
- Bun supports both JavaScript and TypeScript.

If you want to contribute to country-coder, you'll probably need to:
- [Install Bun](https://bun.com/docs/installation)
- `git clone` country-coder
- `cd` into the project folder
- `bun install` the dependencies

As you change things, you'll want to `bun run all` to ensure that things are working.
(This command just runs `clean`, `builds`, and `test`)

It's also good to check on the dependencies sometimes with commands like:
- `bun outdated`  - what packages have updates available?
- `bun update --interactive`  - choose which updates to apply

Try to keep things simple!
