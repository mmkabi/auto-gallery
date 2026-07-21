# Devpost Submission Draft

## 1. Project Title

Auto Gallery

## 2. Short Tagline

Explore. Understand. Decide.

## 3. One-Line Hook

Auto Gallery turns a vehicle listing into a guided 3D sales consultation.

## 4. Short Project Description

Auto Gallery is an interactive 3D vehicle discovery experience led by Lyra, an AI vehicle concierge concept. The submitted build uses a deterministic Guided Demo and rule-based Offline Assistance for reliable judging.

## 5. Full Project Description

Auto Gallery replaces static vehicle browsing with a guided 3D product journey. Customers can rotate the vehicle, enter the real cabin mesh, inspect the cargo area, see wheel and steering demonstrations, review a conceptual powertrain explanation, explore an illustrative financing scenario, and create a browser-local demo lead only after consent.

The public competition build is intentionally deterministic. Live tool-calling was validated separately, but the submitted build defaults to Guided Demo and Offline Assistance because the tested third-party gateway did not provide sufficiently reliable production latency.

## 6. Inspiration

Online vehicle shopping often makes customers jump between image galleries, specifications, finance calculators, and lead forms. Auto Gallery was inspired by the idea that the vehicle itself should become the interface for discovery, education, affordability, and follow-up.

## 7. What It Does

- Loads an optimized 3D vehicle in a premium showroom.
- Starts in Quality render mode.
- Shows a deterministic Guided Demo with exterior reveal, driver door, cabin, steering, off-road visual, cargo inspection, conceptual powertrain, illustrative finance, and local lead summary.
- Supports manual 360-degree exploration, zoom, cabin entry, hotspots, door controls, wheel motion, terrain modes, and render quality modes.
- Provides rule-based Offline Assistance through Lyra.
- Stores demo leads locally only after explicit consent.

## 8. How It Was Built

The frontend uses React, Vite, and Three.js. The optimized glTF model and JPEG textures are served from static public assets. `src/main.jsx` manages the Three.js scene, camera, renderer, model loading, mechanical rigs, hotspots, Guided Demo, and UI state. `src/ai/localAssistant.js` provides rule-based Offline Assistance, `src/financing/calculator.js` handles illustrative finance, and `src/crm/lead.js` handles browser-local demo records.

## 9. How Codex and GPT-5.6 Were Used

Auto Gallery was designed and engineered with Codex powered by GPT-5.6. GPT-5.6 supported the development of the 3D interaction architecture, guided vehicle journey, scene-action tools, performance pipeline, testing strategy, and competition release. Codex helped implement the guided orchestration, strict tool contracts, offline fallback, asset delivery changes, static deployment readiness, tests, secret/globalization scans, and documentation. Human decisions set the product concept, brand direction, visual preference, competition positioning, and reliability choices.

## 10. Challenges

- The source vehicle asset was large and needed an optimized public package.
- Body, tire, and interior materials required careful targeting.
- The rear hatch did not exist as a reliable complete animated group.
- Live provider latency was not reliable enough for public judging.
- The project had to be converted to a static self-contained deployment.
- Documentation had to avoid unsupported claims about live GPT behavior.

## 11. Accomplishments

- A static `dist` build contains the vehicle, textures, CSS, JS, and SPA fallback.
- Guided Demo runs without external API dependency.
- The vehicle supports 3D exploration, door, cabin, wheel, steering, cargo, and conceptual powertrain interactions.
- Financing and lead handling are clearly labeled as demonstration/local-only.
- Secret scan, globalization scan, unit tests, and production build pass.

## 12. What Was Learned

Reliable product demonstrations need truthful fallbacks. A deterministic guided path can be better for judging and customer demos than an unreliable live provider. Complex 3D assets require explicit material targeting, performance modes, and careful deployment packaging.

## 13. What Is Next

- Confirm vehicle asset redistribution rights.
- Deploy the static build to a public URL.
- Record the competition video.
- Connect verified inventory, specifications, lender data, and CRM systems.
- Re-enable live tool-calling only after a production-ready provider is selected and tested.

## 14. Technology List

React, Vite, Three.js, glTF, Meshopt, JavaScript, CSS, Node.js test runner, Cloudflare Pages-compatible static output.

## 15. Recommended Track

AI-assisted commerce, interactive product experience, or automotive retail technology.

## 16. Public Demo URL Placeholder

Public URL requires owner confirmation.

## 17. GitHub Repository URL

Configured remote placeholder: `https://github.com/YOUR_USERNAME/auto-gallery.git`. Owner must confirm the real repository URL.

## 18. Video URL Placeholder

