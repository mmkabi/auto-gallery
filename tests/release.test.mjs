import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const releaseRoot = path.resolve('release/auto-gallery-competition');

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(absolutePath) : [absolutePath];
  });
}

test('competition package contains the deployable product and no local secrets', () => {
  assert.ok(fs.existsSync(path.join(releaseRoot, 'dist/index.html')));
  assert.ok(fs.existsSync(path.join(releaseRoot, 'dist/models/premium-suv-low/model.gltf')));
  assert.ok(fs.existsSync(path.join(releaseRoot, 'server/.env.example')));
  assert.ok(fs.existsSync(path.join(releaseRoot, 'RELEASE_MANIFEST.json')));

  const files = collectFiles(releaseRoot);
  const relativeFiles = files.map((filePath) => path.relative(releaseRoot, filePath).replaceAll('\\', '/'));
  assert.equal(relativeFiles.some((filePath) => path.basename(filePath) === '.env'), false);
  assert.equal(relativeFiles.some((filePath) => filePath.includes('node_modules/')), false);
  assert.equal(relativeFiles.some((filePath) => /model-(?:debug|final|sanitized|standard)/i.test(filePath)), false);
  assert.equal(relativeFiles.some((filePath) => /0311|\.max$|\.obj$|\.mtl$/i.test(filePath)), false);

  for (const filePath of files.filter((entry) => fs.statSync(entry).size < 2_000_000)) {
    const content = fs.readFileSync(filePath, 'utf8');
    assert.doesNotMatch(content, /\bsk-[A-Za-z0-9_-]{20,}\b/, path.relative(releaseRoot, filePath));
  }
});

test('competition evidence contains only final PNG screenshots', () => {
  const evidenceRoot = path.join(releaseRoot, 'evidence', 'screenshots');
  assert.ok(fs.existsSync(evidenceRoot));
  const evidence = collectFiles(evidenceRoot);
  assert.ok(evidence.length >= 10);
  assert.equal(evidence.every((filePath) => path.extname(filePath).toLowerCase() === '.png'), true);
});
