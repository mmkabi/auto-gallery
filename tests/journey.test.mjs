import assert from 'node:assert/strict';
import test from 'node:test';
import { getOfflineReply, getOfflineTourActions } from '../src/ai/localAssistant.js';
import { validateLyraToolCall } from '../src/ai/toolContracts.js';
import { createDemoLead, createLeadSummary } from '../src/crm/lead.js';
import { calculateDemoPayment } from '../src/financing/calculator.js';

const customerRequest =
  'I have a family of five, travel off-road on weekend trails, and want a manageable monthly payment.';

test('personalized fallback journey produces bounded valid scene tools', () => {
  const reply = getOfflineReply(customerRequest, { activeHotspot: 'cabin' });
  const actions = getOfflineTourActions(customerRequest);

  assert.equal(reply.intent, 'family');
  assert.ok(actions.length <= 6);
  assert.ok(actions.some((action) => action.name === 'enter_driver_cabin'));
  assert.ok(actions.some((action) => action.name === 'demonstrate_suspension_mode'));
  assert.ok(actions.some((action) => action.name === 'calculate_demo_payment'));
  actions.forEach((action) => assert.equal(validateLyraToolCall(action.name, action.args).valid, true));
});

test('demonstration payment can flow into a consent-based local lead summary', () => {
  const payment = calculateDemoPayment({
    vehiclePrice: 85000,
    downPayment: 20000,
    months: 48,
    annualRate: 6.5,
  });
  assert.equal(payment.ok, true);

  const lead = createDemoLead(
    { name: 'Alex Kim', phone: '+1 555 010 2026', consent: true },
    {
      purchaseMode: 'installment',
      selectedPaint: 'Onyx Black',
      estimatedMonthlyPayment: `$${Math.round(payment.monthlyPayment).toLocaleString('en-US')}`,
      interests: ['cabin', 'off-road'],
    },
    new Date('2026-07-20T12:00:00.000Z'),
  );

  assert.equal(lead.ok, true);
  const summary = createLeadSummary(lead.record);
  assert.match(summary, /cabin, off-road/);
  assert.doesNotMatch(summary, /sent|submitted/i);
});
