const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/KJ/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1920,height:1080},recordVideo:{dir:path.resolve('.cache/studio-recording'),size:{width:1920,height:1080}}});
 const started=Date.now();const page=await context.newPage();
 try{
  await page.goto((process.env.STUDIO_QA_URL||'http://localhost:5194/')+'#/office/overview');
  await page.getByRole('heading',{name:'One family. The whole picture.'}).waitFor({timeout:90000});
  await page.getByRole('button',{name:'Enter focus view',exact:true}).click();
  await page.getByRole('button',{name:'Reset scenarios',exact:true}).click();
  await page.waitForTimeout(1500);
  await page.mouse.move(1910,1070);
  const leadSeconds=(Date.now()-started)/1000;
  await page.getByRole('button',{name:'Play walkthrough',exact:true}).click();
  await page.mouse.move(1910,1070);
  for(let i=0;i<3;i++){await page.waitForTimeout(20500);console.log(`Recorded ${(i+1)*20.5} seconds of walkthrough`);}
  const video=page.video();await context.close();
  const videoPath=await video.path();
  fs.writeFileSync(path.resolve('.cache/studio-recording/timing.json'),JSON.stringify({videoPath,leadSeconds,duration:61.5},null,2));
  console.log(JSON.stringify({videoPath,leadSeconds,duration:61.5}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
