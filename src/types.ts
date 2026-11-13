import type { Feature, FeatureCollection, Geometry, Point } from 'geojson';

export interface RegionFeatureProperties {
  // Unique identifier specific to country-coder
  id: string;

  // ISO 3166-1 alpha-2 code
  iso1A2: string | undefined;

  // ISO 3166-1 alpha-3 code
  iso1A3: string | undefined;

  // ISO 3166-1 numeric-3 code
  iso1N3: string | undefined;

  // UN M49 code
  m49: string | undefined;

  // Wikidata QID
  wikidata: string;

  // The emoji flag sequence derived from this feature's ISO 3166-1 alpha-2 code
  emojiFlag: string | undefined;

  // The ccTLD (country code top-level domain)
  ccTLD: string | undefined;

  // The common English name
  nameEn: string;

  // Additional identifiers which can be used to look up this feature;
  // these cannot collide with the identifiers for any other feature
  aliases: Array<string> | undefined;

  // For features entirely within a country, the ISO 3166-1 alpha-2 code for that country
  country: string | undefined;

  // The ISO 3166-1 alpha-2, M49, or QIDs of other features this feature is entirely within, including its country
  groups: Array<string>;

  // The ISO 3166-1 alpha-2, M49, or QIDs of other features this feature contains;
  // the inverse of `groups`
  members: Array<string> | undefined;

  // The rough geographic type of this feature.
  // Levels do not necessarily nest cleanly within each other.
  // - `world`: all features

  // - `unitedNations`: United Nations
  // - `union`: European Union
  // - `subunion`: Outermost Regions of the EU, Overseas Countries and Territories of the EU

  // Defined by the UN
  // - `region`: Africa, Americas, Antarctica, Asia, Europe, Oceania
  // - `subregion`: Sub-Saharan Africa, North America, Micronesia, etc.
  // - `intermediateRegion`: Eastern Africa, South America, Channel Islands, etc.

  // - `sharedLandform`: Great Britain, Macaronesia, Mariana Islands, etc.
  // - `country`: Ethiopia, Brazil, United States, etc.
  // - `subcountryGroup`
  // - `territory`: Puerto Rico, Gurnsey, Hong Kong, etc.
  // - `subterritory`: Sark, Ascension Island, Diego Garcia, etc.
  level: Level;

  // The status of this feature's ISO 3166-1 code(s), if any
  // - `official`: officially-assigned
  // - `excRes`: exceptionally-reserved
  // - `usrAssn`: user-assigned
  isoStatus: string | undefined;

  // The side of the road that traffic drives on within this feature
  // - `right`
  // - `left`
  driveSide: 'left' | 'right' | undefined;

  // The unit used for road traffic speeds within this feature
  // - `mph`: miles per hour
  // - `km/h`: kilometers per hour
  roadSpeedUnit: 'mph' | 'km/h' | undefined;

  // The unit used for road vehicle height restrictions within this feature
  // - `ft`: feet and inches
  // - `m`: meters
  roadHeightUnit: 'ft' | 'm' | undefined;

  // The international calling codes for this feature, sometimes including area codes
  // e.g. `1`, `1 340`
  callingCodes: Array<string> | undefined;
};

// Geographic levels, roughly from most to least granular
export type Level =
  | 'subterritory'
  | 'territory'
  | 'subcountryGroup'
  | 'country'
  | 'sharedLandform'
  | 'intermediateRegion'
  | 'subregion'
  | 'region'
  | 'subunion'
  | 'union'
  | 'unitedNations'
  | 'world';

export type RegionFeature = Feature<Geometry, RegionFeatureProperties>;
export type RegionFeatureCollection = FeatureCollection<Geometry, RegionFeatureProperties>;
export type Vec2 = [number, number]; // [lon, lat]
export type Bbox = [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]

export type PointGeometry = Point;
export type PointFeature = Feature<Point>;
export type Location = Vec2 | PointGeometry | PointFeature;

export interface CodingOptions {
  // For overlapping features, the division level of the one to get. If no feature
  // exists at the given level, the feature at the next higher level is returned.
  // See the `level` property of `RegionFeatureProperties` for possible values.
  level?: Level | undefined;
  // Only a feature at the specified level or lower will be returned.
  maxLevel?: Level | undefined;
  // Only a feature with the specified property will be returned.
  withProp?: keyof RegionFeatureProperties | undefined;
};
