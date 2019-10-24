# country-coder

📍 ➡️ 🇩🇰 Convert longitude-latitude pairs to ISO 3166-1 codes quickly and locally


## What is it?

`country-coder` is a lightweight package that looks up identifiers for geographic points without calling a server. It can also convert between alpha-2, alpha-3, numeric-3, and Wikidata identifiers.


### Advantages

Client-side coding has a number of benefits over server-side solutions:

- Works offline (of course)
- Fast, reliable, synchronous calls
- No API keys, rate-limiting, or network errors
- Privacy

### Caveats

`country-coder` prioritizes package size and lookup speed over precision. Thus, it's **not** suitable for some situations and use cases:

- *Disputed Borders*: only one country is returned per point, the "de facto controlling country"
- *Maritime Borders*: only points on land are supported; borders over water are highly generalized
- *Complex Borders*: land borders are of varying detail and may be imprecise at granular scales
- *Country Subdivisions*: provinces and similar features under ISO 3166-2 cannot be coded
- *Naming*: feature names are not included; you can get them with another package or the Wikidata API
- *Spatial Operations*: a feature's calculated area, bounding box, etc. will likely be inaccurate
- *Mapmaking*: the border data is not intended for rendering


## Installing

`npm install country-coder`

This library is available in both ES5/CommonJS and ES6 module formats.

```js
const CountryCoder = require('country-coder').CountryCoder;   // CommonJS
// or
import { CountryCoder } from 'country-coder';     // ES6
```


## Contributing

This package is kept intentionally minimal. However, if you find a bug or have an interesting idea for an enhancement, feel free to open an [Issue](https://github.com/ideditor/country-coder/issues) and/or [Pull Request](https://github.com/ideditor/country-coder/pulls).
