import { composeKnowledgeAnswer, QUICK_ACTION_BY_HOTSPOT } from '../data/vehicleKnowledge.js';

const ROUTES = Object.freeze([
  ['family', ['family', 'children', 'five people', 'seven people', 'third row', 'parents']],
  ['offroad', ['off road', 'off-road', 'weekend trail', 'trail', 'terrain', 'rock', 'sand', 'mud']],
  ['cabin', ['cabin', 'interior', 'dashboard', 'seat', 'steering', 'inside']],
  ['cargo', ['cargo', 'luggage', 'trunk', 'rear storage', 'load space']],
  ['safety', ['safety', 'brake', 'airbag', 'sensor', 'collision', 'cruise']],
  ['wheels', ['wheel', 'tire', 'tyre', 'rim', 'suspension']],
  ['powertrain', ['engine', 'powertrain', 'motor', 'turbo', 'transmission', 'torque']],
  ['finance', ['finance', 'payment', 'monthly', 'down payment', 'interest', 'budget', 'price']],
  ['urban', ['city', 'urban', 'parking', 'commute']],
  ['comfort', ['comfort', 'quiet', 'ride', 'luxury']],
  ['technology', ['technology', 'screen', 'camera', 'digital', 'connected']],
  ['dimensions', ['dimension', 'length', 'width', 'height', 'garage']],
  ['followup', ['follow up', 'call me', 'contact', 'save', 'lead']],
]);

export function normalizeEnglishInput(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9+.%\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function detectOfflineIntent(message, context = {}) {
  const normalized = normalizeEnglishInput(message);
  for (const [intent, terms] of ROUTES) {
    if (terms.some((term) => normalized.includes(term))) return intent;
  }

  const hotspotMap = { powertrain: 'powertrain', cabin: 'cabin', wheel: 'wheels', cargo: 'cargo', safety: 'safety' };
  return hotspotMap[context.activeHotspot] || 'unknown';
}

export function getOfflineReply(message, context = {}) {
  const intent = detectOfflineIntent(message, context);
  const sceneNote = context.activeHotspot
    ? `Current scene context: the ${context.activeHotspot} area is selected.`
    : '';
  return { intent, text: composeKnowledgeAnswer(intent, sceneNote) };
}

export function getOfflineTourActions(message) {
  const normalized = normalizeEnglishInput(message);
  const actions = [{ name: 'return_to_exterior', args: {} }];

  if (/(family|children|five people|third row)/.test(normalized)) {
    actions.push(
      { name: 'open_vehicle_door', args: { door: 'driver' } },
      { name: 'enter_driver_cabin', args: {} },
    );
  }

  if (/(off road|off-road|trail|terrain|rock|sand|mud)/.test(normalized)) {
    actions.push(
      { name: 'focus_vehicle_area', args: { area: 'wheel' } },
      { name: 'demonstrate_suspension_mode', args: { mode: 'rock' } },
    );
  }

  if (/(cargo|luggage|trunk|load space)/.test(normalized)) {
    actions.push({ name: 'show_cargo_area', args: { visible: true } });
  }

  if (/(payment|monthly|budget|finance|down payment)/.test(normalized)) {
    actions.push({
      name: 'calculate_demo_payment',
      args: { vehiclePrice: 85000, downPayment: 20000, months: 48, annualRate: 6.5 },
    });
  }

  return actions.slice(0, 6);
}

export function getQuickPromptForHotspot(hotspot) {
  return QUICK_ACTION_BY_HOTSPOT[hotspot] || '';
}

export function getOfflineIntentCount() {
  return ROUTES.length + 1;
}

