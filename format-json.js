
let fs = require('fs');

let bordersPath = './src/data/borders.json';
let borders = require(bordersPath);

let allowedKeys = new Set(['type', 'features']);
for (let key in borders) {
    if (!allowedKeys.has(key)) {
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

for (var i in features) {
    outstring += JSON.stringify(features[i]);
    if (parseFloat(i) !== features.length - 1) {
        outstring += ',';
    }
    outstring += '\n';
}
outstring += ']}';

fs.writeFileSync(bordersPath, outstring);
