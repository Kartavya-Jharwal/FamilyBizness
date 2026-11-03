const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/KJ/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto(`${process.env.OFFICE_QA_URL || 'http://127.0.0.1:5194/'}#/office/simulation`);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   await page.getByRole('button',{name:'Run best feasible candidate',exact:true}).click();
   await page.getByRole('img',{name:'Simulated real wealth by year, tenth percentile, median and ninetieth percentile'}).scrollIntoViewIfNeeded();
   await page.mouse.move(0,0);
   await page.waitForTimeout(600);
   await page.screenshot({path:path.resolve(`apps/portfolio/artifacts/family-office/projection-${width===1440?'desktop':'mobile'}.png`)});
  }
  await page.evaluate(()=>document.documentElement.classList.add('dark'));
  await page.screenshot({path:path.resolve('apps/portfolio/artifacts/family-office/projection-dark.png')});
  console.log('Projection legend/axes captured at desktop, mobile and dark mobile.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
