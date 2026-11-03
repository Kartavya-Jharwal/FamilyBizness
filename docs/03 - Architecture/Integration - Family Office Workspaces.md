# Integrated Family Office Workspaces

Product facts: [Identity](../00%20-%20Canonical/Identity.md). Requirement contract: [Whole Brief Acceptance](../05%20-%20Requirements/Acceptance%20-%20Whole%20Brief.md).

## Application ownership

The existing React host in `apps/portfolio` owns the planning application. `apps/web` supplies the public entry and static packaging. The application starts at `/office/case`; all six pillar workspaces are reachable from that case. No donor server is needed at runtime. The studio remains an optional presentation surface, not evidence that a requirement is complete.

| Route | Working capability and principal owner |
|---|---|
| `/office/case` | Case identity, saved-data readiness and validated multi-module case-pack export/restore; `case-model.ts` |
| `/office/governance` | Participants, RACI, distinct approval records, entity ownership/control, continuity dependencies and dated readiness actions; `governance-model.ts`, `governance-structures.ts` |
| `/office/sources` | Exact selected excerpts, source identity, interpretation, assumption basis and named review |
| `/office/policy` | Typed executable constraints, explicit activation revision and frozen source snapshots; source changes invalidate active policy |
| `/office/business?tab=estate` (legacy `/office/estate` redirects) | Scoped English-law IHT rule packs, cash-gift chronology, exemptions/reliefs, residence taper, trust lifecycle and timed liquidity; `estate-iht-model.ts` |
| `/office/business?tab=financials` (legacy `/office/finance` redirects) | Entity statements, matched eliminations, FX bridges, reconciliations, DCF/multiple sensitivity, family wealth perimeter, dated AUM history and cash forecasts; `finance-book-model.ts` |
| `/office/simulation` | Security/correlation inputs, constrained continuous allocation, screens, explicit stress, observed-period performance/attribution, correlated projections and dated generation transfers |
| `/office` | Family calendar: agenda/week views, timed council/member meetings, participants, location, agenda, obligations and recurrence |
| `/office/business` | Family business: day-to-day task list/detail, provider costs and board reports; Estate planning and Financial reports are sub-tabs |
| `/office/philanthropy` | Grant/venture diligence, linked governance approval, budget commitment and evidenced payment/refund ledger |

## Shared data and enforcement

- The statement book owns entity cash and forecast capital-use budgets. Profit is not assumed to be distributable cash. Capital approvals read saved budgets, and estate funding imports require an explicit legal-access acknowledgement.
- Book assets are accounting measures. Family fair-value wealth selects non-overlapping ultimate owners and replaces the operating-business carrying investment with DCF equity. It does not add a DCF valuation to already consolidated subsidiary assets. Restricted charity holdings are identified separately.
- The policy owner freezes reviewed source excerpts at activation. Investment constraints/screens, capital approval thresholds and reserve/distribution checks consume the same revision. Changed or unreviewed sources block dependent calculations/actions until reactivated.
- Governance approvals retain distinct actor IDs and evidence. These are local workflow records, not authenticated signatures.
- The source register does not pretend that arbitrary prose is executable. A human binds a reviewed interpretation to a supported typed rule. The legacy portfolio-account IPS remains a separate scope.
- Monthly performance inputs reconcile successive holdings, flows, fees, taxes and FX. Gross/net TWR and unitised drawdown are distinct from AUM growth including external flows. Brinson–Fachler effects are Carino-linked with a reconciliation residual.
- Portfolio optimisation solves convex minimum-variance active sets and searches the efficient frontier under a risk ceiling; it reports feasibility and numerical residuals. The supported universe is two to six securities/funds. There is no five-percentage-point weight grid in the primary investment workspace.
- Projections use reproducible correlated asset shocks and explicit fees/gains-tax assumptions. Internal generation transfers change economic shares without reducing consolidated wealth. Tax/cost events are separate outflows. Private-sale availability and haircuts are explicit.
- Case-pack restore validates every included module and active source references before writes; writes are rolled back on storage failure. Report exports flag absent or invalid saved data instead of silently using sample defaults.

## Boundaries

