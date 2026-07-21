# Auto Gallery Submission Handoff

## 1. Final Project Identity

- Project name: Auto Gallery.
- AI concierge: Lyra - AI Vehicle Concierge.
- Tagline: Explore. Understand. Decide.
- Recommended competition category/track: AI-assisted commerce, interactive product experience, or automotive retail technology.
- Product definition: Auto Gallery is a 3D-first vehicle discovery and sales-assistance demo that combines interactive product exploration, deterministic guidance, illustrative financing, and local consent-based follow-up.
- Submission hook: Auto Gallery turns a static vehicle listing into a repeatable 3D consultation where customers can see, understand, and decide with confidence.

## 2. Problem

Online vehicle discovery is usually split across flat image galleries, specification tables, disconnected finance calculators, and late-stage sales forms. Static galleries do not help a customer understand how cabin space, cargo access, wheel behavior, safety education, and ownership budget relate to personal needs. Specification pages describe features but rarely convert those features into a guided decision. Sales teams then receive incomplete leads because the customer has not expressed context, budget, or feature priorities inside the product experience.

## 3. Solution

Auto Gallery places the vehicle at the center of the buying journey. A customer can explore the 3D vehicle, rotate and zoom, open the driver door, enter the real cabin mesh, inspect the cargo area, view wheel and steering demonstrations, review a conceptual powertrain explanation, calculate an illustrative monthly payment, and create a browser-local demo lead only after consent. Lyra guides the journey through a deterministic Guided Demo and rule-based Offline Assistance so the public competition build remains reliable without live provider latency.

## 4. Key Features

- Real interactive 3D vehicle: implemented with an optimized glTF asset in `public/models/premium-suv-low/`.
- 360-degree exploration: implemented through OrbitControls and the visible `Rotate 360` control.
- Paint customization: disabled in the public build; the vehicle is fixed to Onyx Black for visual consistency.
- Independent door interaction: implemented for the four side doors using validated scene groups and pivots.
- Cabin exploration: implemented using the real Interior, Seats, Dashboard, and SteeringWheel nodes.
- Cargo inspection: implemented as a truthful fallback that hides the unreliable rear hatch mesh instead of claiming a broken hatch animation.
- Wheel and steering demonstrations: implemented with independent wheel and steering-wheel motion.
- Suspension/off-road demonstration: illustrative visual state, not a physics simulation.
- Conceptual powertrain visualization: illustrative only because the source asset has no real engine mesh.
- Safety exploration: implemented as an educational hotspot and prepared Offline Assistance response.
- Illustrative financing: implemented and labeled Demonstration Only and Not a Financing Offer.
- Local consent-gated demo lead handling: implemented in browser storage; not a production CRM.
- Guided Demo: implemented as the default competition mode.
- Offline Assistance: implemented as rule-based intent matching with prepared responses.
- Performance modes: implemented as Performance, Balanced, and Quality; fresh loads default to Quality.
- Reset/restart behavior: implemented for Guided Demo and manual controls.
- Live AI: disabled in the public build.

## 5. Exact Guided Demo Sequence

All Guided Demo steps are repeatable. The controls `Pause`, `Resume`, `Exit`, and `Restart` are available while the demo is running or paused. Restart invalidates the prior run and starts from a clean state.

1. Exterior reveal
   - Visible Lyra message: "Exterior reveal: the optimized production vehicle asset is centered for a complete 360-degree view."
   - Camera action: returns to the exterior cinematic camera.
   - Vehicle action: doors closed, cargo closed, wheel motion off, Onyx Black paint active.
   - UI panel or feature shown: main showroom.
   - Approximate duration: 4.8 seconds.
   - Control used: `Start Guided Demo` or `Restart Guided Demo`.
   - Expected final state: centered exterior view.

2. Driver door
   - Visible Lyra message: "Driver door demonstration: the independent front-door mesh opens around its validated hinge pivot."
   - Camera action: stays in exterior context.
   - Vehicle action: driver door opens.
   - UI panel or feature shown: main showroom.
   - Approximate duration: 4.4 seconds.
   - Control used: automatic Guided Demo step.
   - Expected final state: driver door open.

3. Cabin entry
   - Visible Lyra message: "Cabin entry: the camera moves to the real interior, seats, dashboard, and steering-wheel meshes."
   - Camera action: moves into the driver cabin.
   - Vehicle action: cabin nodes remain visible.
   - UI panel or feature shown: cabin view.
   - Approximate duration: 5.6 seconds.
   - Control used: automatic Guided Demo step.
   - Expected final state: dashboard, steering wheel, and seats visible.

