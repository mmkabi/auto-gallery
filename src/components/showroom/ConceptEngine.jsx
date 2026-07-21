export const CONCEPT_ENGINE_HOTSPOTS = [
  {
    id: 'v6',
    label: 'Core unit',
    title: 'Conceptual power unit',
    text: 'A conceptual layout used to explain high-level system relationships.',
    value: 'Educational visualization only; it is not an engineering model.',
  },
  {
    id: 'turbo',
    label: 'Airflow system',
    title: 'Conceptual induction system',
    text: 'A conceptual visualization of intake airflow.',
    value: 'Useful for explaining relationships without asserting production specifications.',
  },
  {
    id: 'air',
    label: 'Air path',
    title: 'Conceptual intake flow',
    text: 'Light paths illustrate how an intake-flow story can be presented.',
    value: 'The visual does not represent measured airflow.',
  },
  {
    id: 'cooling',
    label: 'Cooling',
    title: 'Conceptual radiator and fan',
    text: 'A simple radiator, fan, and cooling-path presentation.',
    value: 'Production thermal performance is not modeled.',
  },
  {
    id: 'power',
    label: 'Power flow',
    title: 'Conceptual power path',
    text: 'A conceptual path connects the powertrain and transmission story.',
    value: 'This is a communication aid rather than a mechanical simulation.',
  },
  {
    id: 'gearbox',
    label: 'Transmission',
    title: 'Conceptual transmission module',
    text: 'A visual module used to explain power-management concepts.',
    value: 'No production gear count or performance claim is made.',
  },
];

function makeMaterial(THREE, options) {
  return new THREE.MeshStandardMaterial({
    roughness: 0.42,
    metalness: 0.62,
    ...options,
  });
}

function createCylinderBetween(THREE, start, end, radius, material, radialSegments = 18) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(radius, radius, length, radialSegments, 1);
  const mesh = new THREE.Mesh(geometry, material);
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  mesh.position.copy(midpoint);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

function createLabelPlane(THREE, text, position) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  context.fillStyle = 'rgba(8, 9, 11, 0.72)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = 'rgba(216, 182, 109, 0.8)';
  context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  context.fillStyle = '#f7e7bd';
  context.font = 'bold 24px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(24, 6), material);
  mesh.position.copy(position);
  mesh.name = `EngineLabel_${text}`;
  return mesh;
}

