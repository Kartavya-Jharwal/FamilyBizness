// Local visual/regression harness. PLAYWRIGHT_MODULE may point to an installed Playwright package.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/KJ/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.OFFICE_QA_URL || 'http://127.0.0.1:5194/';
const out = path.resolve('apps/portfolio/artifacts/family-office');
fs.mkdirSync(out, {recursive:true});
(async()=>{
 const browser = await chromium.launch({channel:'msedge',headless:true});
 const errors=[]; const results=[];
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>errors.push(e.message));
  const routes=[['office','Family calendar'],['office/governance','Governance & succession'],['office/estate','Family business'],['office/finance','Family business'],['office/simulation',null],['office/sources','Source register & population']];
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   for(const [route,title] of routes){
    await page.goto('about:blank');
    await page.goto(`${base}#/${route}`,{waitUntil:'domcontentloaded',timeout:120000});
    await page.locator('nav[aria-label="Family office pillars"]:visible').waitFor({timeout:90000});
    if(title) await page.getByRole('heading',{name:title,exact:true}).waitFor();
    await page.waitForTimeout(600);
    const name=route.replaceAll('/','-');
    await page.screenshot({path:path.join(out,`${name}-${width}.png`),fullPage:true});
    results.push({route,width,title:await page.locator('h1:visible').first().innerText(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),alerts:await page.getByRole('alert').allTextContents()});
   }
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`${base}#/office`);
  await page.getByRole('button',{name:'Week',exact:true}).click();
  await page.getByRole('button',{name:'Next week',exact:true}).click();
  await page.screenshot({path:path.join(out,'calendar-week.png'),fullPage:true});
  await page.getByRole('button',{name:'Add obligation',exact:true}).click();
  await page.getByLabel('Title',{exact:true}).fill('QA review');
  await page.getByLabel('Responsible owner',{exact:true}).fill('QA reviewer');
  await page.getByLabel('Entity',{exact:true}).last().fill('QA family');
  await page.getByRole('button',{name:'Save obligation',exact:true}).click();
  await page.getByRole('button',{name:/QA review/}).first().waitFor();
  await page.reload();
  await page.getByRole('button',{name:/QA review/}).first().waitFor();
  results.push({interaction:'Obligation saved and survives reload',pass:true});
  await page.goto(`${base}#/office/sources`);
  for(const [label,value] of [['Stable source ID','QA-1'],['Assignment / team member','QA hypothetical source'],['Section / page / revision','Section 1'],['Target input or workflow','RACI'],['Exact excerpt / explicit assumption','Office prepares; board reviews'],['Operational interpretation','Named preparation and review workflow']]) await page.getByLabel(label,{exact:true}).fill(value);
  await page.getByRole('button',{name:'Save mapping',exact:true}).click();
  await page.getByText('QA-1 · draft',{exact:true}).waitFor();
  await page.reload();
  await page.getByText('QA-1 · draft',{exact:true}).waitFor();
  results.push({interaction:'Source mapping saved and survives reload',pass:true});
  await page.evaluate(()=>document.documentElement.classList.add('dark'));
  await page.screenshot({path:path.join(out,'sources-dark.png'),fullPage:true});
  await page.goto('about:blank');
  await page.goto(`${base}#/office/simulation`);
  await page.getByRole('button',{name:'Run best feasible candidate',exact:true}).click();
  const chart=page.getByRole('img',{name:'Simulated real wealth by year, tenth percentile, median and ninetieth percentile'});
  await chart.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({path:path.join(out,'projection-desktop.png')});
  await page.setViewportSize({width:390,height:1000});
  // A viewport layout switch remounts the page; run the visible scenario again.
  await page.getByRole('button',{name:'Run best feasible candidate',exact:true}).click();
  await chart.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({path:path.join(out,'projection-mobile.png')});
  await page.evaluate(()=>document.documentElement.classList.add('dark'));
  await page.screenshot({path:path.join(out,'projection-dark.png')});
  results.push({interaction:'Best feasible projection renders desktop/mobile',pass:true});
  fs.writeFileSync(path.join(out,'UI Results.json'),JSON.stringify({base,results,errors},null,2));
  if(errors.length||results.some(r=>r.overflow)) throw new Error('Console error or document overflow; see UI Results.json');
  console.log(JSON.stringify({pages:results.length,errors,results},null,2));
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
