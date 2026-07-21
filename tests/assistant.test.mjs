import assert from 'node:assert/strict';
import test from 'node:test';
import { detectOfflineIntent, getOfflineReply, getOfflineTourActions } from '../src/ai/localAssistant.js';

test('routes a family trail request and returns transparent guidance', () => {
  assert.equal(detectOfflineIntent('We need a family vehicle for weekend trails.'), 'family');
  const response = getOfflineReply('We need a family vehicle for weekend trails.');
  assert.match(response.text, /family/i);
  assert.match(response.text, /third-party concept asset/i);
});

test('plans only bounded allowlisted actions for an off-road request', () => {
  const actions = getOfflineTourActions('Show a rocky off-road trail demonstration.');
  assert.ok(actions.length <= 6);
  assert.ok(actions.some((action) => action.name === 'focus_vehicle_area'));
  assert.ok(actions.some((action) => action.name === 'demonstrate_suspension_mode'));
});
