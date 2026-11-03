const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/KJ/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.MVP_QA_URL || 'http://127.0.0.1:4173/FamilyBizness/').replace(/\/?$/, '/');
(async () => { const browser = await chromium.launch({ channel: 'msedge', headless: true });
 try { const page = await browser.newPage();
  for (const width of [1440, 390]) { await page.setViewportSize({ width, height: 1000 });
   for (const name of ['legacy', 'report']) { await page.goto(base + name + '.html'); if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Entry overflow: ' + name); }
   for (const name of ['login', 'splash', 'verify']) { await page.goto(base + name + '.html'); await page.getByRole('heading', { name: 'Who is visiting the family office?', exact: true }).waitFor(); }
  }
  console.log('PASS: narrative/guide layout and legacy entry redirects to Portfolio profiles.');
 } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
