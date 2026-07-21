import assert from 'node:assert/strict';
import test from 'node:test';
import { createDemoLead, createLeadSummary } from '../src/crm/lead.js';

test('requires explicit consent for a local demo lead', () => {
  const result = createDemoLead({ name: 'Alex Kim', phone: '+1 555 010 2010', consent: false }, {});
  assert.equal(result.ok, false);
  assert.ok(result.errors.consent);
});

test('creates a browser-local demo record with an ISO timestamp', () => {
  const now = new Date('2026-07-20T12:00:00.000Z');
  const result = createDemoLead(
    { name: 'Alex Kim', phone: '+1 555 010 2010', consent: true },
    { purchaseMode: 'installment', selectedPaint: 'Onyx Black', interests: ['cabin'] },
    now,
  );
  assert.equal(result.ok, true);
  assert.equal(result.record.storage, 'local-browser-demo');
  assert.equal(result.record.createdAt, now.toISOString());
});

test('creates a concise lead summary without claiming CRM transmission', () => {
  const summary = createLeadSummary({
    interests: ['cabin', 'cargo'],
    selectedPaint: 'Onyx Black',
    purchaseMode: 'installment',
    estimatedMonthlyPayment: '$1,541',
  });
  assert.match(summary, /cabin, cargo/);
  assert.doesNotMatch(summary, /sent|submitted/i);
});
