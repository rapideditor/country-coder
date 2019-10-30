# country-coder

📍 ➡️ 🇩🇰 Convert longitude-latitude pairs to [ISO 3166-1](https://en.wikipedia.org/wiki/ISO_3166-1) codes quickly and locally


## What is it?

`country-coder` is a lightweight package that looks up region identifiers for geographic points without calling a server. It can code and convert between several common IDs:

- 🆎 [ISO 3166-1 alpha-2 code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) (`ZA`)
- 🔤 [ISO 3166-1 alpha-3 code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) (`ZAF`)
- 3️⃣ [ISO 3166-1 numeric-3 code](https://en.wikipedia.org/wiki/ISO_3166-1_numeric) (`710`)
- 🌐 [Wikidata QID](https://www.wikidata.org/wiki/Q43649390) (`Q258`)
- 🇺🇳 [Emoji flag](https://en.wikipedia.org/wiki/Regional_Indicator_Symbol) (🇿🇦)

Results can optionally include non-country ISO 3166-1 features, such as Puerto Rico (`PR`) or the Isle of Man (`IM`). Some unofficial yet exceptionally-reserved or user-assigned ISO codes are also supported, such as the European Union (`EU`) and Kosovo (`XK`).

#### Advantages

Client-side coding has a number of benefits over server-side solutions:

- ✅ 🚅 *Performance*: get fast, reliable results at scale
- ✅ ✌️ *Ease of Use*: forget async callbacks, network errors, API keys, and rate limits
- ✅ 🕶 *Privacy*: keep your location data on-device
- ✅ 📴 *Offline Workflows*: deploy to connection-challenged environments

#### Caveats

`country-coder` prioritizes package size and lookup speed over precision. Thus, it's **not** suitable for some situations and use cases:

- 🚫 🛂 *Disputed Borders*: only one country is coded per point, roughly the "de facto controlling country"
- 🚫 🚢 *Maritime Borders*: only points on land are supported; borders over water are highly generalized
- 🚫 🖋 *Complex Borders*: land borders are of varying detail and may be imprecise at granular scales
- 🚫 🧩 *Country Subdivisions*: provinces and similar features under [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) cannot be coded
- 🚫 📇 *Naming*: feature names are omitted; get them via another package or the [Wikidata API](https://www.wikidata.org/wiki/Special:ApiSandbox#action=wbgetentities&format=json&ids=Q258&sites=&props=labels)
- 🚫 📐 *Spatial Operations*: a feature's calculated area, bounding box, etc. will likely be inaccurate
- 🚫 🗺 *Mapmaking*: the border data is not intended for rendering


## Installing

`npm install country-coder`

This library is available in both ES5/CommonJS and ES6 module formats.

```js
const CountryCoder = require('country-coder').CountryCoder;   // CommonJS
// or
import { CountryCoder } from 'country-coder';     // ES6
```

Coding is quick and easy.

```js
const coder = new CountryCoder();
coder.iso1A2Code([71.13, 39.96]);	// returns 'UZ'
```


## Contributing

This package is kept intentionally minimal. However, if you find a bug or have an interesting idea for an enhancement, feel free to open an [Issue](https://github.com/ideditor/country-coder/issues) and/or [Pull Request](https://github.com/ideditor/country-coder/pulls).



## API Reference

##### Methods
* [new CountryCoder](#constructor)() _constructor_
* [feature](#feature)(arg: LocOrID, opts?: GetterOptions): Feature?
* [iso1A2Code](#iso1A2Code)(arg: LocOrID, opts?: GetterOptions): string?
* [iso1A3Code](#iso1A3Code)(arg: LocOrID, opts?: GetterOptions): string?
* [iso1N3Code](#iso1N3Code)(arg: LocOrID, opts?: GetterOptions): string?
* [wikidataQID](#wikidataQID)(arg: LocOrID, opts?: GetterOptions): string?
* [emojiFlag](#emojiFlag)(arg: LocOrID, opts?: GetterOptions): string?
* [features](#features)(loc: Vec2): [Feature]
* [iso1A2Codes](#iso1A2Codes)(loc: Vec2): [string]
* [isInEuropeanUnion](#isInEuropeanUnion)(arg: LocOrID): boolean

##### Properties
* [borders](#min): FeatureCollection - the base GeoJSON containing all features

##### Types
* [Vec2](#Vec2): [number, number]
* [LocOrID](#LocOrID): Vec2 | string
* [GetterOptions](#GetterOptions): options object for coding locations
* [Feature](#Feature): a GeoJSON feature
* [FeatureProperties](#FeatureProperties): the `properties` object of Feature objects
* [FeatureCollection](#FeatureCollection): a GeoJSON feature collection


## Methods

<a name="constructor" href="#constructor">#</a> <b>new CountryCoder</b>()
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L55 "Source")

Constructs a new CountryCoder.

```js
const coder = new CountryCoder();
```


<a name="feature" href="#feature">#</a> <b>feature</b>(arg: LocOrID, opts?: GetterOptions): Feature?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L144 "Source")

Returns the GeoJSON feature for the given location or identifier and options, if found.

```js
const coder = new CountryCoder();
coder.feature([-4.5, 54.2]); 						// returns United Kingdom feature
coder.feature([-4.5, 54.2], { level: 'region' });	// returns Isle of Man feature
coder.feature([0, 90]); 							// returns null
coder.feature('GB'); 								// returns United Kingdom feature
coder.feature('GBR'); 								// returns United Kingdom feature
coder.feature('826'); 								// returns United Kingdom feature
coder.feature('Q145'); 								// returns United Kingdom feature
coder.feature('🇬🇧'); 								// returns United Kingdom feature
coder.feature('UK'); 								// returns United Kingdom feature
coder.feature('IM'); 								// returns Isle of Man feature
```


<a name="iso1A2Code" href="#iso1A2Code">#</a> <b>iso1A2Code</b>(arg: LocOrID, opts?: GetterOptions): Feature?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L152 "Source")

Returns the ISO 3166-1 alpha-2 code for the given location or identifier and options, if found.

```js
const coder = new CountryCoder();
coder.iso1A2Code([-4.5, 54.2]); 						// returns 'GB'
coder.iso1A2Code([-4.5, 54.2], { level: 'region' });	// returns 'IM'
coder.iso1A2Code([0, 90]); 								// returns null
coder.iso1A2Code('GBR'); 								// returns 'GB'
coder.iso1A2Code('826'); 								// returns 'GB'
coder.iso1A2Code('Q145'); 								// returns 'GB'
coder.iso1A2Code('🇬🇧'); 								// returns 'GB'
coder.iso1A2Code('UK'); 								// returns 'GB'
coder.iso1A2Code('IMN'); 								// returns 'IM'
```


<a name="iso1A3Code" href="#iso1A3Code">#</a> <b>iso1A3Code</b>(arg: LocOrID, opts?: GetterOptions): Feature?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L159 "Source")

Returns the ISO 3166-1 alpha-3 code for the given location or identifier and options, if found.

```js
const coder = new CountryCoder();
coder.iso1A3Code([-4.5, 54.2]); 						// returns 'GBR'
coder.iso1A3Code([-4.5, 54.2], { level: 'region' });	// returns 'IMN'
coder.iso1A3Code([0, 90]); 								// returns null
coder.iso1A3Code('GB'); 								// returns 'GBR'
coder.iso1A3Code('826'); 								// returns 'GBR'
coder.iso1A3Code('Q145'); 								// returns 'GBR'
coder.iso1A3Code('🇬🇧'); 								// returns 'GBR'
coder.iso1A3Code('UK'); 								// returns 'GBR'
coder.iso1A3Code('IM'); 								// returns 'IMN'
```


<a name="iso1N3Code" href="#iso1N3Code">#</a> <b>iso1N3Code</b>(arg: LocOrID, opts?: GetterOptions): Feature?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L166 "Source")

Returns the ISO 3166-1 numeric-3 code for the given location or identifier and options, if found.

```js
const coder = new CountryCoder();
coder.iso1N3Code([-4.5, 54.2]); 						// returns '826'
coder.iso1N3Code([-4.5, 54.2], { level: 'region' });	// returns '833'
coder.iso1N3Code([0, 90]); 								// returns null
coder.iso1N3Code('GB'); 								// returns '826'
coder.iso1N3Code('GBR'); 								// returns '826'
coder.iso1N3Code('Q145'); 								// returns '826'
coder.iso1N3Code('🇬🇧'); 								// returns '826'
coder.iso1N3Code('UK'); 								// returns '826'
coder.iso1N3Code('IM'); 								// returns '833'
```


<a name="wikidataQID" href="#wikidataQID">#</a> <b>wikidataQID</b>(arg: LocOrID, opts?: GetterOptions): Feature?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L173 "Source")

Returns the Wikidata QID for the given location or identifier and options, if found.

```js
const coder = new CountryCoder();
coder.wikidataQID([-4.5, 54.2]); 						// returns 'Q145'
coder.wikidataQID([-4.5, 54.2], { level: 'region' });	// returns 'Q9676'
coder.wikidataQID([0, 90]); 							// returns null
coder.wikidataQID('GB'); 								// returns 'Q145'
coder.wikidataQID('GBR'); 								// returns 'Q145'
coder.wikidataQID('826'); 								// returns 'Q145'
coder.wikidataQID('🇬🇧'); 								// returns 'Q145'
coder.wikidataQID('UK'); 								// returns 'Q145'
coder.wikidataQID('IM'); 								// returns 'Q9676'
```


<a name="emojiFlag" href="#emojiFlag">#</a> <b>emojiFlag</b>(arg: LocOrID, opts?: GetterOptions): Feature?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L180 "Source")

Returns the emoji flag sequence for the given location or identifier and options, if found.

```js
const coder = new CountryCoder();
coder.emojiFlag([-4.5, 54.2]); 							// returns '🇬🇧'
coder.emojiFlag([-4.5, 54.2], { level: 'region' });		// returns '🇮🇲'
coder.emojiFlag([0, 90]); 								// returns null
coder.emojiFlag('GB'); 									// returns '🇬🇧'
coder.emojiFlag('GBR'); 								// returns '🇬🇧'
coder.emojiFlag('826'); 								// returns '🇬🇧'
coder.emojiFlag('Q145'); 								// returns '🇬🇧'
coder.emojiFlag('UK'); 									// returns '🇬🇧'
coder.emojiFlag('IM'); 									// returns '🇮🇲'
```


<a name="features" href="#features">#</a> <b>features</b>(loc: Vec2): [Feature]
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L187 "Source")

Returns all the the features containing the given location.

```js
const coder = new CountryCoder();
coder.features([-4.5, 54.2]); 	// returns [{Isle of Man feature}, {United Kingdom feature}]
coder.features([0, 54.2]); 		// returns [{United Kingdom feature}, {European Union feature}]
coder.features([6.1, 46.2]); 	// returns [{Switzerland feature}]
coder.features([0, 90]); 		// returns []
```


<a name="iso1A2Codes" href="#iso1A2Codes">#</a> <b>iso1A2Codes</b>(loc: Vec2): [string]
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L208 "Source")

Returns the ISO 3166-1 alpha-2 codes for all the the features containing the given location.

```js
const coder = new CountryCoder();
coder.iso1A2Codes([-4.5, 54.2]); 	// returns ['IM', 'GB']
coder.iso1A2Codes([0, 54.2]); 		// returns ['GB', 'EU']
coder.iso1A2Codes([6.1, 46.2]); 	// returns ['CH']
coder.iso1A2Codes([0, 90]); 		// returns []
```


<a name="isInEuropeanUnion" href="#isInEuropeanUnion">#</a> <b>isInEuropeanUnion</b>(arg: LocOrID): boolean
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L215 "Source")

Returns `true` if the feature with the given location or identifier is found to be part of the European Union. 

```js
const coder = new CountryCoder();
coder.isInEuropeanUnion([0, 54.2]); 		// returns true (Britain)
coder.isInEuropeanUnion([-4.5, 54.2]); 		// returns false (Isle of Man)
coder.isInEuropeanUnion([6.1, 46.2]); 		// returns false (Switzerland)
coder.isInEuropeanUnion([0, 90]); 			// returns false (North Pole)
coder.isInEuropeanUnion('GB'); 				// returns true
coder.isInEuropeanUnion('GBR'); 			// returns true
coder.isInEuropeanUnion('826'); 			// returns true
coder.isInEuropeanUnion('Q145'); 			// returns true
coder.isInEuropeanUnion('🇬🇧'); 				// returns true
coder.isInEuropeanUnion('UK'); 				// returns true
coder.isInEuropeanUnion('IM'); 				// returns false
coder.isInEuropeanUnion('CH'); 				// returns false
```


## Properties

<a name="borders" href="#borders">#</a> <b>borders</b>: FeatureCollection<br/>

The base GeoJSON feature collection used for feature lookup. While this property is public, modifying it is not recommended and may not have the desired results.


## Types

<a name="Vec2" href="#Vec2">#</a> <b>Vec2</b>

An array of two numbers understood as [longitude, latitude]

`[number, number]`
