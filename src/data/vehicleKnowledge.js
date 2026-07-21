const TRANSPARENCY_NOTE =
  'Equipment and specifications vary by vehicle, model year, trim, and market. This competition build uses a third-party concept asset and does not represent an official manufacturer configuration.';

export const VERIFIED_ASSET_FACTS = Object.freeze({
  vehicleLabel: 'Premium SUV Concept',
  cabinNodes: ['Interior', 'Seats', 'Dashboard', 'SteeringWheel'],
  independentSideDoors: ['DoorFrLeft', 'DoorFrRight', 'DoorRearLeft', 'DoorRearRight'],
  independentWheelNodes: ['WheelFrLeft', 'WheelFrRight', 'WheelRearLeft', 'WheelRearRight'],
  hasRealEngineMesh: false,
  cargoBehavior: 'The rear hatch mesh is hidden temporarily for cargo inspection; no hatch-opening claim is made.',
});

export const INITIAL_LYRA_MESSAGE =
  'Welcome. I am Lyra, the Auto Gallery AI Vehicle Concierge. Tell me how you plan to use the vehicle, or explore the cabin, cargo area, wheels, and demonstration payment tools manually.';

export const QUICK_ACTION_BY_HOTSPOT = Object.freeze({
  engine: 'Explain the conceptual powertrain view.',
  cabin: 'Show me how the cabin supports everyday comfort.',
  wheel: 'Explain the wheel and suspension demonstration.',
  safety: 'What can I review in the safety demonstration?',
  cargo: 'Show me the cargo area and its limitations.',
});

export const KNOWLEDGE = Object.freeze({
  family: {
    direct: 'The real 3D asset includes a multi-row cabin, separate seats, dashboard, and steering wheel groups that can be inspected from the driver position.',
    relevance: 'For a family, the useful next step is to inspect access through the side doors, cabin layout, and cargo space rather than rely on an unverified capacity claim.',
    action: 'I can open the driver door, enter the cabin, and then show the cargo area.',
  },
  offroad: {
    direct: 'This experience includes visual wheel motion, steering, and demonstration suspension states for smooth, rocky, and sloped terrain.',
    relevance: 'These visuals help explain how wheel placement and body movement affect confidence on uneven surfaces, but they are not a physics simulation.',
    action: 'I can focus on the wheels and run the rocky-terrain suspension demonstration.',
  },
  cabin: {
    direct: "The cabin view uses the asset's real Interior, Seats, Dashboard, and SteeringWheel nodes.",
    relevance: 'Moving to the driver position gives a better sense of sightlines, dashboard reach, and front-seat space than an exterior-only viewer.',
    action: 'I can move the camera to the driver position now.',
  },
  cargo: {
    direct: 'Cargo inspection moves the camera to the rear and temporarily hides the rear hatch mesh so the interior remains visible.',
    relevance: 'This avoids presenting a broken hatch animation while still allowing a useful view of the rear seating and load area.',
    action: 'I can open the cargo inspection view.',
  },
  safety: {
    direct: 'The safety hotspot is an educational presentation area, not a claim that a specific production safety package is included.',
    relevance: 'A real commerce deployment would connect this area to verified trim-specific equipment and source citations.',
    action: 'I can focus the safety area and outline what should be verified with a sales specialist.',
  },
  wheels: {
    direct: 'Each wheel is an independent node, with separate brake groups available in the source hierarchy.',
    relevance: 'That separation allows steering and rotation demonstrations without moving the entire vehicle mesh.',
    action: 'I can focus on a front wheel and demonstrate steering or rotation.',
  },
  powertrain: {
    direct: 'The source vehicle does not contain a real engine mesh. Auto Gallery therefore uses a clearly labeled conceptual V6 and power-flow visualization.',
    relevance: 'The concept helps explain system relationships without pretending to be an exact engineering model.',
    action: 'I can open the transparent conceptual powertrain view.',
  },
  finance: {
    direct: 'The payment calculator creates an illustrative USD scenario from a demo price, down payment, term, and interest rate.',
    relevance: 'It helps a customer compare assumptions before speaking with a qualified sales or finance specialist.',
    action: 'I can calculate a sample scenario, but it is not a financing offer or approval.',
  },
  urban: {
    direct: 'For urban use, the most useful checks are exterior dimensions, visibility from the driver position, and low-speed maneuver context.',
    relevance: 'A large vehicle can provide space while also requiring careful parking and access planning.',
    action: 'I can show the exterior, cabin sightline, and wheel steering views.',
  },
  comfort: {
    direct: 'The detailed cabin asset allows visual inspection of seating surfaces, dashboard layout, and driver controls.',
    relevance: 'Visual inspection supports an informed shortlist, but comfort still requires an in-person evaluation.',
    action: 'I can enter the cabin and focus on the seating area.',
  },
  technology: {
    direct: 'Auto Gallery demonstrates technology through contextual hotspots, guided camera movement, scene controls, and a verified knowledge layer.',
    relevance: 'In production, this layer can be connected to official inventory and trim data rather than hardcoded claims.',
    action: 'Choose a feature area and I will connect the explanation to the 3D scene.',
  },
  dimensions: {
    direct: 'Exact production dimensions are intentionally not asserted in this competition build because the asset license and official trim source are not verified.',
    relevance: 'Parking and access decisions should use official documentation for the exact vehicle being considered.',
    action: 'I can still provide a visual exterior overview and driver-position perspective.',
  },
  followup: {
    direct: 'I can prepare a concise summary of the paint, features, and demonstration payment you explored.',
    relevance: 'The competition build stores that record only in this browser; it is not sent to a production CRM.',
    action: 'Review the summary and consent before creating a local demo record.',
  },
  unknown: {
    direct: 'I can help with family use, cabin comfort, cargo, wheels, off-road demonstrations, safety review, technology, or an illustrative payment scenario.',
    relevance: 'A specific priority lets me connect the answer to the most useful 3D view.',
    action: 'Tell me what matters most, or choose one of the suggested questions.',
  },
});

export function composeKnowledgeAnswer(topic, sceneNote = '') {
  const item = KNOWLEDGE[topic] || KNOWLEDGE.unknown;
  return [item.direct, item.relevance, item.action, sceneNote, TRANSPARENCY_NOTE].filter(Boolean).join('\n\n');
}
