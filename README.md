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

Results can optionally include non-country ISO 3166-1 features, such as Puerto Rico (`PR`) or the Isle of Man (`IM`). Some unofficial yet exceptionally-reserved or user-assigned ISO codes are also supported, such as the European Union (`EU`) and Kosovo (`XK`).

In addition to identifiers, `country-coder` can provide basic regional information:

- ☎️ [Telephone Calling Codes](https://en.wikipedia.org/wiki/List_of_country_calling_codes) (+44)
- 🛣 [Driving Side](https://en.wikipedia.org/wiki/Left-_and_right-hand_traffic) (right, left)
- 🚗 [Traffic Speed Unit](https://en.wikipedia.org/wiki/Speed_limit) (km/h, mph)
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


## Quick Start

Simply pass in a `[longitude, latitude]` to `iso1A2Code` to get the country code.

```js
const coder = new CountryCoder();
coder.iso1A2Code([-4.5, 54.2]);	 // returns 'GB'
```

To include non-country regions, pass in `region` for the `level` option.

```js
const coder = new CountryCoder();
coder.iso1A2Code([-4.5, 54.2], { level: 'region' });  // returns 'IM'
```

The same method can convert from other identifiers.

```js
const coder = new CountryCoder();
coder.iso1A2Code('Q145');  // returns 'GB'
```

Read the [full API reference](#api-reference) to see everything `country-coder` can do.


## Contributing

This package is kept intentionally minimal. However, if you find a bug or have an interesting idea for an enhancement, feel free to open an [Issue](https://github.com/ideditor/country-coder/issues) and/or [Pull Request](https://github.com/ideditor/country-coder/pulls).


## API Reference

##### Methods
* [new CountryCoder](#constructor)() _constructor_
* [feature](#feature)(arg: string | Location, opts?: CodingOptions): RegionFeature?
* [iso1A2Code](#iso1A2Code)(arg: string | Location, opts?: CodingOptions): string?
* [iso1A3Code](#iso1A3Code)(arg: string | Location, opts?: CodingOptions): string?
* [iso1N3Code](#iso1N3Code)(arg: string | Location, opts?: CodingOptions): string?
* [wikidataQID](#wikidataQID)(arg: string | Location, opts?: CodingOptions): string?
* [emojiFlag](#emojiFlag)(arg: string | Location, opts?: CodingOptions): string?
* [features](#features)(loc: Location): [RegionFeature]
* [iso1A2Codes](#iso1A2Codes)(loc: Location): [string]
* [isInEuropeanUnion](#isInEuropeanUnion)(arg: string | Location): boolean
* [driveSide](#driveSide)(arg: string | Location): string?
* [roadSpeedUnit](#roadSpeedUnit)(arg: string | Location): string?
* [callingCodes](#callingCodes)(arg: string | Location): [string]

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

<a name="constructor" href="#constructor">#</a> <b>new CountryCoder</b>()
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L63 "Source")

Constructs a new CountryCoder.

```js
const coder = new CountryCoder();
```


<a name="feature" href="#feature">#</a> <b>feature</b>(arg: string | Location, opts?: CodingOptions): RegionFeature?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L172 "Source")

Returns the GeoJSON feature from `borders` for the given location or identifier and options, if found.

```js
const coder = new CountryCoder();
coder.feature([-4.5, 54.2]);  // returns United Kingdom feature
coder.feature([-4.5, 54.2], { level: 'region' });  // returns Isle of Man feature
coder.feature([0, 90]);       // returns null
coder.feature('GB');          // returns United Kingdom feature
coder.feature('GBR');         // returns United Kingdom feature
coder.feature('826');         // returns United Kingdom feature
coder.feature('Q145');        // returns United Kingdom feature
coder.feature('🇬🇧');          // returns United Kingdom feature
coder.feature('UK');          // returns United Kingdom feature
coder.feature('IM');          // returns Isle of Man feature

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.5, 54.2] } };
coder.feature(pointGeoJSON);           // returns United Kingdom feature
coder.feature(pointGeoJSON.geometry);  // returns United Kingdom feature
```


<a name="iso1A2Code" href="#iso1A2Code">#</a> <b>iso1A2Code</b>(arg: string | Location, opts?: CodingOptions): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L180 "Source")

Returns the ISO 3166-1 alpha-2 code for the given location or identifier and options, if found.

```js
const coder = new CountryCoder();
coder.iso1A2Code([-4.5, 54.2]);  // returns 'GB'
coder.iso1A2Code([-4.5, 54.2], { level: 'region' });  // returns 'IM'
coder.iso1A2Code([0, 90]);       // returns null
coder.iso1A2Code('GBR');         // returns 'GB'
coder.iso1A2Code('826');         // returns 'GB'
coder.iso1A2Code('Q145');        // returns 'GB'
coder.iso1A2Code('🇬🇧');          // returns 'GB'
coder.iso1A2Code('UK');          // returns 'GB'
coder.iso1A2Code('IMN');         // returns 'IM'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.5, 54.2] } };
coder.iso1A2Code(pointGeoJSON);           // returns 'GB'
coder.iso1A2Code(pointGeoJSON.geometry);  // returns 'GB'
```


<a name="iso1A3Code" href="#iso1A3Code">#</a> <b>iso1A3Code</b>(arg: string | Location, opts?: CodingOptions): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L187 "Source")

Returns the ISO 3166-1 alpha-3 code for the given location or identifier and options, if found.

```js
const coder = new CountryCoder();
coder.iso1A3Code([-4.5, 54.2]);  // returns 'GBR'
coder.iso1A3Code([-4.5, 54.2], { level: 'region' });  // returns 'IMN'
coder.iso1A3Code([0, 90]);       // returns null
coder.iso1A3Code('GB');          // returns 'GBR'
coder.iso1A3Code('826');         // returns 'GBR'
coder.iso1A3Code('Q145');        // returns 'GBR'
coder.iso1A3Code('🇬🇧');          // returns 'GBR'
coder.iso1A3Code('UK');          // returns 'GBR'
coder.iso1A3Code('IM');          // returns 'IMN'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.5, 54.2] } };
coder.iso1A3Code(pointGeoJSON);           // returns 'GBR'
coder.iso1A3Code(pointGeoJSON.geometry);  // returns 'GBR'
```


<a name="iso1N3Code" href="#iso1N3Code">#</a> <b>iso1N3Code</b>(arg: string | Location, opts?: CodingOptions): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L194 "Source")

Returns the ISO 3166-1 numeric-3 code for the given location or identifier and options, if found.

```js
const coder = new CountryCoder();
coder.iso1N3Code([-4.5, 54.2]);  // returns '826'
coder.iso1N3Code([-4.5, 54.2], { level: 'region' });  // returns '833'
coder.iso1N3Code([0, 90]);       // returns null
coder.iso1N3Code('GB');          // returns '826'
coder.iso1N3Code('GBR');         // returns '826'
coder.iso1N3Code('Q145');        // returns '826'
coder.iso1N3Code('🇬🇧');          // returns '826'
coder.iso1N3Code('UK');          // returns '826'
coder.iso1N3Code('IM');          // returns '833'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.5, 54.2] } };
coder.iso1N3Code(pointGeoJSON);           // returns '826'
coder.iso1N3Code(pointGeoJSON.geometry);  // returns '826'
```


<a name="wikidataQID" href="#wikidataQID">#</a> <b>wikidataQID</b>(arg: string | Location, opts?: CodingOptions): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L201 "Source")

Returns the Wikidata QID for the given location or identifier and options, if found.

```js
const coder = new CountryCoder();
coder.wikidataQID([-4.5, 54.2]);  // returns 'Q145'
coder.wikidataQID([-4.5, 54.2], { level: 'region' });  // returns 'Q9676'
coder.wikidataQID([0, 90]);       // returns null
coder.wikidataQID('GB');          // returns 'Q145'
coder.wikidataQID('GBR');         // returns 'Q145'
coder.wikidataQID('826');         // returns 'Q145'
coder.wikidataQID('🇬🇧');          // returns 'Q145'
coder.wikidataQID('UK');          // returns 'Q145'
coder.wikidataQID('IM');          // returns 'Q9676'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.5, 54.2] } };
coder.wikidataQID(pointGeoJSON);           // returns 'Q145'
coder.wikidataQID(pointGeoJSON.geometry);  // returns 'Q145'
```


<a name="emojiFlag" href="#emojiFlag">#</a> <b>emojiFlag</b>(arg: string | Location, opts?: CodingOptions): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L208 "Source")

Returns the emoji flag sequence for the given location or identifier and options, if found.

```js
const coder = new CountryCoder();
coder.emojiFlag([-4.5, 54.2]);  // returns '🇬🇧'
coder.emojiFlag([-4.5, 54.2], { level: 'region' });  // returns '🇮🇲'
coder.emojiFlag([0, 90]);       // returns null
coder.emojiFlag('GB');          // returns '🇬🇧'
coder.emojiFlag('GBR');         // returns '🇬🇧'
coder.emojiFlag('826');         // returns '🇬🇧'
coder.emojiFlag('Q145');        // returns '🇬🇧'
coder.emojiFlag('UK');          // returns '🇬🇧'
coder.emojiFlag('IM');          // returns '🇮🇲'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.5, 54.2] } };
coder.emojiFlag(pointGeoJSON);           // returns '🇬🇧'
coder.emojiFlag(pointGeoJSON.geometry);  // returns '🇬🇧'
```


<a name="features" href="#features">#</a> <b>features</b>(loc: Location): [RegionFeature]
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L215 "Source")

Returns all the the features containing the given location.

```js
const coder = new CountryCoder();
coder.features([-4.5, 54.2]);  // returns [{Isle of Man feature}, {United Kingdom feature}]
coder.features([0, 51.5]);     // returns [{United Kingdom feature}, {European Union feature}]
coder.features([6.1, 46.2]);   // returns [{Switzerland feature}]
coder.features([0, 90]);       // returns []

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [6.1, 46.2] } };
coder.features(pointGeoJSON);            // returns [{Switzerland feature}]
coder.features(pointGeoJSON.geometry);   // returns [{Switzerland feature}]
```


<a name="iso1A2Codes" href="#iso1A2Codes">#</a> <b>iso1A2Codes</b>(loc: Location): [string]
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L236 "Source")

Returns the ISO 3166-1 alpha-2 codes for all the the features containing the given location that have ISO codes.

```js
const coder = new CountryCoder();
coder.iso1A2Codes([-4.5, 54.2]);   // returns ['IM', 'GB']
coder.iso1A2Codes([0, 51.5]);      // returns ['GB', 'EU']
coder.iso1A2Codes([6.1, 46.2]);    // returns ['CH']
coder.iso1A2Codes([0, 90]);        // returns []

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.5, 54.2] } };
coder.iso1A2Codes(pointGeoJSON);           // returns ['IM', 'GB']
coder.iso1A2Codes(pointGeoJSON.geometry);  // returns ['IM', 'GB']
```


<a name="isInEuropeanUnion" href="#isInEuropeanUnion">#</a> <b>isInEuropeanUnion</b>(arg: string | Location): boolean
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L243 "Source")

Returns `true` if the feature with the given location or identifier is found to be part of the European Union.

```js
const coder = new CountryCoder();
coder.isInEuropeanUnion([0, 51.5]);    // returns true (Britain)
coder.isInEuropeanUnion([-4.5, 54.2]); // returns false (Isle of Man)
coder.isInEuropeanUnion([6.1, 46.2]);  // returns false (Switzerland)
coder.isInEuropeanUnion([0, 90]);      // returns false (North Pole)
coder.isInEuropeanUnion('EU');         // returns true
coder.isInEuropeanUnion('GB');         // returns true
coder.isInEuropeanUnion('GBR');        // returns true
coder.isInEuropeanUnion('826');        // returns true
coder.isInEuropeanUnion('Q145');       // returns true
coder.isInEuropeanUnion('🇬🇧');         // returns true
coder.isInEuropeanUnion('UK');         // returns true
coder.isInEuropeanUnion('IM');         // returns false
coder.isInEuropeanUnion('CH');         // returns false

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 51.5] } };
coder.isInEuropeanUnion(pointGeoJSON);           // returns true (Britain)
coder.isInEuropeanUnion(pointGeoJSON.geometry);  // returns true (Britain)
```


<a name="driveSide" href="#driveSide">#</a> <b>driveSide</b>(arg: string | Location): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L258 "Source")

Returns the side of the road on which traffic drives for the given location or identifier, if found.

```js
const coder = new CountryCoder();
coder.driveSide([0, 51.5]);    // returns 'left' (Britain)
coder.driveSide([6.1, 46.2]);  // returns 'right' (Switzerland)
coder.driveSide([0, 90]);      // returns null (North Pole)
coder.driveSide('EU');         // returns null
coder.driveSide('GB');         // returns 'left'
coder.driveSide('GBR');        // returns 'left'
coder.driveSide('826');        // returns 'left'
coder.driveSide('Q145');       // returns 'left'
coder.driveSide('🇬🇧');         // returns 'left'
coder.driveSide('UK');         // returns 'left'
coder.driveSide('CH');         // returns 'right'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 51.5] } };
coder.driveSide(pointGeoJSON);           // returns 'left' (Britain)
coder.driveSide(pointGeoJSON.geometry);  // returns 'left' (Britain)
```


<a name="roadSpeedUnit" href="#roadSpeedUnit">#</a> <b>roadSpeedUnit</b>(arg: string | Location): string?
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L258 "Source")

Returns the unit of speed used on traffic signs for the given location or identifier, if found.

```js
const coder = new CountryCoder();
coder.roadSpeedUnit([0, 51.5]);    // returns 'mph' (Britain)
coder.roadSpeedUnit([6.1, 46.2]);  // returns 'km/h' (Switzerland)
coder.roadSpeedUnit([0, 90]);      // returns null (North Pole)
coder.roadSpeedUnit('EU');         // returns null
coder.roadSpeedUnit('GB');         // returns 'mph'
coder.roadSpeedUnit('GBR');        // returns 'mph'
coder.roadSpeedUnit('826');        // returns 'mph'
coder.roadSpeedUnit('Q145');       // returns 'mph'
coder.roadSpeedUnit('🇬🇧');         // returns 'mph'
coder.roadSpeedUnit('UK');         // returns 'mph'
coder.roadSpeedUnit('CH');         // returns 'km/h'

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 51.5] } };
coder.roadSpeedUnit(pointGeoJSON);           // returns 'mph' (Britain)
coder.roadSpeedUnit(pointGeoJSON.geometry);  // returns 'mph' (Britain)
```


<a name="callingCodes" href="#callingCodes">#</a> <b>callingCodes</b>(arg: string | Location): [string]
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L258 "Source")

Returns the full international calling code prefix of phone numbers for the given location or identifier, if any. All prefixes have a country code, with some also including an area code separated by a space character. These are commonly formatted with a preceding plus sign (e.g. `+1 242`).

```js
const coder = new CountryCoder();
coder.callingCodes([0, 51.5]);    // returns ['44'] (Britain)
coder.callingCodes([0, 90]);      // returns [] (North Pole)
coder.callingCodes('EU');         // returns []
coder.callingCodes('GB');         // returns ['44']
coder.callingCodes('GBR');        // returns ['44']
coder.callingCodes('826');        // returns ['44']
coder.callingCodes('Q145');       // returns ['44']
coder.callingCodes('🇬🇧');         // returns ['44']
coder.callingCodes('UK');         // returns ['44']
coder.callingCodes('BS');         // returns ['1 242']
coder.callingCodes('JA');         // returns ['1 876', '1 658']

let pointGeoJSON = { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 51.5] } };
coder.callingCodes(pointGeoJSON);           // returns ['44'] (Britain)
coder.callingCodes(pointGeoJSON.geometry);  // returns ['44'] (Britain)
```


## Properties

<a name="borders" href="#borders">#</a> <b>borders</b>: RegionFeatureCollection
[<>](https://github.com/ideditor/country-coder/blob/master/src/country-coder.ts#L50 "Source")<br/>

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

- `level`: `string`, for overlapping features, the division level of the one to get
    - `country` (default): the "sovereign state" feature
    - `region`: the lowest-level feature with an official or user-assigned ISO code


<a name="RegionFeature" href="#RegionFeature">#</a> <b>RegionFeature</b>

A GeoJSON feature representing a codable geographic area.


<a name="RegionFeatureProperties" href="#RegionFeatureProperties">#</a> <b>RegionFeatureProperties</b>

An object containing the attributes of a RegionFeature object.

- `iso1A2`: `string`, ISO 3166-1 alpha-2 code
- `iso1A3`: `string`, ISO 3166-1 alpha-3 code
- `iso1N3`: `string`, ISO 3166-1 numeric-3 code
- `m49`: `string`, UN M49 code
- `wikidata`: `string`, Wikidata QID
- `emojiFlag`: `string`, the emoji flag sequence derived from this feature's ISO 3166-1 alpha-2 code
- `aliases`: `[string]`, additional identifiers which can be used to look up this feature
- `country`: `string`, for features entirely within a country, the ISO 3166-1 alpha-2 code for that country
- `groups`: `[string]`, the ISO 3166-1 alpha-2 or M49 codes of other features this feature is entirely within, other than its country
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
