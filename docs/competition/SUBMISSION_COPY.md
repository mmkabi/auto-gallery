# Competition Submission Copy

## Product

**Auto Gallery** combines a production-delivered 3D vehicle, guided product discovery, rule-based assistance, illustrative financing, and consent-based local follow-up in one focused experience.

**Lyra - AI Vehicle Concierge** leads the deterministic journey. The product line is **Explore. Understand. Decide.**

## Competition Experience

The default Guided Demo resets the experience and visibly performs:

1. Exterior reveal and 360-degree presentation.
2. Driver-door opening using the validated mesh pivot.
3. Entry into the real cabin meshes.
4. Steering-wheel and front-wheel movement.
5. Wheel motion and visual rock-suspension demonstration.
6. Cargo inspection using the truthful hatch-hiding fallback.
7. A clearly labeled conceptual powertrain view.
8. An illustrative financing calculation.
9. A local lead summary without creating a production CRM record.

Every step has a bounded timeout and recovery path. The operator can Pause, Resume, Exit, or Restart. Restart invalidates the previous run and restores clean vehicle and UI state.

## AI Disclosure

Auto Gallery was designed and engineered with Codex powered by GPT-5.6. GPT-5.6 supported the development of the 3D interaction architecture, guided vehicle journey, scene-action tools, performance pipeline, testing strategy, and competition release. The submitted public build defaults to a deterministic Guided Demo for reliable judging.

Live tool-calling was validated in isolated compatibility tests. The public competition build uses a deterministic Guided Demo because the tested third-party gateway did not provide sufficiently reliable production latency.

No external AI request is made during startup, page load, tests, build, preview, Guided Demo, or Offline Assistance.

## Truthful Boundaries

- Guided Demo is deterministic; Offline Assistance is rule-based.
- The source vehicle is presented as a Premium SUV Concept pending asset and configuration verification.
- The public vehicle color is fixed to Onyx Black; public paint controls were removed for reliability and visual consistency.
- The rear hatch is hidden for cargo inspection because a reliable complete hatch animation is unavailable.
- The powertrain visualization is conceptual because the model has no real engine mesh.
- Financing is labeled **Demonstration Only** and **Not a Financing Offer**.
- A manually consented record is labeled **Demo lead created locally** and remains in browser storage.
- No production inventory, lender, CRM, analytics, or manufacturer data service is connected.
