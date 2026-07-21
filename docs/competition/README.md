# Auto Gallery Competition Build

**Auto Gallery** is an interactive 3D vehicle discovery and commerce demonstration featuring **Lyra - AI Vehicle Concierge** and **Explore. Understand. Decide.**

## Submission Mode

Guided Demo is the production default. It is deterministic, offline-capable, repeatable, and does not depend on provider latency. Offline Assistance uses rule-based intent matching and prepared vehicle guidance. Neither mode is described as live GPT output.

Auto Gallery was designed and engineered with Codex powered by GPT-5.6. GPT-5.6 supported the development of the 3D interaction architecture, guided vehicle journey, scene-action tools, performance pipeline, testing strategy, and competition release. The submitted public build defaults to a deterministic Guided Demo for reliable judging.

Live tool-calling was validated in isolated compatibility tests. The public competition build uses a deterministic Guided Demo because the tested third-party gateway did not provide sufficiently reliable production latency.

## Run Locally

```bash
npm install
npm run dev
```

For static production output:

```bash
npm run build
```

The deployable directory is `dist`.

The submission environment uses:

```env
ENABLE_LIVE_AI=false
```

The static public build does not call `/api/lyra/respond` or `/api/lyra/status`.

## Guided Journey

The nine-step tour demonstrates exterior presentation, driver door, cabin, steering, wheels and visual suspension, cargo, conceptual powertrain, illustrative financing, and a local lead summary. The vehicle color is fixed to Onyx Black in the public build. Every step has timeout recovery. Pause, Resume, Exit, and Restart are available, and repeat execution begins from clean vehicle and UI state.

## Verification

```bash
npm run scan:secrets
npm run scan:globalization
npm test
npm run build
```

The static build delivers the optimized glTF, model buffer, textures, CSS, and JavaScript from `dist`.

## Disclosures

- Financing: **Demonstration Only** and **Not a Financing Offer**.
- Lead storage: **Demo lead created locally** after manual consent; no production CRM is connected.
- Cargo: the unreliable rear hatch is hidden during inspection.
- Powertrain: conceptual visualization; the source asset has no real engine mesh.
- Vehicle: Premium SUV Concept pending licensing and official configuration verification.
- Live AI: disabled in the public build.

See the scripts, FAQ, limitations, checklist, engineering report, handoff, and Devpost draft in this directory for submission evidence and owner actions.
