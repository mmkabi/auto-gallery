import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildBluesmindsChatBody,
  getBluesmindsChatEndpoint,
  sanitizeProviderLog,
} from '../server/bluesminds-provider.mjs';

test('builds the exact minimal Bluesminds connectivity body', () => {
  const body = buildBluesmindsChatBody({
    model: 'gpt-5.5',
    messages: [{ role: 'user', content: 'Reply exactly: OK' }],
    temperature: 0,
    maxTokens: 20,
  });
  assert.deepEqual(body, {
    model: 'gpt-5.5',
    messages: [{ role: 'user', content: 'Reply exactly: OK' }],
    temperature: 0,
    max_tokens: 20,
  });
  assert.equal('tools' in body, false);
  assert.equal('max_output_tokens' in body, false);
});

test('uses the required Chat Completions endpoint', () => {
  assert.equal(
    getBluesmindsChatEndpoint('https://api.bluesminds.com/v1'),
    'https://api.bluesminds.com/v1/chat/completions',
  );
});

test('redacts credential-shaped provider log values', () => {
  assert.deepEqual(sanitizeProviderLog({ Authorization: 'Bearer private', value: 'sk-sensitivevalue' }), {
    Authorization: '[REDACTED]',
    value: '[REDACTED]',
  });
});
