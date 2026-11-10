const {chromium}=require('C:/Users/KJ/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
const base=process.env.UI_QA_URL||'http://127.0.0.1:5194/';
const out='apps/portfolio/artifacts/reicon-polish';
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    fs.mkdirSync(out,{recursive:true});
    const context=await browser.newContext({viewport:{width:1440,height:1000}});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'?choose-profile=1#/office/case',{waitUntil:'domcontentloaded',timeout:120000});
    await page.getByRole('heading',{name:'Who is visiting the family office?',exact:true}).waitFor({timeout:180000});
    await page.screenshot({path:`${out}/profile-${process.env.QA_PHASE||'after'}-1440.png`,fullPage:true,animations:'disabled'});
    console.log('Profile chooser captured');
    await page.getByRole('button',{name:'Open Managing Director',exact:true}).click();
    await page.waitForFunction(()=>!location.search.includes('choose-profile'),{},{timeout:120000});
    await page.getByRole('navigation',{name:'Main navigation',exact:true}).waitFor({timeout:180000});
    await page.locator('.recharts-area-area').first().waitFor({state:'attached',timeout:120000});
    await page.waitForTimeout(700);
    await page.screenshot({path:`${out}/overview-${process.env.QA_PHASE||'after'}-1440.png`,fullPage:true,animations:'disabled'});
    console.log('Main page captured');
    if(process.env.QA_PHASE==='before')return;
    for(const theme of ['light','dark'])for(const width of [1440,768,390]){
      await page.setViewportSize({width,height:1000});
      await page.evaluate(theme=>{
        document.documentElement.classList.toggle('dark',theme==='dark');
        document.documentElement.classList.toggle('light',theme==='light');
        document.documentElement.style.colorScheme=theme;
      },theme);
      await page.waitForTimeout(1600);
      await page.screenshot({path:`${out}/overview-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error(`Overflow ${theme}/${width}`);
      const navIcons=page.locator('nav[aria-label="Main navigation"] [data-reicon]');
      if(width===1440&&await navIcons.count()<20)throw Error('Navigation Reicon glyphs missing');
      if(await page.locator('[data-reicon]').count()<5)throw Error('Mobile Reicon glyphs missing');
      const empty=await page.locator('[data-reicon]').evaluateAll(nodes=>nodes.some(node=>!node.querySelector('svg path,svg circle,svg rect,svg line,svg polyline,svg polygon')));
      if(empty)throw Error('Empty Reicon SVG');
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.getByRole('button',{name:'Close menu',exact:true}).click();
    await page.getByRole('button',{name:'Open menu',exact:true}).waitFor();
    await page.screenshot({path:`${out}/sidebar-collapsed.png`,fullPage:true,animations:'disabled'});
    for(const width of [1440,768,390]){
      await page.setViewportSize({width,height:1000});
      await page.goto(base+'?choose-profile=1#/office/case');
      await page.getByRole('heading',{name:'Who is visiting the family office?',exact:true}).waitFor();
      await page.screenshot({path:`${out}/profile-after-${width}.png`,fullPage:true,animations:'disabled'});
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error(`Profile overflow ${width}`);
    }
    if(errors.length)throw Error(errors.join('\n'));
    console.log('Reicon paths, expanded/collapsed sidebar, light/dark charts and responsive profile chooser passed');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
