/* Fresh, serial built-app QA. No previous results or injected profile selection.
 * PROJECT_QA_URL=http://127.0.0.1:4175/portfolio/ node ci/verify-project-signoff.cjs
 * Evidence is isolated per invocation, with results.json updated after every case.
 */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/KJ/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const base = new URL(process.env.PROJECT_QA_URL || 'http://127.0.0.1:4175/portfolio/');
assert(['http:', 'https:'].includes(base.protocol), 'PROJECT_QA_URL must be an HTTP URL');
base.hash = ''; base.search = ''; base.pathname = base.pathname.replace(/\/?$/, '/');
const routeTimeout = Number(process.env.PROJECT_QA_ROUTE_TIMEOUT_MS || 90000);
assert(Number.isFinite(routeTimeout) && routeTimeout >= 10000 && routeTimeout <= 180000, 'Route timeout must be 10000–180000 ms');
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const out = path.resolve('apps/portfolio/artifacts/project-signoff', runId);
fs.mkdirSync(out, { recursive: true });

// Same 25 primary destinations as visual-content.cjs; expected titles verified
// against app-screen-routes.tsx and its currently imported screen components.
const routes = [
  ['/about', 'About'],
  ['/settings/general', 'General'],
  ['/settings/appearance', 'Appearance'],
  ['/settings/records', 'Data'],
  ['/settings/connections', 'Integrations'],
  ['/settings/accessibility', 'Accessibility'],
  ['/office/constitution', 'Family constitution'],
  ['/office/policy', 'Investment mandate'],
  ['/office/simulation', 'Portfolio & scenarios'],
  ['/office/statements', 'Financial statements'],
  ['/office/stochastic', 'Stochastic Process Lab'],
  ['/office/simulation?tab=fire', 'Portfolio & scenarios'],
  ['/spending/budget', 'Budget and Expenditure'],
  ['/office/case', 'Stewardship'],
  ['/office/business', 'Governance and Succession'],
  ['/office/business?tab=estate', 'Estate Planning'],
  ['/office', 'Family calendar'],
  ['/goals', 'Goals'],
  ['/office/finance', 'Capital & liquidity'],
  ['/office/fees', 'Investment fees'],
  ['/office/trading', 'Trading analytics'],
  ['/office/scenarios', 'Scenario Analysis'],
  ['/office/simulation?tab=portfolio', 'Portfolio & scenarios'],
  ['/office/simulation?tab=allocation', 'Portfolio & scenarios'],
  ['/office/simulation?tab=xray', 'Portfolio & scenarios'],
];
const darkRoutes = ['/office/case', '/office/finance', '/office/stochastic'];
const report = { runId, base: base.href, startedAt: new Date().toISOString(), status: 'running', passed: false,
  expectedPrimaryCases: routes.length * 3, expectedDarkCases: darkRoutes.length * 3,
  profileSelections: [], results: [], errors: [], evidence: out };
