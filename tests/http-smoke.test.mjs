import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import test from 'node:test';

const port = 4199;

async function waitForServer(url, timeoutMs = 10000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Server did not start within ${timeoutMs}ms.`);
}

test('production server serves health, app shell, and optimized model', async (context) => {
  const child = spawn(process.execPath, ['server/production.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), OPENAI_API_KEY: '' },
    stdio: 'ignore',
  });
  context.after(() => child.kill());

  const health = await waitForServer(`http://127.0.0.1:${port}/health`);
  assert.equal((await health.json()).app, 'auto-gallery');

  const providerStatus = await fetch(`http://127.0.0.1:${port}/api/lyra/status`);
  assert.deepEqual(await providerStatus.json(), {
    ok: true,
    enabled: false,
    configured: false,
    status: 'disabled',
    provider: 'Bluesminds',
    model: 'gpt-5.2-chat',
  });

  const disabledLiveResponse = await fetch(`http://127.0.0.1:${port}/api/lyra/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'This must not reach an external provider.' }),
  });
  assert.equal(disabledLiveResponse.status, 503);
  assert.equal((await disabledLiveResponse.json()).error, 'live_ai_disabled');

  const app = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(app.status, 200);
  assert.match(await app.text(), /Auto Gallery/);

  const model = await fetch(`http://127.0.0.1:${port}/models/premium-suv-low/model.gltf`, {
    headers: { Range: 'bytes=0-31' },
  });
  assert.equal(model.status, 200);
  assert.match(model.headers.get('content-type') || '', /model\/gltf\+json|application\/json/);

  const modelBuffer = await fetch(`http://127.0.0.1:${port}/models/premium-suv-low/model.bin`, {
    signal: AbortSignal.timeout(5_000),
  });
  assert.equal(modelBuffer.status, 200);
  assert.ok((await modelBuffer.arrayBuffer()).byteLength > 1_000_000);
  const manifest = await model.json();
  assert.equal(manifest.asset.version, '2.0');
  assert.ok(manifest.extensionsUsed.includes('EXT_meshopt_compression'));
});
