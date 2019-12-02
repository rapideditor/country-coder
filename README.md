[![npm version](https://badge.fury.io/js/%40ideditor%2Fcountry-coder.svg)](https://badge.fury.io/js/%40ideditor%2Fcountry-coder)

# country-coder

📍 ➡️ 🇩🇰 Convert longitude-latitude pairs to [ISO 3166-1 codes](https://en.wikipedia.org/wiki/ISO_3166-1) quickly and locally


## What is it?

`country-coder` is a lightweight package that looks up region identifiers for geographic points without calling a server. It can code and convert between several common IDs:

- 🆎 [ISO 3166-1 alpha-2 code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) (`ZA`)
- 🔤 [ISO 3166-1 alpha-3 code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) (`ZAF`)
- 3️⃣ [ISO 3166-1 numeric-3 code](https://en.wikipedia.org/wiki/ISO_3166-1_numeric) (`710`)
- 3️⃣ [United Nations M49 code](https://en.wikipedia.org/wiki/UN_M49) (`710`)
- 🌐 [Wikidata QID](https://www.wikidata.org/wiki/Q43649390) (`Q258`)
- 🇺🇳 [Emoji flag](https://en.wikipedia.org/wiki/Regional_Indicator_Symbol) (🇿🇦)

Results can optionally include non-country ISO 3166-1 features, such as Puerto Rico (`PR`) or the Isle of Man (`IM`). Some unofficial yet exceptionally-reserved or user-assigned ISO codes are also supported, such as the European Union (`EU`) and Kosovo (`XK`), as well as M49 regions like Africa (`002`) or Polynesia (`061`).

In addition to identifiers, `country-coder` can provide basic regional information:

- ☎️ [Telephone Calling Codes](https://en.wikipedia.org/wiki/List_of_country_calling_codes) (+44)
- 🛣 [Driving Side](https://en.wikipedia.org/wiki/Left-_and_right-hand_traffic) (right, left)
- 🚗 [Traffic Speed Unit](https://en.wikipedia.org/wiki/Speed_limit#Signage) (km/h, mph)
- 🇪🇺 [European Union Membership](https://en.wikipedia.org/wiki/Member_state_of_the_European_Union)


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
- 🚫 📇 *Multilingual Naming*: only basic English names are included; get display names via another package or the [Wikidata API](https://www.wikidata.org/wiki/Special:ApiSandbox#action=wbgetentities&format=json&ids=Q258&sites=&props=labels)
- 🚫 📐 *Spatial Operations*: a feature's calculated area, bounding box, etc. will likely be inaccurate
- 🚫 🗺 *Mapmaking*: the border data is not intended for rendering


## Installing

`npm install @ideditor/country-coder`

This library is available in both ES5/CommonJS and ES6 module formats.

```js
const countryCoder = require('@ideditor/country-coder');          // CommonJS import all
const iso1A2Code = require('@ideditor/country-coder').iso1A2Code; // CommonJS import named
// or
import * as countryCoder from '@ideditor/country-coder';          // ES6 import all
import { iso1A2Code } from '@ideditor/country-coder';             // ES6 import named
```


## Quick Start

Simply pass in a `[longitude, latitude]` to `iso1A2Code` to get the country code.

```js
iso1A2Code([-4.5, 54.2]);	 // returns 'GB'
```

To include non-country territories, pass in `territory` for the `level` option.

```js
iso1A2Code([-4.5, 54.2], { level: 'territory' });  // returns 'IM'
```

The same method can convert from other identifiers.

```js
iso1A2Code('Q145');  // returns 'GB'
```

Read the [full API reference](#api-reference) to see everything `country-coder` can do.


## Contributing

This package is kept intentionally minimal. However, if you find a bug or have an interesting idea for an enhancement, feel free to open an [Issue](https://github.com/ideditor/country-coder/issues) and/or [Pull Request](https://github.com/ideditor/country-coder/pulls).


## API Reference

##### Methods
* [feature](#feature)(query: Location | string | number, opts?: CodingOptions): RegionFeature?
* [iso1A2Code](#iso1A2Code)(query: Location | string | number, opts?: CodingOptions): string?
* [iso1A3Code](#iso1A3Code)(query: Location | string | number, opts?: CodingOptions): string?
* [iso1N3Code](#iso1N3Code)(query: Location | string | number, opts?: CodingOptions): string?
* [m49Code](#m49Code)(query: Location | string | number, opts?: CodingOptions): string?
* [wikidataQID](#wikidataQID)(query: Location | string | number, opts?: CodingOptions): string?
* [emojiFlag](#emojiFlag)(query: Location | string | number, opts?: CodingOptions): string?
* [featuresContaining](#featuresContaining)(query: Location | string | number, strict: boolean): [RegionFeature]
* [featuresIn](#featuresIn)(id: string | number, strict: boolean): [RegionFeature]
* [aggregateFeature](#aggregateFeature)(id: string | number): [RegionFeature]
* [isIn](#isIn)(query: Location | string | number, bounds: string | number): boolean
* [isInEuropeanUnion](#isInEuropeanUnion)(query: Location | string | number): boolean
* [driveSide](#driveSide)(query: Location | string | number): string?
* [roadSpeedUnit](#roadSpeedUnit)(query: Location | string | number): string?
* [callingCodes](#callingCodes)(query: Location | string | number): [string]

##### Properties
* [borders](#borders): RegionFeatureCollection - the base GeoJSON containing all features

##### Types
* [Vec2](#Vec2): [number, number]
* [PointGeometry](#PointGeometry): a GeoJSON Point geometry object
* [PointFeature](#PointFeature): a GeoJSON feature object with a Point geometry type
* [Location](#Location): Vec2 | PointGeometry | PointFeature
* [CodingOptions](#CodingOptions)
* [RegionFeature](#RegionFeature)
* [RegionFeatureProperties](#RegionFeatureProperties)
* [RegionFeatureCollection](#RegionFeatureCollection)


## Methods

<a name="feature" href="#feature">#</a> <b>feature</b>(query: Location | string | number, opts?: CodingOptions): RegionFeature?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L347 "Source")

Returns the GeoJSON feature from `borders` for the given location or identifier and options, if found. Note that the `geometry` of the feature may not contain its full bounds (see [aggregateFeature](#aggregateFeature)).

```js
feature([-4.5, 54.2]);  // returns United Kingdom feature
feature([-4.5, 54.2], { level: 'territory' });  // returns {Isle of Man}
feature([0, 90]);       // returns null
feature('GB');          // returns {United Kingdom}
feature('GBR');         // returns {United Kingdom}
feature('826');         // returns {United Kingdom}
feature(826);           // returns {United Kingdom}
feature('Q145');        // returns {United Kingdom}
feature('🇬🇧');          // returns {United Kingdom}
feature('UK');          // returns {United Kingdom}
feature('IM');          // returns {Isle of Man}
feature('United Kingdom'); // returns {United Kingdom}

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.5, 54.2] } };
feature(pointGeoJSON);           // returns {United Kingdom}
feature(pointGeoJSON.geometry);  // returns {United Kingdom}
```


<a name="iso1A2Code" href="#iso1A2Code">#</a> <b>iso1A2Code</b>(query: Location | string | number, opts?: CodingOptions): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L358 "Source")

Returns the ISO 3166-1 alpha-2 code for the given location or identifier and options, if found.

```js
iso1A2Code([-4.5, 54.2]);  // returns 'GB'
iso1A2Code([-4.5, 54.2], { level: 'territory' });  // returns 'IM'
iso1A2Code([0, 90]);       // returns null
iso1A2Code('GBR');         // returns 'GB'
iso1A2Code('826');         // returns 'GB'
iso1A2Code(826);           // returns 'GB'
iso1A2Code('Q145');        // returns 'GB'
iso1A2Code('🇬🇧');          // returns 'GB'
iso1A2Code('UK');          // returns 'GB'
iso1A2Code('IMN');         // returns 'IM'
iso1A2Code('United Kingdom'); // returns 'GB'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.5, 54.2] } };
iso1A2Code(pointGeoJSON);           // returns 'GB'
iso1A2Code(pointGeoJSON.geometry);  // returns 'GB'
```


<a name="iso1A3Code" href="#iso1A3Code">#</a> <b>iso1A3Code</b>(query: Location | string | number, opts?: CodingOptions): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L365 "Source")

Returns the ISO 3166-1 alpha-3 code for the given location or identifier and options, if found.

```js
iso1A3Code([-4.5, 54.2]);  // returns 'GBR'
iso1A3Code([-4.5, 54.2], { level: 'territory' });  // returns 'IMN'
iso1A3Code([0, 90]);       // returns null
iso1A3Code('GB');          // returns 'GBR'
iso1A3Code('826');         // returns 'GBR'
iso1A3Code(826);           // returns 'GBR'
iso1A3Code('Q145');        // returns 'GBR'
iso1A3Code('🇬🇧');          // returns 'GBR'
iso1A3Code('UK');          // returns 'GBR'
iso1A3Code('IM');          // returns 'IMN'
iso1A3Code('United Kingdom'); // returns 'GBR'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.5, 54.2] } };
iso1A3Code(pointGeoJSON);           // returns 'GBR'
iso1A3Code(pointGeoJSON.geometry);  // returns 'GBR'
```


<a name="iso1N3Code" href="#iso1N3Code">#</a> <b>iso1N3Code</b>(query: Location | string | number, opts?: CodingOptions): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L372 "Source")

Returns the ISO 3166-1 numeric-3 code for the given location or identifier and options, if found. For more comprehensive coverage, see [m49Code](#m49Code).

```js
iso1N3Code([-4.5, 54.2]);  // returns '826'
iso1N3Code([-4.5, 54.2], { level: 'territory' });  // returns '833'
iso1N3Code([0, 90]);       // returns null
iso1N3Code('GB');          // returns '826'
iso1N3Code('GBR');         // returns '826'
iso1N3Code('Q145');        // returns '826'
iso1N3Code('🇬🇧');          // returns '826'
iso1N3Code('UK');          // returns '826'
iso1N3Code('IM');          // returns '833'
iso1N3Code('Q15');         // returns null (Africa)
iso1A3Code('United Kingdom'); // returns '826'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.5, 54.2] } };
iso1N3Code(pointGeoJSON);           // returns '826'
iso1N3Code(pointGeoJSON.geometry);  // returns '826'
```


<a name="m49Code" href="#m49Code">#</a> <b>m49Code</b>(query: Location | string | number, opts?: CodingOptions): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L379 "Source")

Returns the United Nations M49 code for the given location or identifier and options, if found. These codes are a superset of ISO 3166-1 numeric-3 codes, adding a subdivision (Sark) and transnational regions (e.g. Asia, Central America, Polynesia).

```js
m49Code([-4.5, 54.2]);  // returns '826'
m49Code([-4.5, 54.2], { level: 'territory' });  // returns '833'
m49Code([0, 90]);       // returns null
m49Code('GB');          // returns '826'
m49Code('GBR');         // returns '826'
m49Code('Q145');        // returns '826'
m49Code('🇬🇧');          // returns '826'
m49Code('UK');          // returns '826'
m49Code('IM');          // returns '833'
m49Code('Q15');         // returns '002' (Africa)
m49Code('United Kingdom'); // returns '826'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.5, 54.2] } };
m49Code(pointGeoJSON);           // returns '826'
m49Code(pointGeoJSON.geometry);  // returns '826'
```


<a name="wikidataQID" href="#wikidataQID">#</a> <b>wikidataQID</b>(query: Location | string | number, opts?: CodingOptions): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L386 "Source")

Returns the Wikidata QID for the given location or identifier and options, if found.

```js
wikidataQID([-4.5, 54.2]);  // returns 'Q145'
wikidataQID([-4.5, 54.2], { level: 'territory' });  // returns 'Q9676'
wikidataQID([0, 90]);       // returns null
wikidataQID('GB');          // returns 'Q145'
wikidataQID('GBR');         // returns 'Q145'
wikidataQID('826');         // returns 'Q145'
wikidataQID(826);           // returns 'Q145'
wikidataQID('🇬🇧');          // returns 'Q145'
wikidataQID('UK');          // returns 'Q145'
wikidataQID('IM');          // returns 'Q9676'
wikidataQID('United Kingdom'); // returns 'Q145'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.5, 54.2] } };
wikidataQID(pointGeoJSON);           // returns 'Q145'
wikidataQID(pointGeoJSON.geometry);  // returns 'Q145'
```


<a name="emojiFlag" href="#emojiFlag">#</a> <b>emojiFlag</b>(query: Location | string | number, opts?: CodingOptions): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L396 "Source")

Returns the emoji flag sequence for the given location or identifier and options, if found.

```js
emojiFlag([-4.5, 54.2]);  // returns '🇬🇧'
emojiFlag([-4.5, 54.2], { level: 'territory' });  // returns '🇮🇲'
emojiFlag([0, 90]);       // returns null
emojiFlag('GB');          // returns '🇬🇧'
emojiFlag('GBR');         // returns '🇬🇧'
emojiFlag('826');         // returns '🇬🇧'
emojiFlag(826);           // returns '🇬🇧'
emojiFlag('Q145');        // returns '🇬🇧'
emojiFlag('UK');          // returns '🇬🇧'
emojiFlag('IM');          // returns '🇮🇲'
emojiFlag('United Kingdom'); // returns '🇬🇧'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.5, 54.2] } };
emojiFlag(pointGeoJSON);           // returns '🇬🇧'
emojiFlag(pointGeoJSON.geometry);  // returns '🇬🇧'
```


<a name="featuresContaining" href="#featuresContaining">#</a> <b>featuresContaining</b>(query: Location | string | number, strict: boolean): [RegionFeature]
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L404 "Source")

Returns all the the features of any type that contain or match the given location or identifier, if any. If `strict` is `true` then only features that are strictly containing are returned.

```js
featuresContaining([-4.5, 54.2]);  // returns [{Isle of Man}, {Northern Europe}, {Europe}, {United Kingdom}]
featuresContaining([0, 51.5]);     // returns [{United Kingdom}, {Northern Europe}, {Europe}, {European Union}]
featuresContaining([6.1, 46.2]);   // returns [{Switzerland}, {Western Europe}, {Europe}]
featuresContaining([0, 90]);       // returns []
featuresContaining('GB');          // returns [{United Kingdom}, {Northern Europe}, {Europe}, {European Union}]
featuresContaining('GBR');         // returns [{United Kingdom}, {Northern Europe}, {Europe}, {European Union}]
featuresContaining('826');         // returns [{United Kingdom}, {Northern Europe}, {Europe}, {European Union}]
featuresContaining(826);           // returns [{United Kingdom}, {Northern Europe}, {Europe}, {European Union}]
featuresContaining('Q145');        // returns [{United Kingdom}, {Northern Europe}, {Europe}, {European Union}]
featuresContaining('🇬🇧');          // returns [{United Kingdom}, {Northern Europe}, {Europe}, {European Union}]
featuresContaining('UK');          // returns [{United Kingdom}, {Northern Europe}, {Europe}, {European Union}]
featuresContaining('154');         // returns [{Northern Europe}, {Europe}]
featuresContaining('GB', true);    // returns [{Northern Europe}, {Europe}, {European Union}]
featuresContaining('154', true);   // returns [{Europe}]

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [0, -90] } };
featuresContaining(pointGeoJSON);            // returns [{Antarctica}]
featuresContaining(pointGeoJSON.geometry);   // returns [{Antarctica}]
```


<a name="featuresIn" href="#featuresIn">#</a> <b>featuresIn</b>(id: string | number, strict: boolean): [RegionFeature]
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L427 "Source")

Returns all the the features that match or are contained within the given identifier, if any. If `strict` is `true` then only features that are strictly contained are returned.

```js
featuresIn('CN');          // returns [{China}, {Hong Kong}, {Macau}]
featuresIn('CHN');         // returns [{China}, {Hong Kong}, {Macau}]
featuresIn('156');         // returns [{China}, {Hong Kong}, {Macau}]
featuresIn(156);           // returns [{China}, {Hong Kong}, {Macau}]
featuresIn('Q148');        // returns [{China}, {Hong Kong}, {Macau}]
featuresIn('🇨🇳');          // returns [{China}, {Hong Kong}, {Macau}]
featuresIn('China');       // returns [{China}, {Hong Kong}, {Macau}]
featuresIn('CN', true);    // returns [{Hong Kong}, {Macau}]
```


<a name="aggregateFeature" href="#aggregateFeature">#</a> <b>aggregateFeature</b>(id: string | number): [RegionFeature]
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L449 "Source")

Returns a new feature with the `properties` of the feature matching `id` and the combined `geometry` of it and all its component features. This step is not necessary when only accessing a feature's properties.

```js
aggregateFeature('CN');          // returns China, Hong Kong, and Macau as one feature
aggregateFeature('CHN');         // returns China, Hong Kong, and Macau as one feature
aggregateFeature('156');         // returns China, Hong Kong, and Macau as one feature
aggregateFeature(156);           // returns China, Hong Kong, and Macau as one feature
aggregateFeature('Q148');        // returns China, Hong Kong, and Macau as one feature
aggregateFeature('🇨🇳');          // returns China, Hong Kong, and Macau as one feature
aggregateFeature('China');       // returns China, Hong Kong, and Macau as one feature
```


<a name="isIn" href="#isIn">#</a> <b>isIn</b>(query: Location | string | number, bounds: string | number): boolean
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L476 "Source")

Returns `true` if the feature matching `query` is, or is within, the feature matching `bounds`.

```js
isIn([0, 51.5], 'GB');    // returns true
isIn([-4.5, 54.2], 'IM'); // returns true
isIn([-4.5, 54.2], 'GB'); // returns true
isIn([-4.5, 54.2], 'CH'); // returns false
isIn([6.1, 46.2], 'GB');  // returns false
isIn('IM', 'GB');         // returns true
isIn('GB', 'IM');         // returns false
isIn('GB', '150');        // returns true
isIn('GBR', 150);         // returns true
isIn('826', 'Q46');       // returns true
isIn('🇮🇲', '🇬🇧');         // returns true
isIn('United Kingdom', 'Europe');     // returns true
isIn('United Kingdom', 'Africa');     // returns false

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 51.5] } };
isIn(pointGeoJSON, 'GB');           // returns true
isIn(pointGeoJSON.geometry, 'GB');  // returns true
```


<a name="isInEuropeanUnion" href="#isInEuropeanUnion">#</a> <b>isInEuropeanUnion</b>(query: Location | string | number): boolean
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L487 "Source")

Returns `true` if the feature with the given location or identifier is found to be part of the European Union. This is a convenience method for `isIn(query, 'EU')`.

```js
isInEuropeanUnion([0, 51.5]);    // returns true (Britain)
isInEuropeanUnion([-4.5, 54.2]); // returns false (Isle of Man)
isInEuropeanUnion([6.1, 46.2]);  // returns false (Switzerland)
isInEuropeanUnion([0, 90]);      // returns false (North Pole)
isInEuropeanUnion('EU');         // returns true
isInEuropeanUnion('GB');         // returns true
isInEuropeanUnion('GBR');        // returns true
isInEuropeanUnion('826');        // returns true
isInEuropeanUnion(826);          // returns true
isInEuropeanUnion('Q145');       // returns true
isInEuropeanUnion('🇬🇧');         // returns true
isInEuropeanUnion('UK');         // returns true
isInEuropeanUnion('United Kingdom'); // returns true
isInEuropeanUnion('IM');         // returns false
isInEuropeanUnion('CH');         // returns false


let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 51.5] } };
isInEuropeanUnion(pointGeoJSON);           // returns true (Britain)
isInEuropeanUnion(pointGeoJSON.geometry);  // returns true (Britain)
```


<a name="driveSide" href="#driveSide">#</a> <b>driveSide</b>(query: Location | string | number): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L492 "Source")

Returns the side of the road on which traffic drives for the given location or identifier, if found.

```js
driveSide([0, 51.5]);    // returns 'left' (Britain)
driveSide([6.1, 46.2]);  // returns 'right' (Switzerland)
driveSide([0, 90]);      // returns null (North Pole)
driveSide('EU');         // returns null
driveSide('GB');         // returns 'left'
driveSide('GBR');        // returns 'left'
driveSide('826');        // returns 'left'
driveSide(826);          // returns 'left'
driveSide('Q145');       // returns 'left'
driveSide('🇬🇧');         // returns 'left'
driveSide('UK');         // returns 'left'
driveSide('United Kingdom'); // returns 'left'
driveSide('CH');         // returns 'right'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 51.5] } };
driveSide(pointGeoJSON);           // returns 'left' (Britain)
driveSide(pointGeoJSON.geometry);  // returns 'left' (Britain)
```


<a name="roadSpeedUnit" href="#roadSpeedUnit">#</a> <b>roadSpeedUnit</b>(query: Location | string | number): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L498 "Source")

Returns the unit of speed used on traffic signs for the given location or identifier, if found.

```js
roadSpeedUnit([0, 51.5]);    // returns 'mph' (Britain)
roadSpeedUnit([6.1, 46.2]);  // returns 'km/h' (Switzerland)
roadSpeedUnit([0, 90]);      // returns null (North Pole)
roadSpeedUnit('EU');         // returns null
roadSpeedUnit('GB');         // returns 'mph'
roadSpeedUnit('GBR');        // returns 'mph'
roadSpeedUnit('826');        // returns 'mph'
roadSpeedUnit(826);          // returns 'mph'
roadSpeedUnit('Q145');       // returns 'mph'
roadSpeedUnit('🇬🇧');         // returns 'mph'
roadSpeedUnit('UK');         // returns 'mph'
roadSpeedUnit('United Kingdom'); // returns 'mph'
roadSpeedUnit('CH');         // returns 'km/h'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 51.5] } };
roadSpeedUnit(pointGeoJSON);           // returns 'mph' (Britain)
roadSpeedUnit(pointGeoJSON.geometry);  // returns 'mph' (Britain)
```


<a name="callingCodes" href="#callingCodes">#</a> <b>callingCodes</b>(query: Location | string | number): [string]
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L504 "Source")

Returns the full international calling code prefix of phone numbers for the given location or identifier, if any. All prefixes have a country code, with some also including an area code separated by a space character. These are commonly formatted with a preceding plus sign (e.g. `+1 242`).

```js
callingCodes([0, 51.5]);    // returns ['44'] (Britain)
callingCodes([0, 90]);      // returns [] (North Pole)
callingCodes('EU');         // returns []
callingCodes('GB');         // returns ['44']
callingCodes('GBR');        // returns ['44']
callingCodes('826');        // returns ['44']
callingCodes(826);          // returns ['44']
callingCodes('Q145');       // returns ['44']
callingCodes('🇬🇧');         // returns ['44']
callingCodes('UK');         // returns ['44']
callingCodes('United Kingdom'); // returns ['44']
callingCodes('BS');         // returns ['1 242']
callingCodes('JA');         // returns ['1 876', '1 658']

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 51.5] } };
callingCodes(pointGeoJSON);           // returns ['44'] (Britain)
callingCodes(pointGeoJSON.geometry);  // returns ['44'] (Britain)
```


## Properties

<a name="borders" href="#borders">#</a> <b>borders</b>: RegionFeatureCollection
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L89 "Source")<br/>

The base GeoJSON feature collection used for feature lookup. While this property is public, modifying it is not recommended and may have unintended effects.


## Types

<a name="Vec2" href="#Vec2">#</a> <b>Vec2</b>

An array of two numbers as `[longitude, latitude]` referenced to the WGS 84 datum.

`[number, number]`


<a name="PointGeometry" href="#PointGeometry">#</a> <b>PointGeometry</b>

GeoJSON [Point geometry](https://tools.ietf.org/html/rfc7946#section-3.1.2) as specified by RFC 7946.


<a name="PointFeature" href="#PointFeature">#</a> <b>PointFeature</b>

A GeoJSON Feature with [Point geometry](https://tools.ietf.org/html/rfc7946#section-3.1.2) as specified by RFC 7946.


<a name="Location" href="#Location">#</a> <b>Location</b>

A geographic location in one of the supported formats.

`Vec2 | PointGeometry | PointFeature`


<a name="CodingOptions" href="#CodingOptions">#</a> <b>CodingOptions</b>

An object containing options used for geocoding.

- `level`: `string`, for overlapping features, the preferred geographic classification of the one to code.  If no feature exists at the specified level, the feature at the next-highest level is coded, if any. The possible values map directly to the `level` property of [RegionFeatureProperties](#RegionFeatureProperties) objects.
    - `world`
    - `union`: European Union
    - `region`: Africa, Americas, Antarctica, Asia, Europe, Oceania
    - `subregion`: Sub-Saharan Africa, North America, Micronesia, etc.
    - `intermediateRegion`: Eastern Africa, South America, Channel Islands, etc.
    - `country`: Ethiopia, Brazil, United States, etc.
    - `territory`: Puerto Rico, Gurnsey, Hong Kong, etc.
    - `subterritory`: Sark, Ascension Island, Diego Garcia, etc.


<a name="RegionFeature" href="#RegionFeature">#</a> <b>RegionFeature</b>

A GeoJSON feature representing a codable geographic area.


<a name="RegionFeatureProperties" href="#RegionFeatureProperties">#</a> <b>RegionFeatureProperties</b>

An object containing the attributes of a RegionFeature object.

- `id`: `string`, a unique ID for this feature specific to country-coder
- `iso1A2`: `string`, ISO 3166-1 alpha-2 code
- `iso1A3`: `string`, ISO 3166-1 alpha-3 code
- `iso1N3`: `string`, ISO 3166-1 numeric-3 code
- `m49`: `string`, UN M49 code
- `wikidata`: `string`, Wikidata QID
- `emojiFlag`: `string`, the emoji flag sequence derived from this feature's ISO 3166-1 alpha-2 code
- `nameEn`: `string`, common name in English
- `aliases`: `[string]`, additional identifiers which can be used to look up this feature
- `country`: `string`, for features entirely within a country, the ISO 3166-1 alpha-2 code for that country
- `groups`: `[string]`, the ISO 3166-1 alpha-2 or M49 codes of other features this feature is entirely within
- `members`: `[string]`, the ISO 3166-1 alpha-2 or M49 codes of other features this feature entirely contains, the inverse of `groups`
- `level`: `string`, the rough geographic classification of this feature
    - `world`
    - `union`: European Union
    - `region`: Africa, Americas, Antarctica, Asia, Europe, Oceania
    - `subregion`: Sub-Saharan Africa, North America, Micronesia, etc.
    - `intermediateRegion`: Eastern Africa, South America, Channel Islands, etc.
    - `country`: Ethiopia, Brazil, United States, etc.
    - `territory`: Puerto Rico, Gurnsey, Hong Kong, etc.
    - `subterritory`: Sark, Ascension Island, Diego Garcia, etc.
- `isoStatus`: `string`, the status of this feature's ISO 3166-1 code(s), if any
    - `official`: officially-assigned
    - `excRes`: exceptionally-reserved
    - `usrAssn`: user-assigned
- `driveSide`: `string`, the side of the road on which traffic drives within this feature
    - `right`
    - `left`
- `roadSpeedUnit`: `string`, the speed unit used on traffic signs in this feature
    - `mph`: miles per hour
    - `km/h`: kilometers per hour
- `callingCodes`: `[string]`, the international calling codes for this feature, sometimes including area codes


<a name="RegionFeatureCollection" href="#RegionFeatureCollection">#</a> <b>RegionFeatureCollection</b>

A GeoJSON feature collection containing RegionFeature objects.
