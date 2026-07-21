export const PRODUCT = Object.freeze({
  name: 'Auto Gallery',
  assistantName: 'Lyra',
  assistantDescriptor: 'AI Vehicle Concierge',
  tagline: 'Explore. Understand. Decide.',
  description:
    'An AI-powered 3D vehicle exploration and sales experience that connects product discovery, intelligent guidance, financing scenarios, and lead qualification in one interface.',
  vehicleName: 'Premium SUV Concept',
});

export const MODEL_ASSET = Object.freeze({
  url: '/models/premium-suv-low/model.gltf',
  label: 'Optimized LOW / glTF',
  format: 'glTF with Meshopt and standard JPEG textures',
  sourceTrianglesApprox: 474676,
  sourceMeshGroups: 22,
  sourceMaterials: 47,
  sourceTextures: 15,
  optimizedTextures: 14,
  hasRealEngineMesh: false,
  interiorNodes: ['Interior', 'Seats', 'Dashboard', 'SteeringWheel'],
});

export const BODY_COLORS = Object.freeze([
  { id: 'onyx', label: 'Onyx Black', value: '#090a0c' },
]);

export const RENDER_QUALITY_OPTIONS = Object.freeze([
  { id: 'normal', label: 'Performance' },
  { id: 'medium', label: 'Balanced' },
  { id: 'high', label: 'Quality' },
]);

export const HOTSPOTS = Object.freeze([
  { id: 'engine', label: 'Powertrain', title: 'Conceptual powertrain' },
  { id: 'cabin', label: 'Cabin', title: 'Cabin experience' },
  { id: 'wheel', label: 'Wheels', title: 'Wheels and braking' },
  { id: 'cargo', label: 'Cargo', title: 'Cargo area' },
  { id: 'safety', label: 'Safety', title: 'Safety overview' },
]);

export const DOOR_CONFIGS = Object.freeze([
  { id: 'driver', label: 'Driver door', mesh: 'DoorFrLeft', type: 'side', side: 1, openAngle: -0.78 },
  { id: 'frontPassenger', label: 'Front passenger door', mesh: 'DoorFrRight', type: 'side', side: -1, openAngle: 0.78 },
  { id: 'rearLeft', label: 'Left rear door', mesh: 'DoorRearLeft', type: 'side', side: 1, openAngle: -0.62 },
  { id: 'rearRight', label: 'Right rear door', mesh: 'DoorRearRight', type: 'side', side: -1, openAngle: 0.62 },
]);

export const WHEEL_CONFIGS = Object.freeze([
  { id: 'frontLeft', label: 'Front-left wheel', mesh: 'WheelFrLeft', front: true },
  { id: 'frontRight', label: 'Front-right wheel', mesh: 'WheelFrRight', front: true },
  { id: 'rearLeft', label: 'Rear-left wheel', mesh: 'WheelRearLeft', front: false },
  { id: 'rearRight', label: 'Rear-right wheel', mesh: 'WheelRearRight', front: false },
]);

export const DEMO_FINANCE_DEFAULTS = Object.freeze({
  vehiclePrice: 85000,
  downPayment: 20000,
  months: 48,
  annualRate: 6.5,
});