4. Steering demonstration
   - Visible Lyra message: "Steering demonstration: the steering wheel and front wheels move together, then return to center."
   - Camera action: remains cabin/exterior-compatible depending on current target.
   - Vehicle action: steering left, steering right, then straight.
   - UI panel or feature shown: steering/wheel movement.
   - Approximate duration: 4.8 seconds plus two 600 ms steering holds.
   - Control used: automatic Guided Demo step.
   - Expected final state: steering centered.

5. Off-road demonstration
   - Visible Lyra message: "Off-road demonstration: wheel motion and the visual rock suspension mode illustrate the interaction concept; this is not a physics simulation."
   - Camera action: focuses wheel area.
   - Vehicle action: wheel motion starts and rock suspension visual mode is selected.
   - UI panel or feature shown: wheel hotspot context.
   - Approximate duration: 5.6 seconds.
   - Control used: automatic Guided Demo step.
   - Expected final state: wheel focus with off-road visual active.

6. Cargo view
   - Visible Lyra message: "Cargo view: the unreliable hatch group is hidden temporarily so the real interior load area can be inspected without claiming a false hatch animation."
   - Camera action: focuses rear cargo area.
   - Vehicle action: wheel motion stops, suspension returns off, cargo inspection hides the rear hatch mesh.
   - UI panel or feature shown: cargo hotspot context.
   - Approximate duration: 5.6 seconds.
   - Control used: automatic Guided Demo step.
   - Expected final state: cargo inspection visible.

7. Conceptual powertrain
   - Visible Lyra message: "Conceptual powertrain view: a clearly labeled educational overlay is shown because the source asset has no real engine mesh."
   - Camera action: focuses the front/powertrain area.
   - Vehicle action: cargo inspection closes and conceptual engine overlay opens.
   - UI panel or feature shown: powertrain panel and overlay.
   - Approximate duration: 5.6 seconds.
   - Control used: automatic Guided Demo step.
   - Expected final state: conceptual powertrain shown.

8. Illustrative financing
   - Visible Lyra message: starts with "Demonstration Only. Not a Financing Offer."
   - Camera action: unchanged.
   - Vehicle action: none.
   - UI panel or feature shown: financing inputs and monthly payment.
   - Approximate duration: 4.8 seconds.
   - Control used: automatic Guided Demo step.
   - Expected final state: installment demo values visible.

9. Local lead summary
   - Visible Lyra message: "Lead summary prepared locally: Onyx Black paint, cabin and off-road interest, cargo review, and illustrative financing. No CRM record was created and no customer data was transmitted."
   - Camera action: unchanged.
   - Vehicle action: none.
   - UI panel or feature shown: assistant panel.
   - Approximate duration: 4.8 seconds.
   - Control used: automatic Guided Demo step.
   - Expected final state: demo complete message; no real CRM record.

## 6. Exact Manual Demonstration Controls

- `Start Guided Demo`: starts the deterministic tour from a clean state.
- `Restart Guided Demo`: starts the tour again after at least one run.
- `Pause`: pauses a running tour.
- `Resume`: resumes a paused tour.
- `Exit`: exits the current tour and resets core state.
- `Restart`: restarts while a tour is running or paused.
- `Explore manually`: opens manual controls.
- `Hide controls`: hides manual controls.
- `Rotate 360`: toggles auto rotation.
- `Pause 360`: stops auto rotation.
- `Enter cabin`: moves the camera to the driver cabin.
- `Return outside`: returns from cabin view.
- `Powertrain concept`: opens the conceptual powertrain hotspot.
- Hotspots: `Powertrain`, `Cabin`, `Wheels`, `Cargo`, `Safety`.
- `Ask Lyra`: sends the hotspot prompt to Offline Assistance.
- `Open driver door` / `Close driver door`: toggles driver door.
- `Open all doors` / `Close all doors`: toggles all independent side doors.
- `Inspect cargo` / `Close cargo view`: toggles cargo inspection by hiding the unreliable hatch mesh.
- `Wheel motion` / `Stop wheel motion`: toggles wheel rotation.
- `Focus wheel`: moves camera to the wheel area.
- `Powertrain view`: moves to the conceptual powertrain.
- `X-ray overlay`: toggles conceptual overlay lines.
- `Reset experience`: resets camera and vehicle state.
- Steering controls: `Left`, `Straight`, `Right`.
- Terrain controls: `Off`, `Smooth`, `Rock`, `Slope`.
- Render controls: `Performance`, `Balanced`, `Quality`.
- Finance controls: `Cash`, `Finance demo`, `Demo vehicle price`, `Down payment`, `Term (months)`, `Illustrative APR (%)`.
- `Save my configuration`: creates a browser-local demo record only after consent.
- `Clear demo data`: clears local demo records.
- Paint controls: disabled in the public build; the vehicle remains Onyx Black.

