import { it } from 'bun:test';
import { strict as assert } from 'node:assert';
import { feature, iso1A2Code } from '../src/country-coder';

it('respects maxLevel when the country fast path finds Antarctica', () => {
  assert.equal(feature('AQ')?.properties.level, 'region');
  for (const maxLevel of ['country', 'sharedLandform', 'intermediateRegion', 'subregion'] as const) {
    assert.equal(feature([0, -90], { maxLevel }), null);
    assert.equal(iso1A2Code([0, -90], { maxLevel }), null);
  }
});

it('keeps Antarctica as a fallback when the range includes regions', () => {
  assert.equal(iso1A2Code([0, -90]), 'AQ');
  assert.equal(iso1A2Code([0, -90], { maxLevel: 'region' }), 'AQ');
  assert.equal(iso1A2Code([13.4, 52.5], { maxLevel: 'country' }), 'DE');
});
