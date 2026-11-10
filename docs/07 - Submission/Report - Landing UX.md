# Landing UX Verification

The landing and entry contract is defined in [Identity](../00%20-%20Canonical/Identity.md) and [Auth Flow](../05%20-%20Requirements/Auth%20Flow.md). Image sources and usage are recorded in [Landing Imagery](../04%20-%20Design/Assets%20-%20Landing%20Imagery.md).

## Changes

- Header layout accommodates wrapping navigation and long surnames instead of relying on a fixed header height.
- The skip link has an explicitly focusable main-content target; reduced-motion preferences apply to document scrolling.
- Local illustrative landscape imagery replaces empty portrait artwork without presenting stock subjects as the actual family. Caption panels provide a consistent contrast background.
- Surname editing works for the current visit even when browser storage is denied. Cross-tab changes update the visible input as well as the brand, and personalization preserves the page-title description. Values remain text, never executable markup.
- Long surnames wrap in body copy as well as the header and footer. Unchanged default personalization avoids rewriting every text node on first load.
- Portfolio splash imagery resolves relative to its CSS file, and the authentication logo uses the configured application base path, preventing missing icons under nested hosting.

## Reproducible Checks

Run `node ci/verify-landing-signoff.cjs` after the production build, with `MVP_QA_URL` set to the preview's actual root, including its deployment prefix if configured. The harness uses the installed Playwright package and Edge; `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_CHANNEL` allow overrides.

Checks cover 320, 390, 768, 1024, 1440 and 1920 CSS-pixel widths; image loading; page overflow; a 60-character surname; header/hero separation; capabilities below the first viewport; keyboard skip navigation; reload and cross-tab persistence; denied storage; safe text rendering; initial and returning profile selection; prepared-office entry; browser exceptions and failed HTTP responses. Screenshots and JSON evidence are written under `apps/portfolio/artifacts/landing-signoff/`.

## Verification Status

On 9 November 2026, the definitive run against the final production build at `http://127.0.0.1:4175/` passed **54 checks**, with **zero browser exceptions and zero failed HTTP responses**. All six viewport widths passed, including the long-surname regression discovered and fixed during this audit. Keyboard, cross-tab, reload, denied-storage, safe-text, initial and returning profile selection, and prepared-office entry checks passed. The harness uses the current accessible profile name, `Open Family Patriarch`.

Final viewport screenshots at 320, 390 and 1440 pixels were visually inspected: text, captions and navigation are readable without overlap. Full-page evidence was also captured at all six widths. The definitive machine-readable result is `apps/portfolio/artifacts/landing-signoff/results.json`; screenshots use `hero-<width>.png` and `landing-<width>.png` in the same directory. Earlier failure captures are diagnostic history and do not supersede the final JSON result.

This verifies the landing and its entry journey in local production output. It does not establish a fresh production deployment, full cross-browser compatibility, or a passing whole-application typecheck. Broader regression and Lighthouse results are recorded separately.

Additional final browser checks passed via `ci/verify-static-smoke.cjs`: nested `/project/` landing imagery and entry links at 390 and 1440 pixels; settings, stochastic and X-ray routes; surname persistence; and a Family Board direct-route restriction. The role check now selects the profile through the actual UI instead of changing storage behind the active session. `ci/verify-reicon-polish.cjs` also passed desktop/tablet/mobile light and dark overview checks, populated navigation icons, sidebar collapse and responsive profile selection. Desktop light and mobile dark charts plus tablet profile screenshots were visually inspected. Production build, local link/asset checks, packaged-source matching and diff whitespace checks passed. The broader TypeScript/Vitest reruns were stopped under workstation memory pressure and are not claimed as passing in this review.

## Content Still Awaiting The Team

The page explicitly identifies outstanding student contribution credits, the supporting video and any actual family photographs. These are content approvals, separate from technical verification.
