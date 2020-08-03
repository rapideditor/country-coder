import whichPolygon from 'which-polygon';
import rawBorders from './data/borders.json';

type RegionFeatureProperties = {
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

  // The common English name
  nameEn: string;

  // Additional identifiers which can be used to look up this feature;
  // these cannot collide with the identifiers for any other feature
  aliases: Array<string> | undefined;

  // For features entirely within a country, the ISO 3166-1 alpha-2 code for that country
  country: string | undefined;

  // The ISO 3166-1 alpha-2 or M49 codes of other features this feature is entirely within, including its country
  groups: Array<string>;

  // The ISO 3166-1 alpha-2 or M49 codes of other features this feature contains;
  // the inverse of `groups`
  members: Array<string> | undefined;

  // The rough geographic type of this feature.
  // Levels do not necessarily nest cleanly within each other.
  // - `world`
  // - `union`: European Union
  // - `region`: Africa, Americas, Antarctica, Asia, Europe, Oceania
  // - `subregion`: Sub-Saharan Africa, North America, Micronesia, etc.
  // - `intermediateRegion`: Eastern Africa, South America, Channel Islands, etc.
  // - `country`: Ethiopia, Brazil, United States, etc.
  // - `subcountryGroup`
  // - `territory`: Puerto Rico, Gurnsey, Hong Kong, etc.
  // - `subterritory`: Sark, Ascension Island, Diego Garcia, etc.
  level: string;

  // The status of this feature's ISO 3166-1 code(s), if any
  // - `official`: officially-assigned
  // - `excRes`: exceptionally-reserved
  // - `usrAssn`: user-assigned
  isoStatus: string | undefined;

  // The side of the road that traffic drives on within this feature
  // - `right`
  // - `left`
  driveSide: string | undefined;

  // The unit used for road traffic speeds within this feature
  // - `mph`: miles per hour
  // - `km/h`: kilometers per hour
  roadSpeedUnit: string | undefined;

  // The international calling codes for this feature, sometimes including area codes
  // e.g. `1`, `1 340`
  callingCodes: Array<string> | undefined;
};
type RegionFeature = { type: string; geometry: any; properties: RegionFeatureProperties };
type RegionFeatureCollection = { type: string; features: Array<RegionFeature> };
type Vec2 = [number, number]; // [lon, lat]
type PointGeometry = { type: string; coordinates: Vec2 };
type PointFeature = { type: string; geometry: PointGeometry; properties: any };
type Location = Vec2 | PointGeometry | PointFeature;
type CodingOptions = {
  // For overlapping features, the division level of the one to get. If no feature
  // exists at the given level, the feature at the next higher level is returned.
  // See the `level` property of `RegionFeatureProperties` for possible values.
  level: string | undefined;
  // Only a feature at the specified level or lower will be returned.
  maxLevel: string | undefined;
  // Only a feature with the specified property will be returned.
  withProp: string | undefined;
};

// The base GeoJSON feature collection
export let borders: RegionFeatureCollection = <RegionFeatureCollection>rawBorders;

// The whichPolygon interface for looking up a feature by point
let whichPolygonGetter: any = {};
// The cache for looking up a feature by identifier
let featuresByCode: any = {};

