import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialSceneState, reduceSceneState, serializeSceneContext } from '../src/three/sceneState.js';

test('serializes only compact allowlisted scene context', () => {
  const serialized = serializeSceneContext({
    cameraMode: 'cabin',
    selectedPaint: 'onyx',
    openDoors: ['driver', 'unknown-door'],
    cabinActive: true,
    secret: 'must-not-leak',
  });
  assert.deepEqual(serialized.openDoors, ['driver']);
  assert.equal('secret' in serialized, false);
});

test('door, cabin, and reset transitions are deterministic', () => {
  let state = createInitialSceneState();
  state = reduceSceneState(state, { type: 'door/set', door: 'driver', open: true });
  state = reduceSceneState(state, { type: 'camera/cabin' });
  assert.deepEqual(state.openDoors, ['driver']);
  assert.equal(state.cabinActive, true);
  state = reduceSceneState(state, { type: 'experience/reset' });
  assert.deepEqual(state, createInitialSceneState());
});