This is a browser-local planning MVP. It does not execute payments, trades, share transfers or legal documents. It does not provide production authentication, live accounting feeds or a shared multiuser database. Statutory estate results are withheld for unsupported legal cases; eligibility remains a reviewed input. Financial consolidation supports a defined whole-entity scope and does not automate acquisition accounting, minority-interest accounting or every trust/corporate tax interaction. Portfolio assumptions require calibration; Monte Carlo outcomes are conditional scenarios.

The supplied Golden Bird constitution is now populated as the fictional English-law and GBP case described below. Other profiles remain editable independent examples. The old flat finance and three-asset models are retained for prior saved-data compatibility and the optional studio, not used as the primary financial/investment interface.

## Donor provenance

The portfolio, selected analysis and constitution foundations remain integrated in the existing host. Cal.diy contributed date-range/order patterns with its MIT attribution. The local simulation scaffold supplied a pure seeded process boundary. ERPNext supplies task-list, company/shareholder and workspace organisation patterns for the embedded Family business surface. Notices and licenses remain in the distributed open-source directory. Original contender clones were moved to ignored `.local-references/contenders`; only the README remains under `donor/contenders`.

## Verification status

Earlier integration and studio checks are historical, not evidence for this expanded revision. The current pass uses focused model/integration checks and a final compiler/build gate. Results will be recorded here after completion. No public deployment of this expanded revision is claimed.

## Expanded revision verification — 2 November 2026

- Targeted model/integration run: **20 tests passed across five files**, covering known continuous allocation bounds/infeasibility, consolidated statements and wealth perimeter, deterministic transfer/cost treatment, period-return reconciliation and linked attribution, capital workflow, board reporting, policy activation/invalidation, and case import/rollback.
- Estate/governance work separately reported **24 focused tests passed** before the delegated run later hit its usage limit. This is reported separately rather than presented as a fresh full-suite run.
- Frontend TypeScript (`tsc --noEmit` and node configuration) passed after fixing literal return types in editable-table factories and a governance test fixture.
- Production build passed. Existing upstream sourcemap/annotation and large-bundle warnings remain; the bundle-size warning is not a claim of a load-time performance pass.
- `scripts/verify-whole-brief.cjs`: five focused browser checks passed, covering primary financial rendering/save, saved future-year budgets feeding capital, continuous optimisation/projection, a board pack consuming saved owners, and the mobile financial editor. No page errors or viewport overflow in those checks.
- A separate focused render check loaded the statutory estate calculation and final projection without page errors. Desktop financial/estate/calculation screenshots and mobile financial editing were inspected. Analytical chart lines were strengthened and animation disabled for stable complete curves; legend text uses foreground tokens.
- `verify-donor-pass.mjs` passed the attribution/branding/distributed-license audit (1,871 editable files at that run). `git diff --check` reported no whitespace errors; Git emitted line-ending conversion notices.

Earlier case/policy browser attempts confirmed activation/persistence and produced desktop/mobile renders, but did not finish the full harness because exact accessible-label locators failed at later editing steps. Those are **not** claimed as complete end-to-end passes. The underlying activation/invalidation model checks passed; explicit labels were added to the affected controls.

Testing was deliberately limited after the user's request to conserve tests. No repeated full upstream suite, production load test, legal certification or authenticated multiuser test is claimed. The build is local; no push or public deployment of this revision has been performed.


## Frontend donor integration

Donors are stripped frontend inputs to the existing Portfolio application. Their Git metadata, backend runtime, authentication and synchronization are excluded from the distributed product by design. A missing donor service is not an unfinished requirement. Portfolio semantic components and its canonical tokens take precedence over donor styling.

ERPNext is used for family-business daily operations and the estate/ownership workspace, not as an external accounting connection. The Family business tab embeds the existing task register, estate workbench and financial book. The separate ERPNext JSON report-import detour has been removed. The task list adapts the donor's subject/company/assignment/due/status list-and-detail pattern onto existing operations records; the estate holding register uses the shareholder/company list-and-detail pattern, while ownership/funding uses existing Governance and Financials owners. No second ledger, task database or estate model is created.

Inspected donor sources at the commit recorded in [ERPNext intake](../02%20-%20Strategy/ERPNext%20-%20Donor%20Intake%20And%20Integration%20Plan.md): `erpnext/projects/workspace/projects/projects.json`, `erpnext/projects/doctype/task/task.json`, `erpnext/projects/doctype/task/task_list.js`, and `erpnext/accounts/doctype/shareholder/shareholder.json`. Their frontend organisation is translated to host React components; no Frappe runtime or copied ERPNext executable source is distributed.

