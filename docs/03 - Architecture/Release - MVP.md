# MVP release

## Four-constitution revision

The current revision implements the [combined operating charter](../00%20-%20Canonical/Family%20Office%20-%20Combined%20Operating%20Charter.md). It replaces the primary independent-family/constitution-authoring offer with one prepared office and shared visitor personas. All four source constitutions contribute selected operating provisions; earlier workspaces remain recoverable separately.

Local verification: all 193 smoke tests across 31 files passed. Two focused profile UI checks also passed. Frontend and node-configuration TypeScript checks passed after correcting population types. The final packaged browser journey passed entry, shared personas, the four-constitution charter and its direct cash-check link, budget application, ERP evidence, estate alternatives, reviews, calendar overlap/agenda/week, stochastic examples, mobile overflow and dark UI without page errors. The combined charter and dark ERP screens were visually inspected. Public publication of this revision is the remaining release gate. The prior deployed baseline is retained as history, not the current source revision.


This record owns the delivery state of the current browser-local MVP. Product scope and exclusions: [MVP Feature Scope](../05%20-%20Requirements/Product%20Requirements%20-%20MVP%20Feature%20Scope.md). Requirement evidence: [acceptance matrix](../05%20-%20Requirements/Release%20-%20MVP%20Acceptance%20Matrix.md).

## Previous deployed baseline

The source now includes independent cases/constitutions, the source-linked family KPI/action home, actual donor frontend/code contributions, ERP task/ownership masks, Council/Board calendar interactions, explicit stewardship reviews and source states, structure comparison, analytical workspaces and portable board/case exports. Golden Bird remains one optional teaching case.

Local verification: the final donor smoke gate passed all 187 tests across 30 files, including the recurrence regression. Root package/UI/frontend TypeScript checks passed. The GitHub Pages-base static artifact builds; branding/license audit and six-donor source/mount/license audit pass. The packaged browser acceptance script covers entry/base paths, independent constitution adoption and selection, ERP actions, estate alternatives, FMEA/source states, calendar, lab and responsive layouts. The packaged browser journey passed. Independent profile/constitution creation and switching, ERP completion evidence, all estate alternative rows, FMEA/action storage, local source states, calendar conflicts and both stochastic examples were exercised without page errors. Settled entry and dark controls plus desktop/mobile screens were visually inspected. The same acceptance script subsequently passed against the public deployment, with no page errors.

## Previous baseline delivery

Published on 3 November 2026 at [FamilyBizness](https://kartavya.tech/FamilyBizness/).

- Deployed application revision: `0c1732f48c3bb94a5791fc0a05a8861836a9719b`.
- [Successful build, checks and Pages deployment](https://github.com/Kartavya-Jharwal/FamilyBizness/actions/runs/41633519384).
- [Public release marker](https://kartavya.tech/FamilyBizness/release.json) matches that revision; build time `2026-11-03T12:11:17.223Z`.
- `MVP_QA_URL=https://kartavya.tech/FamilyBizness/ node scripts/verify-mvp-release.cjs` passed the public combined journey after deployment.
- The exact uploaded Pages artifact was downloaded for the handover, rather than rebuilding a different package. The handover includes the static site, corresponding source archive at the deployed revision, current release documentation and browser evidence.

The first clean Linux release attempt exposed Git line-ending conversion of donor licenses. The release preserves those files byte-for-byte through `.gitattributes`; the replacement workflow passed the exact-license fingerprints and source/mount checks. Subsequent documentation-only commits do not change the deployed application revision.

Donor provenance and what was actually transferred: [Frontend contribution ledger](Donors%20-%20Frontend%20Contribution%20Ledger.md). Every copied/adapted component remains under its applicable original license, with corresponding source available in this repository.
