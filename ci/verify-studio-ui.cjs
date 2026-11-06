const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/KJ/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');const path=require('node:path');const out=path.resolve('apps/portfolio/artifacts/studio');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const errors=[];const checks=[];
try{const page=await browser.newPage({viewport:{width:1600,height:1050}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.STUDIO_QA_URL||'http://localhost:5194/')+'#/office/overview',{waitUntil:'domcontentloaded',timeout:120000});
 await page.getByRole('heading',{name:'One family. The whole picture.'}).waitFor({timeout:90000});
 await page.getByRole('button',{name:'Enter focus view',exact:true}).click();
 const initialStorage=await page.evaluate(()=>JSON.stringify({...localStorage}));
 for(const width of [1600,390]){await page.setViewportSize({width,height:1050});
  for(const [index,name] of ['Wealth','Succession','Constitution','Estate','Portfolio','Stewardship'].entries()){
   const nav=page.getByRole('navigation',{name:'Walkthrough chapters'});await nav.getByRole('button',{name:new RegExp(name)}).click();await page.waitForTimeout(2000);
   await page.screenshot({path:path.join(out,`${index+1}-${name}-${width}.png`),fullPage:true});
   checks.push({chapter:name,width,overflow:await page.locator('.stewardship-studio:visible').evaluate(el=>el.scrollWidth>el.clientWidth),heading:await page.locator('.stewardship-studio h1:visible').innerText()});
  }
 }
 await page.setViewportSize({width:1600,height:1050});
 await page.getByRole('button',{name:'Reset scenarios',exact:true}).click();await page.waitForTimeout(600);
 await page.getByRole('slider',{name:'Public-equity market move'}).press('Home');await page.waitForTimeout(800);
 checks.push({interaction:'Market shock updates family wealth',pass:(await page.locator('.studio-kpis').innerText()).toLowerCase().includes('£29.5m')});
 await page.getByRole('navigation',{name:'Walkthrough chapters'}).getByRole('button',{name:/Succession/}).click();await page.getByRole('slider',{name:/Transfer from/}).press('End');await page.waitForTimeout(800);
 checks.push({interaction:'Ownership transfer updates successor',pass:(await page.locator('.studio-people').innerText()).includes('85%')});
 await page.getByRole('navigation',{name:'Walkthrough chapters'}).getByRole('button',{name:/Constitution/}).click();await page.getByRole('slider',{name:'Required cash allocation'}).press('End');await page.getByRole('heading',{name:'Review allocation',exact:true}).waitFor();
 checks.push({interaction:'Cash threshold produces review signal',pass:true});
 await page.getByRole('navigation',{name:'Walkthrough chapters'}).getByRole('button',{name:/Estate/}).click();await page.getByRole('button',{name:/Model full gap coverage/}).click();await page.getByText('Funding surplus',{exact:true}).waitFor();checks.push({interaction:'Funding scenario closes the gap',pass:true});
 await page.getByRole('navigation',{name:'Walkthrough chapters'}).getByRole('button',{name:/Portfolio/}).click();await page.getByText('Cash minimum from the Constitution chapter: 50%.', {exact:false}).waitFor();checks.push({interaction:'Constitution preview constraint feeds portfolio selection',pass:true});await page.getByRole('slider',{name:'Annual family spending'}).press('Home');await page.waitForTimeout(1000);await page.screenshot({path:path.join(out,'Portfolio-live-adjustment.png')});checks.push({interaction:'Spending slider recalculates projection',pass:(await page.getByRole('slider',{name:'Annual family spending'}).inputValue())==='0'});
 await page.getByRole('button',{name:'Reset scenarios',exact:true}).click();await page.getByRole('button',{name:'Play walkthrough',exact:true}).click();await page.waitForTimeout(4500);checks.push({interaction:'Auto walkthrough demonstrates market adjustment',pass:await page.getByRole('slider',{name:'Public-equity market move'}).inputValue()==='-20'});await page.getByRole('button',{name:'Pause walkthrough',exact:true}).click();
 const finalStorage=await page.evaluate(()=>JSON.stringify({...localStorage}));checks.push({interaction:'Presentation does not alter saved inputs',pass:initialStorage===finalStorage});
 await page.keyboard.press('Escape');checks.push({interaction:'Escape exits focus mode',pass:await page.locator('.studio-focus').count()===0});
 const result={checks,errors};fs.writeFileSync(path.join(out,'UI Results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 if(errors.length||checks.some(c=>c.overflow||c.pass===false))throw new Error('Studio verification failed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