Calendar retains the Cal.diy-derived week/agenda structure and adds timed council and member meetings. Meeting details (start/end, explicit IANA zone, participants by Governance person ID, location and agenda) extend the existing obligation record and profile storage key. All-day tasks retain date-only semantics. Council/next-generation sample meetings populate a fresh register; existing saved registers can add those samples explicitly without replacement or duplication. Meetings can be created, edited, filtered by member and saved; same-day end must follow start. Times are shown in each meeting's recorded zone, not converted to a second viewer zone. Recurrence preserves meeting details. No external invitation delivery is part of this frontend.


### Frontend donor verification - 3 November 2026

- Ten focused operations/meeting tests passed, including backward-compatible register decoding, chronological week selection, meeting time/zone/participant validation and recurrence retaining meeting details.
- Frontend TypeScript and production build passed. Existing upstream sourcemap/annotation and bundle-size warnings remain.
- `scripts/verify-profile-integration.cjs` passed: add a business task and see it in Calendar; save/reload/reopen a timed family meeting; filter participants; navigate mobile Estate/Financial tabs; check viewport overflow and page errors.
- Desktop light/dark and mobile calendar/estate screens were inspected. The estate holding list opens its existing editor. A long valuation-load button was made to wrap within the mobile card. Legacy estate/financial routes redirect to the corresponding Family business tab.
- This pass changes the local frontend. It does not claim a public deployment.


## Golden Bird populated case

The supplied Assignment 1 material has been selected and ported into the fictional English-law case at [Golden Bird - English Law Case](../00%20-%20Canonical/Golden%20Bird%20-%20English%20Law%20Case.md). That canonical record owns legal/currency choices; the source index retains provenance. Runtime population lives in `golden-bird-case.ts`, using the existing case import, validation and profile storage boundaries.

Choose **Project Golden Bird** in the existing profile chooser, or **Open Golden Bird case** from the family workspace. The dedicated profile seeds adopted clauses, ownership/group structure, governance workflows and continuity tasks, reconciled GBP accounts/forecasts, estate and trust scenarios, investment/performance assumptions, provider-cost comparisons, constitutional checks and an office calendar. Initialization fills missing modules once; it does not overwrite saved edits or change other profiles.

Family business now has Governance & succession, Constitution linkage, Estate planning, Day-to-day operations and Financial reports tabs. Existing workspaces are embedded without nested shells. Constitution linkage opens direct operating checks, then the source register and optional generic rule drafts. The adopted cash waterfall is not encoded as an AUM withdrawal cap, and weighted owner approval is not reduced to a number of approvers.

`golden-bird-rules.ts` evaluates the adopted cash safeguards and reserved-decision rules. The English-law dividend-profit capacity gate accompanies the constitutional funding tests. Applying a dividend budget atomically updates the existing holding-company forecast rows and the saved multi-generation spending assumption through the case-import boundary. A recorded decision review becomes evidence in the same operations log and board report. Changed source wording disables the adopted binding until reconciled. Both check inputs are included in portable case packs and board-input snapshots.

The calendar shares those operations records, including Council, Board, Assembly and twice-yearly owners' meetings. The **please fix** record is a message from F to the associate/family technician about constitution legality and instrument references; it opens the populated source workspace. Portfolio scenarios include liquidity, fees/tax, correlated risk, private-asset treatment, spending and generation transfers through the existing engine.


### Golden Bird verification

Thirteen focused tests passed across population, model/restore and profile files. They cover reconciled accounts, estate calculation, portable export/restore, preserved edits, transactional rollback, currency conversion, cash allocation/profit capacity, conflict-aware voting and source-binding invalidation. The integration compiler and production build passed with the existing upstream sourcemap/annotation and bundle-size warnings.

`scripts/verify-golden-bird.cjs` passed the populated-profile journey: governance defaults; profit-capacity blocking; cash waterfall into the financial forecast; conflict recusal; decision-review logging; estate ownership/valuation refresh; board export; Council calendar; mobile layout; and persistence after reload. Desktop and mobile screenshots were inspected for readable controls and labels. This is local verification, not a public deployment.
