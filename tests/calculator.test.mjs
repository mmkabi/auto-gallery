import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateDemoPayment, validateFinanceInputs } from '../src/financing/calculator.js';

test('calculates a valid illustrative monthly payment', () => {
  const result = calculateDemoPayment({ vehiclePrice: 85000, downPayment: 20000, months: 48, annualRate: 6.5 });
  assert.equal(result.ok, true);
  assert.ok(result.monthlyPayment > 1500 && result.monthlyPayment < 1600);
  assert.match(result.disclaimer, /not a financing offer/i);
});

test('rejects a down payment above the vehicle price', () => {
  const result = validateFinanceInputs({ vehiclePrice: 50000, downPayment: 60000, months: 36, annualRate: 5 });
  assert.equal(result.valid, false);
  assert.match(result.errors.downPayment, /cannot exceed/i);
});
