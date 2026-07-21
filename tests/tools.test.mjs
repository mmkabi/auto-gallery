import assert from 'node:assert/strict';
import test from 'node:test';
import { LYRA_TOOL_DEFINITIONS, validateLyraToolCall } from '../src/ai/toolContracts.js';

test('all Lyra tools use strict schemas', () => {
  assert.ok(LYRA_TOOL_DEFINITIONS.length >= 12);
  for (const definition of LYRA_TOOL_DEFINITIONS) {
    assert.equal(definition.strict, true);
    assert.equal(definition.parameters.additionalProperties, false);
  }
});

test('rejects unknown tools and unexpected arguments', () => {
  assert.equal(validateLyraToolCall('execute_code', {}).valid, false);
  assert.equal(validateLyraToolCall('enter_driver_cabin', { script: 'alert(1)' }).valid, false);
});

test('accepts a safe scene action', () => {
  assert.equal(validateLyraToolCall('demonstrate_steering', { direction: 'left' }).valid, true);
});
