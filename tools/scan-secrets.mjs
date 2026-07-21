import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skippedDirectories = new Set(['.git', 'dist', 'node_modules', 'release']);
const textExtensions = new Set([
  '', '.css', '.env', '.example', '.html', '.js', '.json', '.jsx', '.md', '.mjs', '.mtl', '.obj', '.svg', '.txt', '.url',
]);
const secretPatterns = [
  { label: 'OpenAI API key', expression: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { label: 'authorization bearer token', expression: /authorization\s*[:=]\s*["']?bearer\s+[A-Za-z0-9._-]{20,}/giu },
];

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && skippedDirectories.has(entry.name)) return [];
    if (entry.isFile() && entry.name === '.env') return [];
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(absolutePath);
    if (!entry.isFile()) return [];
    const extension = path.extname(entry.name).toLowerCase();
    if (!textExtensions.has(extension) && !entry.name.startsWith('.env')) return [];
    if (fs.statSync(absolutePath).size > 2_000_000) return [];
    return [absolutePath];
  });
}

const failures = [];
for (const filePath of collectFiles(root)) {
  const content = fs.readFileSync(filePath, 'utf8');
  for (const pattern of secretPatterns) {
    pattern.expression.lastIndex = 0;
    if (pattern.expression.test(content)) failures.push(`${path.relative(root, filePath)}: ${pattern.label}`);
  }
}

if (failures.length) {
  console.error(`Secret scan failed:\n${failures.map((item) => `- ${item}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('Secret scan passed. No credential-shaped values were found.');
}
