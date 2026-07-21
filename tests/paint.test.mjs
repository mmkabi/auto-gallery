import assert from 'node:assert/strict';
import test from 'node:test';
import { getPaintPreset, isPaintPreset } from '../src/three/materials/paintSelection.js';

test('allows only the fixed Onyx Black paint', () => {
  assert.equal(getPaintPreset('onyx').value, '#090a0c');
  assert.equal(isPaintPreset('pearl'), false);
  assert.equal(isPaintPreset('champagne'), false);
  assert.equal(isPaintPreset('silver'), false);
  assert.equal(isPaintPreset('graphite'), false);
  assert.equal(isPaintPreset('script:red'), false);
});
