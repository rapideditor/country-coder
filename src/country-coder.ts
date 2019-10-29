import * as whichPolygon from 'which-polygon';

type FeatureProperties = {
  // ISO 3166-1 alpha-2 code
  iso1A2: string;
  // ISO 3166-1 alpha-3 code
  iso1A3: string | undefined;
  // ISO 3166-1 numeric-3 code
  iso1N3: string | undefined;
  // Wikidata QID
  wikidata: string | undefined;
  // For features entirely within a country, the ISO 3166-1 alpha-2 code for that country
  country: string | undefined;
  // The ISO 3166-1 alpha-2 codes of other features this feature is entirely within, other than its country
  groups: Array<string> | undefined;
  // Additional differentiator for some features which aren't countries
  // - `intGroup`: an international organization
  type: string | undefined;
  // The status of this feature's ISO 3166-1 code(s) if they are not officially-assigned
  // - `excRes`: exceptionally-reserved
  // - `usrAssn`: user-assigned
  isoStatus: string | undefined;
  // The emoji flag sequence derived from this feature's ISO 3166-1 alpha-2 code
  flag: string | undefined;
};
type Feature = { type: string; geometry: any; properties: FeatureProperties };
type FeatureCollection = { type: string; features: Array<Feature> };
type Vec2 = [number, number]; // [lon, lat]
type GetterOptions = {
  // For overlapping features, the division level of the one to get
  // - `country` (default): the "sovereign state" feature
  // - `smallest`: the lowest-level feature with an official or user-assigned ISO code
  level: string;
};

export default class CountryCoder {
  public borders: FeatureCollection = require('./data/borders.json');
  private featureQuery: any = {};
  private featuresByCode: any = {};

  // Constructs a new CountryCoder
  constructor() {
    let geometryFeatures: Array<Feature> = [];
    for (let i in this.borders.features) {
      let feature = this.borders.features[i];
      // calculate the emoji flag sequence from the alpha-2 code
      feature.properties.flag = feature.properties.iso1A2.replace(/./g, function(char: string) {
        return String.fromCodePoint(<number>char.charCodeAt(0) + 127397);
      });
      this.featuresByCode[feature.properties.iso1A2] = feature;
      if (feature.geometry) {
        geometryFeatures.push(feature);
      }
    }
    // whichPolygon doesn't support null geometry even though GeoJSON does
    let geometryOnlyCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: geometryFeatures
    };
    this.featureQuery = whichPolygon(geometryOnlyCollection);
  }

  // Returns the feature with an identifying property matching `id`, if any
  feature(id: string): Feature | null {
    if (id.length === 2) {
      // no other IDs can be two characters
      return this.featuresByCode[id] || null;
    }
    if (id.length === 4) {
      // decode a possible emoji flag sequence
      let codeFromFlag: string = id.replace(/../g, function(codePoint: string) {
        return String.fromCharCode(<number>codePoint.codePointAt(0) - 127397);
      });
      if (this.featuresByCode[codeFromFlag]) {
        return this.featuresByCode[codeFromFlag];
      }
    }
    for (let code in this.featuresByCode) {
      let feature = this.featuresByCode[code];
      if (
        feature.properties.iso1A3 === id ||
        feature.properties.iso1N3 === id ||
        feature.properties.wikidata === id
      ) {
        return feature;
      }
    }
    return null;
  }

  // Returns the smallest feature of any code status containing `loc`, if any
  smallestFeature(loc: Vec2): Feature | null {
    let featureProperties: FeatureProperties = this.featureQuery(loc);
    if (!featureProperties) return null;
    return this.featuresByCode[featureProperties.iso1A2];
  }

  // Returns all the features containing `loc`, if any
  features(loc: Vec2): Array<Feature> {
    let feature = this.smallestFeature(loc);
    if (!feature) return [];

    let features: Array<Feature> = [feature];

    let properties = feature.properties;
    if (properties.groups) {
      for (let i in properties.groups) {
        features.push(this.featuresByCode[properties.groups[i]]);
      }
    }

    if (properties.country) {
      features.push(this.featuresByCode[properties.country]);
    }

    return features;
  }

  // Returns the country feature containing `loc`, if any
  // e.g. a location in Puerto Rico will return US
  private countryFeature(loc: Vec2): Feature | null {
    let feature = this.smallestFeature(loc);
    if (!feature) return null;
    // `country` can be explicit;
    // a feature without `country` but with geometry is itself a country
    let countryCode = feature.properties.country || feature.properties.iso1A2;
    return this.featuresByCode[countryCode];
  }

  // Returns the smallest feature containing `loc` to have an officially-assigned or user-assigned code, if any
  // e.g. a location in Puerto Rico will return PR
  private smallestNonExceptedIsoFeature(loc: Vec2): Feature | null {
    let feature = this.features(loc).find(function(feature) {
      return feature.properties.isoStatus !== 'excRes';
    });
    return feature || null;
  }

  // Returns the feature containing `loc` for the `opts`, if any
  private featureForLoc(loc: Vec2, opts?: GetterOptions): Feature | null {
    if (opts && opts.level === 'smallest') {
      // e.g. Puerto Rico
      return this.smallestNonExceptedIsoFeature(loc);
    }
    // e.g. United States
    return this.countryFeature(loc);
  }

  // Returns the ISO 3166-1 alpha-2 code for the region containing `loc`, if any
  iso1A2Code(loc: Vec2, opts?: GetterOptions): string | null {
    let feature = this.featureForLoc(loc, opts);
    if (!feature) return null;
    return feature.properties.iso1A2;
  }

  // Returns the ISO 3166-1 alpha-3 code for the region containing `loc`, if any
  // e.g. a location in Puerto Rico will return USA
  iso1A3Code(loc: Vec2, opts?: GetterOptions): string | null {
    let feature = this.featureForLoc(loc, opts);
    if (!feature) return null;
    return feature.properties.iso1A3 || null;
  }

  // Returns the ISO 3166-1 numeric-3 code for the region containing `loc`, if any
  iso1N3Code(loc: Vec2, opts?: GetterOptions): string | null {
    let feature = this.featureForLoc(loc, opts);
    if (!feature) return null;
    return feature.properties.iso1N3 || null;
  }

  // Returns the Wikidata QID code for the region containing `loc`, if any
  wikidataQID(loc: Vec2, opts?: GetterOptions): string | null {
    let feature = this.featureForLoc(loc, opts);
    if (!feature) return null;
    return <string>feature.properties.wikidata;
  }

  // Returns the emoji flag sequence for the country containing `loc`
  flag(loc: Vec2, opts?: GetterOptions): string | null {
    let feature = this.featureForLoc(loc, opts);
    if (!feature) return null;
    return <string>feature.properties.flag;
  }

  // Returns the ISO 3166-1 alpha-2 codes for all features containing `loc`, if any
  iso1A2Codes(loc: Vec2): Array<string> {
    return this.features(loc).map(function(feature) {
      return feature.properties.iso1A2;
    });
  }

  // Returns true if `loc` is in an EU member state
  isInEuropeanUnion(arg: Vec2 | string): boolean {
    let feature: Feature | null;
    if (typeof arg === 'string') {
      feature = this.feature(<string>arg);
    } else {
      feature = this.smallestFeature(<Vec2>arg);
    }

    if (!feature) return false;
    if (feature.properties.iso1A2 === 'EU') return true;
    if (!feature.properties.groups) return false;
    return feature.properties.groups.indexOf('EU') !== -1;
  }
}
