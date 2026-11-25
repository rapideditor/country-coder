import { it } from 'bun:test';
import { strict as assert } from 'node:assert';
import { featuresContaining, iso1A2Codes } from '../src/country-coder';
import type { Bbox } from '../src/types';

it('returns each feature once when a bounding box intersects several component polygons', () => {
  const bbox: Bbox = [-180, -90, 180, 90];
  const features = featuresContaining(bbox);
  const ids = features.map(feature => feature.properties.id);
  assert.equal(ids.filter(id => id === 'FJ').length, 1);
  assert.equal(ids.filter(id => id === 'BE').length, 1);
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(ids.includes('001'));

  const codes = iso1A2Codes(bbox);
  assert.equal(codes.length, new Set(codes).size);
  assert.ok(codes.includes('FJ'));
  assert.ok(codes.includes('BE'));
});

it('still returns no features for a polar ocean bounding box', () => {
  assert.deepEqual(featuresContaining([-1, 88, 1, 89]), []);
});
