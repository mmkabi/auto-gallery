import assert from 'node:assert/strict';
import test from 'node:test';
import { parseChatCompletionResult, toChatCompletionTool } from '../server/lyra-api.mjs';
import { LYRA_TOOL_DEFINITIONS } from '../src/ai/toolContracts.js';

test('maps strict Lyra tools to Chat Completions function tools', () => {
  const mapped = toChatCompletionTool(LYRA_TOOL_DEFINITIONS[0]);
  assert.equal(mapped.type, 'function');
  assert.equal(mapped.function.name, 'focus_vehicle_area');
  assert.equal(mapped.function.strict, true);
  assert.deepEqual(mapped.function.parameters, LYRA_TOOL_DEFINITIONS[0].parameters);
});

test('parses and validates a Chat Completions tool call', () => {
  const result = parseChatCompletionResult({
    choices: [{
      message: {
        role: 'assistant',
        content: null,
        tool_calls: [{
          id: 'call_123',
          type: 'function',
          function: { name: 'set_vehicle_color', arguments: '{"color":"onyx"}' },
        }],
      },
    }],
  });
  assert.equal(result.toolCall.name, 'set_vehicle_color');
  assert.deepEqual(result.toolCall.args, { color: 'onyx' });
  assert.equal(result.toolCall.callId, 'call_123');
});

test('rejects unknown Chat Completions tool calls', () => {
  const result = parseChatCompletionResult({
    choices: [{
      message: {
        role: 'assistant',
        tool_calls: [{
          id: 'call_123',
          type: 'function',
          function: { name: 'run_arbitrary_code', arguments: '{}' },
        }],
      },
    }],
  });
  assert.equal(result.rejected, true);
});