## 7. Technical Architecture

- Frontend framework: React 19 and Vite 7.
- Three.js architecture: `src/main.jsx` manages scene creation, camera, renderer, GLTFLoader, OrbitControls, mechanical rigs, hotspots, render quality, and guided orchestration.
- React structure: single main showroom component with imported modules for tools, product config, assistant data, financing, CRM, and scene serialization.
- Vite build: `vite.config.js` uses base path `/`, React plugin, and `publicDir: 'public'`.
- glTF asset pipeline: optimized asset is stored in `public/models/premium-suv-low/`.
- Material and paint-selection logic: `src/main.jsx` prepares fixed Onyx Black body paint and natural matte tire material; `src/config/product.js` contains the single allowed paint preset.
- Scene-state management: `src/three/sceneState.js` serializes compact allowlisted state.
- Guided Demo orchestration: `startGuidedDemo` and related helpers in `src/main.jsx`.
- Offline Assistant logic: `src/ai/localAssistant.js` and `src/data/vehicleKnowledge.js`.
- Financing module: `src/financing/calculator.js`.
- Local lead storage: `src/crm/lead.js`.
- Security and privacy design: `.gitignore`, `tools/scan-secrets.mjs`, `docs/competition/SECURITY_AND_PRIVACY.md`.
- Static deployment architecture: `dist` is self-contained with `_redirects`, assets, model, textures, CSS, and JS.

## 8. 3D Asset and Performance Pipeline

- Original source vehicle folder size in the local workspace: 1,889,811,839 bytes.
- Final optimized public model package: 14,410,611 bytes in `public/models/premium-suv-low`.
- Approximate reduction from local source folder to public model package: 99.2%.
- Triangle count: approximately 474,676 source triangles; performance report measured 474,623 loaded triangles.
- Primitive count: 185 source render primitives according to `docs/competition/PERFORMANCE_REPORT.md`.
- Material count: 47 source materials.
- Texture strategy: external optimized JPEG base color and normal textures.
- Meshopt/quantization: glTF uses Meshopt compression according to performance documentation.
- Latest production build output: CSS 18.56 kB, app JS 341.12 kB, React JS 11.21 kB, Three.js JS 538.67 kB.
- Final `dist` size after the final rebuild in this handoff: 15,321,220 bytes.
- Final build duration in this handoff: 1.46 seconds on the local machine.
- Performance modes: Performance, Balanced, Quality.
- Adaptive DPR: render settings clamp pixel ratio by mode.
- Hidden-tab rendering: render work is minimized while the document is hidden.
- Context-loss recovery: WebGL context lost/restored handlers are present in `src/main.jsx`.

## 9. Codex and GPT-5.6 Contribution

Auto Gallery was designed and engineered with Codex powered by GPT-5.6. GPT-5.6 supported the development of the 3D interaction architecture, guided vehicle journey, scene-action tools, performance pipeline, testing strategy, and competition release. The submitted public build defaults to a deterministic Guided Demo for reliable judging.

Codex implemented and iterated on `src/main.jsx`, `src/ai/toolContracts.js`, `src/ai/localAssistant.js`, `src/financing/calculator.js`, `src/crm/lead.js`, `src/three/sceneState.js`, Vite static deployment settings, scans, tests, and competition documentation. Codex also corrected generated or unstable approaches: the broken rear hatch animation was replaced with truthful cargo inspection, unreliable live provider behavior was disabled, public paint controls were removed for a fixed Onyx Black competition presentation, and in-scene AG badge sprites were removed while preserving UI branding.

Human decisions remained in product concept, branding direction, automotive sales focus, final visual preference, and the choice to prioritize reliability over live provider claims.

## 10. Human Decisions

- Product concept: a 3D-first vehicle sales experience.
- Automotive sales focus: vehicle exploration, education, financing context, and follow-up.
- Branding: Auto Gallery, Lyra, Explore. Understand. Decide.
- Visual design direction: premium showroom, black vehicle, minimal controls.
- Feature prioritization: Guided Demo first, manual exploration second.
- Truthful feature handling: no fake engine mesh and no false hatch animation.
- Reliability decision: Live AI disabled in the public build.
- Competition positioning: deterministic guided experience supported by Codex-built architecture.

## 11. Challenges and Engineering Resolutions

- Heavy original vehicle asset
  - Problem: original local asset package was too large for practical web delivery.
  - Cause: raw source package and high-detail model files.
  - Resolution: optimized glTF package with external JPEG textures under `public/models/premium-suv-low`.
  - Limitation: asset-license confirmation is still required.

