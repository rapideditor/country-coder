import fs from 'bun:fs';
import rewind from '@mapbox/geojson-rewind';

const bordersPath = './src/data/borders.json';
const borders = JSON.parse(fs.readFileSync(bordersPath));

// ensure exterior rings are counter-clockwise and interior rings are clockwise
rewind(borders);

const allowedKeys = ['type', 'features'];
for (const key in borders) {
  if (allowedKeys.indexOf(key) === -1) {
    delete borders[key];
  }
}

const features = borders.features;
delete borders.features;

let outstring = JSON.stringify(borders);
outstring = outstring.substring(0, outstring.length - 1);
outstring += ',"features":[\n';

features.sort((feature1, feature2) => {
  let code1 = feature1.properties.iso1A2 ?? '';
  let code2 = feature2.properties.iso1A2 ?? '';
  let compare = code1.localeCompare(code2, 'en');
  if (compare) return compare;

  code1 = feature1.properties.m49 ?? '';
  code2 = feature2.properties.m49 ?? '';
  compare = code1.localeCompare(code2, 'en');
  if (compare) return compare;

  code1 = parseInt(feature1.properties.wikidata.slice(1));
  code2 = parseInt(feature2.properties.wikidata.slice(1));
  return code1 - code2;
});

function roundCoordinatePrecision(feature) {
  if (!feature.geometry || feature.geometry.type !== 'MultiPolygon') return;

  for (const j in feature.geometry.coordinates) {
    const polygon = feature.geometry.coordinates[j];
    for (const k in polygon) {
      const part = polygon[k];
      for (const l in part) {
        let point = part[l];
        part[l] = point.map((coord) => Math.round(coord * 100000) / 100000);
      }
    }
  }
}

const allowedProperties = [
  'iso1A2',
  'iso1A3',
  'iso1N3',
  'm49',
  'wikidata',
  'ccTLD',
  'nameEn',
  'aliases',
  'country',
  'groups',
  'level',
  'isoStatus',
  'driveSide',
  'roadSpeedUnit',
  'roadHeightUnit',
  'callingCodes'
];

// Keep only the allowed properties, and order them as above
function processProperties(feature) {
  const keepProps = {};
  for (const k of allowedProperties) {
    if (feature.properties.hasOwnProperty(k)) {
      keepProps[k] = feature.properties[k];
    }
  }
  feature.properties = keepProps;
}


function validateFeature(feature) {
  if (!feature.geometry) {
    const name = feature.properties.nameEn;
    if (feature.properties.roadSpeedUnit) {
      console.warn(`Warning:  '${name}' has no geometry but has 'roadSpeedUnit'`);
    }
    if (feature.properties.roadHeightUnit) {
      console.warn(`Warning:  '${name}' has no geometry but has 'roadHeightUnit'`);
    }
    if (feature.properties.driveSide) {
      console.warn(`Warning:  '${name}' has no geometry but has 'driveSide'`);
    }
    if (feature.properties.callingCodes) {
      console.warn(`Warning:  '${name}' has no geometry but has 'callingCodes'`);
    }
    if (feature.properties.groups) {
      console.warn(`Warning:  '${name}' has no geometry but has 'groups'`);
    }
  }
}

for (const i in features) {
  let feature = features[i];

  processProperties(feature); // sort properties and strip unrecognized ones
  roundCoordinatePrecision(feature); // remove any unncessary precision
  validateFeature(feature);

  outstring += JSON.stringify(feature);
  if (parseFloat(i) !== features.length - 1) {
    outstring += ',';
  }
  outstring += '\n';
}
outstring += ']}';

fs.writeFileSync(bordersPath, outstring);
