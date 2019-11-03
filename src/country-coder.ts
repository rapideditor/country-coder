import whichPolygon from 'which-polygon';
import borders from './data/borders.json';

type RegionFeatureProperties = {
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

  // The status of this feature's ISO 3166-1 code(s) if they are not officially-assigned
  // - `excRes`: exceptionally-reserved
  // - `usrAssn`: user-assigned
  isoStatus: string | undefined;

  // The emoji flag sequence derived from this feature's ISO 3166-1 alpha-2 code
  emojiFlag: string | undefined;

  // The unit used for road traffic speeds within this feature
  // - `mph`: miles per hour
  // - `km/h`: kilometers per hour
  roadSpeedUnit: string | undefined;
};
type RegionFeature = { type: string; geometry: any; properties: RegionFeatureProperties };
type RegionFeatureCollection = { type: string; features: Array<RegionFeature> };
type Vec2 = [number, number]; // [lon, lat]
type PointGeometry = { type: string; coordinates: Vec2 };
type PointFeature = { type: string; geometry: PointGeometry; properties: any };
type Location = Vec2 | PointGeometry | PointFeature;
type CodingOptions = {
  // For overlapping features, the division level of the one to get
  // - `country` (default): the "sovereign state" feature
  // - `region`: the lowest-level feature with an official or user-assigned ISO code
  level: string;
};

export default class CountryCoder {
  // The base GeoJSON feature collection
  public borders: RegionFeatureCollection = <RegionFeatureCollection>borders;

  // The whichPolygon getter for looking up a feature by point
  private featureQuery: any = {};
  // The cache for looking up a feature by identifier
  private featuresByCode: any = {};

