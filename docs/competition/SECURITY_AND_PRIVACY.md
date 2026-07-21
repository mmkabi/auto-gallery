# Security and Privacy

## Implemented Controls

- OpenAI credentials are read only by Node from process variables or ignored `server/.env`.
- The browser receives provider status, model label, text, and validated tool calls, never the API key or authorization header.
- Requests are same-origin and limited to 24 per minute per local client bucket.
- Request bodies are capped at 24,000 bytes and customer messages at 1,800 characters.
- Provider calls have a 15-second abort timeout.
- Client orchestration is capped at six tool turns and rejects repeated call signatures.
- Tool execution has a four-second timeout.
- All 16 scene tools use strict JSON schemas with `additionalProperties: false`.
- Unknown tools, unexpected arguments, invalid enums, impossible payment inputs, and arbitrary code are rejected.
- `eval`, generated JavaScript, direct DOM access, and model-generated HTML are not used.
- Lyra output is rendered as React text, not unsanitized HTML or Markdown.
- Server instructions treat tool schemas and the knowledge file as trusted context and reject prompt-exfiltration requests.
- Technical provider failures are reduced to generic codes and shown only in developer diagnostics.
- Static delivery sets CSP, `Referrer-Policy: no-referrer`, and `X-Content-Type-Options: nosniff`. CSP grants only `wasm-unsafe-eval` for the Meshopt WebAssembly decoder; general JavaScript `unsafe-eval` remains blocked.
- Lead data requires consent, stores only name, phone, selected journey context, and timestamp in localStorage, and has a clear-data action.
- The competition repository contains no real customer fixture.
- A credential-shape scan runs during lint, and the competition package is built from an explicit allowlist that excludes `.env`, backups, raw source assets, dependencies, and pipeline intermediates.
- The previously stored development key was removed from the workspace. Account-side revocation remains an owner action because deletion cannot invalidate an exposed credential.

## Threat Review

| Risk | Mitigation | Residual risk |
| --- | --- | --- |
| Secret exposure | Server-only environment variables, ignored files, automated scanning, and release allowlisting | A credential was pasted into the development conversation and must still be revoked account-side |
| Prompt injection | Fixed system rules, trusted knowledge, strict tools | Model text quality still requires monitoring |
| Tool abuse | Allowlist, schemas, timeouts, loop cap | Browser scene actions are demonstration controls, not safety-critical systems |
| PII retention | Minimal fields, explicit consent, local-only label, clear action | localStorage persists until cleared by the user |
| Provider abuse | Input limits, timeout, per-client rate bucket | In-memory rate limits do not coordinate across multiple server instances |
| XSS | Plain-text React rendering | Future rich text must use a safe renderer |
| Asset rights | Neutral public copy and blocker disclosure | Redistribution remains blocked until owner confirmation |

## Owner Actions

1. Revoke and replace the credential that appeared in the development conversation.
2. Use a production secret manager and outbound provider allowlist.
3. Add authenticated, centrally coordinated rate limiting before public scale.
4. Add a retention policy and server-side consent record before connecting a real CRM.
5. Conduct dependency and application security review before handling real customer data.
