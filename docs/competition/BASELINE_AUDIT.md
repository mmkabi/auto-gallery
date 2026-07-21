# Auto Gallery Competition Baseline Audit

Audit date: 2026-07-20

## Scope and evidence rules

This audit was completed before the competition refactor. A statement is marked **Verified** only when it was confirmed from repository contents, a command result, or a browser check. Anything not measured is marked **Unknown** or **Assumption**.

## Executive baseline

The starting repository is a working desktop-first React and Three.js prototype with a detailed vehicle, mechanical interactions, an offline sales assistant, optional remote chat proxy, demonstration financing, local lead records, and developer diagnostics. It is not production-deployable as built because the vehicle files are served by Vite middleware from a machine-local source directory and are absent from `dist`.

## Repository and source

| Item | Baseline | Evidence |
|---|---|---|
| Source control | No valid Git repository | **Verified:** `git status` and `git log` both returned `not a git repository` |
| UI entry point | `src/main.jsx` | **Verified** |
| UI size | 2,122 lines in `src/main.jsx` | **Verified** |
| Styles | 1,012 lines in `src/styles.css` | **Verified** |
| Build system | Vite 7.3.6 | **Verified** from build output |
| Runtime | React 19 and Three.js 0.180 | **Verified** from `package.json` |
| Automated application tests | None | **Verified:** only an API connection script exists |
| Hosting manifest | Missing | **Verified:** `.openai/hosting.json` does not exist |

## Starting functionality

Verified from source and prior QA artifacts:

- Orbit rotation, zoom, automatic rotation, and camera transitions.
- Five paint choices with a black default.
- Four independently rigged side doors and an all-door toggle.
- Driver-cabin camera using the real `Interior`, `Dashboard`, `SteeringWheel`, and `Seats` groups.
- Wheel rotation, steering, and demonstration suspension modes.
- Cargo inspection that hides `DoorBack` instead of claiming a reliable hatch animation.
- Five customer hotspots plus a conceptual powertrain visualization.
- Offline keyword-routed assistant with 14 subject intents plus an unknown route.
- Optional remote AI proxy in Vite middleware.
- Demonstration payment calculation.
- Local lead records stored in `localStorage`.
- A deterministic automatic interview sequence.
- Mesh, material, triangle, visibility, pivot, and API diagnostics.

## Brand and globalization baseline

**Verified:** the application started with a localized company brand, localized assistant name, non-English UI strings, right-to-left layout, localized currency and date formatting, localized documentation, localized screenshots, and a localized system prompt.

Affected surfaces included:

- `index.html`
- `src/main.jsx`
- `src/styles.css`
- `src/data/localAgentKnowledge.js`
- `server/system-prompt.md`
- `server/knowledge/land-cruiser-300.json`
- `research.md`
- `docs/project-competition-report-fa.md`
- existing screenshots in the repository root and `artifacts/qa`
- legacy logo asset in `public/branding`

## Build baseline

Command: `npm.cmd run build`

Result: **Passed**

- Modules transformed: 35
- Build time reported by Vite: 4.34 seconds
- JavaScript: 788.86 kB, 216.49 kB gzip
- CSS: 15.26 kB, 3.61 kB gzip
- Warning: JavaScript chunk exceeded the 500 kB warning threshold

## Production-path failure

**Verified:** the production `dist` directory contained HTML, JavaScript, CSS, the legacy logo, favicon, and an audio documentation file. It did not contain the OBJ, MTL, or model textures.

`/model-assets/` was served only by `localModelAssetsPlugin()` in `vite.config.js` through `configureServer` and `configurePreviewServer`. A standalone static deployment of `dist` would therefore display the interface but fail to load the vehicle.

## 3D asset baseline

Active source asset: LOW OBJ/MTL variant.

| Metric | Baseline |
|---|---:|
| OBJ bytes | 67,217,229 |
| Texture bytes | 19,338,481 |
| Approximate source payload | 86,555,710 bytes |
| Vertices | 264,205 |
| Faces | 238,030 |
| Approximate triangles | 474,676 |
| Named mesh groups | 22 |
| Materials | 47 |
| Image textures | 18 |

Critical groups verified in the source asset:

- `Body`, `BodyFront`
- `DoorFrLeft`, `DoorFrRight`, `DoorRearLeft`, `DoorRearRight`, `DoorBack`
- four wheel groups and four brake groups
- `Interior`, `Dashboard`, `SteeringWheel`, `Seats`
- `Headlights`, `Taillights`, `Bottom`

The source asset has no independently identified production engine mesh and no reliable standalone hood mesh.

## Browser and cold-load baseline

A production-preview browser check was started at 1366x768. The browser automation call did not complete within its allowed execution window while the raw OBJ experience was loading and parsing. This is recorded as a **verified timeout**, not as a fabricated load-time number.

Baseline time to first interface: **Unknown**.

Baseline time to interactive vehicle: **Not established; browser measurement timed out**.

Baseline FPS and memory: **Unknown**. No values are claimed.

## AI integration baseline

The starting implementation used an OpenAI-compatible Chat Completions request from Vite middleware. The configured default in the example was an older provider-specific model string. No OpenAI SDK was installed.

The local fallback was deterministic keyword matching and must not be represented as a generative model.

Official guidance reviewed for the refactor:

- OpenAI recommends the Responses API for GPT-5.6 reasoning and tool workflows.
- The requested flagship model identifier is `gpt-5.6-sol`; `gpt-5.6` is an alias.
- Function tools should use strict JSON schemas.
- `parallel_tool_calls: false` can bound a response to zero or one function call.
- Function results are returned with `function_call_output` and the original `call_id`.

The OpenAI Developer Docs MCP could not be installed in this environment because the local `codex.exe` invocation returned `Access is denied`. The current official developer website and the bundled GPT-5.6 migration reference were used instead.

## Secret and privacy baseline

- **Verified:** `server/.env` exists and contains a configured API key.
- **Verified:** `server/.env`, `.env`, and matching environment files are ignored by `.gitignore`.
- The key value was not printed during the audit.
- **Owner action required:** any key previously placed in a chat, screenshot, or public location must be revoked and replaced.
- Lead records were stored locally without an explicit consent checkbox or expiry control.

## Asset and trademark baseline

The repository contained manufacturer, vehicle-model, badge, and marketplace-style asset references. No explicit redistribution license for the 3D model or textures was found during the baseline audit.

Status: **License unknown; public redistribution is blocked until the owner supplies evidence.**

The competition-facing product must therefore use neutral `Premium SUV Concept` wording and must not claim that the asset is official.

## High-priority baseline risks

1. Vehicle assets missing from production output.
2. Raw OBJ parse and transfer cost causing an unmeasured but observed browser timeout.
3. No verified 3D asset redistribution license.
4. Localized brand and interface inconsistent with a global competition submission.
5. Passive AI chat rather than a bounded scene-orchestration layer.
6. No tool schema validation or browser-executed tool loop.
7. No automated tests or globalization guard.
8. Demonstration lead flow lacked explicit consent and data clearing.
9. Monolithic application source increased change risk.
10. Stale screenshots could be submitted accidentally.

## Assumptions that require validation

- The LOW source model is visually adequate after conversion to GLB.
- Group names can be retained through the available conversion toolchain.
- A mid-range competition laptop can maintain the target frame rate after conversion and lifecycle fixes.
- GPT-5.6 Sol access is available to the project owner's API account.
- A public deployment account and final competition URL will be supplied by the owner if local hosting tools are unavailable.
