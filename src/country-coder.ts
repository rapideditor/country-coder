import whichPolygon from 'which-polygon';
import * as geojson from './data/borders.json';

type FeatureProperties = {
  // ISO 3166-1 alpha-2 code
  iso1A2: string;
  // ISO 3166-1 alpha-3 code
  iso1A3: string | undefined;
  // ISO 3166-1 numeric-3 code
  iso1N3: string | undefined;
  // Wikidata QID
  wikidata: string | undefined;
  // for features entirely within a country, the ISO 3166-1 alpha-2 code for that country
  country: string | undefined;
  // the ISO 3166-1 alpha-2 codes of other features this feature is entirely within, other than its country
  groups: Array<string> | undefined;
  // additional differentiator for some features which aren't countries
  // - `intGroup`: an international organization
  type: string | undefined;
  // the status of this feature's ISO 3166-1 code(s) if they are not officially-assigned
  // - `excRes`: exceptionally-reserved
  // - `usrAssn`: user-assigned
  isoStatus: string | undefined;
};
type Feature = { type: string; geometry: any; properties: FeatureProperties };
type FeatureCollection = { type: string; features: Array<Feature> };
type Vec2 = [number, number]; // [lon, lat]

export default class CountryCoder {
  public borders: FeatureCollection = (<any>geojson).default;
  private featureQuery: any = {};
  private featuresByCode: any = {};

  // Constructs a new CountryCoder
  constructor() {
    let geometryFeatures: Array<Feature> = [];
    for (let i in this.borders.features) {
      let feature = this.borders.features[i];
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
      return this.featuresByCode[id] || null;
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

  // Returns the ISO 3166-1 alpha-2 code for the country containing `loc`, if any
  // e.g. a location in Puerto Rico will return US
  countryIso1A2Code(loc: Vec2): string | null {
    let feature = this.smallestFeature(loc);
    if (!feature) return null;
    // `country` can be explicit;
    // a feature without `country` but with geometry is itself a country
    return feature.properties.country || feature.properties.iso1A2;
  }

  // Returns the country feature containing `loc`, if any
  countryFeature(loc: Vec2): Feature | null {
    let countryCode = this.countryIso1A2Code(loc);
    if (!countryCode) return null;
    return this.featuresByCode[countryCode];
  }

  // Returns the ISO 3166-1 alpha-3 code for the country containing `loc`, if any
  // e.g. a location in Puerto Rico will return USA
  countryIso1A3Code(loc: Vec2): string | null {
    let feature = this.countryFeature(loc);
    if (!feature) return null;
    return feature.properties.iso1A3 || null;
  }

  // Returns the ISO 3166-1 numeric-3 code for the country containing `loc`, if any
  countryIso1N3Code(loc: Vec2): string | null {
    let feature = this.countryFeature(loc);
    if (!feature) return null;
    return feature.properties.iso1N3 || null;
  }

  // Returns the Wikidata QID code for the country containing `loc`, if any
  countryWikidataQID(loc: Vec2): string | null {
    let feature = this.countryFeature(loc);
    if (!feature) return null;
    // all countries are linked to Wikidata
    return <string>feature.properties.wikidata;
  }

  // Returns the smallest feature containing `loc` to have an officially-assigned code, if any
  smallestOfficialIsoFeature(loc: Vec2): Feature | null {
    return (
      this.features(loc).find(function(feature) {
        return !feature.properties.isoStatus; // features without an explicit status are officially-assigned
      }) || null
    );
  }

  // Returns the ISO 3166-1 alpha-2 code of the smallest feature containing `loc` to have an officially-assigned code, if any
  // e.g. a location in Puerto Rico will return PR
  officialIso1A2Code(loc: Vec2): string | null {
    let feature = this.smallestOfficialIsoFeature(loc);
    if (!feature) return null;
    return feature.properties.iso1A2;
  }

  // Returns the ISO 3166-1 alpha-2 codes for all features containing `loc`, if any
  iso1A2Codes(loc: Vec2): Array<string> {
    return this.features(loc).map(function(feature) {
      return feature.properties.iso1A2;
    });
  }

  // Returns true if `loc` is in an EU member state
  isInEuropeanUnion(loc: Vec2): boolean {
    return this.iso1A2Codes(loc).indexOf('EU') !== -1;
  }
}
