// Production output served through request interception, including a nested host prefix.
const { chromium } = require('C:/Users/KJ/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
let activeBrowser;
(async () => {
  const browser = activeBrowser = await chromium.launch({channel:'msedge',headless:true});
  const context = await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(()=>{
    if(!localStorage.getItem('familybizness:selected-demo-profile')) localStorage.setItem('familybizness:selected-demo-profile','office-role-2');
    localStorage.setItem('familybizness:composite-entry-seen:v1','seen');
  });
  const errors=[];
  const root=path.resolve('dist');
  await context.route('http://static.local/**',async route=>{
    const url=new URL(route.request().url());
    const rel=decodeURIComponent(url.pathname).replace(/^\/project\//,'');
    let target=path.resolve(root,rel);
    if(target!==root&&!target.startsWith(root+path.sep))return route.fulfill({status:403,body:'Outside static root'});
    if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
    if(!fs.existsSync(target)){errors.push(`Missing ${url.pathname}`);return route.fulfill({status:404,body:'Missing'});}
    return route.fulfill({path:target});
  });
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  for (const width of [390,1440]) {
    await page.setViewportSize({width,height:1000});
    const response=await page.goto('http://static.local/project/');
    if(!response.ok())throw Error(`Nested landing returned ${response.status()}`);
    for (const image of await page.locator('img').all()) await image.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>Array.from(document.images).every(image=>image.complete&&image.naturalWidth>0),null,{timeout:30000});
    const entry=await page.getByRole('link',{name:"Let's log in"}).getAttribute('href');
    if(new URL(entry,page.url()).pathname!=='/project/portfolio/')throw Error('Landing entry escaped nested deployment');
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error(`Nested landing overflow at ${width}`);
    console.log(`Nested landing images and entry passed: ${width}`);
  }
  const base='http://static.local/project/portfolio/';
  for(const [route,heading] of [['/settings/general','General'],['/office/stochastic','Seven-model family capital comparison'],['/office/simulation?tab=xray','Performance metrics']]) {
    await page.goto(base+'#'+route);
    await page.getByRole('heading',{name:heading,exact:true}).waitFor({timeout:120000});
    console.log(`Production route passed: ${route}`);
  }
  await page.goto(base+'#/settings/general');
  await page.getByLabel('Family surname',{exact:true}).fill('Sample');
  await page.getByText('Sample Family Office',{exact:true}).first().waitFor();
  await page.reload();
  await page.getByLabel('Family surname',{exact:true}).waitFor();
  if(await page.getByLabel('Family surname',{exact:true}).inputValue()!=='Sample')throw Error('Surname did not persist');
  await page.goto(base+'?choose-profile=1#/office/case');
  await page.getByRole('button',{name:'Open Family Board',exact:true}).click();
  await page.waitForFunction(()=>!new URL(location.href).searchParams.has('choose-profile'),null,{timeout:30000});
  await page.getByRole('navigation',{name:'Main navigation',exact:true}).waitFor();
  await page.goto(base+'#/office/statements');await page.reload();
  await page.getByRole('heading',{name:'Page unavailable for this role',exact:true}).waitFor();
  await browser.close();
  if(errors.length)throw Error(errors.join('\n'));
  console.log('Nested static output, surname persistence and direct-route guard passed');
})().catch(async error=>{console.error(error);await activeBrowser?.close();process.exitCode=1;});