export function createConceptEngine(THREE) {
  const group = new THREE.Group();
  group.name = 'ConceptPowertrain_Demo';
  group.visible = false;

  const darkMetal = makeMaterial(THREE, { color: 0x16191c, roughness: 0.36, metalness: 0.78 });
  const brushed = makeMaterial(THREE, { color: 0x85837d, roughness: 0.32, metalness: 0.86 });
  const blackRubber = makeMaterial(THREE, { color: 0x050607, roughness: 0.72, metalness: 0.08 });
  const champagne = makeMaterial(THREE, { color: 0xd8b66d, roughness: 0.28, metalness: 0.7 });
  const blueGlow = new THREE.MeshBasicMaterial({ color: 0x79b7ff, transparent: true, opacity: 0.72 });
  const goldGlow = new THREE.MeshBasicMaterial({ color: 0xd8b66d, transparent: true, opacity: 0.64 });

  const engineBlock = new THREE.Mesh(new THREE.BoxGeometry(44, 18, 18), darkMetal);
  engineBlock.name = 'ConceptEngine_MainPowerUnit';
  engineBlock.position.set(0, 0, 0);
  group.add(engineBlock);

  const topCover = new THREE.Mesh(new THREE.BoxGeometry(36, 8, 8), brushed);
  topCover.name = 'ConceptEngine_TopCover';
  topCover.position.set(0, 9.5, 0);
  group.add(topCover);

  const cylinderRows = [-8, 8].flatMap((xOffset) =>
    [-12, 0, 12].map((zOffset) => {
      const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 14, 22), brushed);
      cylinder.name = 'ConceptEngine_CoreDetail';
      cylinder.rotation.z = Math.PI / 2;
      cylinder.position.set(xOffset, 1.5, zOffset);
      return cylinder;
    }),
  );
  cylinderRows.forEach((mesh) => group.add(mesh));

  [-31, 31].forEach((xOffset, index) => {
    const turbo = new THREE.Mesh(new THREE.TorusGeometry(7.4, 1.8, 16, 40), champagne);
    turbo.name = index === 0 ? 'ConceptEngine_LeftAirModule' : 'ConceptEngine_RightAirModule';
    turbo.rotation.y = Math.PI / 2;
    turbo.position.set(xOffset, 2, -10);
    group.add(turbo);

    const compressor = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 5, 28), brushed);
    compressor.name = 'ConceptEngine_TurboCompressorHousing';
    compressor.rotation.z = Math.PI / 2;
    compressor.position.set(xOffset, 2, -10);
    group.add(compressor);
  });

  const intakeLeft = createCylinderBetween(
    THREE,
    new THREE.Vector3(-38, 4, -26),
    new THREE.Vector3(-14, 7, -8),
    1.8,
    blackRubber,
  );
  intakeLeft.name = 'ConceptEngine_LeftAirIntakePipe';
  const intakeRight = createCylinderBetween(
    THREE,
    new THREE.Vector3(38, 4, -26),
    new THREE.Vector3(14, 7, -8),
    1.8,
    blackRubber,
  );
  intakeRight.name = 'ConceptEngine_RightAirIntakePipe';
  group.add(intakeLeft, intakeRight);

  const radiator = new THREE.Mesh(new THREE.BoxGeometry(54, 22, 3), brushed);
  radiator.name = 'ConceptEngine_ConceptRadiator';
  radiator.position.set(0, 0, -34);
  group.add(radiator);

  const fan = new THREE.Group();
  fan.name = 'ConceptEngine_CoolingFanAnimated';
  fan.position.set(0, 0, -30);
  for (let i = 0; i < 7; i += 1) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(2.3, 12, 0.9), blackRubber);
    blade.position.y = 5.5;
    blade.rotation.z = (i / 7) * Math.PI * 2;
    fan.add(blade);
  }
  group.add(fan);
  group.userData.fan = fan;

  const battery = new THREE.Mesh(new THREE.BoxGeometry(13, 9, 10), blackRubber);
  battery.name = 'ConceptEngine_BatteryModule';
  battery.position.set(-28, -3, 19);
  group.add(battery);

  const tank = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 12, 22), brushed);
  tank.name = 'ConceptEngine_SideReservoir';
  tank.position.set(28, -3, 20);
  tank.rotation.z = Math.PI / 2;
  group.add(tank);

  const gearbox = new THREE.Mesh(new THREE.BoxGeometry(20, 14, 16), darkMetal);
  gearbox.name = 'ConceptEngine_10SpeedGearboxConcept';
  gearbox.position.set(0, -2, 34);
  group.add(gearbox);

  const powerShaft = createCylinderBetween(
    THREE,
    new THREE.Vector3(0, -1, 10),
    new THREE.Vector3(0, -1, 46),
    1.6,
    champagne,
    20,
  );
  powerShaft.name = 'ConceptEngine_PowerTransferPath';
  group.add(powerShaft);

  for (let i = 0; i < 6; i += 1) {
    const flow = createCylinderBetween(
      THREE,
      new THREE.Vector3(-42 + i * 16, 15 + Math.sin(i) * 2, -40),
      new THREE.Vector3(-32 + i * 13, 12, -14),
      0.45,
      i % 2 ? blueGlow : goldGlow,
      10,
    );
    flow.name = 'ConceptEngine_AnimatedAirPowerFlow';
    group.add(flow);
  }

  group.add(
    createLabelPlane(THREE, 'CORE', new THREE.Vector3(0, 22, 0)),
    createLabelPlane(THREE, 'AIRFLOW', new THREE.Vector3(0, 18, -22)),
    createLabelPlane(THREE, 'DRIVE', new THREE.Vector3(0, 13, 40)),
  );

  group.userData.hotspots = CONCEPT_ENGINE_HOTSPOTS;
  group.userData.update = (delta) => {
    fan.rotation.z += delta * 5;
    group.traverse((node) => {
      if (node.name === 'ConceptEngine_AnimatedAirPowerFlow' && node.material) {
        node.material.opacity = 0.42 + Math.sin(performance.now() * 0.004 + node.id) * 0.2;
      }
    });
  };

  return group;
}
