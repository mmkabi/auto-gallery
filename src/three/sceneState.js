const DOOR_IDS = Object.freeze(['driver', 'frontPassenger', 'rearLeft', 'rearRight']);

export function createInitialSceneState() {
  return {
    cameraMode: 'exterior',
    selectedPaint: 'onyx',
    openDoors: [],
    activeHotspot: null,
    cabinActive: false,
    currentDemonstration: null,
    renderQuality: 'normal',
    modelLoaded: false,
    assistantMode: 'guided',
  };
}

export function serializeSceneContext(state) {
  const source = state && typeof state === 'object' ? state : {};
  return {
    cameraMode: String(source.cameraMode || 'exterior').slice(0, 24),
    selectedPaint: String(source.selectedPaint || 'onyx').slice(0, 24),
    openDoors: Array.isArray(source.openDoors)
      ? source.openDoors.filter((door) => DOOR_IDS.includes(door)).slice(0, DOOR_IDS.length)
      : [],
    activeHotspot: source.activeHotspot ? String(source.activeHotspot).slice(0, 24) : null,
    cabinActive: Boolean(source.cabinActive),
    currentDemonstration: source.currentDemonstration
      ? String(source.currentDemonstration).slice(0, 48)
      : null,
    financing: source.financing && typeof source.financing === 'object'
      ? {
        vehiclePrice: Number(source.financing.vehiclePrice) || 0,
        downPayment: Number(source.financing.downPayment) || 0,
        months: Number(source.financing.months) || 0,
        annualRate: Number(source.financing.annualRate) || 0,
      }
      : null,
    renderQuality: String(source.renderQuality || 'normal').slice(0, 16),
    modelLoaded: Boolean(source.modelLoaded),
    assistantMode: String(source.assistantMode || 'guided').slice(0, 16),
  };
}

export function reduceSceneState(state, action) {
  const current = { ...createInitialSceneState(), ...state };
  switch (action?.type) {
    case 'paint/set':
      return { ...current, selectedPaint: action.paint };
    case 'door/set': {
      const doors = new Set(current.openDoors);
      if (action.open) doors.add(action.door);
      else doors.delete(action.door);
      return { ...current, openDoors: [...doors].filter((door) => DOOR_IDS.includes(door)) };
    }
    case 'camera/cabin':
      return { ...current, cameraMode: 'cabin', cabinActive: true, activeHotspot: 'cabin' };
    case 'camera/exterior':
      return { ...current, cameraMode: 'exterior', cabinActive: false, activeHotspot: null };
    case 'experience/reset':
      return createInitialSceneState();
    default:
      return current;
  }
}
