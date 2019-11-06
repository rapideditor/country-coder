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
  wikidata: string | undefined;

  // Additional identifiers which can be used to look up this feature;
  // these cannot collide with the identifiers for any other feature
  aliases: Array<string> | undefined;

  // For features entirely within a country, the ISO 3166-1 alpha-2 code for that country
  country: string | undefined;

  // The ISO 3166-1 alpha-2 or M49 codes of other features this feature is entirely within, including its country
  groups: Array<string> | undefined;

  // The ISO 3166-1 alpha-2 or M49 codes of other features this feature contains;
  // the inverse of `groups`
  members: Array<string> | undefined;

  // The status of this feature's ISO 3166-1 code(s), if any
  // - `official`: officially-assigned
  // - `excRes`: exceptionally-reserved
  // - `usrAssn`: user-assigned
  isoStatus: string | undefined;

  // The emoji flag sequence derived from this feature's ISO 3166-1 alpha-2 code
  emojiFlag: string | undefined;

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
  // For overlapping features, the division level of the one to get
  // - `country` (default): the "sovereign state" feature
  // - `region`: the lowest-level feature with an official or user-assigned ISO code
  level: string;
};

// The base GeoJSON feature collection
export let borders: RegionFeatureCollection = <RegionFeatureCollection>rawBorders;

// The whichPolygon getter for looking up a feature by point
let featureQuery: any = {};
// The cache for looking up a feature by identifier
let featuresByCode: any = {};

