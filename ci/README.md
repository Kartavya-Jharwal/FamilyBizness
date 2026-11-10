# Local automation

Landing release checks: run `node ci/verify-landing-signoff.cjs` against the built preview (`MVP_QA_URL`), then `node ci/verify-landing-performance.mjs` (`LANDING_URL`, `LIGHTHOUSE_CLI`, and optional `CHROME_PATH`). Run Lighthouse while builds and other browser tests are idle. The scripts save screenshots and machine-readable results under the ignored `apps/portfolio/artifacts/landing-signoff/` folder. [UX results](../docs/07%20-%20Submission/Report%20-%20Landing%20UX.md) and [performance budgets/results](../docs/07%20-%20Submission/Report%20-%20Landing%20Performance.md) describe scope and limitations.

Run `npm run ci:local` (Bun required), or `./ci/Run.ps1` from PowerShell. The pipeline installs locked dependencies, checks source hygiene, typechecks, runs the focused donor and family-office test suite, builds, checks local HTML links and checks assets. The lint step is a source hygiene check, not a full ESLint ruleset. No hosted workflow remains active.

`npm run preview:local` builds and serves the output locally. `dist/` contains only static files; no server runtime or credentials are needed. Hash routes survive refresh. Default output uses relative paths and can be copied to any static host. Set `BASE_PATH` only for a deliberate fixed prefix.

Examples are inert: never copy them to an automation path unless intentionally enabling paid automation. For Cloudflare Pages, upload `dist/` directly, or configure build `bun run build`, output `dist`, root repository directory. GitLab example is for reference only.

`npm run prompts:append` scans known project transcript sources and appends previously unseen user prompts with source and timestamp. It only includes records tied to this repository; secrets are redacted. Raw transcripts stay local. Inspect the log before publishing.

Optional production browser smoke check on this machine: `node ci/verify-static-smoke.cjs`. It intercepts files from `dist/` under a nested URL prefix without starting a server. It requires the machine-specific Playwright runtime noted in the script, and verifies real built-route execution, surname persistence and a restricted direct route.