  // Constructs a new CountryCoder
  constructor() {
    let featuresByCode = this.featuresByCode;
    let identifierProps = ['iso1A2', 'iso1A3', 'iso1N3', 'wikidata', 'emojiFlag'];

    // Caches features by their identifying strings for rapid lookup
    function cacheFeatureByIDs(feature: RegionFeature) {
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
    function loadFlag(feature: RegionFeature) {
      feature.properties.emojiFlag = feature.properties.iso1A2.replace(/./g, function(
        char: string
      ) {
        return String.fromCodePoint(<number>char.charCodeAt(0) + 127397);
      });
    }

    let geometryFeatures: Array<RegionFeature> = [];
    for (let i in this.borders.features) {
      let feature = this.borders.features[i];

      if (
        !feature.properties.roadSpeedUnit &&
        // no common unit in the EU
        feature.properties.iso1A2 !== 'EU'
      ) {
        // only `mph` regions are listed explicitly, else assume `km/h`
        feature.properties.roadSpeedUnit = 'km/h';
      }

      loadFlag(feature);

      cacheFeatureByIDs(feature);

      if (feature.geometry) geometryFeatures.push(feature);
    }

    // whichPolygon doesn't support null geometry even though GeoJSON does
    let geometryOnlyCollection: RegionFeatureCollection = {
      type: 'RegionFeatureCollection',
      features: geometryFeatures
    };
    this.featureQuery = whichPolygon(geometryOnlyCollection);
  }

  // Returns the [longitude, latitude] for the location argument
  private basicLoc(loc: Location): Vec2 {
    if (Array.isArray(loc)) {
      return <Vec2>loc;
    } else if ((<PointGeometry>loc).coordinates) {
      return (<PointGeometry>loc).coordinates;
    }
    return (<PointFeature>loc).geometry.coordinates;
  }

  // Returns the smallest feature of any kind containing `loc`, if any
  private smallestFeature(loc: Location): RegionFeature | null {
    let basicLoc = this.basicLoc(loc);
    let featureProperties: RegionFeatureProperties = this.featureQuery(basicLoc);
    if (!featureProperties) return null;
    return this.featuresByCode[featureProperties.iso1A2];
  }

  // Returns the country feature containing `loc`, if any
  private countryFeature(loc: Location): RegionFeature | null {
    let feature = this.smallestFeature(loc);
    if (!feature) return null;
    // a feature without `country` but with geometry is itself a country
    let countryCode = feature.properties.country || feature.properties.iso1A2;
    return this.featuresByCode[countryCode];
  }

  // Returns the smallest feature containing `loc` to have an officially-assigned or user-assigned code, if any
  private smallestNonExceptedIsoFeature(loc: Location): RegionFeature | null {
    let feature = this.features(loc).find(function(feature) {
      return feature.properties.isoStatus !== 'excRes';
    });
    return feature || null;
  }

  // Returns the feature containing `loc` for the `opts`, if any
  private featureForLoc(loc: Location, opts?: CodingOptions): RegionFeature | null {
    if (opts && opts.level === 'region') {
      // e.g. Puerto Rico
      return this.smallestNonExceptedIsoFeature(loc);
    }
    // e.g. United States
    return this.countryFeature(loc);
  }

  // Returns the feature with an identifying property matching `id`, if any
  private featureForID(id: string): RegionFeature | null {
    return this.featuresByCode[id] || null;
  }

  // Returns the feature matching the given arguments, if any
  feature(arg: string | Location, opts?: CodingOptions): RegionFeature | null {
    if (typeof arg === 'string') {
      return this.featureForID(<string>arg);
    }
    return this.featureForLoc(<Location>arg, opts);
  }

  // Returns the ISO 3166-1 alpha-2 code for the feature matching the arguments, if any
  iso1A2Code(arg: string | Location, opts?: CodingOptions): string | null {
    let feature = this.feature(arg, opts);
    if (!feature) return null;
    return feature.properties.iso1A2;
  }

  // Returns the ISO 3166-1 alpha-3 code for the feature matching the arguments, if any
  iso1A3Code(arg: string | Location, opts?: CodingOptions): string | null {
    let feature = this.feature(arg, opts);
    if (!feature) return null;
    return feature.properties.iso1A3 || null;
  }

  // Returns the ISO 3166-1 numeric-3 code for the feature matching the arguments, if any
  iso1N3Code(arg: string | Location, opts?: CodingOptions): string | null {
    let feature = this.feature(arg, opts);
    if (!feature) return null;
    return feature.properties.iso1N3 || null;
  }

  // Returns the Wikidata QID code for the feature matching the arguments, if any
  wikidataQID(arg: string | Location, opts?: CodingOptions): string | null {
    let feature = this.feature(arg, opts);
    if (!feature) return null;
    return feature.properties.wikidata || null;
  }

  // Returns the emoji emojiFlag sequence for the feature matching the arguments, if any
  emojiFlag(arg: string | Location, opts?: CodingOptions): string | null {
    let feature = this.feature(arg, opts);
    if (!feature) return null;
    return <string>feature.properties.emojiFlag;
  }

  // Returns all the features containing `loc` (zero or more)
  features(loc: Location): Array<RegionFeature> {
    let feature = this.smallestFeature(loc);
    if (!feature) return [];

    let features: Array<RegionFeature> = [feature];

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

  // Returns the ISO 3166-1 alpha-2 codes for all features containing `loc` (zero or more)
  iso1A2Codes(loc: Location): Array<string> {
    return this.features(loc).map(function(feature) {
      return feature.properties.iso1A2;
    });
  }

  // Returns true if the feature matching `arg` is within EU jurisdiction
  isInEuropeanUnion(arg: string | Location): boolean {
    let feature: RegionFeature | null;
    if (typeof arg === 'string') {
      feature = this.feature(<string>arg);
    } else {
      feature = this.smallestFeature(<Location>arg);
    }

    if (!feature) return false;
    if (feature.properties.iso1A2 === 'EU') return true;
    if (!feature.properties.groups) return false;
    return feature.properties.groups.indexOf('EU') !== -1;
  }

  // Returns the road speed unit for the feature matching `arg` as a string (`mph` or `km/h`)
  roadSpeedUnit(arg: string | Location): string | null {
    let feature: RegionFeature | null;
    if (typeof arg === 'string') {
      feature = this.feature(<string>arg);
    } else {
      feature = this.smallestFeature(<Location>arg);
    }
    return (feature && feature.properties.roadSpeedUnit) || null;
  }
}
