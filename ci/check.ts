import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, dirname, extname } from "node:path";
async function walk(dir: string): Promise<string[]> {
  return (await Promise.all((await readdir(dir, {withFileTypes:true})).filter(e=>!['node_modules','.git','dist'].includes(e.name)).map(e=>e.isDirectory()?walk(resolve(dir,e.name)):[resolve(dir,e.name)]))).flat();
}
const mode=process.argv[2];
const failures:string[]=[];
if(mode==='lint') {
  for(const file of [...await walk('ci'), ...await walk('apps/web/src'), ...await walk('apps/portfolio/apps/frontend/src')]) {
    if(!['.ts','.tsx','.js','.html','.css','.ps1'].includes(extname(file))) continue;
    const text=await readFile(file,'utf8');
    if(/^(<<<<<<<|=======|>>>>>>>) /m.test(text)) failures.push(`${file}: merge conflict`);
    if(text.includes('\u0000')) failures.push(`${file}: unexpected NUL`);
  }
  if((await readdir('.github/workflows').catch(()=>[])).some(f=>/\.ya?ml$/.test(f))) failures.push('Active GitHub workflow');
} else {
  const root=resolve('dist');
  const files=await walk(root);
  for(const file of files.filter(f=>f.endsWith('.html'))) {
    const text=await readFile(file,'utf8');
    const rx=mode==='links'?/\b(?:href|action)="([^"]+)"/g:/\b(?:src|poster)="([^"]+)"/g;
    for(const match of text.matchAll(rx)) {
      const value=match[1];
      if(/^(?:[a-z]+:|\/\/|#)/i.test(value)) continue;
      let target=resolve(value.startsWith('/')?root:dirname(file), value.replace(/^\//,'').split(/[?#]/)[0]);
      try {if((await stat(target)).isDirectory()) target=resolve(target,'index.html'); await stat(target);} catch {failures.push(`${file}: missing ${value}`);}
    }
  }
  if(mode==='assets') for(const path of ['assets/brand/logo.svg','assets/seo/open-graph.png','assets/seo/favicon.svg','assets/site.webmanifest']) {
    try {await stat(resolve(root,path));} catch {failures.push(`Missing ${path}`);}
  }
}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`${mode} checks passed`);