- Paint-material targeting
  - Problem: exterior paint had baked or split materials.
  - Cause: converted source material groups.
  - Resolution: body paint materials are cloned and normalized to fixed Onyx Black.
  - Limitation: public paint controls are disabled.

- Vehicle interaction grouping
  - Problem: only some moving parts are reliably independent.
  - Cause: source scene hierarchy and pivots.
  - Resolution: side doors, wheels, and steering use validated groups and pivots.
  - Limitation: not every visible part is independently animated.

- Cargo/hatch limitations
  - Problem: hatch animation produced an incomplete visual.
  - Cause: complete rear hatch was not available as a reliable independent group.
  - Resolution: cargo inspection hides the unreliable hatch mesh.
  - Limitation: not a real hatch-opening animation.

- Live AI gateway reliability
  - Problem: third-party gateway latency and compatibility were not production-reliable.
  - Cause: provider behavior outside the static public build.
  - Resolution: public build uses Guided Demo and Offline Assistance.
  - Limitation: live provider is disabled.

- Static deployment conversion
  - Problem: earlier versions depended on server routes or local model serving.
  - Cause: Vite middleware and API routes.
  - Resolution: model assets moved under `public`, Vite base `/`, and `_redirects` added.
  - Limitation: live AI requires future server deployment.

- Security and secret handling
  - Problem: provider credentials must not enter the client or repository.
  - Cause: live provider experiments required local env files.
  - Resolution: `.env`, `server/.env`, logs, backups, and raw source files are ignored; secret scan passes.
  - Limitation: owner must rotate any previously exposed development credential.

- Performance balancing
  - Problem: vehicle is still a high-detail asset.
  - Cause: 474k triangle source model.
  - Resolution: render modes, optimized model, hidden-tab behavior, and static asset delivery.
  - Limitation: low-end mobile devices may still need Performance mode.

## 12. Verification Evidence

- Final build result: passed, `npm.cmd run build`, Vite built 43 modules in 1.46 seconds.
- Unit-test result: passed, 22 tests.
- Secret-scan result: passed.
- Globalization-scan result: passed.
- Release-test result: not run in this handoff.
- Browser/console result: not re-run in this handoff.
- Local production preview result: not re-run in this handoff.
- Fresh loads start in Quality mode: implemented by `getDefaultRenderQuality()` returning `high`.
- Front AG vehicle badge absent: front badge creation block removed from `src/main.jsx`.
- Rear AG vehicle badge absent: rear badge creation block removed from `src/main.jsx`.
- Live AI disabled: static client no longer depends on `/api/lyra/respond` or `/api/lyra/status`; `ENABLE_LIVE_AI=false` remains the documented default.
- No external AI request occurs in the public build: no connectivity test was run and public UI uses Guided Demo/Offline Assistance.

## 13. Repository and Deployment Information

- Repository URL: `https://github.com/YOUR_USERNAME/auto-gallery.git` is the configured placeholder remote; owner must confirm the real URL.
- Branch: `main`.
- Latest commit hash before final handoff commit: `332eb402dc594c6c5340a2b80c2ec5bc15549430`.
- Latest commit message before final handoff commit: `Auto Gallery competition release`.
- Public demo URL: Public URL requires owner confirmation.
- Local run instructions: `npm install`, `npm run dev`.
- Production build instructions: `npm run build`.
- Static deployment output directory: `dist`.
- Required Node version: not explicitly pinned in the repository.
- Hosting limitations: static build works for Guided Demo and Offline Assistance; live provider requires future server integration.

## 14. Third-Party Assets and Licenses

- Vehicle model source: local third-party premium SUV concept package in the owner workspace.
- Vehicle asset license status: marketplace/source identification exists in `docs/competition/THIRD_PARTY_LICENSES.md`, but public redistribution still requires owner confirmation.
- Textures: included as optimized JPEG textures in the public model package; rights follow the vehicle asset package and require confirmation.
- React: dependency in `package.json`.
- Three.js: dependency in `package.json`.
- Vite: dependency in `package.json`.
- OpenAI JavaScript SDK: dependency retained for disabled future server work; not used by the public static build.
- Fonts/icons: no separate external font or icon asset pack is required by the public build.
- Verified license information: library licenses documented in `docs/competition/THIRD_PARTY_LICENSES.md`.
- Owner-provided information: vehicle asset purchase/redistribution rights.
- Unverified information requiring owner confirmation: exact vehicle asset license coverage for public static hosting.

## 15. Known Limitations

