# Final Engineering Report

## Submission State

Auto Gallery is prepared as a reliable static Guided Demo competition build. The default path is deterministic, the assistant fallback is rule-based, and external AI is disabled in the public experience.

Auto Gallery was designed and engineered with Codex powered by GPT-5.6. GPT-5.6 supported the development of the 3D interaction architecture, guided vehicle journey, scene-action tools, performance pipeline, testing strategy, and competition release. The submitted public build defaults to a deterministic Guided Demo for reliable judging.

Live tool-calling was validated in isolated compatibility tests. The public competition build uses a deterministic Guided Demo because the tested third-party gateway did not provide sufficiently reliable production latency.

## Delivered Experience

- Optimized glTF vehicle delivered from static production assets.
- Fresh page loads start in Quality render mode.
- Fixed Onyx Black vehicle presentation.
- Front and rear in-scene AG badge sprites removed while UI branding remains.
- Preserved four side doors, wheels, cabin, seats, dashboard, and steering wheel.
- Exterior reveal, driver-door opening, cabin camera, steering, wheel motion, visual suspension, cargo inspection, and conceptual powertrain demonstration.
- Deterministic Lyra Guided Demo with bounded steps, timeout recovery, Pause, Resume, Exit, and Restart.
- Rule-based Offline Assistance with truthful prepared responses.
- Validated illustrative payment calculator labeled **Demonstration Only** and **Not a Financing Offer**.
- Consent-based browser-local demo record labeled **Demo lead created locally**.
- Developer diagnostics for meshes, materials, triangles, mechanical groups, and runtime performance.

## Static Deployment Gate

The public build is prepared for static hosting:

1. Vite base path is `/`.
2. `public/_redirects` provides Cloudflare Pages SPA fallback.
3. Vehicle assets are under `public/models` and are copied into `dist/models`.
4. The built browser bundle contains no dependency on `/api/lyra/respond` or `/api/lyra/status`.

No external AI request is made during startup, page load, scans, tests, build, Guided Demo, or Offline Assistance.

## Guided Demo Reliability

The runner uses a unique run identifier. Restart and Exit invalidate earlier asynchronous work. Each action is bounded by a timeout, reports recovery locally, restores a safe exterior state when needed, and continues. Display delays are pause-aware. A clean start resets the fixed paint state, camera interactions, doors, wheels, suspension, cargo, powertrain overlays, financing inputs, lead form, assistant state, and messages.

The guided lead step creates only a summary and never writes a CRM record. Manual browser-local record creation remains consent-gated.

## Truthfulness

- The vehicle is a Premium SUV Concept pending official asset and configuration verification.
- Cargo inspection hides an unreliable hatch instead of claiming a working hatch animation.
- Powertrain graphics are conceptual because the source asset has no engine mesh.
- Finance values are illustrative and not lender terms.
- Local records are not production CRM submissions.
- Guided Demo and Offline Assistance are not represented as live GPT responses.

## Verification Results

- Secret scan: passed.
- Globalization scan: passed.
- Unit tests: passed, 22 tests.
- Production build: passed.
- Production vehicle asset: present in `dist/models/premium-suv-low/`.
- Release test: not run in this final handoff because the requested final check set was secret scan, globalization scan, existing unit tests, and production build.
- Browser/console result: not re-run in this final handoff.

## Remaining Owner Actions

1. Confirm the vehicle asset license before public redistribution.
2. Replace the placeholder GitHub remote with the real repository URL if needed.
3. Push the final reviewed commit to GitHub if the configured remote is not valid.
4. Deploy the static `dist` folder.
5. Verify the public URL and production asset transfer.
6. Capture final competition screenshots.
7. Record the competition video.
8. Submit repository, deployment URL, screenshots, and video.
