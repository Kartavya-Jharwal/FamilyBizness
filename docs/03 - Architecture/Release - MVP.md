# MVP Release

This record owns the current deployed browser-local MVP. Scope: [MVP feature contract](../05%20-%20Requirements/Product%20Requirements%20-%20MVP%20Feature%20Scope.md). Acceptance mapping: [release matrix](../05%20-%20Requirements/Release%20-%20MVP%20Acceptance%20Matrix.md).

## Published application

- Live: [FamilyBizness](https://kartavya.tech/FamilyBizness/).
- Deployed application revision: `4b05b2a03f9c4a47250b45e73e91eea51378d463`.
- [Successful clean build, checks and Pages deployment](https://github.com/Kartavya-Jharwal/FamilyBizness/actions/runs/41643303442).
- [Public release marker](https://kartavya.tech/FamilyBizness/release.json): build time `2026-11-03T13:19:54.507Z`; base `/FamilyBizness`.

The current offer is one prepared family office using the [combined operating charter](../00%20-%20Canonical/Family%20Office%20-%20Combined%20Operating%20Charter.md). Golden Bird, Calcot / Stone, Sandoval and Vasnani supply selected provisions. Visitor personas share the existing charter, financial/estate records, calendar, tasks and evidence. Earlier independent workspaces remain recoverable separately; constitution creation/library controls are secondary administration.

The combined charter populates sale-or-retain readiness and dependent continuity actions, ownership-liquidity review, independent employment assessment, mentoring, reporting deadlines and draft community requests through the existing module owners. Source selection and incompatible alternatives are explicit. The numerical scenario remains the existing validated GBP case rather than combining four businesses' accounts.

## Executed verification

- All **193 smoke tests across 31 files** passed locally, including six composite-office regressions. Two focused profile UI checks passed separately.
- Shared UI/SDK declarations were generated; frontend and node-configuration TypeScript passed after population-type corrections. The clean deployment workflow passed the final type/smoke/provenance gates.
- Pages-base static build passed. Existing upstream sourcemap/annotation, circular-chunk and bundle-size warnings remain non-fatal; the critical built journeys were exercised.
- The six-software-donor source/mount/license audit passed; original license bytes and distributed notices remain retained. Constitution sources are distinct from software donors.
- `node scripts/verify-mvp-release.cjs` passed against the packaged site: redirects/font/base, all four charter sources, shared personas, direct cash-check navigation and budget application, ERP completion evidence, estate alternatives, FMEA/action/source state, calendar overlap/agenda/week, both process examples, responsive layout and dark UI; no page errors.
- Combined charter desktop/mobile and dark ERP screens were visually inspected for readable text and usable layout.
- Public HTTP verification confirmed the deployed revision. Both entry HTML files, the self-hosted font, donor manifest and main application bundle match the exact uploaded Pages artifact byte-for-byte.

## Handover

`artifacts/submission/FamilyBizness - MVP.zip` contains the exact published static artifact under `FamilyBizness/`, corresponding source at the deployed revision, current Markdown documentation including the combined charter, and browser evidence. The ZIP is local delivery output, not committed application source. Its README explains serving the `/FamilyBizness/` base and entering the prepared office. Documentation-only follow-up commits do not change the deployed application revision.

Detailed donor contributions: [frontend ledger](Donors%20-%20Frontend%20Contribution%20Ledger.md). Current entry and persona behavior: [profile flow](../05%20-%20Requirements/Auth%20Flow.md). Prior release records remain in Git history.
