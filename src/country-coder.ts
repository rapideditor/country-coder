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

  // Additional identifiers which can be used to look up this feature;
  // these cannot collide with the identifiers for any other feature
  aliases: Array<string> | undefined;

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
type LocOrID = Vec2 | string;
type GetterOptions = {
  // For overlapping features, the division level of the one to get
  // - `country` (default): the "sovereign state" feature
  // - `smallest`: the lowest-level feature with an official or user-assigned ISO code
  level: string;
};

export default class CountryCoder {
  // The base GeoJSON feature collection
  public borders: FeatureCollection = require('./data/borders.json');

  // The whichPolygon getter for looking up a feature by point
  private featureQuery: any = {};
  // The cache for looking up a feature by identifier
  private featuresByCode: any = {};

  // Constructs a new CountryCoder
  constructor() {
    let featuresByCode = this.featuresByCode;
    let identifierProps = ['iso1A2', 'iso1A3', 'iso1N3', 'wikidata', 'flag'];

    // Caches features by their identifying strings for rapid lookup
    function cacheFeatureByIDs(feature: Feature) {
      for (let k in identifierProps) {
        let prop = identifierProps[k];
        let id = prop && feature.properties[prop];
        if (id) {
          featuresByCode[id] = feature;
        }
      }
      if (feature.properties.aliases) {
        for (let j in feature.properties.aliases) {
          let alias = feature.properties.aliases[j];
          featuresByCode[alias] = feature;
        }
      }
    }

    // Calculates the emoji flag sequence from the alpha-2 code and caches it
    function loadFlag(feature: Feature) {
      feature.properties.flag = feature.properties.iso1A2.replace(/./g, function(char: string) {
        return String.fromCodePoint(<number>char.charCodeAt(0) + 127397);
      });
    }

    let geometryFeatures: Array<Feature> = [];
    for (let i in this.borders.features) {
      let feature = this.borders.features[i];

      loadFlag(feature);

      cacheFeatureByIDs(feature);

      if (feature.geometry) geometryFeatures.push(feature);
    }

    // whichPolygon doesn't support null geometry even though GeoJSON does
    let geometryOnlyCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: geometryFeatures
    };
    this.featureQuery = whichPolygon(geometryOnlyCollection);
  }

  // Returns the smallest feature of any code status containing `loc`, if any
  private smallestFeature(loc: Vec2): Feature | null {
    let featureProperties: FeatureProperties = this.featureQuery(loc);
    if (!featureProperties) return null;
    return this.featuresByCode[featureProperties.iso1A2];
  }

  // Returns the country feature containing `loc`, if any
  private countryFeature(loc: Vec2): Feature | null {
    let feature = this.smallestFeature(loc);
    if (!feature) return null;
    // a feature without `country` but with geometry is itself a country
    let countryCode = feature.properties.country || feature.properties.iso1A2;
    return this.featuresByCode[countryCode];
  }

  // Returns the smallest feature containing `loc` to have an officially-assigned or user-assigned code, if any
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

  // Returns the feature with an identifying property matching `id`, if any
  private featureForID(id: string): Feature | null {
    return this.featuresByCode[id] || null;
  }

  // Returns the feature matching the given arguments, if any
  feature(arg: LocOrID, opts?: GetterOptions): Feature | null {
    if (typeof arg === 'string') {
      return this.featureForID(<string>arg);
    }
    return this.featureForLoc(<Vec2>arg, opts);
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

  // Returns the ISO 3166-1 alpha-2 code for the feature matching the arguments, if any
  iso1A2Code(arg: LocOrID, opts?: GetterOptions): string | null {
    let feature = this.feature(arg, opts);
    if (!feature) return null;
    return feature.properties.iso1A2;
  }

  // Returns the ISO 3166-1 alpha-3 code for the feature matching the arguments, if any
  iso1A3Code(arg: LocOrID, opts?: GetterOptions): string | null {
    let feature = this.feature(arg, opts);
    if (!feature) return null;
    return feature.properties.iso1A3 || null;
  }

  // Returns the ISO 3166-1 numeric-3 code for the feature matching the arguments, if any
  iso1N3Code(arg: LocOrID, opts?: GetterOptions): string | null {
    let feature = this.feature(arg, opts);
    if (!feature) return null;
    return feature.properties.iso1N3 || null;
  }

  // Returns the Wikidata QID code for the feature matching the arguments, if any
  wikidataQID(arg: LocOrID, opts?: GetterOptions): string | null {
    let feature = this.feature(arg, opts);
    if (!feature) return null;
    return <string>feature.properties.wikidata;
  }

  // Returns the emoji flag sequence for the feature matching the arguments, if any
  flag(arg: LocOrID, opts?: GetterOptions): string | null {
    let feature = this.feature(arg, opts);
    if (!feature) return null;
    return <string>feature.properties.flag;
  }

  // Returns the ISO 3166-1 alpha-2 codes for all features containing `loc`, if any
  iso1A2Codes(loc: Vec2): Array<string> {
    return this.features(loc).map(function(feature) {
      return feature.properties.iso1A2;
    });
  }

  // Returns true if the feature matching `arg` is within EU jurisdiction
  isInEuropeanUnion(arg: LocOrID): boolean {
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