const persist = () => fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
persist();
const urlFor = route => { const url = new URL(base); url.hash = route; return url.href; };
// Prepared-office symbols such as FAMILY-BUS have no bundled mark. The avatar falls back to initials.
const optionalAsset = (value) => { try { return new URL(value).pathname.includes('/ticker-logos/'); } catch { return false; } };
const bounded = async (work, label) => {
  let timer;
  try { return await Promise.race([work(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label}: exceeded ${routeTimeout} ms deadline`)), routeTimeout); })]); }
  finally { clearTimeout(timer); }
};

async function diagnostics(page) {
  return page.evaluate(() => ({
    url: location.href,
    headings: Array.from(document.querySelectorAll('h1,h2')).map(el => el.textContent?.trim()).slice(0, 30),
    viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth,
    overflowCandidates: Array.from(document.body.querySelectorAll('*')).map(el => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ el, r }) => r.width > 0 && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(el).visibility !== 'hidden')
      .slice(0, 20).map(({ el, r }) => ({ tag: el.tagName, className: String(el.className).slice(0, 180), text: el.textContent?.trim().slice(0, 90), left: r.left, right: r.right })),
  }));
}

async function inspect(context, route, heading, width, theme) {
  const file = `${width}-${theme}-${route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`;
  const result = { width, theme, route, expectedHeading: heading, startedAt: new Date().toISOString(), passed: false, errors: [], badHTTP: [], failedRequests: [], consoleErrors: [] };
  const page = await context.newPage();
  let closing = false;
  page.on('pageerror', error => result.errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && !optionalAsset(response.url())) result.badHTTP.push({ status: response.status(), url: response.url() }); });
  page.on('requestfailed', request => { if (!closing || !/ABORTED/i.test(request.failure()?.errorText || '')) result.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }); });
  page.on('console', message => { if (message.type() === 'error') result.consoleErrors.push(message.text()); });
  try {
    await bounded(async () => {
      console.log(`START ${width} ${theme} ${route}`);
      const response = await page.goto(urlFor(route), { waitUntil: 'domcontentloaded' });
      assert(response?.ok(), `Document HTTP ${response?.status()}`);
      await page.getByRole('heading', { name: heading, exact: true }).first().waitFor();
      await page.waitForFunction(() => !document.querySelector('vite-error-overlay') &&
        !Array.from(document.querySelectorAll('h1')).some(el => /^(404|Something went wrong|Page unavailable for this role)/i.test(el.textContent.trim())));
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400); // allow charts and deferred panels to commit after the title
      assert(new URL(page.url()).hash === '#' + route, `Unexpected redirect: ${page.url()}`);
      assert(await page.evaluate(theme => document.documentElement.classList.contains(theme), theme), `Expected ${theme} theme`);
      if (route.startsWith('/office/simulation?tab=')) {
        const tab = new URLSearchParams(route.split('?')[1]).get('tab');
        const title = { portfolio: 'Monte Carlo - spending across generations', allocation: 'Allocation of family capital', fire: 'Family FIRE · financial independence across generations', xray: 'X-ray · policy and liquidity review' }[tab];
        await page.locator('[data-slot="tabs-content"]').filter({ has: page.getByRole('heading', { name: title, exact: true }) }).first().waitFor();
      }
      const rendered = await page.locator('main').allInnerTexts();
      assert(rendered.some(text => text.trim().length > 80), 'Main content is absent or still empty');
      fs.writeFileSync(path.join(out, `${file}.txt`), rendered.join('\n\n--- main landmark ---\n\n'));
      result.diagnostics = await diagnostics(page);
      assert(result.diagnostics.documentWidth <= width && result.diagnostics.bodyWidth <= width, 'Horizontal page overflow');
      assert(await page.locator('img').evaluateAll(images => images.filter(image => image.getBoundingClientRect().width > 0 && image.complete).every(image => image.naturalWidth > 0)), 'A rendered image failed to decode');
      await page.screenshot({ path: path.join(out, `${file}.png`), fullPage: true, animations: 'disabled', timeout: 15000 });
      result.screenshot = `${file}.png`;
      // App layouts may scroll inside a fixed viewport; capture that bottom too.
      const scrolled = await page.evaluate(() => {
        const candidates = Array.from(document.querySelectorAll('main,section,div')).filter(el => /auto|scroll/.test(getComputedStyle(el).overflowY) && el.clientHeight > 150 && el.scrollHeight > el.clientHeight + 100);
        const container = candidates.sort((a, b) => b.clientHeight - a.clientHeight)[0];
        if (!container) return false;
        container.scrollTop = container.scrollHeight; return true;
      });
      if (scrolled) {
        await page.waitForTimeout(150);
        await page.screenshot({ path: path.join(out, `${file}-bottom.png`), fullPage: true, animations: 'disabled', timeout: 15000 });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth), 'Horizontal overflow after scrolling');
      }
      result.expectedHeadingVerified = true;
    }, `${width}/${theme}/${route}`);
  } catch (error) {
    result.failure = error.message;
    try { result.diagnostics = await Promise.race([diagnostics(page), new Promise((_, reject) => setTimeout(() => reject(new Error('Diagnostic deadline')), 3000))]); } catch {}
    try { await page.screenshot({ path: path.join(out, `${file}-failure.png`), timeout: 5000, animations: 'disabled' }); } catch {}
  } finally {
    closing = true;
    await page.close().catch(() => {});
    result.passed = !result.failure && !result.errors.length && !result.badHTTP.length && !result.failedRequests.length;
    result.finishedAt = new Date().toISOString();
    report.results.push(result); persist();
    console.log(`${result.passed ? 'PASS' : 'FAIL'} ${width} ${theme} ${route}${result.failure ? ': ' + result.failure : ''}`);
  }
}

(async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true, timeout: 30000 });
  try {
    for (const width of [390, 768, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', colorScheme: 'light', locale: 'en-GB' });
      context.setDefaultTimeout(30000); context.setDefaultNavigationTimeout(60000);
      const setup = await context.newPage();
      const selection = { width, passed: false, errors: [], badHTTP: [] };
      setup.on('pageerror', error => selection.errors.push(error.message));
      setup.on('response', response => { if (response.status() >= 400 && !optionalAsset(response.url())) selection.badHTTP.push({ status: response.status(), url: response.url() }); });
      try {
        await bounded(async () => {
          const entry = new URL(base); entry.searchParams.set('choose-profile', '1'); entry.hash = '/office/case';
          await setup.goto(entry.href, { waitUntil: 'domcontentloaded' });
          await setup.getByRole('heading', { name: 'Who is visiting the family office?', exact: true }).waitFor();
          await setup.getByRole('button', { name: 'Open Managing Director', exact: true }).click();
          await setup.waitForFunction(() => !new URL(location.href).searchParams.has('choose-profile'));
          await setup.getByRole('heading', { name: 'Stewardship', exact: true }).waitFor();
          // Use the real settings control; do not inject localStorage or CSS themes.
          await setup.goto(urlFor('/settings/appearance'), { waitUntil: 'domcontentloaded' });
          await setup.getByRole('heading', { name: 'Appearance', exact: true }).waitFor();
          await setup.getByLabel('Theme', { exact: false }).selectOption('light');
          await setup.waitForFunction(() => document.documentElement.classList.contains('light'));
          selection.passed = true;
        }, `Managing Director selection ${width}`);
        assert(!selection.errors.length && !selection.badHTTP.length, 'Profile entry raised browser or HTTP errors');
        report.profileSelections.push(selection); persist();
        for (const [route, heading] of routes) await inspect(context, route, heading, width, 'light');
        await setup.reload({ waitUntil: 'domcontentloaded' });
        await setup.getByLabel('Theme', { exact: false }).selectOption('dark');
        await setup.waitForFunction(() => document.documentElement.classList.contains('dark'));
        for (const route of darkRoutes) await inspect(context, route, routes.find(item => item[0] === route)[1], width, 'dark');
      } catch (error) {
        selection.passed = false; selection.failure = error.message;
        if (!report.profileSelections.includes(selection)) report.profileSelections.push(selection);
        report.errors.push({ width, message: error.message });
        try { await setup.screenshot({ path: path.join(out, `setup-${width}-failure.png`), timeout: 5000 }); } catch {}
        persist(); console.error(`FAIL setup/theme ${width}: ${error.message}`);
      } finally { await context.close(); }
    }
    report.passed = report.results.length === report.expectedPrimaryCases + report.expectedDarkCases && report.results.every(result => result.passed) && report.profileSelections.length === 3 && report.profileSelections.every(result => result.passed) && report.errors.length === 0;
    report.status = 'complete'; report.finishedAt = new Date().toISOString(); persist();
    console.log(`${report.passed ? 'PASS' : 'FAIL'} ${report.results.filter(result => result.passed).length}/${report.expectedPrimaryCases + report.expectedDarkCases} route/viewport/theme cases; evidence ${out}`);
    if (!report.passed) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(error => { report.status = 'failed'; report.errors.push({ message: error.message }); report.finishedAt = new Date().toISOString(); persist(); console.error(error); process.exitCode = 1; });
