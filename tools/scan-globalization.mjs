import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scanTargets = ['src', 'server', 'public', 'docs', 'dist', 'index.html', 'package.json', 'vite.config.js', 'README.md'];
const textExtensions = new Set(['.css', '.html', '.js', '.json', '.jsx', '.md', '.mjs', '.svg']);
const ignoredNames = new Set(['.env']);
const prohibited = [
  { label: 'localized script', expression: /[\u0600-\u06ff]/u },
  { label: 'retired product brand', expression: /auto\s*khatib|autokhatib/iu },
  { label: 'specific source vehicle label', expression: /toyota|land\s*cruiser/iu },
  { label: 'regional identity reference', expression: /\b(?:iran|iranian|persia|persian|farsi|tehran)\b/iu },
  { label: 'regional currency or phone format', expression: /\b(?:irr|rial|toman)\b|\+98/iu },
  { label: 'localized document metadata', expression: /fa-ir|lang=["']fa["']|dir=["']rtl["']|direction\s*:\s*rtl/iu },
  { label: 'regional domain', expression: /https?:\/\/[^\s/]+\.ir(?:\/|\b)/iu },
];

function collectFiles(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'backups') return [];
    return collectFiles(path.join(target, entry.name));
  });
}

const failures = [];
for (const relativeTarget of scanTargets) {
  for (const filePath of collectFiles(path.join(root, relativeTarget))) {
    if (ignoredNames.has(path.basename(filePath)) || !textExtensions.has(path.extname(filePath).toLowerCase())) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    for (const rule of prohibited) {
      if (rule.expression.test(content)) {
        failures.push(`${path.relative(root, filePath)}: ${rule.label}`);
      }
    }
  }
}

if (failures.length) {
  console.error(`Globalization scan failed:\n${failures.map((item) => `- ${item}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('Globalization scan passed. Public source and competition documents are globally neutral.');
}