Video URL requires owner confirmation.

## 19. Codex Session ID Placeholder

Codex Session ID requires owner confirmation from the Codex application history.

## 20. Short Judge-Facing Note

The submitted public build does not claim to use live GPT responses. It uses a deterministic Guided Demo and rule-based Offline Assistance to provide a reliable judging experience. Live tool-calling was validated separately and can be connected to a supported production provider later.

## 21. Five Possible Submission Titles

1. Auto Gallery: The Guided 3D Vehicle Showroom
2. Auto Gallery: Explore. Understand. Decide.
3. Lyra: A 3D Concierge for Vehicle Discovery
4. Auto Gallery: From Static Listings to Guided Decisions
5. Auto Gallery: Interactive Vehicle Commerce in 3D

## 22. Five Alternative Hooks

1. A car listing should feel like a showroom consultation, not a slideshow.
2. Auto Gallery turns the vehicle into the sales interface.
3. Lyra guides customers through features, needs, and affordability in one 3D journey.
4. Static galleries show a car; Auto Gallery explains it.
5. A reliable guided demo for the future of vehicle commerce.

## 23. Concise 100-Word Version

Auto Gallery is an interactive 3D vehicle discovery and commerce demo led by Lyra, an AI vehicle concierge concept. The public competition build uses a deterministic Guided Demo and rule-based Offline Assistance for reliable judging. Users can rotate the vehicle, open the driver door, enter the real cabin mesh, inspect cargo, view wheel and steering demonstrations, explore a conceptual powertrain, calculate an illustrative monthly payment, and create a browser-local demo lead with consent. Codex powered by GPT-5.6 supported the 3D interaction architecture, guided journey, testing strategy, optimization, and competition release.

## 24. Concise 250-Word Version

Auto Gallery is a 3D-first vehicle discovery and sales-assistance demo designed around a simple idea: the vehicle itself should guide the customer from curiosity to confidence. Instead of separating photos, specifications, financing, and lead capture, Auto Gallery brings them into one interactive showroom.

The experience is led by Lyra - AI Vehicle Concierge. In the submitted public build, Lyra runs as a deterministic Guided Demo and rule-based Offline Assistance so the judging experience is reliable and does not depend on live provider latency. Users can rotate and zoom the vehicle, open the driver door, enter the real cabin mesh, inspect cargo through a truthful hatch-hiding fallback, demonstrate steering and wheel motion, view a visual off-road/suspension mode, open a conceptual powertrain explanation, calculate an illustrative monthly payment, and create a local demo lead only after consent.

Auto Gallery was built with React, Vite, Three.js, an optimized glTF asset, static deployment packaging, local validation modules, and automated scans/tests. Codex powered by GPT-5.6 supported the scene-action architecture, guided journey design, offline fallback strategy, material targeting, performance pipeline, testing, documentation, and release preparation.

The build is honest about limitations: the powertrain is conceptual, financing is not an offer, the lead is not a CRM record, and live tool-calling is disabled in the public version until a production-ready provider is selected.

## 25. Longer Detailed Version

Auto Gallery is an interactive 3D vehicle discovery and commerce demonstration for modern automotive retail. It addresses a common gap in online car shopping: customers can see photos, read specifications, try a separate finance calculator, and submit a generic lead, but they rarely get a coherent guided experience that connects product features to personal needs.

The product introduces Lyra - AI Vehicle Concierge. Lyra is presented in the public competition build as a deterministic Guided Demo and rule-based Offline Assistance layer. The goal is reliability: judges can run the same complete journey without depending on third-party model latency. Live tool-calling was validated separately in isolated compatibility tests, but it is disabled in the public build.

The guided journey starts with a premium 3D vehicle reveal. It opens the driver door, moves into the real cabin mesh, demonstrates steering and wheels, shows an off-road visual mode, inspects cargo with a truthful hatch-hiding fallback, explains a conceptual powertrain, presents an illustrative financing calculation, and prepares a local lead summary without transmitting customer data. Manual controls allow 360-degree exploration, cabin entry, hotspots, wheel motion, terrain modes, render-quality selection, and consent-based local demo records.

Technically, Auto Gallery uses React, Vite, Three.js, GLTFLoader, OrbitControls, an optimized glTF vehicle asset, local assistant logic, strict scene-action validation, a financing module, browser-local lead storage, secret and globalization scans, and a static deployment path suitable for Cloudflare Pages. Codex powered by GPT-5.6 supported the architecture, implementation, debugging, testing, optimization, and documentation. Human decisions shaped the product concept, brand, visual style, truthful limitations, and final choice to prioritize deterministic reliability for competition submission.
