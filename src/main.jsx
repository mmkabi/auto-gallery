import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { CONCEPT_ENGINE_HOTSPOTS, createConceptEngine } from './components/showroom/ConceptEngine.jsx';
import {
  getOfflineIntentCount,
  getOfflineReply,
  getOfflineTourActions,
  getQuickPromptForHotspot,
} from './ai/localAssistant.js';
import { validateLyraToolCall } from './ai/toolContracts.js';
import {
  BODY_COLORS,
  DEMO_FINANCE_DEFAULTS,
  DOOR_CONFIGS,
  HOTSPOTS,
  MODEL_ASSET,
  PRODUCT,
  RENDER_QUALITY_OPTIONS,
  WHEEL_CONFIGS,
} from './config/product.js';
import { createDemoLead } from './crm/lead.js';
import { INITIAL_LYRA_MESSAGE } from './data/vehicleKnowledge.js';
import { calculateDemoPayment, formatDemoCurrency } from './financing/calculator.js';
import { getPaintPreset } from './three/materials/paintSelection.js';
import { serializeSceneContext } from './three/sceneState.js';
import './styles.css';

const SEARCH_TERMS = [
  'body',
  'door',
  'hood',
  'engine',
  'seat',
  'dashboard',
  'steering',
  'interior',
  'wheel',
  'glass',
  'chassis',
];

const CLASSIFIERS = {
  body: ['body', 'paint', 'carbody'],
  glass: ['glass', 'wind', 'optic'],
  door: ['door'],
  interior: ['interior', 'seat', 'dashboard', 'steering', 'int'],
};

const BODY_MESH_NAMES = ['body', 'bodyfront', 'doorfrleft', 'doorfrright', 'doorrearleft', 'doorrearright', 'doorback'];
// BlackPaint carries the visible exterior shell in the converted GLB. The
// parent-group guard keeps same-name trim outside body/door groups untouched.
const BODY_PAINT_MATERIALS = ['carpaint', 'carbodytextured', 'blackpaint'];
const NON_DIM_MATERIALS = ['glass', 'wheel', 'tire', 'brake', 'light', 'int', 'chrome'];
const CARGO_HATCH_MESH_NAMES = ['DoorBack'];
const TIRE_MATERIALS = ['rubber', 'wheeltirebump'];


const STEERING_ANGLES = {
  left: 0.32,
  straight: 0,
  right: -0.32,
};
const API_STATUS_TEXT = {
  connected: 'Connected',
  connecting: 'Connecting',
  disabled: 'Live AI unavailable in this build',
  offline: 'Guided mode',
  unavailable: 'Guided mode',
};
const COMPETITION_DISCLOSURE = 'Auto Gallery uses a deterministic AI-guided demonstration in this competition build to ensure a reliable presentation. The live tool-calling architecture was validated separately and can be connected to a supported production AI provider.';
const GUIDED_STEP_TIMEOUT_MS = 2500;
const ANIMATION_TIME_SCALE = 2;
const GUIDED_DISPLAY_TIME_SCALE = 4;

function getDefaultRenderQuality() {
  return 'high';
}

