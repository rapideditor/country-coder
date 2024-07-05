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

  // The unit used for road vehicle height restrictions within this feature
  // - `ft`: feet and inches
  // - `m`: meters
  roadHeightUnit: string | undefined;

  // The international calling codes for this feature, sometimes including area codes
  // e.g. `1`, `1 340`
  callingCodes: Array<string> | undefined;
};
type RegionFeature = { type: string; geometry: any; properties: RegionFeatureProperties };
type RegionFeatureCollection = { type: string; features: Array<RegionFeature> };
type Vec2 = [number, number]; // [lon, lat]
type Bbox = [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
type PointGeometry = { type: string; coordinates: Vec2 };
type PointFeature = { type: string; geometry: PointGeometry; properties: any };
type Location = Vec2 | PointGeometry | PointFeature;
type CodingOptions = {
  // For overlapping features, the division level of the one to get. If no feature
  // exists at the given level, the feature at the next higher level is returned.
  // See the `level` property of `RegionFeatureProperties` for possible values.
  level?: string | undefined;
  // Only a feature at the specified level or lower will be returned.
  maxLevel?: string | undefined;
  // Only a feature with the specified property will be returned.
  withProp?: string | undefined;
};

// The base GeoJSON feature collection
export let borders: RegionFeatureCollection = <RegionFeatureCollection>rawBorders;

// The whichPolygon interface for looking up a feature by point
let _whichPolygon: any = {};
// The cache for looking up a feature by identifier
let _featuresByCode: any = {};

// discard special characters and instances of and/the/of that aren't the only characters
const idFilterRegex =
  /(?=(?!^(and|the|of|el|la|de)$))(\b(and|the|of|el|la|de)\b)|[-_ .,'()&[\]/]/gi;

function canonicalID(id: string | null): string {
  const s = id || '';
  if (s.charAt(0) === '.') {
    // skip replace if it leads with a '.' (e.g. a ccTLD like '.de', '.la')
    return s.toUpperCase();
  } else {
    return s.replace(idFilterRegex, '').toUpperCase();
  }
}

// Geographic levels, roughly from most to least granular
const levels = [
  'subterritory',
  'territory',
  'subcountryGroup',
  'country',
  'sharedLandform',
  'intermediateRegion',
  'subregion',
  'region',
  'subunion',
  'union',
  'unitedNations',
  'world'
];

loadDerivedDataAndCaches(borders);

// Loads implicit feature data and the getter index caches
function loadDerivedDataAndCaches(borders) {
  const identifierProps = ['iso1A2', 'iso1A3', 'm49', 'wikidata', 'emojiFlag', 'ccTLD', 'nameEn'];
  let geometryFeatures: Array<RegionFeature> = [];

  for (const feature of borders.features) {
    // generate a unique ID for each feature
    const props = feature.properties;
    props.id = props.iso1A2 || props.m49 || props.wikidata;

    loadM49(feature);
    loadTLD(feature);
    loadIsoStatus(feature);
    loadLevel(feature);
    loadGroups(feature);
    loadFlag(feature);
    // cache only after loading derived IDs
    cacheFeatureByIDs(feature);

    if (feature.geometry) {
      geometryFeatures.push(feature);
    }
  }

  // must load `members` only after fully loading `featuresByID`
  for (const feature of borders.features) {
    // ensure all groups are listed by their ID
    feature.properties.groups = feature.properties.groups.map(groupID => {
      return _featuresByCode[groupID].properties.id;
    });
    loadMembersForGroupsOf(feature);
  }

  // must load attributes only after loading geometry features into `members`
  for (const feature of borders.features) {
    loadRoadSpeedUnit(feature);
    loadRoadHeightUnit(feature);
    loadDriveSide(feature);
    loadCallingCodes(feature);
    loadGroupGroups(feature);
  }

  for (const feature of borders.features) {
    // order groups by their `level`
    feature.properties.groups.sort((groupID1, groupID2) => {
      return (
        levels.indexOf(_featuresByCode[groupID1].properties.level) -
        levels.indexOf(_featuresByCode[groupID2].properties.level)
      );
    });
    // order members by their `level` and then by order in borders
    if (feature.properties.members) {
      feature.properties.members.sort((id1, id2) => {
        const diff =
          levels.indexOf(_featuresByCode[id1].properties.level) -
          levels.indexOf(_featuresByCode[id2].properties.level);
        if (diff === 0) {
          return (
            borders.features.indexOf(_featuresByCode[id1]) -
            borders.features.indexOf(_featuresByCode[id2])
          );
        }
        return diff;
      });
    }
  }

  // whichPolygon doesn't support null geometry even though GeoJSON does
  const geometryOnlyCollection: RegionFeatureCollection = {
    type: 'FeatureCollection',
    features: geometryFeatures
  };
  _whichPolygon = whichPolygon(geometryOnlyCollection);

  function loadGroups(feature: RegionFeature) {
    const props = feature.properties;
    if (!props.groups) {
      props.groups = [];
    }
    if (feature.geometry && props.country) {
      // Add `country` to `groups`
      props.groups.push(props.country);
    }
    if (props.m49 !== '001') {  // all features are in the world feature except the world itself
      props.groups.push('001');
    }
  }

  function loadM49(feature: RegionFeature) {
    const props = feature.properties;
    if (!props.m49 && props.iso1N3) {  // M49 is a superset of ISO numerics so we only need to store one
      props.m49 = props.iso1N3;
    }
  }

  function loadTLD(feature: RegionFeature) {
    const props = feature.properties;
    if (props.level === 'unitedNations') return; // `.un` is not a ccTLD
    if (props.ccTLD === null) return; // e.g. Sark is an ISO code but not a ccTLD
    if (!props.ccTLD && props.iso1A2) {  // ccTLD is nearly the same as iso1A2, so we only need to explicitly code any exceptions
      props.ccTLD = '.' + props.iso1A2.toLowerCase();
    }
  }

  function loadIsoStatus(feature: RegionFeature) {
    const props = feature.properties;
    if (!props.isoStatus && props.iso1A2) {  // Features with an ISO code but no explicit status are officially-assigned
      props.isoStatus = 'official';
    }
  }

  function loadLevel(feature: RegionFeature) {
    const props = feature.properties;
    if (props.level) return;
    if (!props.country) {  // a feature without an explicit `level` or `country` is itself a country
      props.level = 'country';
    } else if (!props.iso1A2 || props.isoStatus === 'official') {
      props.level = 'territory';
    } else {
      props.level = 'subterritory';
    }
  }

  function loadGroupGroups(feature: RegionFeature) {
    const props = feature.properties;
    if (feature.geometry || !props.members) return;

    const featureLevelIndex = levels.indexOf(props.level);
    let sharedGroups: Array<string> = [];

    props.members.forEach((memberID, index) => {
      const member = _featuresByCode[memberID];
      const memberGroups = member.properties.groups.filter((groupID) => {
        return (
          groupID !== feature.properties.id &&
          featureLevelIndex < levels.indexOf(_featuresByCode[groupID].properties.level)
        );
      });
      if (index === 0) {
        sharedGroups = memberGroups;
      } else {
        sharedGroups = sharedGroups.filter((groupID) => memberGroups.indexOf(groupID) !== -1);
      }
    });

    props.groups = props.groups.concat(
      sharedGroups.filter((groupID) => props.groups.indexOf(groupID) === -1)
    );

    for (const groupID of sharedGroups) {
      const groupFeature = _featuresByCode[groupID];
      if (groupFeature.properties.members.indexOf(props.id) === -1) {
        groupFeature.properties.members.push(props.id);
      }
    }
  }

  function loadRoadSpeedUnit(feature: RegionFeature) {
    const props = feature.properties;
    if (feature.geometry) {
      // only `mph` regions are listed explicitly, else assume `km/h`
      if (!props.roadSpeedUnit) props.roadSpeedUnit = 'km/h';
    } else if (props.members) {
      const vals = Array.from(
        new Set(
          props.members
            .map(id => {
              const member = _featuresByCode[id];
              if (member.geometry) return member.properties.roadSpeedUnit || 'km/h';
            })
            .filter(Boolean)
        )
      );
      // if all members have the same value then that's also the value for this feature
      if (vals.length === 1) props.roadSpeedUnit = vals[0];
    }
  }

  function loadRoadHeightUnit(feature: RegionFeature) {
    const props = feature.properties;
    if (feature.geometry) {
      // only `ft` regions are listed explicitly, else assume `m`
      if (!props.roadHeightUnit) props.roadHeightUnit = 'm';
    } else if (props.members) {
      const vals = Array.from(
        new Set(
          props.members
            .map(id => {
              const member = _featuresByCode[id];
              if (member.geometry) return member.properties.roadHeightUnit || 'm';
            })
            .filter(Boolean)
        )
      );
      // if all members have the same value then that's also the value for this feature
      if (vals.length === 1) props.roadHeightUnit = vals[0];
    }
  }

  function loadDriveSide(feature: RegionFeature) {
    const props = feature.properties;
    if (feature.geometry) {
      // only `left` regions are listed explicitly, else assume `right`
      if (!props.driveSide) props.driveSide = 'right';
    } else if (props.members) {
      const vals = Array.from(
        new Set(
          props.members
            .map(id => {
              const member = _featuresByCode[id];
              if (member.geometry) return member.properties.driveSide || 'right';
            })
            .filter(Boolean)
        )
      );
      // if all members have the same value then that's also the value for this feature
      if (vals.length === 1) props.driveSide = vals[0];
    }
  }

  function loadCallingCodes(feature: RegionFeature) {
    const props = feature.properties;
    if (!feature.geometry && props.members) {
      props.callingCodes = Array.from(
        new Set(
          props.members.reduce((array, id) => {
            const member = _featuresByCode[id];
            if (member.geometry && member.properties.callingCodes) {
              return array.concat(member.properties.callingCodes);
            }
            return array;
          }, [])
        )
      );
    }
  }

  // Calculates the emoji flag sequence from the alpha-2 code (if any) and caches it
  function loadFlag(feature: RegionFeature) {
    if (!feature.properties.iso1A2) return;

    const flag = feature.properties.iso1A2.replace(/./g, function (char: string) {
      return String.fromCodePoint(<number>char.charCodeAt(0) + 127397);
    });
    feature.properties.emojiFlag = flag;
  }

  // Populate `members` as the inverse relationship of `groups`
  function loadMembersForGroupsOf(feature: RegionFeature) {
    for (const groupID of feature.properties.groups) {
      const groupFeature = _featuresByCode[groupID];

      if (!groupFeature.properties.members) {
        groupFeature.properties.members = [];
      }
      groupFeature.properties.members.push(feature.properties.id);
    }
  }

  // Caches features by their identifying strings for rapid lookup
  function cacheFeatureByIDs(feature: RegionFeature) {
    let ids: Array<string> = [];

    for (const prop of identifierProps) {
      const id = feature.properties[prop];
      if (id) {
        ids.push(id);
      }
    }

    for (const alias of (feature.properties.aliases || [])) {
      ids.push(alias);
    }

    for (const id of ids) {
      const cid = canonicalID(id);
      _featuresByCode[cid] = feature;
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
  const query = locArray(loc);
  const featureProperties: RegionFeatureProperties = _whichPolygon(query);
  if (!featureProperties) return null;
  return _featuresByCode[featureProperties.id];
}

// Returns the country feature containing `loc`, if any
function countryFeature(loc: Location): RegionFeature | null {
  const feature = smallestFeature(loc);
  if (!feature) return null;

  // a feature without `country` but with geometry is itself a country
  const countryCode = feature.properties.country || feature.properties.iso1A2;
  return _featuresByCode[<string>countryCode] || null;
}

let defaultOpts = {
  level: undefined,
  maxLevel: undefined,
  withProp: undefined
};

// Returns the feature containing `loc` for the `opts`, if any
function featureForLoc(loc: Location, opts: CodingOptions): RegionFeature | null {
  const targetLevel = opts.level || 'country';
  const maxLevel = opts.maxLevel || 'world';
  const withProp = opts.withProp;

  const targetLevelIndex = levels.indexOf(targetLevel);
  if (targetLevelIndex === -1) return null;

  const maxLevelIndex = levels.indexOf(maxLevel);
  if (maxLevelIndex === -1) return null;
  if (maxLevelIndex < targetLevelIndex) return null;

  if (targetLevel === 'country') {
    // attempt fast path for country-level coding
    const fastFeature = countryFeature(loc);
    if (fastFeature) {
      if (!withProp || fastFeature.properties[withProp]) {
        return fastFeature;
      }
    }
  }

  const features = featuresContaining(loc);

  const match = features.find((feature) => {
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
    return false;
  });

  return match || null;
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
  return _featuresByCode[stringID] || null;
}

function smallestFeaturesForBbox(bbox: Bbox): [RegionFeature] {
  return _whichPolygon.bbox(bbox).map(props => _featuresByCode[props.id]);
}

function smallestOrMatchingFeature(query: Location | string | number): RegionFeature | null {
  if (typeof query === 'object') {
    return smallestFeature(<Location>query);
  }
  return featureForID(query);
}

// Returns the feature matching the given arguments, if any
export function feature(query: Location | string | number, opts: CodingOptions = defaultOpts): RegionFeature | null {
  if (typeof query === 'object') {
    return featureForLoc(<Location>query, opts);
  }
  return featureForID(query);
}

// Returns the ISO 3166-1 alpha-2 code for the feature matching the arguments, if any
export function iso1A2Code(query: Location | string | number, opts: CodingOptions = defaultOpts): string | null {
  opts.withProp = 'iso1A2';
  const match = feature(query, opts);
  if (!match) return null;
  return match.properties.iso1A2 || null;
}

// Returns the ISO 3166-1 alpha-3 code for the feature matching the arguments, if any
export function iso1A3Code(query: Location | string | number, opts: CodingOptions = defaultOpts): string | null {
  opts.withProp = 'iso1A3';
  const match = feature(query, opts);
  if (!match) return null;
  return match.properties.iso1A3 || null;
}

// Returns the ISO 3166-1 numeric-3 code for the feature matching the arguments, if any
export function iso1N3Code(query: Location | string | number, opts: CodingOptions = defaultOpts): string | null {
  opts.withProp = 'iso1N3';
  const match = feature(query, opts);
  if (!match) return null;
  return match.properties.iso1N3 || null;
}

// Returns the UN M49 code for the feature matching the arguments, if any
export function m49Code(query: Location | string | number, opts: CodingOptions = defaultOpts): string | null {
  opts.withProp = 'm49';
  const match = feature(query, opts);
  if (!match) return null;
  return match.properties.m49 || null;
}

// Returns the Wikidata QID code for the feature matching the arguments, if any
export function wikidataQID(query: Location | string | number, opts: CodingOptions = defaultOpts): string | null {
  opts.withProp = 'wikidata';
  const match = feature(query, opts);
  if (!match) return null;
  return match.properties.wikidata;
}

// Returns the emoji emojiFlag sequence for the feature matching the arguments, if any
export function emojiFlag(query: Location | string | number, opts: CodingOptions = defaultOpts): string | null {
  opts.withProp = 'emojiFlag';
  const match = feature(query, opts);
  if (!match) return null;
  return match.properties.emojiFlag || null;
}

// Returns the ccTLD (country code top-level domain) for the feature matching the arguments, if any
export function ccTLD(
  query: Location | string | number,
  opts: CodingOptions = defaultOpts
): string | null {
  opts.withProp = 'ccTLD';
  const match = feature(query, opts);
  if (!match) return null;
  return match.properties.ccTLD || null;
}

function propertiesForQuery(query: Location | Bbox, property: string): Array<string> {
  const features = featuresContaining(query, false);
  return features.map(feature => feature.properties[property]).filter(Boolean);
}

// Returns all the ISO 3166-1 alpha-2 codes of features at the location
export function iso1A2Codes(query: Location | Bbox): Array<string> {
  return propertiesForQuery(query, 'iso1A2');
}

// Returns all the ISO 3166-1 alpha-3 codes of features at the location
export function iso1A3Codes(query: Location | Bbox): Array<string> {
  return propertiesForQuery(query, 'iso1A3');
}

// Returns all the ISO 3166-1 numeric-3 codes of features at the location
export function iso1N3Codes(query: Location | Bbox): Array<string> {
  return propertiesForQuery(query, 'iso1N3');
}

// Returns all the UN M49 codes of features at the location
export function m49Codes(query: Location | Bbox): Array<string> {
  return propertiesForQuery(query, 'm49');
}

// Returns all the Wikidata QIDs of features at the location
export function wikidataQIDs(query: Location | Bbox): Array<string> {
  return propertiesForQuery(query, 'wikidata');
}

// Returns all the emoji flag sequences of features at the location
export function emojiFlags(query: Location | Bbox): Array<string> {
  return propertiesForQuery(query, 'emojiFlag');
}

// Returns all the ccTLD (country code top-level domain) sequences of features at the location
export function ccTLDs(query: Location | Bbox): Array<string> {
  return propertiesForQuery(query, 'ccTLD');
}

// Returns the feature matching `query` and all features containing it, if any.
// If passing `true` for `strict`, an exact match will not be included
export function featuresContaining(query: Location | Bbox | string | number, strict?: boolean): Array<RegionFeature> {
  let matchingFeatures: Array<RegionFeature>;

  if (Array.isArray(query) && query.length === 4) {  // check if bounding box
    matchingFeatures = smallestFeaturesForBbox(<Bbox>query);
  } else {
    const smallestOrMatching = smallestOrMatchingFeature(<Location | string | number>query);
    matchingFeatures = smallestOrMatching ? [smallestOrMatching] : [];
  }

  if (!matchingFeatures.length) return [];

  let returnFeatures: Array<RegionFeature>;
  if (!strict || typeof query === 'object') {
    returnFeatures = matchingFeatures.slice();
  } else {
    returnFeatures = [];
  }

  for (const feature of matchingFeatures) {
    const properties = feature.properties;
    for (const groupID of properties.groups) {
      const groupFeature = _featuresByCode[groupID];
      if (returnFeatures.indexOf(groupFeature) === -1) {
        returnFeatures.push(groupFeature);
      }
    }
  }

  return returnFeatures;
}

// Returns the feature matching `id` and all features it contains, if any.
// If passing `true` for `strict`, an exact match will not be included
export function featuresIn(id: string | number, strict?: boolean): Array<RegionFeature> {
  const feature = featureForID(id);
  if (!feature) return [];

  let features: Array<RegionFeature> = [];

  if (!strict) {
    features.push(feature);
  }

  const properties = feature.properties;
  for (const memberID of (properties.members || [])) {
    features.push(_featuresByCode[memberID]);
  }

  return features;
}

// Returns a new feature with the properties of the feature matching `id`
// and the combined geometry of all its component features
export function aggregateFeature(id: string | number): RegionFeature | null {
  const features = featuresIn(id, false);
  if (features.length === 0) return null;

  let aggregateCoordinates = [];
  for (const feature of features) {
    if (feature.geometry?.type === 'MultiPolygon' && feature.geometry.coordinates) {
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
export function isIn(query: Location | string | number, bounds: string | number): boolean | null {
  const queryFeature = smallestOrMatchingFeature(query);
  const boundsFeature = featureForID(bounds);

  if (!queryFeature || !boundsFeature) return null;

  if (queryFeature.properties.id === boundsFeature.properties.id) return true;
  return queryFeature.properties.groups.indexOf(boundsFeature.properties.id) !== -1;
}

// Returns true if the feature matching `query` is within EU jurisdiction
export function isInEuropeanUnion(query: Location | string | number): boolean | null {
  return isIn(query, 'EU');
}

// Returns true if the feature matching `query` is, or is within, a United Nations member state
export function isInUnitedNations(query: Location | string | number): boolean | null {
  return isIn(query, 'UN');
}

// Returns the side traffic drives on in the feature matching `query` as a string (`right` or `left`)
export function driveSide(query: Location | string | number): string | null {
  const feature = smallestOrMatchingFeature(query);
  return (feature && feature.properties.driveSide) || null;
}

// Returns the road speed unit for the feature matching `query` as a string (`mph` or `km/h`)
export function roadSpeedUnit(query: Location | string | number): string | null {
  const feature = smallestOrMatchingFeature(query);
  return (feature && feature.properties.roadSpeedUnit) || null;
}

// Returns the road vehicle height restriction unit for the feature matching `query` as a string (`ft` or `m`)
export function roadHeightUnit(query: Location | string | number): string | null {
  const feature = smallestOrMatchingFeature(query);
  return (feature && feature.properties.roadHeightUnit) || null;
}

// Returns the full international calling codes for phone numbers in the feature matching `query`, if any
export function callingCodes(query: Location | string | number): Array<string> {
  const feature = smallestOrMatchingFeature(query);
  return (feature && feature.properties.callingCodes) || [];
}