loadDerivedDataAndCaches(borders);
// Some data is implicit, load before using
function loadDerivedDataAndCaches(borders) {
  let identifierProps = ['iso1A2', 'iso1A3', 'm49', 'wikidata', 'emojiFlag'];
  let geometryFeatures: Array<RegionFeature> = [];
  for (let i in borders.features) {
    let feature = borders.features[i];

    // generate a unique ID for each feature
    feature.properties.id = feature.properties.iso1A2 || feature.properties.m49;

    loadGroups(feature);
    loadM49(feature);
    loadIsoStatus(feature);
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
    loadMembersForGroupsOf(feature);
  }

  // whichPolygon doesn't support null geometry even though GeoJSON does
  let geometryOnlyCollection: RegionFeatureCollection = {
    type: 'RegionFeatureCollection',
    features: geometryFeatures
  };
  featureQuery = whichPolygon(geometryOnlyCollection);

  function loadGroups(feature: RegionFeature) {
    let props = feature.properties;
    if (props.country) {
      // Add `country` to `groups`
      if (props.groups) {
        props.groups.push(props.country);
      } else {
        props.groups = [props.country];
      }
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

  function loadRoadSpeedUnit(feature: RegionFeature) {
    let props = feature.properties;
    if (
      props.roadSpeedUnit === undefined &&
      props.iso1A2 &&
      // no common unit in the EU
      props.iso1A2 !== 'EU'
    ) {
      // only `mph` regions are listed explicitly, else assume `km/h`
      props.roadSpeedUnit = 'km/h';
    }
  }

  function loadDriveSide(feature: RegionFeature) {
    let props = feature.properties;
    if (
      props.driveSide === undefined &&
      props.iso1A2 &&
      // no common side in the EU
      props.iso1A2 !== 'EU'
    ) {
      // only `left` regions are listed explicitly, else assume `right`
      props.driveSide = 'right';
    }
  }

  // Calculates the emoji flag sequence from the alpha-2 code (if any) and caches it
  function loadFlag(feature: RegionFeature) {
    if (!feature.properties.iso1A2) return;
    let flag = feature.properties.iso1A2.replace(/./g, function(char: string) {
      return String.fromCodePoint(<number>char.charCodeAt(0) + 127397);
    });
    feature.properties.emojiFlag = flag;
  }

  // Populate `members` as the inverse relationship of `groups`
  function loadMembersForGroupsOf(feature: RegionFeature) {
    if (!feature.properties.groups) return;

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
    for (let k in identifierProps) {
      let prop = identifierProps[k];
      let id = prop && feature.properties[prop];
      if (id) {
        featuresByCode[id] = feature;
      }
    }
    if (feature.properties.aliases) {
      for (let j in feature.properties.aliases) {
        let alias = feature.properties.aliases[j].toUpperCase().replace(/[-_ ]/g, '');
        featuresByCode[alias] = feature;
      }
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
  let featureProperties: RegionFeatureProperties = featureQuery(query);
  if (!featureProperties) return null;
  return featuresByCode[featureProperties.id];
}

// Returns the country feature containing `loc`, if any
function countryFeature(loc: Location): RegionFeature | null {
  let feature = smallestFeature(loc);
  if (!feature) return null;
  // a feature without `country` but with geometry is itself a country
  let countryCode = feature.properties.country || feature.properties.iso1A2;
  return featuresByCode[<string>countryCode];
}

// Returns the smallest feature containing `loc` to have an officially-assigned or user-assigned code, if any
function smallestNonExceptedIsoFeature(loc: Location): RegionFeature | null {
  let feature = features(loc).find(function(feature) {
    let isoStatus = feature.properties.isoStatus;
    return isoStatus === 'official' || isoStatus === 'usrAssn';
  });
  return feature || null;
}

// Returns the feature containing `loc` for the `opts`, if any
function featureForLoc(loc: Location, opts?: CodingOptions): RegionFeature | null {
  if (opts && opts.level === 'region') {
    // e.g. Puerto Rico
    return smallestNonExceptedIsoFeature(loc);
  }
  // e.g. United States
  return countryFeature(loc);
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
    stringID = id.toUpperCase().replace(/[-_ ]/g, '');
  }
  return featuresByCode[stringID] || null;
}

// Returns the feature matching the given arguments, if any
export function feature(
  query: Location | string | number,
  opts?: CodingOptions
): RegionFeature | null {
  if (typeof query === 'object') {
    return featureForLoc(<Location>query, opts);
  }
  return featureForID(query);
}

// Returns the ISO 3166-1 alpha-2 code for the feature matching the arguments, if any
export function iso1A2Code(query: Location | string | number, opts?: CodingOptions): string | null {
  let match = feature(query, opts);
  if (!match) return null;
  return match.properties.iso1A2 || null;
}

// Returns the ISO 3166-1 alpha-3 code for the feature matching the arguments, if any
export function iso1A3Code(query: Location | string | number, opts?: CodingOptions): string | null {
  let match = feature(query, opts);
  if (!match) return null;
  return match.properties.iso1A3 || null;
}

// Returns the ISO 3166-1 numeric-3 code for the feature matching the arguments, if any
export function iso1N3Code(query: Location | string | number, opts?: CodingOptions): string | null {
  let match = feature(query, opts);
  if (!match) return null;
  return match.properties.iso1N3 || null;
}

// Returns the UN M49 code for the feature matching the arguments, if any
export function m49Code(query: Location | string | number, opts?: CodingOptions): string | null {
  let match = feature(query, opts);
  if (!match) return null;
  return match.properties.m49 || null;
}

// Returns the Wikidata QID code for the feature matching the arguments, if any
export function wikidataQID(
  query: Location | string | number,
  opts?: CodingOptions
): string | null {
  let match = feature(query, opts);
  if (!match) return null;
  return match.properties.wikidata || null;
}

// Returns the emoji emojiFlag sequence for the feature matching the arguments, if any
export function emojiFlag(query: Location | string | number, opts?: CodingOptions): string | null {
  let match = feature(query, opts);
  if (!match) return null;
  return match.properties.emojiFlag || null;
}

// Returns all the features containing `loc` (zero or more)
export function features(loc: Location): Array<RegionFeature> {
  let feature = smallestFeature(loc);
  if (!feature) return [];

  let features: Array<RegionFeature> = [feature];

  let properties = feature.properties;
  if (properties.groups) {
    for (let i in properties.groups) {
      let groupID = properties.groups[i];
      features.push(featuresByCode[groupID]);
    }
  }
  return features;
}

// Returns the ISO 3166-1 alpha-2 codes for all features containing `loc` (zero or more)
export function iso1A2Codes(loc: Location): Array<string> {
  return features(loc)
    .map(function(feature) {
      return feature.properties.iso1A2 || '';
    })
    .filter(Boolean);
}

// Returns true if the feature matching `query` is, or is a part of, the feature matching `bounds`
export function isIn(query: Location | string | number, bounds: string | number): boolean {
  let queryFeature: RegionFeature | null;
  if (typeof query === 'object') {
    queryFeature = smallestFeature(<Location>query);
  } else {
    queryFeature = featureForID(query);
  }
  let boundsFeature = featureForID(bounds);

  if (!queryFeature || !boundsFeature) return false;

  if (queryFeature.properties.id === boundsFeature.properties.id) return true;
  if (!queryFeature.properties.groups) return false;
  return queryFeature.properties.groups.indexOf(boundsFeature.properties.id) !== -1;
}

// Returns true if the feature matching `query` is within EU jurisdiction
export function isInEuropeanUnion(query: Location | string | number): boolean {
  return isIn(query, 'EU');
}

// Returns the side traffic drives on in the feature matching `query` as a string (`right` or `left`)
export function driveSide(query: Location | string | number): string | null {
  let feature: RegionFeature | null;
  if (typeof query === 'object') {
    feature = smallestFeature(<Location>query);
  } else {
    feature = featureForID(query);
  }
  return (feature && feature.properties.driveSide) || null;
}

// Returns the road speed unit for the feature matching `query` as a string (`mph` or `km/h`)
export function roadSpeedUnit(query: Location | string | number): string | null {
  let feature: RegionFeature | null;
  if (typeof query === 'object') {
    feature = smallestFeature(<Location>query);
  } else {
    feature = featureForID(query);
  }
  return (feature && feature.properties.roadSpeedUnit) || null;
}

// Returns the full international calling codes for phone numbers in the feature matching `query`, if any
export function callingCodes(query: Location | string | number): Array<string> {
  let feature: RegionFeature | null;
  if (typeof query === 'object') {
    feature = smallestFeature(<Location>query);
  } else {
    feature = featureForID(query);
  }
  return (feature && feature.properties.callingCodes) || [];
}