function normalizeName(value) {
  return String(value ?? '').toLowerCase();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const INTERACTIVE_NODE_NAMES = new Set([
  'Body',
  'BodyFront',
  'DoorFrLeft',
  'DoorFrRight',
  'DoorRearLeft',
  'DoorRearRight',
  'DoorBack',
  'WheelFrLeft',
  'WheelFrRight',
  'WheelRearLeft',
  'WheelRearRight',
  'Interior',
  'Seats',
  'Dashboard',
  'SteeringWheel',
]);

function normalizeLoadedSceneGraph(root) {
  root.traverse((node) => {
    if (!node.isMesh || !INTERACTIVE_NODE_NAMES.has(node.parent?.name)) return;
    node.userData.sourceMeshName = node.name;
    node.userData.sourceGroupName = node.parent.name;
  });
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getRenderQualitySettings(qualityId) {
  const deviceRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  const settings = {
    normal: {
      pixelRatio: Math.min(deviceRatio, 0.78),
      exposure: 1.16,
      hotspotInterval: 120,
      engineLineStep: 0.006,
      conceptUpdateEvery: 2,
      fillLight: true,
      rimLight: false,
      cabinLight: false,
      grid: false,
      fogDensity: 0,
    },
    medium: {
      pixelRatio: Math.min(deviceRatio, 1),
      exposure: 1.22,
      hotspotInterval: 80,
      engineLineStep: 0.008,
      conceptUpdateEvery: 1,
      fillLight: true,
      rimLight: true,
      cabinLight: true,
      grid: true,
      fogDensity: 0,
    },
    high: {
      pixelRatio: Math.min(Math.max(deviceRatio, 1.25), 1.4),
      exposure: 1.3,
      hotspotInterval: 45,
      engineLineStep: 0.011,
      conceptUpdateEvery: 1,
      fillLight: true,
      rimLight: true,
      cabinLight: true,
      grid: true,
      fogDensity: 0.0007,
    },
  };

  return settings[qualityId] ?? settings.normal;
}

function applyRenderQuality(renderer, scene, mount, sceneParts, qualityId) {
  const settings = getRenderQualitySettings(qualityId);

  if (renderer) {
    renderer.setPixelRatio(settings.pixelRatio);
    renderer.toneMappingExposure = settings.exposure;
    const rect = mount?.getBoundingClientRect();
    if (rect?.width && rect?.height) {
      renderer.setSize(rect.width, rect.height);
    }
  }

  if (scene) {
    scene.fog = settings.fogDensity > 0 ? new THREE.FogExp2(0x5f646b, settings.fogDensity) : null;
  }

  if (sceneParts) {
    if (sceneParts.fillLight) {
      sceneParts.fillLight.visible = settings.fillLight;
    }
    if (sceneParts.rimLight) {
      sceneParts.rimLight.visible = settings.rimLight;
    }
    if (sceneParts.cabinLight) {
      sceneParts.cabinLight.visible = settings.cabinLight;
    }
    if (sceneParts.grid) {
      sceneParts.grid.visible = settings.grid;
    }
  }

  return settings;
}

function getMaterialArray(material) {
  if (!material) {
    return [];
  }

  return Array.isArray(material) ? material : [material];
}

function getMaterialNames(material) {
  return unique(getMaterialArray(material).map((entry) => entry?.name || 'material'));
}

function isBodyMeshName(name) {
  const normalized = normalizeName(name);
  return BODY_MESH_NAMES.some((needle) => normalized.includes(needle));
}

function isBodyPaintMaterial(material) {
  const normalized = normalizeName(material?.name);
  return BODY_PAINT_MATERIALS.some((needle) => normalized.includes(needle));
}

function collectModelInfo(model) {
  const meshes = [];
  const materials = new Map();
  const keywordHits = Object.fromEntries(SEARCH_TERMS.map((term) => [term, []]));
  let triangles = 0;

  model.traverse((node) => {
    if (!node.isMesh) {
      return;
    }

    const materialNames = getMaterialNames(node.material);
    materialNames.forEach((name) => {
      if (!materials.has(name)) {
        materials.set(name, {
          name,
          visible: true,
          wireframe: false,
        });
      }
    });

    const geometry = node.geometry;
    const triangleCount = geometry?.index
      ? Math.round(geometry.index.count / 3)
      : Math.round((geometry?.attributes?.position?.count ?? 0) / 3);
    triangles += triangleCount;

    const displayName = node.userData.sourceGroupName
      ? `${node.userData.sourceGroupName} / ${node.name}`
      : node.name;
    const searchable = normalizeName(`${displayName} ${materialNames.join(' ')}`);
    SEARCH_TERMS.forEach((term) => {
      if (searchable.includes(term)) {
        keywordHits[term].push(displayName || '(unnamed mesh)');
      }
    });

    meshes.push({
      id: node.uuid,
      name: displayName || '(unnamed mesh)',
      materialNames,
      triangles: triangleCount,
      visible: node.visible,
    });
  });

  return {
    meshes,
    materials: [...materials.values()],
    keywordHits,
    triangles,
  };
}

function getNamedMeshBounds(root) {
  const bounds = new Map();

  root.traverse((node) => {
    if (INTERACTIVE_NODE_NAMES.has(node.name)) {
      bounds.set(node.name, new THREE.Box3().setFromObject(node));
    }
  });

  return bounds;
}

function getBoxCenter(box) {
  if (!box || box.isEmpty()) {
    return null;
  }

  return box.getCenter(new THREE.Vector3());
}

function setMaterialsWireframe(root, isWireframe) {
  root?.traverse((node) => {
    if (!node.isMesh) {
      return;
    }

    getMaterialArray(node.material).filter(Boolean).forEach((material) => {
      material.wireframe = isWireframe;
      material.needsUpdate = true;
    });
  });
}

function setByClassifier(root, classifierKey, visible) {
  const needles = CLASSIFIERS[classifierKey] ?? [];
  root?.traverse((node) => {
    if (!node.isMesh) {
      return;
    }

    const materialNames = getMaterialNames(node.material).join(' ');
    const searchable = normalizeName(`${node.userData.sourceGroupName || ''} ${node.name} ${materialNames}`);
    if (needles.some((needle) => searchable.includes(needle))) {
      node.visible = visible;
    }
  });
}

function setEveryMesh(root, visible) {
  root?.traverse((node) => {
    if (node.isMesh) {
      node.visible = visible;
    }
  });
}

function prepareBodyPaintMaterials(root, color) {
  root.traverse((node) => {
    if (!node.isMesh || !isBodyMeshName(node.userData.sourceGroupName || node.name)) {
      return;
    }

    const cloneMaterial = (material) => {
      if (!isBodyPaintMaterial(material)) {
        return material;
      }

      const cloned = new THREE.MeshPhysicalMaterial({
        name: material.name,
        color: new THREE.Color(color),
        // Automotive paint is a clear-coated dielectric. Keeping metalness
        // moderate preserves bright paint colors without an HDR environment.
        metalness: 0.32,
        roughness: 0.24,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        normalMap: material.normalMap || null,
        roughnessMap: material.roughnessMap || null,
        metalnessMap: material.metalnessMap || null,
        aoMap: material.aoMap || null,
        envMap: material.envMap || null,
        transparent: material.transparent,
        opacity: material.opacity ?? 1,
        side: material.side,
      });
      cloned.name = material.name;
      cloned.map = null;
      cloned.userData = {
        ...cloned.userData,
        autoGalleryBodyPaint: true,
        originalMapName: material.map?.name || material.map?.source?.data?.src || '',
        originalOpacity: cloned.opacity ?? 1,
        originalTransparent: cloned.transparent,
      };
      cloned.needsUpdate = true;
      return cloned;
    };

    node.material = Array.isArray(node.material) ? node.material.map(cloneMaterial) : cloneMaterial(node.material);
  });
}

function neutralizeSteeringEmblem(root) {
  root.traverse((node) => {
    if (!node.isMesh || node.userData.sourceGroupName !== 'SteeringWheel') return;
    if (getMaterialArray(node.material).some((material) => normalizeName(material?.name) === 'intchrome')) {
      node.visible = false;
      node.userData.neutralizedSourceDetail = true;
    }
  });
}

function darkenTireMaterials(root) {
  root.traverse((node) => {
    const groupName = normalizeName(node.userData.sourceGroupName || node.parent?.name || node.name);
    if (!node.isMesh || !groupName.includes('wheel')) return;

    getMaterialArray(node.material).forEach((material) => {
      const materialName = normalizeName(material?.name);
      if (!material?.color || !TIRE_MATERIALS.some((name) => materialName === name)) return;

      material.color.set('#080808');
      material.map = null;
      material.metalness = 0;
      material.roughness = 0.98;
      material.envMapIntensity = 0.04;
      material.normalScale?.setScalar?.(0.42);
      material.needsUpdate = true;
    });
  });
}

function applyBodyColor(root, color) {
  let updatedMaterials = 0;
  root?.traverse((node) => {
    if (!node.isMesh) {
      return;
    }

    getMaterialArray(node.material).forEach((material) => {
      const belongsToBody = isBodyMeshName(node.userData.sourceGroupName || node.name);
      const isPaintSurface = material?.userData?.autoGalleryBodyPaint || isBodyPaintMaterial(material);
      if (belongsToBody && isPaintSurface && material?.color) {
        material.color.set(color);
        material.needsUpdate = true;
        updatedMaterials += 1;
      }
    });
  });
  return updatedMaterials;
}

function dimBodyForEngine(root, shouldDim) {
  root?.traverse((node) => {
    if (!node.isMesh || !isBodyMeshName(node.userData.sourceGroupName || node.name)) {
      return;
    }

    getMaterialArray(node.material).forEach((material) => {
      if (!material) {
        return;
      }

      const materialName = normalizeName(material.name);
      if (NON_DIM_MATERIALS.some((needle) => materialName.includes(needle))) {
        return;
      }

      if (material.userData.originalOpacity === undefined) {
        material.userData.originalOpacity = material.opacity ?? 1;
        material.userData.originalTransparent = material.transparent;
      }

      material.transparent = shouldDim || material.userData.originalTransparent;
      material.opacity = shouldDim ? 0.42 : material.userData.originalOpacity;
      material.needsUpdate = true;
    });
  });
}

function getSceneLandmarks(root, modelBox) {
  const meshBounds = getNamedMeshBounds(root);
  const size = modelBox.getSize(new THREE.Vector3());
  const center = modelBox.getCenter(new THREE.Vector3());
  const bodyFrontCenter = getBoxCenter(meshBounds.get('BodyFront'));
  const steeringCenter = getBoxCenter(meshBounds.get('SteeringWheel'));
  const dashboardCenter = getBoxCenter(meshBounds.get('Dashboard'));
  const seatsCenter = getBoxCenter(meshBounds.get('Seats'));
  const frontSign = bodyFrontCenter && bodyFrontCenter.z < center.z ? -1 : 1;
  const frontEdge = frontSign > 0 ? modelBox.max.z : modelBox.min.z;
  const rearEdge = frontSign > 0 ? modelBox.min.z : modelBox.max.z;

  return {
    center,
    size,
    frontSign,
    frontEdge,
    rearEdge,
    steeringCenter,
    dashboardCenter,
    seatsCenter,
    meshBounds,
  };
}

function getHotspotPositions(landmarks) {
  const { center, size, frontSign, frontEdge, steeringCenter, dashboardCenter } = landmarks;
  const cabinAnchor = steeringCenter ?? dashboardCenter ?? center;

  return {
    engine: new THREE.Vector3(center.x, center.y + size.y * 0.42, frontEdge - frontSign * size.z * 0.16),
    cabin: new THREE.Vector3(cabinAnchor.x, cabinAnchor.y + size.y * 0.18, cabinAnchor.z - frontSign * size.z * 0.04),
    wheel: new THREE.Vector3(center.x + size.x * 0.44, center.y + size.y * 0.18, frontEdge - frontSign * size.z * 0.22),
    cargo: new THREE.Vector3(center.x, center.y + size.y * 0.32, landmarks.rearEdge + frontSign * size.z * 0.12),
    safety: new THREE.Vector3(center.x - size.x * 0.42, center.y + size.y * 0.54, center.z - frontSign * size.z * 0.08),
  };
}

function getCameraPose(view, landmarks) {
  const { center, size, frontSign, frontEdge, steeringCenter, dashboardCenter } = landmarks;
  const maxSize = Math.max(size.x, size.y, size.z);
  const cabinAnchor = steeringCenter ?? dashboardCenter ?? center;

  if (view === 'front') {
    return {
      position: new THREE.Vector3(center.x + size.x * 0.08, center.y + size.y * 0.32, frontEdge + frontSign * size.z * 0.72),
      target: new THREE.Vector3(center.x, center.y + size.y * 0.28, frontEdge - frontSign * size.z * 0.11),
    };
  }

  if (view === 'engine') {
    return {
      position: new THREE.Vector3(center.x + size.x * 0.08, center.y + size.y * 0.62, frontEdge + frontSign * size.z * 0.34),
      target: new THREE.Vector3(center.x, center.y + size.y * 0.42, frontEdge - frontSign * size.z * 0.16),
    };
  }

  if (view === 'wheel') {
    const selectedWheel = landmarks.meshBounds?.get('WheelFrLeft') ?? landmarks.meshBounds?.get('WheelFrRight');
    const wheelCenter = getBoxCenter(selectedWheel);
    if (wheelCenter) {
      return {
        position: new THREE.Vector3(wheelCenter.x + size.x * 0.44, wheelCenter.y + size.y * 0.2, wheelCenter.z + frontSign * size.z * 0.18),
        target: wheelCenter,
      };
    }

    return {
      position: new THREE.Vector3(center.x + size.x * 0.72, center.y + size.y * 0.24, frontEdge + frontSign * size.z * 0.04),
      target: new THREE.Vector3(center.x + size.x * 0.39, center.y + size.y * 0.18, frontEdge - frontSign * size.z * 0.22),
    };
  }

  if (view === 'cargo') {
    return {
      position: new THREE.Vector3(center.x + size.x * 0.78, center.y + size.y * 0.46, landmarks.rearEdge - frontSign * size.z * 0.36),
      target: new THREE.Vector3(center.x, center.y + size.y * 0.28, landmarks.rearEdge + frontSign * size.z * 0.08),
    };
  }

  if (view === 'safety') {
    return {
      position: new THREE.Vector3(center.x - size.x * 0.78, center.y + size.y * 0.52, center.z + frontSign * size.z * 0.16),
      target: new THREE.Vector3(center.x, center.y + size.y * 0.42, center.z - frontSign * size.z * 0.08),
    };
  }

  if (view === 'cabin') {
    return {
      position: new THREE.Vector3(cabinAnchor.x - size.x * 0.2, cabinAnchor.y + size.y * 0.05, cabinAnchor.z - frontSign * size.z * 0.12),
      target: new THREE.Vector3(cabinAnchor.x + size.x * 0.03, cabinAnchor.y + size.y * 0.02, cabinAnchor.z + frontSign * size.z * 0.06),
    };
  }

  return {
    position: new THREE.Vector3(center.x + size.x * 2.2, center.y + size.y * 1.08, center.z + frontSign * maxSize * 1.28),
    target: new THREE.Vector3(center.x, center.y + size.y * 0.34, center.z),
  };
}

function configureControlsForView(controls, landmarks, view) {
  if (!controls) {
    return;
  }

  const maxSize = Math.max(landmarks.size.x, landmarks.size.y, landmarks.size.z);
  if (view === 'cabin') {
    controls.minDistance = maxSize * 0.018;
    controls.maxDistance = maxSize * 0.22;
    controls.minPolarAngle = Math.PI * 0.26;
    controls.maxPolarAngle = Math.PI * 0.76;
    controls.enablePan = false;
    return;
  }

  controls.minDistance = maxSize * 0.08;
  controls.maxDistance = maxSize * 3.2;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = Math.PI * 0.86;
  controls.enablePan = true;
}

function inspectDoorPivot(root) {
  let frontDoor = null;
  root.traverse((node) => {
    if (!frontDoor && node.isMesh && normalizeName(node.name).includes('doorfrleft')) {
      frontDoor = node;
    }
  });

  if (!frontDoor) {
    return {
      available: false,
      label: 'Front-door mesh was not found.',
    };
  }

  frontDoor.geometry.computeBoundingBox();
  const localCenter = frontDoor.geometry.boundingBox.getCenter(new THREE.Vector3());
  const distanceFromOrigin = localCenter.length();
  const localSize = frontDoor.geometry.boundingBox.getSize(new THREE.Vector3());
  const maxDoorSize = Math.max(localSize.x, localSize.y, localSize.z);

  if (distanceFromOrigin > maxDoorSize * 0.85) {
    return {
      available: false,
      label: 'The front-door pivot is unreliable because geometry is too far from its origin.',
    };
  }

  return {
    available: false,
    label: 'Door animation remains disabled until its pivot is verified.',
  };
}

function findMeshByName(root, meshName) {
  let groupMatch = null;
  let meshMatch = null;
  root.traverse((node) => {
    if (node.name !== meshName) return;
    if (node.isMesh && !meshMatch) meshMatch = node;
    if (!node.isMesh && !groupMatch) groupMatch = node;
  });
  return groupMatch || meshMatch;
}

function getBoxInParentSpace(object, parent) {
  parent.updateWorldMatrix(true, true);
  object.updateWorldMatrix(true, false);
  const worldBox = new THREE.Box3().setFromObject(object);
  const corners = [
    [worldBox.min.x, worldBox.min.y, worldBox.min.z],
    [worldBox.min.x, worldBox.min.y, worldBox.max.z],
    [worldBox.min.x, worldBox.max.y, worldBox.min.z],
    [worldBox.min.x, worldBox.max.y, worldBox.max.z],
    [worldBox.max.x, worldBox.min.y, worldBox.min.z],
    [worldBox.max.x, worldBox.min.y, worldBox.max.z],
    [worldBox.max.x, worldBox.max.y, worldBox.min.z],
    [worldBox.max.x, worldBox.max.y, worldBox.max.z],
  ];
  const localBox = new THREE.Box3();
  corners.forEach(([x, y, z]) => {
    localBox.expandByPoint(parent.worldToLocal(new THREE.Vector3(x, y, z)));
  });
  return localBox;
}

function roundVector(vector) {
  return [vector.x, vector.y, vector.z].map((value) => Number(value.toFixed(2)));
}

function boxSummary(box) {
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  return {
    min: roundVector(box.min),
    max: roundVector(box.max),
    center: roundVector(center),
    size: roundVector(size),
  };
}

function makeDiagnostic(part, mesh, parent, pivot, axis, animatable, reason = '') {
  const box = mesh ? getBoxInParentSpace(mesh, parent) : null;
  return {
    part,
    independent: Boolean(mesh),
    mesh: mesh?.name || 'none',
    boundingBox: box ? boxSummary(box) : null,
    axis,
    pivot: pivot ? roundVector(pivot) : null,
    animatable,
    reason,
  };
}

function collectRearHatchCandidates(root) {
  const modelBox = new THREE.Box3().setFromObject(root);
  const size = modelBox.getSize(new THREE.Vector3());
  const rearThreshold = modelBox.max.y - size.y * 0.18;
  const candidates = [];

  root.traverse((node) => {
    if (!node.isMesh) {
      return;
    }

    const box = new THREE.Box3().setFromObject(node);
    const center = box.getCenter(new THREE.Vector3());
    const materialNames = getMaterialNames(node.material);
    const searchable = normalizeName(`${node.name} ${materialNames.join(' ')}`);
    const nearRear = center.y > rearThreshold || box.max.y > rearThreshold;
    const rearNamed = ['back', 'rear', 'tail', 'trunk', 'glass', 'light', 'logo'].some((term) => searchable.includes(term));

    if (nearRear || rearNamed) {
      candidates.push({
        name: node.name || '(unnamed mesh)',
        materialNames,
        box: boxSummary(box),
        selectedForHatch: node.name === 'DoorBack',
        reason: node.name === 'DoorBack'
          ? 'This is the only independent rear-hatch mesh and is temporarily hidden for cargo inspection.'
          : 'This mesh remains fixed because it is integrated with the body or fixed lamps.',
      });
    }
  });

  return candidates.sort((a, b) => b.box.center[1] - a.box.center[1]);
}

function setCargoInspectionVisibility(root, enabled) {
  if (!root) {
    return;
  }

  CARGO_HATCH_MESH_NAMES.forEach((meshName) => {
    const hatch = findMeshByName(root, meshName);
    if (!hatch) {
      return;
    }

    if (hatch.userData.originalCargoVisible === undefined) {
      hatch.userData.originalCargoVisible = hatch.visible;
    }

    hatch.visible = enabled ? false : hatch.userData.originalCargoVisible;

    hatch.traverse((node) => {
      getMaterialArray(node.material).forEach((material) => {
        if (material) material.needsUpdate = true;
      });
    });
  });
}

function createPivotRig(mesh, parent, pivotLocal, axis, openAngle) {
  const pivot = new THREE.Group();
  pivot.name = `MechanicalPivot_${mesh.name}`;
  pivot.position.copy(pivotLocal);
  parent.add(pivot);
  parent.updateWorldMatrix(true, true);
  pivot.updateWorldMatrix(true, false);
  pivot.attach(mesh);
  return {
    pivot,
    axis,
    openAngle,
    target: 0,
    current: 0,
  };
}

function createDoorRig(config, root) {
  const mesh = findMeshByName(root, config.mesh);
  if (!mesh) {
    return {
      rig: null,
      diagnostic: makeDiagnostic(config.label, null, root, null, config.type === 'trunk' ? 'X' : 'Z', false, 'Independent mesh was not found.'),
    };
  }

  const parent = mesh.parent;
  const box = getBoxInParentSpace(mesh, parent);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const isUsable = size.x > 1 && size.y > 1 && size.z > 1;

  if (!isUsable) {
    return {
      rig: null,
      diagnostic: makeDiagnostic(config.label, mesh, parent, center, config.type === 'trunk' ? 'X' : 'Z', false, 'Bounding box is not valid.'),
    };
  }

  let pivotLocal;
  let axis;
  if (config.type === 'trunk') {
    pivotLocal = new THREE.Vector3(center.x, box.max.y, box.max.z);
    axis = 'X';
  } else {
    const sideX = config.side >= 0 ? box.max.x : box.min.x;
    pivotLocal = new THREE.Vector3(sideX, box.min.y, center.z);
    axis = 'Z';
  }

  const rig = createPivotRig(mesh, parent, pivotLocal, axis, config.openAngle);
  return {
    rig,
    diagnostic: makeDiagnostic(config.label, mesh, parent, pivotLocal, axis, true),
  };
}

function createWheelRig(config, root) {
  const mesh = findMeshByName(root, config.mesh);
  if (!mesh) {
    return {
      rig: null,
      diagnostic: makeDiagnostic(config.label, null, root, null, 'X', false, 'Independent mesh was not found.'),
    };
  }

  const parent = mesh.parent;
  const box = getBoxInParentSpace(mesh, parent);
  const center = box.getCenter(new THREE.Vector3());
  const yaw = new THREE.Group();
  yaw.name = `SteeringYaw_${mesh.name}`;
  yaw.position.copy(center);
  parent.add(yaw);
  parent.updateWorldMatrix(true, true);
  yaw.updateWorldMatrix(true, false);

  const spin = new THREE.Group();
  spin.name = `WheelSpin_${mesh.name}`;
  yaw.add(spin);
  spin.updateWorldMatrix(true, false);
  spin.attach(mesh);

  return {
    rig: {
      yaw,
      spin,
      mesh,
      front: config.front,
      spinVelocity: 0,
      targetSteer: 0,
      currentSteer: 0,
      baseY: yaw.position.z,
    },
    diagnostic: makeDiagnostic(config.label, mesh, parent, center, config.front ? 'X spin / Z steering' : 'X spin', true),
  };
}

function createSteeringWheelRig(root) {
  const mesh = findMeshByName(root, 'SteeringWheel');
  if (!mesh) {
    return {
      rig: null,
      diagnostic: makeDiagnostic('Cabin steering wheel', null, root, null, 'Y', false, 'Steering-wheel mesh was not found.'),
    };
  }

  const parent = mesh.parent;
  const box = getBoxInParentSpace(mesh, parent);
  const center = box.getCenter(new THREE.Vector3());
  const pivot = createPivotRig(mesh, parent, center, 'Y', 0);
  return {
    rig: pivot,
    diagnostic: makeDiagnostic('Cabin steering wheel', mesh, parent, center, 'Y', true),
  };
}

function setupMechanicalRig(root, scene) {
  const diagnostics = [];
  const doorRigs = {};
  DOOR_CONFIGS.forEach((config) => {
    const { rig, diagnostic } = createDoorRig(config, root);
    if (rig) {
      doorRigs[config.id] = rig;
    }
    diagnostics.push(diagnostic);
  });

  const wheelRigs = {};
  WHEEL_CONFIGS.forEach((config) => {
    const { rig, diagnostic } = createWheelRig(config, root);
    if (rig) {
      wheelRigs[config.id] = rig;
    }
    diagnostics.push(diagnostic);
  });

  const steering = createSteeringWheelRig(root);
  diagnostics.push(steering.diagnostic);

  ['BodyFront', 'Interior'].forEach((name) => {
    const mesh = findMeshByName(root, name);
    diagnostics.push(makeDiagnostic(name === 'BodyFront' ? 'Front body' : 'Cabin interior', mesh, root, null, 'none', false, 'Display node, not a mechanical animation node.'));
  });
  diagnostics.push(makeDiagnostic('Rear hatch', findMeshByName(root, 'DoorBack'), root, null, 'inspection', false, 'A reliable complete hatch pivot is unavailable; DoorBack is hidden during cargo inspection.'));

  const frontWheel = wheelRigs.frontLeft?.mesh || wheelRigs.frontRight?.mesh;
  const wheelOutline = frontWheel ? new THREE.Box3Helper(new THREE.Box3().setFromObject(frontWheel), 0xd8b66d) : null;
  if (wheelOutline) {
    wheelOutline.name = 'SelectedWheel_SubtleOutline';
    wheelOutline.visible = false;
    scene.add(wheelOutline);
  }

  return {
    diagnostics,
    rearHatchCandidates: collectRearHatchCandidates(root),
    doorRigs,
    wheelRigs,
    steeringWheelRig: steering.rig,
    wheelOutline,
    wheelMotionSpeed: 0,
    wheelMotionTarget: 0,
    suspensionMode: 'off',
    suspensionTime: 0,
    steeringTarget: 0,
  };
}

function updateMechanicalRig(mechanics, root, delta) {
  if (!mechanics) {
    return;
  }

  Object.values(mechanics.doorRigs).forEach((door) => {
    door.current += (door.target - door.current) * Math.min(delta * (7 / ANIMATION_TIME_SCALE), 1);
    if (door.axis === 'Z') {
      door.pivot.rotation.z = door.current;
    } else if (door.axis === 'X') {
      door.pivot.rotation.x = door.current;
    }
  });

  mechanics.wheelMotionSpeed += (mechanics.wheelMotionTarget - mechanics.wheelMotionSpeed) * Math.min(delta * (2.7 / ANIMATION_TIME_SCALE), 1);
  Object.values(mechanics.wheelRigs).forEach((wheel) => {
    wheel.spin.rotation.x += mechanics.wheelMotionSpeed * delta;
    if (wheel.front) {
      wheel.currentSteer += (mechanics.steeringTarget - wheel.currentSteer) * Math.min(delta * (6 / ANIMATION_TIME_SCALE), 1);
      wheel.yaw.rotation.z = wheel.currentSteer;
    }
  });

  if (mechanics.steeringWheelRig) {
    mechanics.steeringWheelRig.current += (mechanics.steeringTarget * 2.6 - mechanics.steeringWheelRig.current) * Math.min(delta * (6 / ANIMATION_TIME_SCALE), 1);
    mechanics.steeringWheelRig.pivot.rotation.y = mechanics.steeringWheelRig.current;
  }

  mechanics.suspensionTime += delta;
  const mode = mechanics.suspensionMode;
  const amplitude = mode === 'rock' ? 1.8 : mode === 'slope' ? 1.0 : mode === 'smooth' ? 0.35 : 0;
  const phaseOffset = mode === 'slope' ? 1.2 : 0;
  Object.entries(mechanics.wheelRigs).forEach(([id, wheel], index) => {
    const bounce = amplitude * Math.sin(mechanics.suspensionTime * (mode === 'rock' ? 4.8 : 2.2) + index * 0.85 + phaseOffset);
    wheel.yaw.position.z = wheel.baseY + bounce;
  });
  if (root) {
    root.position.y = amplitude ? Math.sin(mechanics.suspensionTime * 2.1) * amplitude * 0.18 : 0;
  }

  if (mechanics.wheelOutline?.visible) {
    const wheel = mechanics.wheelRigs.frontLeft?.mesh || mechanics.wheelRigs.frontRight?.mesh;
    if (wheel) {
      mechanics.wheelOutline.box.copy(new THREE.Box3().setFromObject(wheel));
    }
  }
}

function createEngineLines() {
  const group = new THREE.Group();
  group.name = 'demo-xray-lines-placeholder';

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xd8b66d,
    transparent: true,
    opacity: 0.68,
  });

  for (let index = 0; index < 8; index += 1) {
    const offset = (index - 3.5) * 8;
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-34, 0, offset),
      new THREE.Vector3(34, 0, offset + 8),
    ]);
    group.add(new THREE.Line(geometry, lineMaterial.clone()));
  }

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xd8b66d,
    transparent: true,
    opacity: 0.28,
    wireframe: true,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(38, 0.7, 8, 96), ringMaterial);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  group.visible = false;
  return group;
}

