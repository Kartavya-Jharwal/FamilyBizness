import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// Bind local release evidence to the exact working-tree inputs, including uncommitted work.
const output = resolve('apps/portfolio/artifacts/project-signoff/source-snapshot.json');
const scope = ['apps/web', 'apps/portfolio/apps/frontend', 'apps/portfolio/packages',
  'packages', 'ci', 'package.json', 'bun.lock', 'apps/portfolio/package.json',
  'apps/portfolio/bun.lock', 'apps/portfolio/tsconfig.base.json', 'tsconfig.json',
  'docs/00 - Canonical/Identity.md'];
const files = [...new Set(execFileSync('git', ['ls-files', '-z', '--cached', '--others',
  '--exclude-standard', '--', ...scope], { encoding: 'utf8' }).split('\0').filter(Boolean))].sort();
const hashes = Object.fromEntries(files.map(file => [file,
  createHash('sha256').update(readFileSync(file)).digest('hex')]));
const digest = createHash('sha256').update(JSON.stringify(hashes)).digest('hex');
if (process.argv[2] === 'capture') {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify({ capturedAt: new Date().toISOString(), digest, hashes }, null, 2));
  console.log(`Captured ${files.length} sign-off inputs: ${digest}`);
} else if (process.argv[2] === 'verify') {
  const baseline = JSON.parse(readFileSync(output, 'utf8'));
  const changed = [...new Set([...Object.keys(baseline.hashes), ...files])]
    .filter(file => baseline.hashes[file] !== hashes[file]);
  if (changed.length) {
    console.error(`Source changed since checks began (${changed.length} files):\n${changed.join('\n')}`);
    process.exitCode = 1;
  } else console.log(`Verified unchanged sign-off inputs: ${digest}`);
} else throw new Error('Usage: node ci/signoff-snapshot.mjs capture|verify');
