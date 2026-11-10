/** Run real Lighthouse audits against a built, locally served landing page.
 * Usage: LIGHTHOUSE_CLI=/path/to/lighthouse/cli/index.js node ci/verify-landing-performance.mjs
 * Set CHROME_PATH to a Chrome/Edge executable if automatic discovery is unavailable.
 * Reports are intentionally kept with ignored local release evidence.
 */
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const url = process.env.LANDING_URL || 'http://127.0.0.1:4175/';
new URL(url);
const label = process.env.AUDIT_LABEL || 'final';
if (!/^[a-z0-9-]+$/i.test(label)) throw new Error('AUDIT_LABEL must contain only letters, numbers and hyphens');
const out = resolve('apps/portfolio/artifacts/landing-signoff', label);
await mkdir(out, { recursive: true });
let cli = process.env.LIGHTHOUSE_CLI;
if (!cli) {
  try { cli = require.resolve('lighthouse/cli/index.js', { paths: [resolve('.cache/lighthouse'), process.cwd()] }); }
  catch { throw new Error('Lighthouse is required. Install it in a temporary directory and set LIGHTHOUSE_CLI to its cli/index.js.'); }
}
const summaries = [];
for (const mode of ['mobile', 'desktop']) {
  const output = resolve(out, `lighthouse-${mode}`);
  const args = [cli, url, '--quiet', '--chrome-flags=--headless --no-first-run',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--output=json', '--output=html', `--output-path=${output}`];
  if (mode === 'desktop') args.push('--preset=desktop');
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Lighthouse ${mode} exited ${result.status}`);
  const report = JSON.parse(await readFile(`${output}.report.json`, 'utf8'));
  if (report.runtimeError) throw new Error(report.runtimeError.message);
  const score = Object.fromEntries(Object.entries(report.categories).map(([key, value]) => [key, Math.round(value.score * 100)]));
  const metrics = Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index', 'total-byte-weight'].map(key => [key, report.audits[key]?.numericValue]));
  const failures = Object.values(report.audits).filter(a => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'informative').map(a => ({ id: a.id, title: a.title, displayValue: a.displayValue }));
  const passed = score.performance >= 90 && score.accessibility >= 95 && score['best-practices'] >= 95 && score.seo >= 95 && metrics['cumulative-layout-shift'] <= 0.1 && metrics['largest-contentful-paint'] <= 2500 && metrics['total-blocking-time'] <= 200 && metrics['total-byte-weight'] <= 1_000_000 && report.audits['label-content-name-mismatch']?.score !== 0;
  summaries.push({ mode, url: report.finalDisplayedUrl, lighthouseVersion: report.lighthouseVersion, fetchTime: report.fetchTime, score, metrics, passed, failures });
}
await writeFile(resolve(out, 'summary.json'), JSON.stringify(summaries, null, 2));
console.log(JSON.stringify(summaries, null, 2));
if (summaries.some(item => !item.passed)) process.exitCode = 1;