function createNeutralVehicleBadge({ width = 25, height = 9.4, depthTest = true } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  context.fillStyle = '#151515';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#c9a96f';
  context.lineWidth = 5;
  context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  context.fillStyle = '#f0dfbf';
  context.font = '700 46px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('AG', canvas.width / 2, canvas.height / 2 + 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, depthWrite: false, depthTest });
  const badge = new THREE.Sprite(material);
  badge.name = 'AutoGallery_NeutralBadge';
  badge.scale.set(width, height, 1);
  return badge;
}

function addNeutralWheelCaps(root, landmarks) {
  const wheelNames = ['WheelFrLeft', 'WheelFrRight', 'WheelRearLeft', 'WheelRearRight'];
  wheelNames.forEach((wheelName) => {
    const wheel = findMeshByName(root, wheelName);
    const bounds = landmarks.meshBounds?.get(wheelName);
    if (!wheel || !bounds || !root.parent) return;

    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const side = Math.sign(center.x - landmarks.center.x) || 1;
    const radius = Math.max(size.y, size.z) * 0.115;
    const cap = new THREE.Group();
    cap.name = `AutoGallery_${wheelName}_NeutralCap`;
    cap.position.copy(center);
    cap.position.x += side * size.x * 0.52;
    cap.rotation.y = Math.PI / 2;

    const disk = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 32),
      new THREE.MeshBasicMaterial({ color: 0x151515, side: THREE.DoubleSide }),
    );
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius * 0.72, radius, 32),
      new THREE.MeshBasicMaterial({ color: 0xc9a96f, side: THREE.DoubleSide }),
    );
    ring.position.z = 0.04;
    cap.add(disk, ring);
    root.parent.add(cap);
    wheel.attach(cap);
  });
}

function calculateMonthlyPayment(total, downPayment, months, annualRate) {
  const principal = Math.max(Number(total) - Number(downPayment), 0);
  const count = Math.max(Number(months), 1);
  const monthlyRate = Math.max(Number(annualRate), 0) / 100 / 12;

  if (!monthlyRate) {
    return principal / count;
  }

  return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -count);
}

