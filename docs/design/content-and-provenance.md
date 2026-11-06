# Content, Provenance And Integration Register

Product purpose and canonical facts: [Identity](../00%20-%20Canonical/Identity.md).

## Content homes

- Cash gifts: Estate Planning, cash gifts and seven-year ledger (`estate-statutory-page.tsx`, `/office/estate`). Generic and prepared case defaults contain labelled illustrative cash gifts; existing saved records remain authoritative. No exemption is assumed without evidence.
- Calendar: `annualOfficeDiary` in `operations-model.ts` provides eight monthly SFO review events across the current calendar year and the following January and February. It is included in new/reset diaries alongside the existing meeting samples. Existing saved diaries are preserved. The dates are illustrative review appointments, not legal filing deadlines.
- Liquidity sequencing: Capital overview explains source confirmation, protected reserves, contingent receipts and payment ordering next to the saved-book cash runway.
- Financial Statements: `/office/statements`, reading the same saved financial book as the capital overview. Candidate accounting connections are explicitly planned, with no active integration claimed.
- IPS: all review, revision and configuration panels remain open. The parser explanation states its deterministic scope and the need for human review. Appendix A is preserved as the art and culture mandate; no text beyond the supplied ending was invented.

## Accounting product names

Checked against official pages on 6 November 2026: [QuickBooks](https://status.quickbooks.intuit.com/), [Xero](https://apps.xero.com/uk/industry/accounting), [Sage Accounting and Sage Intacct](https://www.sage.com/en-gb/accounting-software/), [NetSuite](https://www.netsuite.com/portal/products/erp/financial-management/finance-accounting.shtml), [Zoho Books](https://www.zoho.com/books/) and [FreshBooks](https://www.freshbooks.com/accounting). These are candidate names, with no endorsement or implemented connector.

## Donor provenance and modifications

The authoritative file-level source, license, revision and retained-host-file record is `apps/portfolio/apps/frontend/public/open-source/donor-manifest.json`; distributed license texts and notices sit beside it. About links to this manifest and the repository. Do not replace the manifest with an inferred license summary.

| Source | Retained surface | Recorded license | Host changes |
|---|---|---|---|
| Wealthfolio | Portfolio frontend, accounts, holdings, activity, shared UI | AGPL-3.0 | Static adapters, local records, family-office routes, theme and profile shell |
| Ghostfolio | Selected investment-analysis workflows | AGPL-3.0 | Adapted analysis presentation and host data inputs; attribution limited to credits |
| ERPNext | Selected DocType/task/ownership interaction structures | GPL-3.0 | Host React fields and records; no ERPNext backend |
| Cal.diy | Calendar heading, week filtering, overlap lanes and switches | MIT | Numeric local-zone time arithmetic, host state, accessible host components |
| Dither Kit | Registry components listed in manifest | MIT declaration; retained notice | Host token and chart composition |
| User-supplied policy module | Parser and policy contracts | User-authorized source; dependency notices retained | Local adoption and rule evaluation |
| Local simulation lab | Model implementations | Local project source | Saved financial inputs, reproducible local computation |

The manifest explicitly records that the initial portfolio intake did not preserve an upstream commit. Snapshot hashes identify retained files; do not invent that revision. No contender clone under `donor/` is added to version control.

## Image credits

About reserves a structured image-credit area. Before replacing a placeholder, record path, creator, source URL, license, required attribution and changes in the asset register. Empty credits do not grant reuse rights.

## Spacing ownership audit

Before the calendar-switch correction, the switch root owned external vertical spacing through `my-2`, and its label owned sibling separation through `ml-3`. The root now owns internal vertical breathing room through `py-2` and sibling spacing through `gap-3`; label margin was removed. Existing auto margins in member rows align counts to the trailing edge rather than indenting navigation. IPS review sections retain `fo-disclosure` internal padding from the established host class.

## Category boundaries

Asset classes describe economic exposure: cash and equivalents, public equities, fixed income, real estate, private equity / operating businesses, private credit and collectibles. A vehicle is not an asset class. Entity types describe legal ownership and restrictions: individual, holding company, operating company, trust and charitable foundation. Expense classification follows purpose and payer: household distributions, office administration, professional advice, taxes, insurance, investment-management fees, business operating expense and philanthropic grants. A capital purchase of a documented collectible is recorded separately from decoration expense or a charitable artist grant; the same cultural theme does not make those transactions interchangeable.

## Visual verification scope

The repeatable local visual pass is `node ci/visual-content.cjs` with Vite on port 5194. It captures all 25 distinct final sidebar routes (including query-selected portfolio panes and estate planning) at 1440, 768 and 390 CSS pixels. Output stays untracked under `apps/portfolio/artifacts/handoff/`. It waits for rendered headings and rejects Vite overlays. `ci/visual-landing.cjs` captures the built landing at the same widths, and `ci/visual-chart-detail.cjs` scrolls FIRE to the outlook chart for additional inspection. The sweep covers the final sidebar; legacy detail routes outside that sidebar are not claimed as exhaustively captured. Each route waits for its expected heading. A fresh page per route and a shared browser context per width avoid mobile-stack carryover while retaining prepared records.

Settings mobile detail originally had only the standard container padding, so the fixed floating dock covered the trailing reset control. The settings container now owns extra bottom padding derived from the touch-target and spacing tokens. The settings drill-in breakpoint includes tablet widths to keep the detail column readable.

The mobile Budget page header had a zero-width `h1`: its parent flex row let the action group consume all available width. The shared `PageHeader` now exposes an optional `stackActionsOnMobile` layout flag, used by Budget, so the title and actions occupy separate rows below the small-screen breakpoint. Gap remains owned by that header flex container. This fixes the width allocation rather than adding margins to the title.

Final sidebar sweep on 6 November 2026: 25 routes × 3 widths = 75 captures, every expected heading verified, zero document-level horizontal overflows and zero JavaScript page errors. Desktop/tablet/mobile settings were manually compared for row alignment. Seven-model and FIRE charts were inspected at mobile and desktop widths; tick labels and legends remained readable. The initial Budget mobile title measured zero width; its header-layout fix was verified by a successful visible-heading retry. The first prepared-case provenance test assumed every calendar appointment was a constitutional obligation; it now distinguishes explicitly illustrative diary appointments while continuing to require canonical source IDs for constitutional tasks. The focused six-test prepared-case suite passes.


## Final visual evidence

All 25 final sidebar destinations were captured at 1440, 768 and 390 CSS pixels (75 verified route/width combinations). Each captured page matched its expected heading, with no page errors or root overflow. The mobile Budget heading needed its header/actions owner to stack; the settings container owns bottom padding to clear the fixed dock. Full results and images remain local under `apps/portfolio/artifacts/handoff/`; see the [implementation report](../07%20-%20Submission/Report%20-%20Handoff%20Implementation.md).

X-ray performance KPI cards were additionally inspected through the retained `?tab=methods` route, which renders the same `ReturnMethods` component now included beneath X-ray. Desktop shows all eight numeric cards (charges, TWR, monetary gain, annualized return, volatility, drawdown, attribution and observation count); mobile stacks them in one column. Extra evidence: `xray-metrics-390.png` and `xray-metrics-1440.png`. The Vite QA server and both attempted preview tabs were closed after verification.
