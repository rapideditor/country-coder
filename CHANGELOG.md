# What's New

**country-coder** is an open source project. You can submit bug reports, help out,
or learn more by visiting our project page on GitHub:  :octocat: https://github.com/rapideditor/country-coder

Please star our project on GitHub to show your support! ⭐️

_Breaking changes, which may affect downstream projects, are marked with a_ ⚠️


<!--
# A.B.C
##### YYYY-MMM-DD
*

[#xx]: https://github.com/rapideditor/country-coder/issues/xx
-->

# 5.3.1
##### 2024-Dec-13
* Cyprus border refinements and corrections ([#139], [#140], [#143])

[#139]: https://github.com/rapideditor/country-coder/issues/139
[#140]: https://github.com/rapideditor/country-coder/issues/140
[#143]: https://github.com/rapideditor/country-coder/issues/143


# 5.3.0
##### 2024-Jul-17
* Support Sark/CQ in CLDR 43, Unicode 16 ([#137])

[#137]: https://github.com/rapideditor/country-coder/issues/137


# 5.2.2
##### 2023-Sep-26
* Include 'types' in export map ([#133])

[#133]: https://github.com/rapideditor/country-coder/issues/133


# 5.2.1
##### 2023-Jul-12
* Bump dependency versions
* Adjust TW polygon to include Matsu and Wuqiu islands ([#127], [#128])

[#127]: https://github.com/rapideditor/country-coder/issues/127
[#128]: https://github.com/rapideditor/country-coder/issues/128


# 5.2.0
##### 2023-Mar-12
* Bump dependency versions
* Switch country-coder to a scoped package under the rapideditor org: `@rapideditor/country-coder`
  * ⚠️ Note: projects that depend on country-coder may need to update their code


# 5.1.0
##### 2022-Dec-09
* Close seam along Swiss-German border ([#61])
* Make Ireland less spiky ([#oci-528])
* Bump dependency versions

[#61]: https://github.com/rapideditor/country-coder/issues/61
[#oci-528]: https://github.com/osmlab/osm-community-index/issues/528


# 5.0.4
##### 2022-May-04
* Avoid `for..in` over arrays ([#59],[#60])
* Fix EU membership for France ([#47],[#55])
* Add GB-UKM for UK Mainland ([#52])

[#60]: https://github.com/rapideditor/country-coder/issues/60
[#59]: https://github.com/rapideditor/country-coder/issues/59
[#55]: https://github.com/rapideditor/country-coder/issues/55
[#52]: https://github.com/rapideditor/country-coder/issues/52
[#47]: https://github.com/rapideditor/country-coder/issues/47


# 5.0.3
##### 2021-Jun-24
* Remove "browser" from the export map ([#45])

[#45]: https://github.com/rapideditor/country-coder/issues/45


# 5.0.2
##### 2021-Jun-17
* Add an export map to `package.json`, fix file extensions again


# 5.0.1
##### 2021-Jun-15
* Use explicit file extensions for .cjs and .mjs exports ([#44])


# 5.0.0
##### 2021-Jun-14
* ⚠️ Replace microbundle with [esbuild](https://esbuild.github.io/) for super fast build speed. Outputs are now:
  * `"source": "./src/country-coder.ts"`  - TypeScript source file
  * `"types": "./dist/country-coder.d.ts"` - TypeScript definition file
  * `"main": "./dist/country-coder.cjs"` - CJS bundle, modern JavaScript, works with `require()`
  * `"module": "./dist/country-coder.mjs"` - ESM bundle, modern JavaScript, works with `import`
  * `"browser": "./dist/country-coder.iife.js"` - IIFE bundle, modern JavaScript, works in browser `<script>` tag
  * Note: v4.1.0 was broken for some uses because of an improper "exports" specification ([#44])
* ⚠️ country-coder is marked as `"type": "module"` now
* ⚠️ Dropped support for old browsers like Internet Explorer on https://ideditor.codes
* Use TypeScript / ts-jest for testing ([#43])

[#43]: https://github.com/rapideditor/country-coder/issues/43
[#44]: https://github.com/rapideditor/country-coder/issues/44


# 4.1.0
##### 2021-Jun-04
* country-coder now publishes various builds in UMD, CJS, ES6 Module thanks to [microbundle](https://github.com/developit/microbundle)
  * The UMD bundle works in the browser now too
* Added functions for working with ccTLD (country code top-level internet domain) ([#12])
* Extract Crimea into its own feature out of European Russia ([#15])
* Move Chukchi Peninsula from European Russia to Asian Russia ([#31])
* Support bbox querying ([#32])

[#12]: https://github.com/rapideditor/country-coder/issues/12
[#15]: https://github.com/rapideditor/country-coder/issues/15
[#31]: https://github.com/rapideditor/country-coder/issues/31
[#32]: https://github.com/rapideditor/country-coder/issues/32