function ShowroomApp() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const qualityScenePartsRef = useRef({});
  const renderQualitySettingsRef = useRef(getRenderQualitySettings(getDefaultRenderQuality()));
  const modelRef = useRef(null);
  const landmarksRef = useRef(null);
  const cameraMoveRef = useRef(null);
  const autoSpinRef = useRef(true);
  const isCabinViewRef = useRef(false);
  const hotspotRefs = useRef({});
  const hotspotPositionsRef = useRef({});
  const messagesRef = useRef(null);
  const engineLinesRef = useRef(null);
  const conceptEngineRef = useRef(null);
  const mechanicsRef = useRef(null);
  const developerModeRef = useRef(false);
  const lastFrameTimeRef = useRef(performance.now());
  const modelLoadStartedRef = useRef(performance.now());
  const demoRunRef = useRef(0);
  const demoStatusRef = useRef('idle');
  const sessionIdRef = useRef(`gallery-${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`);

  const [status, setStatus] = useState('Preparing the 3D showroom...');
  const [modelFailed, setModelFailed] = useState(false);
  const [runtimeMetrics, setRuntimeMetrics] = useState({
    fps: 0,
    modelLoadMs: null,
    pixelRatio: 1,
  });
  const [bodyColor, setBodyColor] = useState(BODY_COLORS[0].value);
  const [renderQuality, setRenderQuality] = useState(getDefaultRenderQuality);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [activeEnginePart, setActiveEnginePart] = useState(null);
  const [wireframe, setWireframe] = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);
  const [ownerPanelOpen, setOwnerPanelOpen] = useState(false);
  const [apiMode, setApiMode] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    status: 'disabled',
    enabled: false,
    configured: false,
    provider: 'Bluesminds',
    model: 'gpt-5.2-chat',
  });
  const [assistantMode, setAssistantMode] = useState('guided');
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [isCabinView, setIsCabinView] = useState(false);
  const [autoSpin, setAutoSpin] = useState(true);
  const [demoStatus, setDemoStatus] = useState('idle');
  const [demoStepIndex, setDemoStepIndex] = useState(0);
  const [demoHasRun, setDemoHasRun] = useState(false);
  const [demoCompletedRuns, setDemoCompletedRuns] = useState(0);
  const [doorStatus, setDoorStatus] = useState('Waiting for the model...');
  const [mechanicalDiagnostics, setMechanicalDiagnostics] = useState([]);
  const [openDoors, setOpenDoors] = useState({});
  const [wheelMotion, setWheelMotion] = useState(false);
  const [steeringMode, setSteeringMode] = useState('straight');
  const [suspensionMode, setSuspensionMode] = useState('off');
  const [xrayMode, setXrayMode] = useState(false);
  const [cargoInspection, setCargoInspection] = useState(false);
  const [rearHatchCandidates, setRearHatchCandidates] = useState([]);
  const [apiError, setApiError] = useState('');
  const [purchaseMode, setPurchaseMode] = useState('installment');
  const [finance, setFinance] = useState({
    total: DEMO_FINANCE_DEFAULTS.vehiclePrice,
    downPayment: DEMO_FINANCE_DEFAULTS.downPayment,
    months: DEMO_FINANCE_DEFAULTS.months,
    annualRate: DEMO_FINANCE_DEFAULTS.annualRate,
  });
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    note: '',
    consent: false,
  });
  const [leadErrors, setLeadErrors] = useState({});
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [manualControlsOpen, setManualControlsOpen] = useState(false);
  const [crmRecords, setCrmRecords] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('auto-gallery-demo-leads-v1') ?? '[]');
    } catch {
      return [];
    }
  });
  const [messages, setMessages] = useState([
    {
      id: 'initial',
      role: 'assistant',
      text: INITIAL_LYRA_MESSAGE,
      mode: 'guided',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [modelInfo, setModelInfo] = useState({
    meshes: [],
    materials: [],
    keywordHits: Object.fromEntries(SEARCH_TERMS.map((term) => [term, []])),
    triangles: 0,
  });

  const selectBodyColor = (color) => {
    setBodyColor(color);
    const updatedMaterials = applyBodyColor(modelRef.current, color);
    console.info(`[Auto Gallery] Body paint applied: ${color}; materials: ${updatedMaterials}`);
  };

  const activeHotspotData = useMemo(
    () => HOTSPOTS.find((hotspot) => hotspot.id === activeHotspot),
    [activeHotspot],
  );
  const technicalEngineMode = activeHotspot === 'engine' || xrayMode;
  const activeHotspotPrompt = activeHotspot ? getQuickPromptForHotspot(activeHotspot) : '';
  const financeResult = calculateDemoPayment({
    vehiclePrice: Number(finance.total),
    downPayment: Number(finance.downPayment),
    months: Number(finance.months),
    annualRate: Number(finance.annualRate),
  });
  const monthlyPayment = financeResult.ok ? financeResult.monthlyPayment : 0;

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    isCabinViewRef.current = isCabinView;
  }, [isCabinView]);

  useEffect(() => {
    developerModeRef.current = developerMode;
  }, [developerMode]);

  useEffect(() => {
    demoStatusRef.current = demoStatus;
  }, [demoStatus]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOwnerPanelOpen((value) => !value);
      }
      if (event.key === 'Escape') {
        setWelcomeOpen(false);
        setOwnerPanelOpen(false);
        setDeveloperMode(false);
        setActiveHotspot(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem('auto-gallery-live-ai', String(apiMode));
  }, [apiMode]);

  const refreshApiStatus = async () => {
    setApiStatus((current) => ({
      ...current,
      status: 'disabled',
      enabled: false,
      configured: false,
    }));
    setApiMode(false);
    setApiError('');
    setAssistantMode('guided');
  };

  useEffect(() => {
    refreshApiStatus();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = null;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 6000);
    camera.position.set(260, 130, 420);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    const initialQuality = getDefaultRenderQuality();
    const initialRenderSettings = getRenderQualitySettings(initialQuality);
    renderer.setPixelRatio(initialRenderSettings.pixelRatio);
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = initialRenderSettings.exposure;
    renderer.setClearColor(0x686d74, 0);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    renderQualitySettingsRef.current = initialRenderSettings;

    const handleContextLost = (event) => {
      event.preventDefault();
      setStatus('The 3D renderer paused after losing its graphics context. Reload to recover.');
      setModelFailed(true);
    };
    const handleContextRestored = () => {
      setStatus('Graphics context restored. Reloading the experience is recommended.');
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.screenSpacePanning = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.88;
    controlsRef.current = controls;

    const ambient = new THREE.HemisphereLight(0xffffff, 0xd8d4ca, 2.35);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.25);
    keyLight.position.set(240, 420, 210);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf7efe0, 1.35);
    fillLight.position.set(-260, 230, 260);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.65);
    rimLight.position.set(-280, 220, -250);
    scene.add(rimLight);

    const cabinLight = new THREE.PointLight(0xfff2dc, 1.1, 190);
    cabinLight.position.set(0, 135, 132);
    scene.add(cabinLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1200, 1200),
      new THREE.MeshStandardMaterial({
        color: 0x4c5158,
        roughness: 0.42,
        metalness: 0.08,
      }),
    );
    floor.name = 'luxury-showroom-floor';
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.2;
    floor.receiveShadow = false;
    scene.add(floor);

    const grid = new THREE.GridHelper(900, 12, 0x666c74, 0x666c74);
    grid.name = 'subtle-showroom-grid';
    grid.position.y = -1.9;
    getMaterialArray(grid.material).forEach((material) => {
      material.transparent = true;
      material.opacity = 0.1;
      material.depthWrite = false;
    });
    scene.add(grid);

    const architecture = new THREE.Group();
    architecture.name = 'lightweight-exhibition-garage';
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x73777d,
      roughness: 0.86,
      metalness: 0.015,
    });
    const lowerWallMaterial = new THREE.MeshStandardMaterial({
      color: 0x5f646b,
      roughness: 0.82,
      metalness: 0.02,
    });
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x686d74,
      roughness: 0.56,
      metalness: 0.2,
    });
    const lightPanelMaterial = new THREE.MeshBasicMaterial({
      color: 0xfff8eb,
      toneMapped: false,
    });
    const addBox = (name, size, position, material) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.name = name;
      mesh.position.set(...position);
      architecture.add(mesh);
      return mesh;
    };

    addBox('gallery-back-wall', [1240, 370, 18], [0, 183, -560], wallMaterial);
    addBox('gallery-back-wall-lower', [1240, 92, 8], [0, 44, -548], lowerWallMaterial);
    addBox('gallery-display-recess', [520, 226, 8], [0, 150, -548], accentMaterial);
    addBox('gallery-left-wall', [18, 320, 1080], [-620, 158, -20], wallMaterial);
    addBox('gallery-right-wall', [18, 320, 1080], [620, 158, -20], wallMaterial);
    addBox('gallery-left-column', [34, 286, 34], [-352, 141, -530], lowerWallMaterial);
    addBox('gallery-right-column', [34, 286, 34], [352, 141, -530], lowerWallMaterial);
    addBox('gallery-left-accent', [7, 218, 9], [-318, 150, -539], accentMaterial);
    addBox('gallery-right-accent', [7, 218, 9], [318, 150, -539], accentMaterial);

    const silhouettePanel = new THREE.Mesh(
      new THREE.PlaneGeometry(390, 184),
      new THREE.MeshBasicMaterial({
        color: 0xfff8eb,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    silhouettePanel.name = 'vehicle-silhouette-light-panel';
    silhouettePanel.position.set(0, 151, -542.8);
    architecture.add(silhouettePanel);

    [-270, -40, 190].forEach((z, index) => {
      addBox(`gallery-ceiling-beam-${index + 1}`, [1100, 12, 28], [0, 340, z], lowerWallMaterial);
      addBox(`gallery-ceiling-light-${index + 1}`, [430, 3, 10], [0, 332, z + 3], lightPanelMaterial);
    });

    const displayZone = new THREE.Mesh(
      new THREE.CircleGeometry(245, 64),
      new THREE.MeshStandardMaterial({
        color: 0x5f646b,
        roughness: 0.38,
        metalness: 0.08,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
      }),
    );
    displayZone.name = 'centered-display-zone';
    displayZone.rotation.x = -Math.PI / 2;
    displayZone.position.y = -1.82;
    architecture.add(displayZone);

    const wallWash = new THREE.PointLight(0xfff8eb, 0.92, 520, 1.7);
    wallWash.name = 'gallery-back-wall-wash';
    wallWash.position.set(0, 176, -405);
    architecture.add(wallWash);
    const leftGalleryFill = new THREE.PointLight(0xfff7ea, 0.62, 420, 1.8);
    leftGalleryFill.position.set(-270, 210, 40);
    architecture.add(leftGalleryFill);
    const rightGalleryFill = leftGalleryFill.clone();
    rightGalleryFill.position.x = 270;
    architecture.add(rightGalleryFill);

    architecture.traverse((node) => {
      if (!node.isMesh) return;
      node.renderOrder = -20;
      getMaterialArray(node.material).forEach((material) => {
        material.depthWrite = false;
      });
    });

    scene.add(architecture);
    qualityScenePartsRef.current = { fillLight, rimLight, cabinLight, grid, architecture };
    renderQualitySettingsRef.current = applyRenderQuality(
      renderer,
      scene,
      mount,
      qualityScenePartsRef.current,
      initialQuality,
    );

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      camera.aspect = rect.width / Math.max(rect.height, 1);
      camera.updateProjectionMatrix();
    };

    const updateHotspotLabels = () => {
      const positions = hotspotPositionsRef.current;
      const rect = renderer.domElement.getBoundingClientRect();

      Object.entries(hotspotRefs.current).forEach(([id, element]) => {
        const position = positions[id];
        if (!element || !position) {
          return;
        }

        const projected = position.clone().project(camera);
        const isVisible = projected.z > -1 && projected.z < 1;
        const x = (projected.x * 0.5 + 0.5) * rect.width;
        const y = (-projected.y * 0.5 + 0.5) * rect.height;
        element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        element.style.opacity = isVisible ? '1' : '0';
      });
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    let animationFrame = 0;
    let lastHotspotLabelUpdate = 0;
    let conceptEngineFrame = 0;
    let frameCount = 0;
    let frameWindowStartedAt = performance.now();
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      const now = performance.now();
      if (document.hidden) {
        lastFrameTimeRef.current = now;
        return;
      }
      const delta = Math.min((now - lastFrameTimeRef.current) / 1000, 0.05);
      lastFrameTimeRef.current = now;
      const renderSettings = renderQualitySettingsRef.current;

      const move = cameraMoveRef.current;
      if (move) {
        const elapsed = performance.now() - move.start;
        const progress = Math.min(elapsed / move.duration, 1);
        const eased = progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
        camera.position.lerpVectors(move.fromPosition, move.toPosition, eased);
        controls.target.lerpVectors(move.fromTarget, move.toTarget, eased);
        if (progress >= 1) {
          cameraMoveRef.current = null;
        }
      }

      if (engineLinesRef.current?.visible) {
        engineLinesRef.current.rotation.y += renderSettings.engineLineStep;
        const pulse = 0.34 + Math.sin(performance.now() * 0.004) * 0.16;
        engineLinesRef.current.traverse((node) => {
          if (node.material) {
            node.material.opacity = pulse;
          }
        });
      }

      conceptEngineFrame += 1;
      if (conceptEngineRef.current?.visible) {
        const updateEvery = renderSettings.conceptUpdateEvery || 1;
        if (conceptEngineFrame % updateEvery === 0) {
          conceptEngineRef.current.userData?.update?.(delta * updateEvery);
        }
      }
      updateMechanicalRig(mechanicsRef.current, modelRef.current, delta);

      controls.autoRotate = autoSpinRef.current && !isCabinViewRef.current && !cameraMoveRef.current;
      controls.update(delta);
      if (now - lastHotspotLabelUpdate > renderSettings.hotspotInterval) {
        updateHotspotLabels();
        lastHotspotLabelUpdate = now;
      }
      renderer.render(scene, camera);
      frameCount += 1;
      if (now - frameWindowStartedAt >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - frameWindowStartedAt));
        if (developerModeRef.current) {
          setRuntimeMetrics((current) => ({
            ...current,
            fps,
            pixelRatio: Number(renderer.getPixelRatio().toFixed(2)),
          }));
        }
        frameCount = 0;
        frameWindowStartedAt = now;
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      renderer.dispose();
      renderer.domElement.remove();
      scene.traverse((node) => {
        if (node.isMesh || node.isLine) {
          node.geometry?.dispose?.();
          getMaterialArray(node.material).forEach((material) => material?.dispose?.());
        }
      });
    };
  }, []);

  useEffect(() => {
    renderQualitySettingsRef.current = applyRenderQuality(
      rendererRef.current,
      sceneRef.current,
      mountRef.current,
      qualityScenePartsRef.current,
      renderQuality,
    );
  }, [renderQuality]);

  useEffect(() => {
    if (!sceneRef.current) {
      return undefined;
    }

    let cancelled = false;
    const scene = sceneRef.current;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    window.__AUTO_GALLERY_MODEL_READY = false;
    modelLoadStartedRef.current = performance.now();
    setModelFailed(false);
    setStatus('Loading the optimized LOW model...');
    setModelInfo((info) => ({ ...info, meshes: [], materials: [] }));

    if (modelRef.current) {
      scene.remove(modelRef.current);
      modelRef.current.traverse((node) => {
        if (node.isMesh) {
          node.geometry?.dispose?.();
        }
      });
      modelRef.current = null;
    }

    loader.load(
      MODEL_ASSET.url,
      (gltf) => {
        if (cancelled) return;

        const object = gltf.scene;
        object.name = PRODUCT.vehicleName;
        object.rotation.x = -Math.PI / 2;
        object.updateMatrixWorld(true);
        normalizeLoadedSceneGraph(object);
        object.traverse((node) => {
          if (!node.isMesh) return;
          node.castShadow = false;
          node.receiveShadow = false;
        });

        prepareBodyPaintMaterials(object, bodyColor);
        darkenTireMaterials(object);
        neutralizeSteeringEmblem(object);
        setMaterialsWireframe(object, wireframe);
        const info = collectModelInfo(object);
        scene.add(object);
        modelRef.current = object;

        const modelBox = new THREE.Box3().setFromObject(object);
        const landmarks = getSceneLandmarks(object, modelBox);
        landmarksRef.current = landmarks;
        hotspotPositionsRef.current = getHotspotPositions(landmarks);

        addNeutralWheelCaps(object, landmarks);

        const engineLines = createEngineLines();
        const enginePosition = hotspotPositionsRef.current.engine;
        engineLines.position.copy(enginePosition).add(new THREE.Vector3(0, -12, 0));
        engineLines.rotation.x = Math.PI / 2;
        engineLines.scale.setScalar(0.72);
        scene.add(engineLines);
        engineLinesRef.current = engineLines;

        const conceptEngine = createConceptEngine(THREE);
        conceptEngine.position.copy(enginePosition).add(new THREE.Vector3(0, -24, 0));
        conceptEngine.scale.setScalar(0.78);
        scene.add(conceptEngine);
        conceptEngineRef.current = conceptEngine;

        const mechanicalRig = setupMechanicalRig(object, scene);
        mechanicsRef.current = mechanicalRig;
        window.__AUTO_GALLERY_MECHANICS = mechanicalRig;
        setMechanicalDiagnostics(mechanicalRig.diagnostics);
        setRearHatchCandidates(mechanicalRig.rearHatchCandidates);
        setOpenDoors({});
        setWheelMotion(false);
        setSteeringMode('straight');
        setSuspensionMode('off');
        setCargoInspection(false);

        configureControlsForView(controlsRef.current, landmarks, 'exterior');
        moveCamera('cinematic', 1200);

        setModelInfo(info);
        setDoorStatus('Independent side-door rigs are ready. Cargo inspection safely hides the unreliable rear hatch mesh.');
        setStatus(`Optimized glTF loaded: ${info.meshes.length} meshes, ${info.materials.length} materials.`);
        setRuntimeMetrics((current) => ({
          ...current,
          modelLoadMs: Math.round(performance.now() - modelLoadStartedRef.current),
        }));
        window.__AUTO_GALLERY_MODEL_READY = true;
        window.__AUTO_GALLERY_MODEL_INFO = info;

        console.group('Auto Gallery 3D model structure - optimized LOW');
        console.table(info.meshes.map((mesh) => ({
          mesh: mesh.name,
          source: object.getObjectByProperty('uuid', mesh.id)?.userData?.sourceMeshName || mesh.name,
          materials: mesh.materialNames.join(', '),
          triangles: mesh.triangles,
        })));
        console.table(info.materials.map((material) => ({ material: material.name })));
        console.groupEnd();
      },
      (event) => {
        if (!event.total) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        setStatus(`Loading optimized glTF: ${percent}%`);
      },
      (error) => {
        console.error(error);
        setModelFailed(true);
        setStatus('The optimized glTF could not be loaded. Check the production model asset.');
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    applyBodyColor(modelRef.current, bodyColor);
  }, [bodyColor]);

  useEffect(() => {
    const technicalView = technicalEngineMode;
    const wheelFocus = activeHotspot === 'wheel';
    dimBodyForEngine(modelRef.current, technicalView || wheelFocus);
    if (engineLinesRef.current) {
      engineLinesRef.current.visible = technicalView;
    }
    if (conceptEngineRef.current) {
      conceptEngineRef.current.visible = technicalView;
    }
    if (mechanicsRef.current?.wheelOutline) {
      mechanicsRef.current.wheelOutline.visible = wheelFocus;
    }
  }, [activeHotspot, technicalEngineMode]);

  useEffect(() => {
    setCargoInspectionVisibility(modelRef.current, cargoInspection);
  }, [cargoInspection]);

  useEffect(() => {
    window.localStorage.setItem('auto-gallery-demo-leads-v1', JSON.stringify(crmRecords));
  }, [crmRecords]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, assistantBusy]);

  function moveCamera(view, duration = 900) {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const landmarks = landmarksRef.current;
    if (!camera || !controls || !landmarks) {
      return;
    }

    const pose = getCameraPose(view, landmarks);
    cameraMoveRef.current = {
      fromPosition: camera.position.clone(),
      fromTarget: controls.target.clone(),
      toPosition: pose.position,
      toTarget: pose.target,
      start: performance.now(),
      duration: duration * ANIMATION_TIME_SCALE,
    };
    configureControlsForView(controls, landmarks, view);
  }

  const refreshInfo = () => {
    if (modelRef.current) {
      setModelInfo(collectModelInfo(modelRef.current));
    }
  };

  const runVisibilityAction = (action) => {
    if (!modelRef.current) {
      return;
    }

    action(modelRef.current);
    if (cargoInspection) {
      setCargoInspectionVisibility(modelRef.current, true);
    }
    refreshInfo();
  };

  const toggleMesh = (meshId) => {
    runVisibilityAction((root) => {
      root.traverse((node) => {
        if (node.isMesh && node.uuid === meshId) {
          node.visible = !node.visible;
        }
      });
    });
  };

  const applyWireframe = () => {
    const next = !wireframe;
    setWireframe(next);
    setMaterialsWireframe(modelRef.current, next);
  };

  const goExterior = () => {
    setIsCabinView(false);
    setActiveHotspot(null);
    setCargoInspection(false);
    setAutoSpin(true);
    moveCamera('cinematic', 850);
  };

  const enterCabin = () => {
    setIsCabinView(true);
    setActiveHotspot('cabin');
    setAutoSpin(false);
    moveCamera('cabin', 1050);
  };

  const handleHotspot = (id) => {
    setActiveHotspot(id);
    setAutoSpin(false);
    setActiveEnginePart(id === 'engine' ? 'v6' : null);

    if (id === 'cabin') {
      enterCabin();
      return;
    }

    if (id === 'cargo') {
      setCargoInspection(true);
    } else {
      setCargoInspection(false);
    }

    setIsCabinView(false);
    moveCamera(id, 950);
  };

  const inspectCargoArea = (enabled = !cargoInspection) => {
    setCargoInspection(enabled);
    setActiveHotspot(enabled ? 'cargo' : null);
    setAutoSpin(!enabled);
    setIsCabinView(false);
    if (enabled) {
      moveCamera('cargo', 900);
    } else {
      moveCamera('cinematic', 850);
    }
  };

  const closeFeaturePanel = () => {
    if (activeHotspot === 'cargo') {
      inspectCargoArea(false);
      return;
    }

    setActiveHotspot(null);
  };

  const setDoorTarget = (doorId, shouldOpen) => {
    const rig = mechanicsRef.current?.doorRigs?.[doorId];
    if (!rig) {
      return;
    }

    rig.target = shouldOpen ? rig.openAngle : 0;
    setOpenDoors((current) => ({
      ...current,
      [doorId]: shouldOpen,
    }));

  };

  const toggleDoor = (doorId) => {
    setDoorTarget(doorId, !openDoors[doorId]);
  };

  const setAllDoorsTarget = (shouldOpen) => {
    const nextOpenDoors = {};
    DOOR_CONFIGS.forEach((door) => {
      const rig = mechanicsRef.current?.doorRigs?.[door.id];
      if (rig) {
        rig.target = shouldOpen ? rig.openAngle : 0;
        nextOpenDoors[door.id] = shouldOpen;
      }
    });
    setOpenDoors(shouldOpen ? nextOpenDoors : {});
  };

  const openAllDoors = () => {
    const allAvailableDoorsOpen = Object.keys(mechanicsRef.current?.doorRigs || {})
      .every((doorId) => openDoors[doorId]);
    setAllDoorsTarget(!allAvailableDoorsOpen);
  };

  const resetInteractions = () => {
    DOOR_CONFIGS.forEach((door) => {
      const rig = mechanicsRef.current?.doorRigs?.[door.id];
      if (rig) {
        rig.target = 0;
      }
    });
    setOpenDoors({});
    selectBodyColor(BODY_COLORS[0].value);
    setWheelMotion(false);
    setSteeringMode('straight');
    setSuspensionMode('off');
    setXrayMode(false);
    setCargoInspection(false);
    setActiveHotspot(null);
    setActiveEnginePart(null);
    goExterior();
  };

  const toggleWheelMotion = () => {
    setWheelMotion((value) => !value);
  };

  const selectSteering = (mode) => {
    setSteeringMode(mode);
    const angle = STEERING_ANGLES[mode] ?? 0;
    if (mechanicsRef.current) {
      mechanicsRef.current.steeringTarget = angle;
    }
  };

  const selectSuspension = (mode) => {
    setSuspensionMode(mode);
    if (mechanicsRef.current) {
      mechanicsRef.current.suspensionMode = mode;
    }
  };

  useEffect(() => {
    if (mechanicsRef.current) {
      mechanicsRef.current.wheelMotionTarget = wheelMotion ? 9.5 : 0;
    }
  }, [wheelMotion]);

  useEffect(() => {
    if (mechanicsRef.current) {
      mechanicsRef.current.steeringTarget = STEERING_ANGLES[steeringMode] ?? 0;
    }
  }, [steeringMode]);

  useEffect(() => {
    if (mechanicsRef.current) {
      mechanicsRef.current.suspensionMode = suspensionMode;
    }
  }, [suspensionMode]);

  const buildAgentContext = () => ({
    ...serializeSceneContext({
      cameraMode: isCabinView ? 'cabin' : cargoInspection ? 'cargo' : 'exterior',
      selectedPaint: BODY_COLORS.find((color) => color.value === bodyColor)?.id || 'onyx',
      openDoors: Object.entries(openDoors).filter(([, value]) => value).map(([key]) => key),
      activeHotspot,
      cabinActive: isCabinView,
      currentDemonstration: technicalEngineMode
        ? 'conceptual-powertrain'
        : wheelMotion
          ? 'wheel-motion'
          : suspensionMode !== 'off'
            ? `suspension-${suspensionMode}`
            : null,
      financing: {
        vehiclePrice: Number(finance.total),
        downPayment: Number(finance.downPayment),
        months: Number(finance.months),
        annualRate: Number(finance.annualRate),
      },
      renderQuality,
      modelLoaded: Boolean(modelRef.current),
      assistantMode,
    }),
    purchaseMode,
    modelAsset: {
      format: MODEL_ASSET.format,
      meshGroups: modelInfo.meshes.length,
      materials: modelInfo.materials.length,
      trianglesApprox: modelInfo.triangles,
      hasRealEngineMesh: MODEL_ASSET.hasRealEngineMesh,
      interiorNodes: MODEL_ASSET.interiorNodes,
    },
  });

  const executeLyraTool = async (name, args) => {
    const validation = validateLyraToolCall(name, args);
    if (!validation.valid) throw new Error(`tool_rejected:${validation.error}`);

    switch (name) {
      case 'focus_vehicle_area':
        if (args.area === 'exterior') goExterior();
        else if (args.area === 'cabin') enterCabin();
        else handleHotspot(args.area === 'powertrain' ? 'engine' : args.area);
        break;
      case 'set_vehicle_color': {
        const paint = getPaintPreset(args.color);
        if (!paint) throw new Error('paint_not_available');
        selectBodyColor(paint.value);
        break;
      }
      case 'open_vehicle_door':
        setDoorTarget(args.door, true);
        break;
      case 'close_vehicle_door':
        setDoorTarget(args.door, false);
        break;
      case 'toggle_all_doors':
        setAllDoorsTarget(args.open);
        break;
      case 'enter_driver_cabin':
        enterCabin();
        break;
      case 'return_to_exterior':
        goExterior();
        break;
      case 'show_cargo_area':
        inspectCargoArea(args.visible);
        break;
      case 'show_powertrain_concept':
        if (args.visible) handleHotspot('engine');
        else closeFeaturePanel();
        setXrayMode(args.visible);
        break;
      case 'show_safety_features':
        handleHotspot('safety');
        break;
      case 'demonstrate_steering':
        selectSteering(args.direction);
        break;
      case 'demonstrate_wheel_motion':
        setWheelMotion(args.enabled);
        break;
      case 'demonstrate_suspension_mode':
        selectSuspension(args.mode);
        break;
      case 'calculate_demo_payment': {
        const result = calculateDemoPayment(args);
        if (!result.ok) throw new Error('invalid_finance_inputs');
        setFinance({
          total: args.vehiclePrice,
          downPayment: args.downPayment,
          months: args.months,
          annualRate: args.annualRate,
        });
        setPurchaseMode('installment');
        return {
          ok: true,
          monthlyPayment: formatDemoCurrency(result.monthlyPayment),
          disclaimer: result.disclaimer,
        };
      }
      case 'prepare_lead_summary':
        return {
          ok: true,
          storage: 'local browser only',
          consentRequired: true,
          selectedPaint: BODY_COLORS.find((color) => color.value === bodyColor)?.label,
          purchaseMode,
        };
      case 'reset_vehicle_experience':
        resetInteractions();
        break;
      default:
        throw new Error('tool_not_allowlisted');
    }

    await sleep(220);
    return { ok: true, sceneContext: buildAgentContext() };
  };

  const requestRemoteAssistant = async (message) => {
    void message;
    throw new Error('live_ai_disabled_static_build');
  };

  const runGuidedActions = async (message) => {
    const actions = getOfflineTourActions(message);
    for (const action of actions.slice(0, 5)) {
      await executeLyraTool(action.name, action.args);
    }
  };

  const submitChat = async (message = chatInput, options = {}) => {
    const trimmed = String(message || '').trim();
    if (!trimmed || assistantBusy) return;

    setMessages((current) => [...current, {
      id: `${Date.now()}-user`,
      role: 'user',
      text: trimmed,
    }].slice(-12));
    setChatInput('');
    setAssistantBusy(true);

    try {
      const useLive = !options.forceGuided && apiMode && apiStatus.enabled && apiStatus.configured;
      let text;
      let mode;
      if (useLive) {
        text = await requestRemoteAssistant(trimmed);
        mode = 'live';
        setApiError('');
      } else {
        await runGuidedActions(trimmed);
        await sleep(320);
        text = getOfflineReply(trimmed, buildAgentContext()).text;
        mode = 'guided';
        setAssistantMode('guided');
      }
      setMessages((current) => [...current, {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text,
        mode,
      }].slice(-12));
    } catch (error) {
      setApiError(error?.message || 'provider_request_failed');
      setApiStatus((current) => ({ ...current, status: 'unavailable' }));
      if (trimmed === 'Reply exactly: LIVE-LYRA-7319') {
        setAssistantMode('live');
        setMessages((current) => [...current, {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: `Live provider verification failed: ${error?.message || 'provider_request_failed'}`,
          mode: 'live',
        }].slice(-12));
        return;
      }
      setAssistantMode('guided');
      await runGuidedActions(trimmed).catch(() => {});
      await sleep(280);
      setMessages((current) => [...current, {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text: getOfflineReply(trimmed, buildAgentContext()).text,
        mode: 'guided',
      }].slice(-12));
    } finally {
      setAssistantBusy(false);
    }
  };

  const submitLead = (event) => {
    event.preventDefault();
    const result = createDemoLead(leadForm, {
      purchaseMode,
      selectedPaint: BODY_COLORS.find((color) => color.value === bodyColor)?.label,
      estimatedMonthlyPayment: purchaseMode === 'installment' ? formatDemoCurrency(monthlyPayment) : null,
      interests: [activeHotspot, isCabinView ? 'cabin' : null].filter(Boolean),
    });
    if (!result.ok) {
      setLeadErrors(result.errors);
      return;
    }

    setLeadErrors({});
    setCrmRecords((current) => [result.record, ...current].slice(0, 5));
    setMessages((current) => [...current, {
      id: `${Date.now()}-lead`,
      role: 'assistant',
      mode: 'guided',
      text: `Demo lead created locally. Record ${result.record.id} was saved in this browser only and was not sent to a production CRM.`,
    }].slice(-12));
  };

  const clearDemoData = () => {
    setCrmRecords([]);
    window.localStorage.removeItem('auto-gallery-demo-leads-v1');
  };

  const setGuidedStatus = (nextStatus) => {
    demoStatusRef.current = nextStatus;
    setDemoStatus(nextStatus);
  };

  const addGuidedMessage = (text, suffix = 'guided') => {
    setMessages((current) => [...current, {
      id: `${Date.now()}-${suffix}`,
      role: 'assistant',
      mode: 'guided',
      text,
    }].slice(-12));
  };

  const waitForGuidedDisplay = async (runId, milliseconds) => {
    let elapsed = 0;
    while (elapsed < milliseconds) {
      if (demoRunRef.current !== runId || demoStatusRef.current === 'idle') return false;
      if (demoStatusRef.current === 'paused') {
        await sleep(100);
        continue;
      }
      const slice = Math.min(100, milliseconds - elapsed);
      await sleep(slice);
      elapsed += slice;
    }
    return demoRunRef.current === runId;
  };

  const runGuidedAction = async (runId, step) => {
    let timeoutId;
    try {
      await Promise.race([
        Promise.resolve().then(step.action),
        new Promise((_, reject) => {
          timeoutId = window.setTimeout(() => reject(new Error('guided_step_timeout')), GUIDED_STEP_TIMEOUT_MS);
        }),
      ]);
      return true;
    } catch {
      if (demoRunRef.current !== runId) return false;
      addGuidedMessage(`${step.label} could not complete in time. Lyra restored a safe exterior state and continued the deterministic tour.`, 'demo-recovery');
      setWheelMotion(false);
      selectSteering('straight');
      selectSuspension('off');
      goExterior();
      return true;
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  const startGuidedDemo = async () => {
    const vehicle = modelRef.current || sceneRef.current?.getObjectByName(PRODUCT.vehicleName);
    if (!vehicle) return;
    modelRef.current = vehicle;
    if (!landmarksRef.current) {
      const recoveredBox = new THREE.Box3().setFromObject(vehicle);
      landmarksRef.current = getSceneLandmarks(vehicle, recoveredBox);
      hotspotPositionsRef.current = getHotspotPositions(landmarksRef.current);
    }
    const runId = demoRunRef.current + 1;
    demoRunRef.current = runId;
    setDemoHasRun(true);
    setGuidedStatus('running');
    setDemoStepIndex(0);
    setWelcomeOpen(false);
    setManualControlsOpen(false);
    setAssistantMode('guided');
    setApiError('');
    setAssistantBusy(false);
    setPurchaseMode('installment');
    setFinance({
      total: DEMO_FINANCE_DEFAULTS.vehiclePrice,
      downPayment: DEMO_FINANCE_DEFAULTS.downPayment,
      months: DEMO_FINANCE_DEFAULTS.months,
      annualRate: DEMO_FINANCE_DEFAULTS.annualRate,
    });
    setLeadForm({ name: '', phone: '', note: '', consent: false });
    setLeadErrors({});
    setMessages([{
      id: `${Date.now()}-demo-start`,
      role: 'assistant',
      mode: 'guided',
      text: 'Guided Demo started from a clean state. Lyra will run a deterministic vehicle, financing, and local lead-summary journey.',
    }]);
    resetInteractions();
    selectBodyColor(BODY_COLORS[0].value);
    setAutoSpin(true);

    const steps = [
      {
        label: 'Exterior reveal',
        duration: 1200,
        action: () => {
          goExterior();
          setAutoSpin(true);
          addGuidedMessage('Exterior reveal: the optimized production vehicle asset is centered for a complete 360-degree view.');
        },
      },
      {
        label: 'Driver door',
        duration: 1100,
        action: () => {
          setDoorTarget('driver', true);
          addGuidedMessage('Driver door demonstration: the independent front-door mesh opens around its validated hinge pivot.');
        },
      },
      {
        label: 'Cabin entry',
        duration: 1400,
        action: () => {
          enterCabin();
          addGuidedMessage('Cabin entry: the camera moves to the real interior, seats, dashboard, and steering-wheel meshes.');
        },
      },
      {
        label: 'Steering demonstration',
        duration: 1200,
        action: async () => {
          selectSteering('left');
          await sleep(300 * ANIMATION_TIME_SCALE);
          selectSteering('right');
          await sleep(300 * ANIMATION_TIME_SCALE);
          selectSteering('straight');
          addGuidedMessage('Steering demonstration: the steering wheel and front wheels move together, then return to center.');
        },
      },
      {
        label: 'Off-road demonstration',
        duration: 1400,
        action: () => {
          goExterior();
          handleHotspot('wheel');
          setWheelMotion(true);
          selectSuspension('rock');
          addGuidedMessage('Off-road demonstration: wheel motion and the visual rock suspension mode illustrate the interaction concept; this is not a physics simulation.');
        },
      },
      {
        label: 'Cargo view',
        duration: 1400,
        action: () => {
          setWheelMotion(false);
          selectSuspension('off');
          inspectCargoArea(true);
          addGuidedMessage('Cargo view: the unreliable hatch group is hidden temporarily so the real interior load area can be inspected without claiming a false hatch animation.');
        },
      },
      {
        label: 'Conceptual powertrain',
        duration: 1400,
        action: () => {
          inspectCargoArea(false);
          handleHotspot('engine');
          setXrayMode(true);
          setActiveEnginePart('power');
          addGuidedMessage('Conceptual powertrain view: a clearly labeled educational overlay is shown because the source asset has no real engine mesh.');
        },
      },
      {
        label: 'Illustrative financing',
        duration: 1200,
        action: () => {
          setPurchaseMode('installment');
          addGuidedMessage(`Demonstration Only. Not a Financing Offer. Using the visible sample inputs, the illustrative monthly payment is ${formatDemoCurrency(monthlyPayment)}.`);
        },
      },
      {
        label: 'Local lead summary',
        duration: 1200,
        action: () => {
          addGuidedMessage('Lead summary prepared locally: Onyx Black paint, cabin and off-road interest, cargo review, and illustrative financing. No CRM record was created and no customer data was transmitted.');
        },
      },
    ];

    for (let index = 0; index < steps.length; index += 1) {
      if (demoRunRef.current !== runId || demoStatusRef.current === 'idle') return;
      while (demoStatusRef.current === 'paused') {
        if (!await waitForGuidedDisplay(runId, 100)) return;
      }
      setDemoStepIndex(index + 1);
      if (!await runGuidedAction(runId, steps[index])) return;
      if (!await waitForGuidedDisplay(runId, steps[index].duration * GUIDED_DISPLAY_TIME_SCALE)) return;
    }

    if (demoRunRef.current === runId) {
      setActiveHotspot(null);
      setActiveEnginePart(null);
      setXrayMode(false);
      selectBodyColor(BODY_COLORS[0].value);
      setGuidedStatus('idle');
      setDemoStepIndex(0);
      setDemoCompletedRuns((count) => count + 1);
      addGuidedMessage('Guided Demo complete. The vehicle remains available for manual exploration or a clean restart.', 'demo-complete');
    }
  };

  const pauseGuidedDemo = () => {
    setGuidedStatus('paused');
  };

  const resumeGuidedDemo = () => {
    setGuidedStatus('running');
  };

  const exitGuidedDemo = () => {
    demoRunRef.current += 1;
    setGuidedStatus('idle');
    setDemoStepIndex(0);
    resetInteractions();
    selectBodyColor(BODY_COLORS[0].value);
    setAutoSpin(true);
    setMessages([{ id: 'initial', role: 'assistant', text: INITIAL_LYRA_MESSAGE, mode: 'guided' }]);
  };

  const restartGuidedDemo = () => {
    demoRunRef.current += 1;
    setGuidedStatus('idle');
    window.setTimeout(startGuidedDemo, 0);
  };

  const visibleMeshCount = modelInfo.meshes.filter((mesh) => mesh.visible).length;
  const triangleLabel = modelInfo.triangles.toLocaleString('en-US');
  const availableDoorIds = Object.keys(mechanicsRef.current?.doorRigs || {});
  const allDoorsOpen = availableDoorIds.length > 0 && availableDoorIds.every((doorId) => openDoors[doorId]);
  const assistantStatus = assistantMode === 'live' ? 'Live AI' : 'Guided Demo';

  return (
    <main className="showroom-app" dir="ltr">
      <section className="viewer-stage" aria-label="Auto Gallery interactive 3D showroom">
        <div ref={mountRef} className="viewer-canvas" />
        <div className="stage-shade" />

        <header className="hero-panel">
          <div className="brand-mark">
            <span className="brand-monogram" aria-hidden="true">AG</span>
            <div>
              <strong>{PRODUCT.name}</strong>
              <span>{PRODUCT.tagline}</span>
            </div>
          </div>
          <h1>From curiosity to confidence.</h1>
          <p>{PRODUCT.description}</p>
          <div className="hero-actions guided-demo-controls">
            {demoStatus === 'idle' && (
              <button
                type="button"
                className="primary-action"
                onClick={demoHasRun ? restartGuidedDemo : startGuidedDemo}
                disabled={!modelRef.current}
              >
                {demoHasRun ? 'Restart Guided Demo' : 'Start Guided Demo'}
              </button>
            )}
            {demoStatus === 'running' && <button type="button" className="primary-action" onClick={pauseGuidedDemo}>Pause</button>}
            {demoStatus === 'paused' && <button type="button" className="primary-action" onClick={resumeGuidedDemo}>Resume</button>}
            {demoStatus !== 'idle' && <button type="button" onClick={exitGuidedDemo}>Exit</button>}
            {demoStatus !== 'idle' && <button type="button" onClick={restartGuidedDemo}>Restart</button>}
            <button type="button" onClick={() => setManualControlsOpen((value) => !value)}>
              {manualControlsOpen ? 'Hide controls' : 'Explore manually'}
            </button>
            {demoStatus !== 'idle' && <span className="demo-progress">Step {demoStepIndex}/9</span>}
          </div>
        </header>

        <div className="hotspot-layer" aria-label="Vehicle feature hotspots">
          {HOTSPOTS.map((hotspot) => (
            <button
              key={hotspot.id}
              ref={(element) => {
                hotspotRefs.current[hotspot.id] = element;
              }}
              type="button"
              className={`hotspot-button ${activeHotspot === hotspot.id ? 'active' : ''}`}
              onClick={() => handleHotspot(hotspot.id)}
            >
              {hotspot.label}
            </button>
          ))}
        </div>

        <section className="control-strip" aria-label="Primary vehicle controls">
          <button type="button" onClick={() => setAutoSpin((value) => !value)}>
            {autoSpin ? 'Pause 360' : 'Rotate 360'}
          </button>
          <button type="button" onClick={enterCabin}>
            Enter cabin
          </button>
          {isCabinView && (
            <button type="button" className="primary-action" onClick={goExterior}>
              Return outside
            </button>
          )}
          <button type="button" onClick={() => handleHotspot('engine')}>
            Powertrain concept
          </button>
        </section>

        {manualControlsOpen && (
        <section className="interaction-panel" aria-label="Advanced vehicle controls">
          <header>
            <span>Vehicle controls</span>
            <small>Motion is limited to independently verified scene nodes.</small>
          </header>
          <div className="interaction-grid">
            <button type="button" onClick={() => toggleDoor('driver')}>
              {openDoors.driver ? 'Close driver door' : 'Open driver door'}
            </button>
            <button type="button" onClick={openAllDoors}>
              {allDoorsOpen ? 'Close all doors' : 'Open all doors'}
            </button>
            <button type="button" onClick={() => inspectCargoArea()}>
              {cargoInspection ? 'Close cargo view' : 'Inspect cargo'}
            </button>
            <button type="button" onClick={enterCabin}>
              Enter cabin
            </button>
            <button type="button" onClick={toggleWheelMotion} className={wheelMotion ? 'active' : ''}>
              {wheelMotion ? 'Stop wheel motion' : 'Wheel motion'}
            </button>
            <button type="button" onClick={() => handleHotspot('wheel')}>
              Focus wheel
            </button>
            <button type="button" onClick={() => handleHotspot('engine')}>
              Powertrain view
            </button>
            <button type="button" onClick={() => setXrayMode((value) => !value)} className={xrayMode ? 'active' : ''}>
              X-ray overlay
            </button>
            <button type="button" onClick={resetInteractions}>
              Reset experience
            </button>
          </div>
          <div className="segmented-controls steering-controls">
            <span>Steer</span>
            {[
              ['left', 'Left'],
              ['straight', 'Straight'],
              ['right', 'Right'],
            ].map(([mode, label]) => (
              <button key={mode} type="button" className={steeringMode === mode ? 'active' : ''} onClick={() => selectSteering(mode)}>
                {label}
              </button>
            ))}
          </div>
          <div className="segmented-controls">
            <span>Terrain</span>
            {[
              ['off', 'Off'],
              ['smooth', 'Smooth'],
              ['rock', 'Rock'],
              ['slope', 'Slope'],
            ].map(([mode, label]) => (
              <button key={mode} type="button" className={suspensionMode === mode ? 'active' : ''} onClick={() => selectSuspension(mode)}>
                {label}
              </button>
            ))}
          </div>
          <div className="segmented-controls render-quality-controls">
            <span>Render</span>
            {RENDER_QUALITY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={renderQuality === option.id ? 'active' : ''}
                onClick={() => setRenderQuality(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
        )}

        {activeHotspotData && (
          <aside className="feature-panel" aria-live="polite">
            <button type="button" className="panel-close" onClick={closeFeaturePanel} aria-label="Close feature panel">Close</button>
            <span>Hotspot</span>
            <h2>{activeHotspotData.title}</h2>
            {activeHotspot === 'engine' && (
              <>
                <div className="engine-placeholder" aria-label="Conceptual powertrain diagram">
                  <i />
                  <i />
                  <i />
                  <strong>Powertrain system concept</strong>
                </div>
                <p>A conceptual power-flow story for digital product exploration.</p>
                <p>This is not a real engine mesh or an engineering model of a production vehicle.</p>
                <div className="engine-hotspot-list">
                  {CONCEPT_ENGINE_HOTSPOTS.map((part) => (
                    <button key={part.id} type="button" className={activeEnginePart === part.id ? 'active' : ''} onClick={() => setActiveEnginePart(part.id)}>
                      {part.label}
                    </button>
                  ))}
                </div>
                {activeEnginePart && (
                  <article className="engine-part-card">
                    <strong>{CONCEPT_ENGINE_HOTSPOTS.find((part) => part.id === activeEnginePart)?.title}</strong>
                    <p>{CONCEPT_ENGINE_HOTSPOTS.find((part) => part.id === activeEnginePart)?.text}</p>
                    <small>{CONCEPT_ENGINE_HOTSPOTS.find((part) => part.id === activeEnginePart)?.value}</small>
                  </article>
                )}
              </>
            )}
            {activeHotspot === 'cabin' && (
              <p>The cabin camera uses the asset's real Interior, Seats, Dashboard, and SteeringWheel nodes.</p>
            )}
            {activeHotspot === 'wheel' && (
              <p>Independent wheel and brake groups support steering, rotation, and visual terrain demonstrations. This is not a physics simulation.</p>
            )}
            {activeHotspot === 'cargo' && (
              <p>The unreliable rear hatch mesh is temporarily hidden during cargo inspection. No real hatch-opening claim is made.</p>
            )}
            {activeHotspot === 'safety' && (
              <p>This educational hotspot shows how verified trim-specific safety content could be presented. It does not claim a production equipment package.</p>
            )}
            {activeHotspotPrompt && (
              <button type="button" className="ask-agent-button" onClick={() => submitChat(activeHotspotPrompt)}>
                Ask Lyra
              </button>
            )}
            <small>{doorStatus}</small>
          </aside>
        )}

        <aside className="sales-panel" aria-label="Lyra AI Vehicle Concierge">
          <div className="assistant-head">
            <div>
              <span>{PRODUCT.assistantName} &mdash; {PRODUCT.assistantDescriptor}</span>
              <strong>{assistantStatus}</strong>
            </div>
            <em>{assistantMode === 'live' ? 'Live AI' : 'Offline Assistance'}</em>
          </div>

          <div ref={messagesRef} className="messages" aria-live="polite">
            {messages.map((message) => (
              <p key={message.id} className={message.role}>
                {message.text}
                {message.role === 'assistant' && <small>{message.mode === 'live' ? 'Live AI' : 'Offline Assistance'}</small>}
              </p>
            ))}
            {assistantBusy && <p className="assistant typing">Lyra is coordinating the experience...</p>}
          </div>

          <form className="chat-form" onSubmit={(event) => {
            event.preventDefault();
            submitChat();
          }}>
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Tell Lyra what matters to you..."
              aria-label="Message Lyra"
            />
            <button type="submit" disabled={assistantBusy}>Send</button>
          </form>

          <div className="quick-prompts">
            {[
              'We need a family vehicle for weekend trails.',
              'Show an illustrative payment scenario.',
            ].map((prompt) => (
              <button key={prompt} type="button" onClick={() => submitChat(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <div className="purchase-tabs" role="tablist" aria-label="Purchase path">
            <button
              type="button"
              className={purchaseMode === 'cash' ? 'active' : ''}
              onClick={() => setPurchaseMode('cash')}
            >
              Cash
            </button>
            <button
              type="button"
              className={purchaseMode === 'installment' ? 'active' : ''}
              onClick={() => setPurchaseMode('installment')}
            >
              Finance demo
            </button>
          </div>

          {purchaseMode === 'installment' ? (
            <div className="finance-grid">
              <label>
                Demo vehicle price
                <input
                  type="number"
                  value={finance.total}
                  onChange={(event) => setFinance((current) => ({ ...current, total: event.target.value }))}
                />
              </label>
              <label>
                Down payment
                <input
                  type="number"
                  value={finance.downPayment}
                  onChange={(event) => setFinance((current) => ({ ...current, downPayment: event.target.value }))}
                />
              </label>
              <label>
                Term (months)
                <input
                  type="number"
                  value={finance.months}
                  onChange={(event) => setFinance((current) => ({ ...current, months: event.target.value }))}
                />
              </label>
              <label>
                Illustrative APR (%)
                <input
                  type="number"
                  value={finance.annualRate}
                  onChange={(event) => setFinance((current) => ({ ...current, annualRate: event.target.value }))}
                />
              </label>
              <div className="payment-result">
                <span>Illustrative monthly payment</span>
                <strong>{financeResult.ok ? formatDemoCurrency(monthlyPayment) : 'Check inputs'}</strong>
              </div>
              <small className="finance-disclaimer"><strong>Demonstration Only</strong> &middot; <strong>Not a Financing Offer</strong> &middot; No approval or lender term.</small>
            </div>
          ) : (
            <p className="cash-note">Live pricing is intentionally unavailable. A production deployment would use verified inventory and sales systems.</p>
          )}

          <form className="lead-form" onSubmit={submitLead}>
            <input
              value={leadForm.name}
              onChange={(event) => setLeadForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Name"
              aria-invalid={Boolean(leadErrors.name)}
            />
            <input
              value={leadForm.phone}
              onChange={(event) => setLeadForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="Phone, including country code"
              inputMode="tel"
              aria-invalid={Boolean(leadErrors.phone)}
            />
            <label className="consent-control">
              <input
                type="checkbox"
                checked={leadForm.consent}
                onChange={(event) => setLeadForm((current) => ({ ...current, consent: event.target.checked }))}
              />
              I consent to creating a local demo follow-up record in this browser.
            </label>
            {Object.keys(leadErrors).length > 0 && <small className="form-error">{Object.values(leadErrors).join(' ')}</small>}
            <button type="submit" className="primary-action">Save my configuration</button>
          </form>

          {crmRecords.length > 0 && (
            <div className="crm-records">
              {crmRecords.map((record) => (
                <article key={record.id}>
                  <strong>{record.id}</strong>
                  <span>{record.name} | {record.phone}</span>
                </article>
              ))}
              <button type="button" onClick={clearDemoData}>Clear demo data</button>
            </div>
          )}
        </aside>

        {ownerPanelOpen && (
          <aside className="owner-panel" aria-label="Owner AI settings">
            <header>
              <div>
                <span>Owner settings</span>
                <h2>Secure AI connection</h2>
              </div>
              <button type="button" onClick={() => setOwnerPanelOpen(false)}>Close</button>
            </header>
            <p>
              API credentials are never entered or stored in the browser. Configure the server-only file:
              <code>server/.env</code>
            </p>
            <dl>
              <div>
                <dt>Provider</dt>
                <dd>{apiStatus.provider}</dd>
              </div>
              <div>
                <dt>Model</dt>
                <dd>{apiStatus.model}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{API_STATUS_TEXT[apiStatus.status] || apiStatus.status}</dd>
              </div>
            </dl>
            {apiStatus.enabled ? (
              <label className="api-toggle">
                <input
                  type="checkbox"
                  checked={apiMode}
                  onChange={(event) => setApiMode(event.target.checked)}
                />
                Enable Live AI for this owner session
              </label>
            ) : (
              <p className="live-ai-unavailable">Live AI unavailable in this build</p>
            )}
            <div className="owner-actions">
              <button type="button" onClick={refreshApiStatus}>Refresh status</button>
              <button type="button" onClick={() => submitChat('Give me a concise cabin overview.')} disabled={assistantBusy}>
                Test Offline Assistance
              </button>
            </div>
            <small>Toggle this panel with Ctrl + Shift + K.</small>
          </aside>
        )}

        {developerMode && (
          <aside className="debug-panel" aria-label="Developer diagnostics">
            <header>
              <div>
                <h2>Developer Debug Viewer</h2>
                <p>{status}</p>
              </div>
              <button type="button" onClick={() => setDeveloperMode(false)}>Close</button>
            </header>

            <dl>
              <div>
                <dt>Mesh</dt>
                <dd>{visibleMeshCount}/{modelInfo.meshes.length}</dd>
              </div>
              <div>
                <dt>Material</dt>
                <dd>{modelInfo.materials.length}</dd>
              </div>
              <div>
                <dt>Triangles</dt>
                <dd>{triangleLabel}</dd>
              </div>
            </dl>

            <section className="debug-section">
              <h3>Agent Provider</h3>
              <code>{assistantMode === 'live' ? 'Live tool orchestration' : 'Deterministic Guided Demo'}</code>
              <small>Offline intents: {getOfflineIntentCount()}</small>
              <small>Guided completions: {demoCompletedRuns}</small>
              <small>Render quality: {RENDER_QUALITY_OPTIONS.find((option) => option.id === renderQuality)?.label}</small>
              <small>Provider status: {apiStatus.status}</small>
              {apiStatus.enabled && <small>Last technical error: {apiError || 'none'}</small>}
            </section>

            <section className="debug-section">
              <h3>Runtime</h3>
              <small>Model: {MODEL_ASSET.url}</small>
              <small>Source groups: {MODEL_ASSET.sourceMeshGroups}</small>
              <small>Source textures: {MODEL_ASSET.sourceTextures}</small>
              <small>Approximate FPS: {runtimeMetrics.fps || 'measuring'}</small>
              <small>Device pixel ratio: {runtimeMetrics.pixelRatio}</small>
              <small>Model load: {runtimeMetrics.modelLoadMs === null ? 'pending' : `${runtimeMetrics.modelLoadMs} ms`}</small>
            </section>

            <section className="debug-actions">
              <button type="button" onClick={() => runVisibilityAction((root) => setEveryMesh(root, true))}>
                Show all
              </button>
              <button type="button" onClick={() => runVisibilityAction((root) => setByClassifier(root, 'body', false))}>
                Hide body
              </button>
              <button type="button" onClick={() => runVisibilityAction((root) => setByClassifier(root, 'glass', false))}>
                Hide glass
              </button>
              <button type="button" className={wireframe ? 'active' : ''} onClick={applyWireframe}>
                Wireframe
              </button>
              <button type="button" onClick={() => moveCamera('front', 700)}>
                Front view
              </button>
              <button type="button" onClick={enterCabin}>
                Cabin view
              </button>
            </section>

            <section className="debug-section">
              <h3>Mechanical diagnostics</h3>
              <div className="mechanical-list">
                {mechanicalDiagnostics.map((item) => (
                  <article key={`${item.part}-${item.mesh}`}>
                    <strong>{item.part}</strong>
                    <span>{item.mesh}</span>
                    <small>
                      {item.independent ? 'independent' : 'not independent'} | axis: {item.axis} | pivot: {item.pivot?.join(', ') || 'none'}
                    </small>
                    <small>
                      {item.animatable ? 'animatable' : 'disabled'}{item.reason ? ` | ${item.reason}` : ''}
                    </small>
                    {item.boundingBox && (
                      <code>
                        size [{item.boundingBox.size.join(', ')}] center [{item.boundingBox.center.join(', ')}]
                      </code>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <section className="debug-section">
              <h3>Rear mesh analysis</h3>
              <div className="mechanical-list">
                {rearHatchCandidates.map((item) => (
                  <article key={item.name}>
                    <strong>{item.name}</strong>
                    <span>{item.materialNames.join(', ')}</span>
                    <small>{item.selectedForHatch ? 'cargo inspection mesh' : 'fixed or inseparable'}</small>
                    <small>{item.reason}</small>
                    <code>
                      size [{item.box.size.join(', ')}] center [{item.box.center.join(', ')}]
                    </code>
                  </article>
                ))}
              </div>
            </section>

            <section className="debug-section">
              <h3>Scene-name search</h3>
              <div className="term-grid">
                {SEARCH_TERMS.map((term) => (
                  <span key={term} className={modelInfo.keywordHits[term]?.length ? 'hit' : 'miss'}>
                    {term}
                    <b>{modelInfo.keywordHits[term]?.length ?? 0}</b>
                  </span>
                ))}
              </div>
            </section>

            <section className="debug-section">
              <h3>Meshes</h3>
              <div className="mesh-list">
                {modelInfo.meshes.map((mesh) => (
                  <article key={mesh.id} className={!mesh.visible ? 'is-hidden' : ''}>
                    <button type="button" onClick={() => toggleMesh(mesh.id)}>
                      {mesh.visible ? 'Hide' : 'Show'}
                    </button>
                    <div>
                      <strong>{mesh.name}</strong>
                      <span>{mesh.materialNames.join(', ') || 'no material'}</span>
                      <small>{mesh.triangles.toLocaleString('en-US')} triangles</small>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="debug-section">
              <h3>Materials</h3>
              <div className="material-list">
                {modelInfo.materials.map((material) => (
                  <span key={material.name}>{material.name}</span>
                ))}
              </div>
            </section>
          </aside>
        )}

        <button
          type="button"
          className="developer-trigger"
          onClick={() => setDeveloperMode((value) => !value)}
          aria-label="Toggle developer diagnostics"
        >
          DEV
        </button>

        {modelFailed && (
          <section className="model-fallback" role="alert">
            <strong>3D experience unavailable</strong>
            <p>The commerce and guided-assistance tools remain available. Reload to retry the vehicle model.</p>
            <button type="button" onClick={() => window.location.reload()}>Reload 3D experience</button>
          </section>
        )}

        {welcomeOpen && (
          <section className="welcome-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
            <div className="welcome-content">
              <span>Auto Gallery competition build</span>
              <h2 id="welcome-title">Explore the vehicle with Lyra.</h2>
              <p>{COMPETITION_DISCLOSURE}</p>
              <div>
                <button type="button" className="primary-action" onClick={startGuidedDemo} disabled={!modelRef.current} autoFocus>Start Guided Demo</button>
                <button type="button" onClick={() => { setWelcomeOpen(false); setManualControlsOpen(true); }}>Explore manually</button>
              </div>
              <small>{status}</small>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<ShowroomApp />);
