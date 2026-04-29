# Contributing

This project uses **GitHub** to track issues and manage our source code.
- Check out the [Git Guides](https://github.com/git-guides) to learn more.

This project uses **TypeScript**, a superset of the **JavaScript** programming language.
- Check out the [TypeScript Docs](https://www.typescriptlang.org/docs/) to learn more.
- [MDN's JavaScript guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) is a great resource for learning about JavaScript.

This project uses **Bun** as our development environment.
- Check out the [Bun Docs](https://bun.com/docs) to learn more.
- (It's similar to other JavaScript tools like Node/Jest/Esbuild/Vite, so knowing any of those already will help you a lot).
- Bun supports both JavaScript and TypeScript.

If you want to contribute to country-coder, you'll probably need to:
- [Install Bun](https://bun.com/docs/installation)
- `git clone` https://github.com/rapideditor/country-coder
- `cd` into the project folder
- `bun install` the dependencies

As you change things, you'll want to `bun run all` to ensure that things are working.
(This command runs `clean`, `lint`, `build`, and `test`.)

You can also test the preview page in a local server:
- `bun start` - then open `http://127.0.0.1:8080/` in a browser.

It's also good to check on the dependencies sometimes with commands like:
- `bun outdated`  - what packages have updates available?
- `bun update --interactive`  - choose which updates to apply

Try to keep things simple!

## AI-Assisted Contributions

We welcome contributions made with the help of AI tools.
If you use them, you are responsible for understanding and reviewing the output before submitting it.
Generated code, issues, and PR descriptions should be clear and relevant — not verbose for the sake of it.