// discard special characters and instances of and/the/of that aren't the only characters
let idFilterRegex = /(?=(?!^(and|the|of)$))(\b(and|the|of)\b)|[-_ .,'()&[\]/]/gi;

function canonicalID(id: string): string {
  return id.replace(idFilterRegex, '').toUpperCase();
}

// Geographic levels, roughly from most to least granular
let levels = [
  'subterritory',
  'territory',
  'subcountryGroup',
  'country',
  'intermediateRegion',
  'subregion',
  'region',
  'union',
  'world'
];

loadDerivedDataAndCaches(borders);
// Loads implicit feature data and the getter index caches
function loadDerivedDataAndCaches(borders) {
  let identifierProps = ['iso1A2', 'iso1A3', 'm49', 'wikidata', 'emojiFlag', 'nameEn'];
  let geometryFeatures: Array<RegionFeature> = [];
  for (let i in borders.features) {
    let feature = borders.features[i];

    // generate a unique ID for each feature
    feature.properties.id =
      feature.properties.iso1A2 || feature.properties.m49 || feature.properties.wikidata;

    loadM49(feature);
    loadIsoStatus(feature);
    loadLevel(feature);
    loadGroups(feature);
    loadRoadSpeedUnit(feature);
    loadDriveSide(feature);
    loadFlag(feature);

    // cache only after loading derived IDs
    cacheFeatureByIDs(feature);

    if (feature.geometry) geometryFeatures.push(feature);
  }

  // must load `members` only after fully loading `featuresByID`
  for (let i in borders.features) {
    let feature = borders.features[i];
    // order groups by their `level`
    feature.properties.groups.sort(function (groupID1, groupID2) {
      return (
        levels.indexOf(featuresByCode[groupID1].properties.level) -
        levels.indexOf(featuresByCode[groupID2].properties.level)
      );
    });
    loadMembersForGroupsOf(feature);
  }

  // whichPolygon doesn't support null geometry even though GeoJSON does
  let geometryOnlyCollection: RegionFeatureCollection = {
    type: 'FeatureCollection',
    features: geometryFeatures
  };
  whichPolygonGetter = whichPolygon(geometryOnlyCollection);

  function loadGroups(feature: RegionFeature) {
    let props = feature.properties;
    if (!props.groups) {
      props.groups = [];
    }
    if (props.country) {
      // Add `country` to `groups`
      props.groups.push(props.country);
    }
    if (props.m49 !== '001') {
      // all features are in the world feature except the world itself
      props.groups.push('001');
    }
  }

  function loadM49(feature: RegionFeature) {
    let props = feature.properties;
    if (!props.m49 && props.iso1N3) {
      // M49 is a superset of ISO numerics so we only need to store one
      props.m49 = props.iso1N3;
    }
  }

  function loadIsoStatus(feature: RegionFeature) {
    let props = feature.properties;
    if (!props.isoStatus && props.iso1A2) {
      // Features with an ISO code but no explicit status are officially-assigned
      props.isoStatus = 'official';
    }
  }

  function loadLevel(feature: RegionFeature) {
    let props = feature.properties;
    if (props.level) return;
    if (!props.country) {
      // a feature without an explicit `level` or `country` is itself a country
      props.level = 'country';
    } else if (!props.iso1A2 || props.isoStatus === 'official') {
      props.level = 'territory';
    } else {
      props.level = 'subterritory';
    }
  }

  function loadRoadSpeedUnit(feature: RegionFeature) {
    let props = feature.properties;
    if (
      props.roadSpeedUnit === undefined &&
      (props.level === 'country' || props.level === 'territory' || props.level === 'subterritory')
    ) {
      // only `mph` regions are listed explicitly, else assume `km/h`
      props.roadSpeedUnit = 'km/h';
    }
  }

  function loadDriveSide(feature: RegionFeature) {
    let props = feature.properties;
    if (
      props.driveSide === undefined &&
      (props.level === 'country' || props.level === 'territory' || props.level === 'subterritory')
    ) {
      // only `left` regions are listed explicitly, else assume `right`
      props.driveSide = 'right';
    }
  }

  // Calculates the emoji flag sequence from the alpha-2 code (if any) and caches it
  function loadFlag(feature: RegionFeature) {
    if (!feature.properties.iso1A2) return;
    let flag = feature.properties.iso1A2.replace(/./g, function (char: string) {
      return String.fromCodePoint(<number>char.charCodeAt(0) + 127397);
    });
    feature.properties.emojiFlag = flag;
  }

  // Populate `members` as the inverse relationship of `groups`
  function loadMembersForGroupsOf(feature: RegionFeature) {
    let featureID = feature.properties.id;
    let standardizedGroupIDs: Array<string> = [];
    for (let j in feature.properties.groups) {
      let groupID = feature.properties.groups[j];
      let groupFeature = featuresByCode[groupID];
      standardizedGroupIDs.push(groupFeature.properties.id);

      if (groupFeature.properties.members) {
        groupFeature.properties.members.push(featureID);
      } else {
        groupFeature.properties.members = [featureID];
      }
    }
    // ensure that all relationships are coded by `id`
    feature.properties.groups = standardizedGroupIDs;
  }

  // Caches features by their identifying strings for rapid lookup
  function cacheFeatureByIDs(feature: RegionFeature) {
    let ids: Array<string> = [];
    for (let k in identifierProps) {
      let prop = identifierProps[k];
      let id = feature.properties[prop];
      if (id) ids.push(id);
    }
    if (feature.properties.aliases) {
      for (let j in feature.properties.aliases) {
        ids.push(feature.properties.aliases[j]);
      }
    }
    for (let i in ids) {
      let id = canonicalID(ids[i]);
      featuresByCode[id] = feature;
    }
  }
}

// Returns the [longitude, latitude] for the location argument
function locArray(loc: Location): Vec2 {
  if (Array.isArray(loc)) {
    return <Vec2>loc;
  } else if ((<PointGeometry>loc).coordinates) {
    return (<PointGeometry>loc).coordinates;
  }
  return (<PointFeature>loc).geometry.coordinates;
}

// Returns the smallest feature of any kind containing `loc`, if any
function smallestFeature(loc: Location): RegionFeature | null {
  let query = locArray(loc);
  let featureProperties: RegionFeatureProperties = whichPolygonGetter(query);
  if (!featureProperties) return null;
  return featuresByCode[featureProperties.id];
}

// Returns the country feature containing `loc`, if any
function countryFeature(loc: Location): RegionFeature | null {
  let feature = smallestFeature(loc);
  if (!feature) return null;
  // a feature without `country` but with geometry is itself a country
  let countryCode = feature.properties.country || feature.properties.iso1A2;
  return featuresByCode[<string>countryCode] || null;
}

let defaultOpts = {
  level: undefined,
  maxLevel: undefined,
  withProp: undefined
};

// Returns the feature containing `loc` for the `opts`, if any
function featureForLoc(loc: Location, opts: CodingOptions): RegionFeature | null {
  let targetLevel = opts.level || 'country';
  let maxLevel = opts.maxLevel || 'world';
  let withProp = opts.withProp;

  let targetLevelIndex = levels.indexOf(targetLevel);
  if (targetLevelIndex === -1) return null;

  let maxLevelIndex = levels.indexOf(maxLevel);
  if (maxLevelIndex === -1) return null;
  if (maxLevelIndex < targetLevelIndex) return null;

  if (targetLevel === 'country') {
    // attempt fast path for country-level coding
    let fastFeature = countryFeature(loc);
    if (fastFeature) {
      if (!withProp || fastFeature.properties[withProp]) {
        return fastFeature;
      }
    }
  }

  let features = featuresContaining(loc);

  for (let i in features) {
    let feature = features[i];
    let levelIndex = levels.indexOf(feature.properties.level);
    if (
      feature.properties.level === targetLevel ||
      // if no feature exists at the target level, return the first feature at the next level up
      (levelIndex > targetLevelIndex && levelIndex <= maxLevelIndex)
    ) {
      if (!withProp || feature.properties[withProp]) {
        return feature;
      }
    }
  }
  return null;
}

// Returns the feature with an identifying property matching `id`, if any
function featureForID(id: string | number): RegionFeature | null {
  let stringID: string;
  if (typeof id === 'number') {
    stringID = id.toString();
    if (stringID.length === 1) {
      stringID = '00' + stringID;
    } else if (stringID.length === 2) {
      stringID = '0' + stringID;
    }
  } else {
    stringID = canonicalID(id);
  }
  return featuresByCode[stringID] || null;
}

function smallestOrMatchingFeature(query: Location | string | number): RegionFeature | null {
  if (typeof query === 'object') {
    return smallestFeature(<Location>query);
  }
  return featureForID(query);
}

// Returns the feature matching the given arguments, if any
export function feature(
  query: Location | string | number,
  opts: CodingOptions = defaultOpts
): RegionFeature | null {
  if (typeof query === 'object') {
    return featureForLoc(<Location>query, opts);
  }
  return featureForID(query);
}

// Returns the ISO 3166-1 alpha-2 code for the feature matching the arguments, if any
export function iso1A2Code(
  query: Location | string | number,
  opts: CodingOptions = defaultOpts
): string | null {
  opts.withProp = 'iso1A2';
  let match = feature(query, opts);
  if (!match) return null;
  return match.properties.iso1A2 || null;
}

// Returns the ISO 3166-1 alpha-3 code for the feature matching the arguments, if any
export function iso1A3Code(
  query: Location | string | number,
  opts: CodingOptions = defaultOpts
): string | null {
  opts.withProp = 'iso1A3';
  let match = feature(query, opts);
  if (!match) return null;
  return match.properties.iso1A3 || null;
}

// Returns the ISO 3166-1 numeric-3 code for the feature matching the arguments, if any
export function iso1N3Code(
  query: Location | string | number,
  opts: CodingOptions = defaultOpts
): string | null {
  opts.withProp = 'iso1N3';
  let match = feature(query, opts);
  if (!match) return null;
  return match.properties.iso1N3 || null;
}

// Returns the UN M49 code for the feature matching the arguments, if any
export function m49Code(
  query: Location | string | number,
  opts: CodingOptions = defaultOpts
): string | null {
  opts.withProp = 'm49';
  let match = feature(query, opts);
  if (!match) return null;
  return match.properties.m49 || null;
}

// Returns the Wikidata QID code for the feature matching the arguments, if any
export function wikidataQID(
  query: Location | string | number,
  opts: CodingOptions = defaultOpts
): string | null {
  opts.withProp = 'wikidata';
  let match = feature(query, opts);
  if (!match) return null;
  return match.properties.wikidata;
}

// Returns the emoji emojiFlag sequence for the feature matching the arguments, if any
export function emojiFlag(
  query: Location | string | number,
  opts: CodingOptions = defaultOpts
): string | null {
  opts.withProp = 'emojiFlag';
  let match = feature(query, opts);
  if (!match) return null;
  return match.properties.emojiFlag || null;
}

// Returns the feature matching `query` and all features containing it, if any.
// If passing `true` for `strict`, an exact match will not be included
export function featuresContaining(
  query: Location | string | number,
  strict?: boolean
): Array<RegionFeature> {
  let feature = smallestOrMatchingFeature(query);
  if (!feature) return [];

  let features: Array<RegionFeature> = [];

  if (!strict || typeof query === 'object') {
    features.push(feature);
  }

  let properties = feature.properties;
  for (let i in properties.groups) {
    let groupID = properties.groups[i];
    features.push(featuresByCode[groupID]);
  }
  return features;
}

// Returns the feature matching `id` and all features it contains, if any.
// If passing `true` for `strict`, an exact match will not be included
export function featuresIn(id: string | number, strict?: boolean): Array<RegionFeature> {
  let feature = featureForID(id);
  if (!feature) return [];

  let features: Array<RegionFeature> = [];

  if (!strict) {
    features.push(feature);
  }

  let properties = feature.properties;
  if (properties.members) {
    for (let i in properties.members) {
      let memberID = properties.members[i];
      features.push(featuresByCode[memberID]);
    }
  }
  return features;
}

// Returns a new feature with the properties of the feature matching `id`
// and the combined geometry of all its component features
export function aggregateFeature(id: string | number): RegionFeature | null {
  let features = featuresIn(id, false);
  if (features.length === 0) return null;

  let aggregateCoordinates = [];
  for (let i in features) {
    let feature = features[i];
    if (
      feature.geometry &&
      feature.geometry.type === 'MultiPolygon' &&
      feature.geometry.coordinates
    ) {
      aggregateCoordinates = aggregateCoordinates.concat(feature.geometry.coordinates);
    }
  }

  return {
    type: 'Feature',
    properties: features[0].properties,
    geometry: {
      type: 'MultiPolygon',
      coordinates: aggregateCoordinates
    }
  };
}

// Returns true if the feature matching `query` is, or is a part of, the feature matching `bounds`
export function isIn(query: Location | string | number, bounds: string | number): boolean {
  let queryFeature = smallestOrMatchingFeature(query);
  let boundsFeature = featureForID(bounds);

  if (!queryFeature || !boundsFeature) return false;

  if (queryFeature.properties.id === boundsFeature.properties.id) return true;
  return queryFeature.properties.groups.indexOf(boundsFeature.properties.id) !== -1;
}

// Returns true if the feature matching `query` is within EU jurisdiction
export function isInEuropeanUnion(query: Location | string | number): boolean {
  return isIn(query, 'EU');
}

// Returns the side traffic drives on in the feature matching `query` as a string (`right` or `left`)
export function driveSide(query: Location | string | number): string | null {
  let feature = smallestOrMatchingFeature(query);
  return (feature && feature.properties.driveSide) || null;
}

// Returns the road speed unit for the feature matching `query` as a string (`mph` or `km/h`)
export function roadSpeedUnit(query: Location | string | number): string | null {
  let feature = smallestOrMatchingFeature(query);
  return (feature && feature.properties.roadSpeedUnit) || null;
}

// Returns the full international calling codes for phone numbers in the feature matching `query`, if any
export function callingCodes(query: Location | string | number): Array<string> {
  let feature = smallestOrMatchingFeature(query);
  return (feature && feature.properties.callingCodes) || [];
}
