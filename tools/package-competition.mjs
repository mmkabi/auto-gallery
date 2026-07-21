import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseRoot = path.join(root, 'release');
const stagingRoot = path.join(releaseRoot, 'auto-gallery-competition');
const sourceEntries = [
  'dist',
  'docs/competition',
  'index.html',
  'package-lock.json',
  'package.json',
  'public',
  'README.md',
  'server',
  'src',
  'tests',
  'tools',
  'vite.config.js',
];

function assertInside(parent, child) {
  const relative = path.relative(parent, child);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Unsafe release path: ${child}`);
  }
}

function shouldExclude(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  const baseName = path.basename(normalized);
  if (baseName === '.env') return true;
  if (baseName.startsWith('.env.') && baseName !== '.env.example') return true;
  return normalized.includes('/node_modules/') || normalized.includes('/release/');
}

function copyTree(source, destination, relativePath = '') {
  if (shouldExclude(relativePath)) return;
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyTree(path.join(source, entry), path.join(destination, entry), path.join(relativePath, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function collectReleaseFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectReleaseFiles(absolutePath) : [absolutePath];
  });
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

fs.mkdirSync(releaseRoot, { recursive: true });
assertInside(releaseRoot, stagingRoot);
fs.rmSync(stagingRoot, { recursive: true, force: true });
fs.mkdirSync(stagingRoot, { recursive: true });

for (const entry of sourceEntries) {
  const source = path.join(root, entry);
  if (!fs.existsSync(source)) throw new Error(`Required release entry is missing: ${entry}`);
  copyTree(source, path.join(stagingRoot, entry), entry);
}

const screenshotSource = path.join(root, 'artifacts', 'competition');
const screenshotDestination = path.join(stagingRoot, 'evidence', 'screenshots');
if (fs.existsSync(screenshotSource)) {
  for (const entry of fs.readdirSync(screenshotSource, { withFileTypes: true })) {
    if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.png') {
      copyTree(path.join(screenshotSource, entry.name), path.join(screenshotDestination, entry.name), `evidence/screenshots/${entry.name}`);
    }
  }
}

const files = collectReleaseFiles(stagingRoot)
  .sort((a, b) => a.localeCompare(b))
  .map((filePath) => ({
    path: path.relative(stagingRoot, filePath).replaceAll('\\', '/'),
    bytes: fs.statSync(filePath).size,
    sha256: sha256(filePath),
  }));

const manifest = {
  product: 'Auto Gallery',
  version: '1.0.0-competition',
  generatedAt: new Date().toISOString(),
  fileCount: files.length,
  totalBytes: files.reduce((total, file) => total + file.bytes, 0),
  excluded: [
    'API credentials and local environment files',
    'raw source vehicle files',
    'workspace backups',
    'model-pipeline intermediates',
    'dependency installation directory',
  ],
  files,
};

fs.writeFileSync(path.join(stagingRoot, 'RELEASE_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Competition staging package created: ${stagingRoot}`);
console.log(`Files: ${manifest.fileCount}; bytes before ZIP compression: ${manifest.totalBytes}`);
