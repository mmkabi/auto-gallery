# Auto Gallery

Auto Gallery is an interactive 3D vehicle discovery and commerce demonstration featuring **Lyra - AI Vehicle Concierge** and the product line **Explore. Understand. Decide.**

The public competition build defaults to a deterministic Guided Demo and rule-based Offline Assistance. It does not call an external AI provider. Live tool-calling code remains disabled for future integration and is not presented as a live GPT feature in this build.

Auto Gallery was designed and engineered with Codex powered by GPT-5.6. GPT-5.6 supported the development of the 3D interaction architecture, guided vehicle journey, scene-action tools, performance pipeline, testing strategy, and competition release. The submitted public build defaults to a deterministic Guided Demo for reliable judging.

Live tool-calling was validated in isolated compatibility tests. The public competition build uses a deterministic Guided Demo because the tested third-party gateway did not provide sufficiently reliable production latency.

```bash
npm install
npm run dev
npm run build
```

For static deployment, upload the generated `dist` folder. Vite uses base path `/`, `public/_redirects` provides SPA fallback for Cloudflare Pages, and all required glTF vehicle assets are copied from `public/models/premium-suv-low` into `dist/models/premium-suv-low`.

Server configuration defaults to:

```env
ENABLE_LIVE_AI=false
```

Competition architecture, disclosures, scripts, limitations, and owner actions are documented in [`docs/competition/README.md`](docs/competition/README.md).

The bundled third-party vehicle asset must not be publicly redistributed until the owner confirms competition-compatible license rights.
