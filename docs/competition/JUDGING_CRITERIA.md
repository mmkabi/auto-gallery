# Judging Criteria

## Technical Implementation

**Evidence:** optimized glTF delivery, Three.js mechanical grouping, strict scene-action contracts, compact scene serialization, deterministic Guided Demo orchestration, rule-based Offline Assistance, local lead handling, static Vite deployment, and automated tests.

**Demonstration moment:** start Guided Demo, watch Lyra reveal the exterior, open the driver door, enter the cabin, focus the wheels, show cargo, explain the conceptual powertrain, and calculate an illustrative payment.

**Files:** `src/main.jsx`, `src/ai/toolContracts.js`, `src/ai/localAssistant.js`, `src/three/sceneState.js`, `src/financing/calculator.js`, `src/crm/lead.js`, `tests/`.

**Remaining risk:** the optional live provider path is disabled in the public build and should not be judged as a live GPT deployment.

## Product and Visual Design

**Evidence:** vehicle-first 3D composition, Quality render default, fixed Onyx Black presentation, restrained premium showroom palette, clear AI mode labels, responsive controls, focus states, consent flow, and cancellable guided tour.

**Demonstration moment:** compare the uncluttered first-run screen with manual controls, enter the driver cabin, inspect the cargo area without a broken hatch animation, and use the finance panel.

**Files:** `src/styles.css`, `src/config/product.js`, `src/main.jsx`.

**Remaining risk:** the 474k-triangle vehicle limits the quality ceiling on low-end mobile devices.

## Potential Impact

**Evidence:** one journey combines discovery, product education, customer intent, payment exploration, consent, and lead qualification. The architecture can connect to verified inventory, specification, lender, and CRM systems without changing the customer mental model.

**Demonstration moment:** show how a customer can move from product curiosity to cabin inspection, off-road education, financing context, and a local follow-up summary without leaving the 3D experience.

**Files:** `src/data/vehicleKnowledge.js`, `src/financing/calculator.js`, `src/crm/lead.js`, `docs/competition/README.md`.

**Remaining risk:** impact is a product hypothesis; no production conversion study or customer analytics are claimed.

## Quality and Originality

**Evidence:** Lyra is not a chat widget placed beside a viewer. It is a constrained demonstration layer that coordinates product states, truthful fallbacks, financing labels, and local consent handling.

**Demonstration moment:** run the full Guided Demo twice from a clean state and show that the same repeatable customer journey remains available without external provider latency.

**Files:** `src/ai/`, `src/data/vehicleKnowledge.js`, `src/main.jsx`, `docs/competition/SECURITY_AND_PRIVACY.md`.

**Remaining risk:** several visual interaction primitives are inherited from the pre-existing viewer and are not claimed as newly invented.
