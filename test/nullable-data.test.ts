import { it } from 'bun:test';
import { strict as assert } from 'node:assert';
import { feature } from '../src/country-coder';
import type { RegionFeature, RegionFeatureCollection, RegionFeatureProperties } from '../src/types';

it('accepts a geometry-free region in the public GeoJSON types', () => {
  const kingdom = feature('GB');
  assert.ok(kingdom);
  assert.equal(kingdom.geometry, null);
  const region: RegionFeature = { type: 'Feature', properties: kingdom.properties, geometry: null };
  const collection: RegionFeatureCollection = { type: 'FeatureCollection', features: [region] };
  assert.deepEqual(collection.features, [kingdom]);
});

it('represents Sark\'s explicit absence of a ccTLD', () => {
  const sark = feature('Sark');
  assert.ok(sark);
  const properties: RegionFeatureProperties = { ...sark.properties, ccTLD: null };
  assert.deepEqual(sark.properties, properties);
});