- Live AI is disabled in the public competition build.
- Conceptual powertrain is not a real engine mesh.
- Suspension/off-road mode is visual, not a physics simulation.
- Financing is illustrative and not a financing offer.
- Demo lead storage is browser-local and not a real CRM.
- No lender integration, inventory integration, analytics, or production CRM exists.
- Rear hatch opening is not reliable; cargo inspection hides the hatch mesh.
- Public paint controls are disabled; Onyx Black is fixed.
- Low-end mobile performance may require a lower render mode.
- Public URL requires owner confirmation.
- Asset-license confirmation is still required before public redistribution.

## 16. Judging-Criteria Alignment

- Technical implementation
  - Optimized glTF vehicle loads from static assets.
  - Three.js controls, mechanical rigs, hotspots, and guided orchestration are implemented.
  - Secret scan, globalization scan, unit tests, and build pass.

- Product and visual design
  - Vehicle remains the focal point in a premium showroom UI.
  - Guided Demo provides a coherent retail journey.
  - Truthful labels distinguish deterministic guidance, conceptual features, and illustrative finance.

- Potential impact
  - Connects product education, affordability, and follow-up.
  - Helps customers relate vehicle features to needs.
  - Creates a path for future inventory, lender, and CRM integrations.

- Quality and originality
  - Lyra coordinates vehicle states instead of acting as a detached chat box.
  - Broken/unsupported features are handled honestly.
  - Static public build prioritizes repeatable judging reliability.

## 17. Strongest Competition Differentiators

1. 3D-first guided sales journey rather than a flat vehicle listing.
2. Deterministic Lyra demo that is reliable for judging.
3. Real vehicle interaction groups for doors, cabin, wheels, and steering.
4. Honest handling of unsupported engine and hatch features.
5. Integrated illustrative financing and consent-gated local follow-up.

## 18. Strongest Visual Moments

1. Exterior reveal - use `Start Guided Demo`; cinematic exterior camera; shows the full black SUV; ideal screen time 8 seconds.
2. Driver door opening - automatic demo step; exterior camera; proves mechanical interaction; 6 seconds.
3. Cabin entry - automatic demo step or `Enter cabin`; driver-position camera; shows dashboard, wheel, and seats; 10 seconds.
4. Steering movement - automatic demo step; cabin or wheel view; shows synchronized steering; 8 seconds.
5. Wheel focus - `Focus wheel`; wheel camera; shows tire/rim/brake grouping; 7 seconds.
6. Rock suspension mode - `Rock`; wheel/body visual motion; supports off-road story; 8 seconds.
7. Cargo inspection - `Inspect cargo`; rear camera; truthful hatch hiding reveals cargo; 8 seconds.
8. Conceptual powertrain - `Powertrain concept`; front camera and overlay; educates without fake engine claims; 8 seconds.
9. Financing demo - `Finance demo`; sales panel; shows affordability context; 8 seconds.
10. Local lead consent - `Save my configuration`; sales panel; shows privacy-aware follow-up; 8 seconds.

## 19. Three-Minute Video Input Data

- Best opening visual: exterior Guided Demo reveal of the black SUV in Quality mode.
- Best opening hook concept: "What if a vehicle listing could guide a customer like a showroom consultant?"
- Problem statement: Online vehicle shopping separates visuals, specs, affordability, and lead capture.
- Solution statement: Auto Gallery turns the vehicle itself into the guided sales interface.
- Most surprising feature: deterministic Lyra journey controls the 3D vehicle without relying on live provider latency.
- Strongest technical achievement: optimized static glTF deployment with mechanical interactions and guided orchestration.
- Strongest AI/Codex evidence: Codex helped build the scene-action architecture, testing strategy, fallback design, and release documentation.
- Best transformation before/after: raw viewer and local model path to static deployable competition package.
- Best proof of reliability: scans, 22 unit tests, and production build pass with Live AI disabled.
- Best closing claim: Auto Gallery is a reliable blueprint for the next generation of guided vehicle commerce.
- 165-175 second sequence: 0-15 exterior reveal, 15-32 problem and solution, 32-50 door and cabin, 50-75 steering and wheel/off-road, 75-92 cargo, 92-110 conceptual powertrain, 110-132 financing, 132-148 local lead consent, 148-165 Codex/GPT-5.6 engineering contribution, 165-175 closing differentiator.

## 20. Owner Actions Still Required

- Confirm final public URL.
- Confirm vehicle asset rights.
- Capture final video.
- Upload video publicly.
- Obtain Codex Session ID.
- Replace placeholder Git remote with the real repository URL if necessary.
- Complete Devpost contact fields.
- Submit before the deadline.
