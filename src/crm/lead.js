export const DEMO_LEAD_STORAGE_KEY = 'auto-gallery-demo-leads-v1';

export function validateLeadInput(input) {
  const name = String(input?.name || '').trim().slice(0, 80);
  const phone = String(input?.phone || '').trim().slice(0, 32);
  const consent = input?.consent === true;
  const errors = {};

  if (name.length < 2) errors.name = 'Enter a name with at least two characters.';
  if (!/^\+?[0-9 ()-]{7,24}$/.test(phone)) errors.phone = 'Enter an international phone number.';
  if (!consent) errors.consent = 'Consent is required to create a local demo record.';

  return { valid: Object.keys(errors).length === 0, errors, values: { name, phone, consent } };
}

export function createDemoLead(input, context, now = new Date()) {
  const validation = validateLeadInput(input);
  if (!validation.valid) return { ok: false, errors: validation.errors };

  return {
    ok: true,
    record: {
      id: `DEMO-${now.getTime().toString().slice(-7)}`,
      name: validation.values.name,
      phone: validation.values.phone,
      purchaseMode: context.purchaseMode,
      selectedPaint: context.selectedPaint,
      estimatedMonthlyPayment: context.estimatedMonthlyPayment ?? null,
      interests: Array.isArray(context.interests) ? context.interests.slice(0, 6) : [],
      createdAt: now.toISOString(),
      storage: 'local-browser-demo',
    },
  };
}

export function createLeadSummary(context) {
  const interests = Array.isArray(context?.interests) && context.interests.length
    ? context.interests.join(', ')
    : 'general vehicle exploration';
  return [
    `Interest: ${interests}.`,
    `Paint: ${context?.selectedPaint || 'not selected'}.`,
    `Purchase path: ${context?.purchaseMode || 'not selected'}.`,
    context?.estimatedMonthlyPayment
      ? `Illustrative monthly payment: ${context.estimatedMonthlyPayment}.`
      : 'Illustrative payment: not calculated.',
  ].join(' ');
}

