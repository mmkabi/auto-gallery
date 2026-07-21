const FINANCE_LIMITS = Object.freeze({
  vehiclePrice: { min: 1000, max: 1000000 },
  downPayment: { min: 0, max: 1000000 },
  months: { min: 1, max: 120 },
  annualRate: { min: 0, max: 40 },
});

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function validateFinanceInputs(input) {
  const values = {
    vehiclePrice: finiteNumber(input?.vehiclePrice),
    downPayment: finiteNumber(input?.downPayment),
    months: finiteNumber(input?.months),
    annualRate: finiteNumber(input?.annualRate),
  };
  const errors = {};

  for (const [key, limits] of Object.entries(FINANCE_LIMITS)) {
    const value = values[key];
    if (value === null || value < limits.min || value > limits.max) {
      errors[key] = `Enter a value from ${limits.min} to ${limits.max}.`;
    }
  }

  if (values.months !== null && !Number.isInteger(values.months)) {
    errors.months = 'Term must be a whole number of months.';
  }

  if (
    values.vehiclePrice !== null &&
    values.downPayment !== null &&
    values.downPayment > values.vehiclePrice
  ) {
    errors.downPayment = 'Down payment cannot exceed the demo vehicle price.';
  }

  return { valid: Object.keys(errors).length === 0, errors, values };
}

export function calculateDemoPayment(input) {
  const validation = validateFinanceInputs(input);
  if (!validation.valid) {
    return { ok: false, errors: validation.errors, monthlyPayment: null };
  }

  const { vehiclePrice, downPayment, months, annualRate } = validation.values;
  const principal = vehiclePrice - downPayment;
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = monthlyRate === 0
    ? principal / months
    : (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);

  return {
    ok: true,
    values: validation.values,
    principal,
    monthlyPayment,
    disclaimer: 'Demonstration only. This is not a financing offer or approval.',
  };
}

export function formatDemoCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

