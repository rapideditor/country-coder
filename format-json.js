let fs = require('fs');

let bordersPath = './src/data/borders.json';
let borders = require(bordersPath);

let allowedKeys = ['type', 'features'];
for (let key in borders) {
  if (allowedKeys.indexOf(key) === -1) {
    delete borders[key];
  }
}

let features = borders.features;
delete borders.features;

let outstring = JSON.stringify(borders);
outstring = outstring.substring(0, outstring.length - 1);
outstring += ',"features":[\n';

features.sort(function(feature1, feature2) {
  return feature1.properties.iso1A2 > feature2.properties.iso1A2 ? 1 : -1;
});

function roundCoordinatePrecision(feature) {
  if (!feature.geometry || feature.geometry.type !== 'MultiPolygon') return;

  for (let j in feature.geometry.coordinates) {
    let polygon = feature.geometry.coordinates[j];
    for (let k in polygon) {
      let part = polygon[k];
      for (let l in part) {
        let point = part[l];
        part[l] = point.map(function(coordinate) {
          return Math.round(coordinate * 100000) / 100000;
        });
      }
    }
  }
}

let featureProperties = [
  'iso1A2',
  'iso1A3',
  'iso1N3',
  'wikidata',
  'aliases',
  'country',
  'groups',
  'isoStatus',
  'driveSide',
  'roadSpeedUnit',
  'callingCodes'
];

function processProperties(feature) {
  let newProperties = {};
  for (var j in featureProperties) {
    let prop = featureProperties[j];
    if (feature.properties[prop]) {
      newProperties[prop] = feature.properties[prop];
    }
  }
  feature.properties = newProperties;
}

for (let i in features) {
  let feature = features[i];

  // sort properties and strip unrecognized ones
  processProperties(feature);

  // remove any unncessary precision
  roundCoordinatePrecision(feature);

  outstring += JSON.stringify(feature);
  if (parseFloat(i) !== features.length - 1) {
    outstring += ',';
  }
  outstring += '\n';
}
outstring += ']}';

fs.writeFileSync(bordersPath, outstring);
