const stringEnum = (values) => ({ type: 'string', enum: values });
const numberRange = (minimum, maximum) => ({ type: 'number', minimum, maximum });
const booleanValue = () => ({ type: 'boolean' });

function tool(name, description, properties = {}, required = Object.keys(properties)) {
  return Object.freeze({
    type: 'function',
    name,
    description,
    strict: true,
    parameters: {
      type: 'object',
      properties,
      required,
      additionalProperties: false,
    },
  });
}

export const LYRA_TOOL_DEFINITIONS = Object.freeze([
  tool('focus_vehicle_area', 'Move the camera to an approved vehicle area.', {
    area: stringEnum(['exterior', 'cabin', 'wheel', 'cargo', 'safety', 'powertrain']),
  }),
  tool('set_vehicle_color', 'Apply an approved paint preset.', {
    color: stringEnum(['onyx']),
  }),
  tool('open_vehicle_door', 'Open one independently rigged side door.', {
    door: stringEnum(['driver', 'frontPassenger', 'rearLeft', 'rearRight']),
  }),
  tool('close_vehicle_door', 'Close one independently rigged side door.', {
    door: stringEnum(['driver', 'frontPassenger', 'rearLeft', 'rearRight']),
  }),
  tool('toggle_all_doors', 'Open or close all independently rigged side doors.', {
    open: booleanValue(),
  }),
  tool('enter_driver_cabin', 'Move the camera into the driver cabin.'),
  tool('return_to_exterior', 'Return the camera to the exterior hero view.'),
  tool('show_cargo_area', 'Show or close the safe cargo inspection view.', {
    visible: booleanValue(),
  }),
  tool('show_powertrain_concept', 'Show or close the explicitly conceptual powertrain visualization.', {
    visible: booleanValue(),
  }),
  tool('show_safety_features', 'Focus the safety education hotspot.'),
  tool('demonstrate_steering', 'Set the front wheels and steering wheel direction.', {
    direction: stringEnum(['left', 'straight', 'right']),
  }),
  tool('demonstrate_wheel_motion', 'Start or stop wheel rotation.', {
    enabled: booleanValue(),
  }),
  tool('demonstrate_suspension_mode', 'Set an approved visual suspension mode.', {
    mode: stringEnum(['off', 'smooth', 'rock', 'slope']),
  }),
  tool('calculate_demo_payment', 'Calculate an illustrative USD payment. Never call it an offer.', {
    vehiclePrice: numberRange(1000, 1000000),
    downPayment: numberRange(0, 1000000),
    months: { type: 'integer', minimum: 1, maximum: 120 },
    annualRate: numberRange(0, 40),
  }),
  tool('prepare_lead_summary', 'Prepare a reviewable local lead summary. This does not submit a lead.'),
  tool('reset_vehicle_experience', 'Reset camera, doors, wheels, suspension, and feature state.'),
]);

export const LYRA_TOOL_NAMES = Object.freeze(LYRA_TOOL_DEFINITIONS.map((entry) => entry.name));

function validateValue(schema, value) {
  if (schema.type === 'string') return typeof value === 'string' && (!schema.enum || schema.enum.includes(value));
  if (schema.type === 'boolean') return typeof value === 'boolean';
  if (schema.type === 'number' || schema.type === 'integer') {
    return Number.isFinite(value)
      && (schema.type !== 'integer' || Number.isInteger(value))
      && (schema.minimum === undefined || value >= schema.minimum)
      && (schema.maximum === undefined || value <= schema.maximum);
  }
  return false;
}

export function validateLyraToolCall(name, args) {
  const definition = LYRA_TOOL_DEFINITIONS.find((entry) => entry.name === name);
  if (!definition || !args || typeof args !== 'object' || Array.isArray(args)) {
    return { valid: false, error: 'Unknown tool or invalid argument object.' };
  }

  const schema = definition.parameters;
  const keys = Object.keys(args);
  if (keys.some((key) => !(key in schema.properties))) {
    return { valid: false, error: 'Unexpected tool argument.' };
  }

  for (const required of schema.required) {
    if (!(required in args)) return { valid: false, error: `Missing required argument: ${required}.` };
  }

  for (const [key, value] of Object.entries(args)) {
    if (!validateValue(schema.properties[key], value)) {
      return { valid: false, error: `Invalid value for ${key}.` };
    }
  }

  if (name === 'calculate_demo_payment' && args.downPayment > args.vehiclePrice) {
    return { valid: false, error: 'Down payment cannot exceed vehicle price.' };
  }

  return { valid: true, definition, args };
}

export function parseLyraToolArguments(rawArguments) {
  try {
    const args = typeof rawArguments === 'string' ? JSON.parse(rawArguments) : rawArguments;
    return { ok: true, args };
  } catch {
    return { ok: false, error: 'Tool arguments were not valid JSON.' };
  }
}
