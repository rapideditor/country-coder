# What's New

**country-coder** is an open source project. You can submit bug reports, help out,
or learn more by visiting our project page on GitHub:  :octocat: https://github.com/ideditor/country-coder

Please star our project on GitHub to show your support! :star:

_Breaking changes, which may affect downstream projects, are marked with a_ :warning:


<!--
# A.B.C
##### YYYY-MMM-DD
*

[#xx]: https://github.com/ideditor/country-coder/issues/xx
-->

# 5.0.4
##### 2022-May-04
* Avoid `for..in` over arrays ([#59],[#60])
* Fix EU membership for France ([#47],[#55])
* Add GB-UKM for UK Mainland ([#52])

[#60]: https://github.com/ideditor/country-coder/issues/60
[#59]: https://github.com/ideditor/country-coder/issues/59
[#55]: https://github.com/ideditor/country-coder/issues/55
[#52]: https://github.com/ideditor/country-coder/issues/52
[#47]: https://github.com/ideditor/country-coder/issues/47


# 5.0.3
##### 2021-Jun-24
* Remove "browser" from the export map ([#45])

[#45]: https://github.com/ideditor/country-coder/issues/45


# 5.0.2
##### 2021-Jun-17
* Add an export map to `package.json`, fix file extensions again


# 5.0.1
##### 2021-Jun-15
* Use explicit file extensions for .cjs and .mjs exports ([#44])


# 5.0.0
##### 2021-Jun-14
* :warning: Replace microbundle with [esbuild](https://esbuild.github.io/) for super fast build speed. Outputs are now:
  * `"source": "./src/country-coder.ts"`  - TypeScript source file
  * `"types": "./dist/country-coder.d.ts"` - TypeScript definition file
  * `"main": "./dist/country-coder.cjs"` - CJS bundle, modern JavaScript, works with `require()`
  * `"module": "./dist/country-coder.mjs"` - ESM bundle, modern JavaScript, works with `import`
  * `"browser": "./dist/country-coder.iife.js"` - IIFE bundle, modern JavaScript, works in browser `<script>` tag
  * Note: v4.1.0 was broken for some uses because of an improper "exports" specification ([#44])
* :warning: country-coder is marked as `"type": "module"` now
* :warning: Dropped support for old browsers like Internet Explorer on https://ideditor.codes
* Use TypeScript / ts-jest for testing ([#43])

[#43]: https://github.com/ideditor/country-coder/issues/43
[#44]: https://github.com/ideditor/country-coder/issues/44


# 4.1.0
##### 2021-Jun-04
* country-coder now publishes various builds in UMD, CJS, ES6 Module thanks to [microbundle](https://github.com/developit/microbundle)
  * The UMD bundle works in the browser now too
* Added functions for working with ccTLD (country code top-level internet domain) ([#12])
* Extract Crimea into its own feature out of European Russia ([#15])
* Move Chukchi Peninsula from European Russia to Asian Russia ([#31])
* Support bbox querying ([#32])

[#12]: https://github.com/ideditor/country-coder/issues/12
[#15]: https://github.com/ideditor/country-coder/issues/15
[#31]: https://github.com/ideditor/country-coder/issues/31
[#32]: https://github.com/ideditor/country-coder/issues/32
