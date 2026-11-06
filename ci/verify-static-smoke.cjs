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
    if(!target.startsWith(root+path.sep))return route.fulfill({status:403,body:'Outside static root'});
    if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
    if(!fs.existsSync(target)){errors.push(`Missing ${url.pathname}`);return route.fulfill({status:404,body:'Missing'});}
    return route.fulfill({path:target});
  });
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
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
  await page.evaluate(()=>localStorage.setItem('familybizness:selected-demo-profile','office-role-1'));
  await page.goto(base+'#/office/statements');await page.reload();
  await page.getByRole('heading',{name:'Page unavailable for this role',exact:true}).waitFor();
  await browser.close();
  if(errors.length)throw Error(errors.join('\n'));
  console.log('Nested static output, surname persistence and direct-route guard passed');
})().catch(async error=>{console.error(error);await activeBrowser?.close();process.exitCode=1;});
