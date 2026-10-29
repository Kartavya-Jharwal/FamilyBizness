import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const root=path.resolve('apps/portfolio');
const frontend=path.join(root,'apps/frontend');
const legalRoot=path.join(frontend,'public/open-source');
let count=0;
function audit(folder) {
  for(const entry of fs.readdirSync(folder,{withFileTypes:true})) {
    if(['node_modules','dist','artifacts','open-source','.git'].includes(entry.name))continue;
    const file=path.join(folder,entry.name);
    assert(!/wealthfolio/i.test(entry.name),'Unedited product path: '+file);
    if(entry.isDirectory())audit(file);
    else if(/\.(?:ts|tsx|js|jsx|mjs|json|css|scss|html|md|toml)$/.test(file) && !/^(?:LICENSE|NOTICE|TRADEMARKS)(?:\.|$)/i.test(entry.name) && !file.endsWith('attribution-page.tsx')) {
      count++;
      assert(!/wealthfolio/i.test(fs.readFileSync(file,'utf8')),'Brand outside original legal attribution: '+file);
    }
  }
}
audit(root);
for(const [source,published] of [[path.join(root,'LICENSE'),'portfolio/LICENSE'],[path.join(root,'packages/addon-sdk/LICENSE'),'portfolio/sdk-LICENSE']]) {
  assert(fs.readFileSync(source).equals(fs.readFileSync(path.join(legalRoot,published))),'Original license changed: '+published);
  assert(fs.readFileSync(source).equals(fs.readFileSync(path.resolve('dist/portfolio/open-source',published))),'License missing or changed in built artifact: '+published);
}
// Captured from the original Ghostfolio license before extraction; no ignored clone is needed in CI.
for(const file of [path.join(legalRoot,'ghostfolio/LICENSE'),path.resolve('dist/portfolio/open-source/ghostfolio/LICENSE')]) assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'),'93d1cebd66c75ccba84725a118a4a2d9f27e5b26c5a5fb1f469285db4de46231','Original analysis license changed');
for(const project of ['portfolio','ghostfolio']) for(const file of ['NOTICE.md','TRADEMARKS.md']) assert(fs.existsSync(path.resolve('dist/portfolio/open-source',project,file)),'Missing attribution: '+project+'/'+file);
for(const file of ['NOTICE.md','zod-LICENSE']) {
  const source=path.join(legalRoot,'policy-module',file);
  const built=path.resolve('dist/portfolio/open-source/policy-module',file);
  assert(fs.readFileSync(source).equals(fs.readFileSync(built)),'Policy provenance missing or changed in distribution: '+file);
}
for(const file of ['logo.png','logo-gold.png','logo-vantage.png','wf-vector.png','wf-vector2.png','splashscreen.png','app-icon-192.png']) assert(!fs.existsSync(path.join(frontend,'public',file)),'Original branded asset remains: '+file);
for(const theme of ['light','dark','system']) for(const suffix of ['.png','.webp','@2x.webp']) assert(!fs.existsSync(path.resolve(root,`dist/themes/theme-${theme}${suffix}`)),'Legacy screenshot in generated distribution');
const attribution=fs.readFileSync(path.join(frontend,'src/pages/insights/analysis/attribution-page.tsx'),'utf8');
assert(attribution.includes('modified fork of Ghostfolio') && attribution.includes('modified fork of Wealthfolio'),'Both fork attributions must be visible');
const stream=fs.readFileSync(path.join(frontend,'src/adapters/web/ai-streaming.ts'),'utf8');
assert(!/\bfetch\s*\(|new\s+(WebSocket|EventSource)|api[_-]?key/i.test(stream),'Faux stream acquired live transport or credentials');
assert(fs.readFileSync(path.resolve('dist/portfolio/index.html'),'utf8').includes('<title>FamilyBizness</title>'),'Build still has upstream title');
console.log(`PASS: ${count} editable files scanned; product branding removed, both donors credited, original licenses distributed and faux stream offline.`);
