# Deployment

## Verified Static Build

```bash
npm install
npm run build
```

The deployable output is:

```text
dist/
```

The public competition build is prepared for static hosting such as Cloudflare Pages:

- Vite base path is `/`.
- `public/_redirects` is copied to `dist/_redirects` and contains `/* /index.html 200`.
- The optimized glTF vehicle package is copied to `dist/models/premium-suv-low/`.
- CSS and JavaScript bundles are emitted under `dist/assets/`.
- No browser route depends on `/api/lyra/respond` or `/api/lyra/status`.

## Local Preview Options

Use the Vite preview command for a static-style local preview:

```bash
npm run preview
```

The repository also contains a Node production server for local smoke testing and future server-enabled work, but it is not required for the submitted static competition build.

## Environment

The public build keeps live AI disabled:

```text
ENABLE_LIVE_AI=false
```

Do not commit `.env`, `server/.env`, API keys, credentials, logs, backups, raw source vehicle assets, or `node_modules`.

## Public URL

No public deployment was created by Codex in this handoff. Public URL requires owner confirmation.

## Owner Deployment Steps

1. Confirm vehicle asset redistribution rights.
2. Push the final repository to the intended GitHub remote.
3. Connect the repository to Cloudflare Pages or another static host.
4. Use `npm run build` as the build command and `dist` as the output directory.
5. Verify direct refresh, model transfer, Guided Demo, Offline Assistance, and browser console output.
6. Record the exact public URL in the final submission form.
