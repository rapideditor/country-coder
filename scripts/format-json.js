const fs = require('fs');
const rewind = require('@mapbox/geojson-rewind');

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
  if (feature1.properties.iso1A2 && !feature2.properties.iso1A2) return 1;
  if (!feature1.properties.iso1A2 && feature2.properties.iso1A2) return -1;
  if (feature1.properties.m49 && !feature2.properties.m49) return 1;
  if (!feature1.properties.m49 && feature2.properties.m49) return -1;
  if (feature1.properties.m49) {
    return feature1.properties.m49.localeCompare(feature2.properties.m49, 'en');
  }
  if (feature1.properties.iso1A2) {
    return feature1.properties.iso1A2.localeCompare(feature2.properties.iso1A2, 'en');
  }
  return (
    parseInt(feature1.properties.wikidata.slice(1)) -
    parseInt(feature2.properties.wikidata.slice(1))
  );
});

function roundCoordinatePrecision(feature) {
  if (!feature.geometry || feature.geometry.type !== 'MultiPolygon') return;

  for (const j in feature.geometry.coordinates) {
    const polygon = feature.geometry.coordinates[j];
    for (const k in polygon) {
      const part = polygon[k];
      for (const l in part) {
        let point = part[l];
        part[l] = point.map(coord => Math.round(coord * 100000) / 100000);
      }
    }
  }
}

const featureProperties = [
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

function processProperties(feature) {
  let newProperties = {};
  for (const j in featureProperties) {
    const prop = featureProperties[j];
    if (feature.properties[prop]) {
      newProperties[prop] = feature.properties[prop];
    }
  }
  feature.properties = newProperties;
}

function validateFeature(feature) {
  if (!feature.geometry) {
    const name = feature.properties.nameEn;
    if (feature.properties.roadSpeedUnit)
      console.error(name + ' has no geometry but has roadSpeedUnit');
    if (feature.properties.roadHeightUnit)
      console.error(name + ' has no geometry but has roadHeightUnit');
    if (feature.properties.driveSide) console.error(name + ' has no geometry but has driveSide');
    if (feature.properties.callingCodes)
      console.error(name + ' has no geometry but has callingCodes');
    if (feature.properties.groups) console.error(name + ' has no geometry but has groups');
  }
}


for (const i in features) {
  let feature = features[i];

  processProperties(feature);   // sort properties and strip unrecognized ones
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
