# Landing Performance

## Scope and method

Local Lighthouse lab checks cover the built public landing page, not the Portfolio application or production field performance. Product scope remains defined by [Identity](../00%20-%20Canonical/Identity.md). Responsive and interaction checks are documented in [Landing UX](Report%20-%20Landing%20UX.md).

Audits use Lighthouse **13.6.0**, headless Microsoft Edge, the mobile default simulated throttling profile and the desktop preset. Reports are written to ignored `apps/portfolio/artifacts/landing-signoff/<label>/`. Build and browser suites run serially to avoid competing with the audit on this workstation.

## Final result — 9 November 2026

**PASS**: `node ci/verify-landing-performance.mjs` exited **0** against the final built landing at `http://127.0.0.1:4175/`. The measured page reflects the current canonical Smith narrative. Source and built landing HTML, CSS and surname script were checked for agreement.

| Profile | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 99 | 100 | 100 | 100 | 2,136 ms | 59 ms | 0 | 326,384 bytes |
| Desktop | 100 | 100 | 100 | 100 | 685 ms | 0 ms | 0.00282 | 475,706 bytes |

Mobile started at 17:32:20 UTC and desktop at 17:32:40 UTC. Evidence: `final/summary.json`, `final/lighthouse-mobile.report.json`, `final/lighthouse-mobile.report.html`, and the equivalent desktop reports beneath the artifact directory above. The visible-label/accessibility-name audit passes in both profiles.

## Reproduce

Build with `bun run build`, then serve with `PORT=4175 bun run preview` (PowerShell: `$env:PORT='4175'; bun run preview`). In another terminal:

```powershell
npm install --prefix .cache/lighthouse --no-save lighthouse@13.6.0
$env:CHROME_PATH='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
$env:LANDING_URL='http://127.0.0.1:4175/'
node ci/verify-landing-performance.mjs
```

`LIGHTHOUSE_CLI` can point to an existing CLI installation. This workstation used `D:/KJ/Caches/npm/_npx/0f94ee7615faf582/node_modules/lighthouse/cli/index.js`. `AUDIT_LABEL` selects an evidence subdirectory; its default is `final`.

The command fails unless both profiles reach performance ≥90 and accessibility, best practices and SEO ≥95; LCP ≤2,500 ms; TBT ≤200 ms; CLS ≤0.1; and total transfer ≤1,000,000 bytes. It also rejects a visible-label/accessibility-name mismatch, including when that audit does not affect the category score.

## Findings addressed

The first integrated imagery run reached desktop **100/100/100/100**, mobile **92/100/100/100**, but failed the stricter mobile LCP budget at **3,018 ms**. Mobile TBT was **168 ms**, CLS **0**, and transfer **443,079 bytes**. The LCP element was the hero oak image; priority, eager loading and discovery checks already passed. Image-delivery diagnostics identified compression savings, and the mobile page incurred additional style/layout work. This is an intermediate result, not a passing sign-off result.

The follow-up reduces the mobile hero to a dedicated 480-pixel WebP, reuses it in the generation card, and avoids unnecessary text-node mutations during surname initialization. The decorative monogram remains hidden from assistive technology; removing the brand link's redundant overriding `aria-label` allows its visible text to supply the native accessible name and resolves the mismatch. Preview and development servers now return correct JPEG, WebP, AVIF and manifest MIME types.

## Limits

Local preview does not model GitHub Pages compression, cache headers, real network latency or real-user Core Web Vitals. Lighthouse's cache and compression suggestions must be checked on the deployed URL. Scores vary with host load and are not an availability or security certification.

The separate Portfolio application retains a large production JavaScript chunk (approximately 5.65 MB uncompressed) and existing source-map/circular-chunk warnings. Passing landing scores do not clear that application's performance. No new portfolio engine or authentication backend is introduced by this work.
