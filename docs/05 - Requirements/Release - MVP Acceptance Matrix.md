# MVP Release Acceptance Matrix

This matrix is the release audit of documented product threads, assessed against the local source on 3 November 2026. Product identity remains in [Identity](../00%20-%20Canonical/Identity.md). The [whole-brief contract](Acceptance%20-%20Whole%20Brief.md) supplies the capability IDs. The initial inspection is retained below; [coordinated release closure](#coordinated-release-closure) records the subsequent fixes and executed gates. The [release record](../03%20-%20Architecture/Release%20-%20MVP.md) owns publication evidence.

**Code present** means inspected implementation exists; it is not a fresh runtime pass. **Gap** means the documented acceptance is not satisfied by the inspected source. **Historical** means an intake or earlier implementation description has been superseded. **Excluded** identifies production services deliberately outside this static MVP; it does not mark those services implemented.

## Initial product inspection (superseded by closure)

| ID / thread | Inspected implementation | Audit disposition / required release demonstration |
|---|---|---|
| G1 Decision rights | `governance-model.ts`, `governance-page.tsx`; submission/approval actors, evidence, history; reserved-vote checks | Code present. Verify invalid actor blocks, distinct approval requirements, and recorded review. Generic preparation approvals must not be mistaken for weighted owner/Board authority. |
| G2 Ownership/control | `governance-structures.ts`; entity graph, economic look-through, controlled votes; before/after transfers | Code present. Reject invalid totals/cycles and show an ownership/control change without silently applying it. |
| G3 Continuity | `governance-planning.tsx`; prerequisites, deadlines and completion evidence | Code present. Complete/reopen prerequisites and verify readiness. |
| C1 Constitution provenance | `source-model.ts`, source register, adopted Golden Bird fixture | Code present for selected sample. Golden Bird is one optional case; custom cases/constitutions need independent setup and editable source identity. |
| C2 Rule linkage | `policy-engine.ts`; exact-source activation/invalidation; direct cash/vote checks | Code present. Verify changed wording blocks actions and report results. Generic checks cannot remain permanently fixed to Golden Bird thresholds. |
| C3 Values/constraints | Sector screens and cash/equity/illiquidity/reserve/approval rules | Code present. Show blocked breach and screened/unscreened difference. Unspecified source screens must not be invented. |
| E1 English-law estate | `estate-iht-model.ts`; supported dated packs, gifts, residence taper, business relief, source references | Code present. Scoped results and unsupported-case handling require final gate; no legal certification is claimed. |
| E2 Structure alternatives | Ownership graph, gift timing, separate simple trust lifecycle | Gap at audit: no consistent direct/holding/trust comparison of the same input basis. Add a bounded comparative view with explicit economic/control consequences and applicable charges. |
| E3 Succession liquidity | Timed funding, insurance/access acknowledgement and monthly gap schedule | Code present. Verify late funding does not cure an earlier deadline shortfall. |
| P1 Construction | `investment-model.ts`, security inputs, full correlation, active-set optimisation | Code present. Run feasible and infeasible cases and inspect residuals. |
| P2 Risk/diversification | Portfolio volatility, concentration, stress; monthly drawdown, VaR95/CVaR95 | Code present. Historical risk is already implemented; do not add a duplicate engine. Validate units, sample-size labelling and illiquid constraints. |
| P3 Objective optimisation | Frontier/bisection, current/optimal and values-screen comparisons | Code present. Numerical and source-policy gates must pass. |
| F1 Consolidation | `finance-book-model.ts`; entity balances, income, cash, FX, matched eliminations | Code present. Verify reconciled and unmatched cases; preserve source IDs/dates. |
| F2 Valuation | DCF/multiple sensitivity; carrying-value replacement | Code present. Holding-company refresh must include holding cash and apply ownership once. |
| F3 AUM/flows | Family wealth perimeter and dated history | Code present. Gross AUM, net wealth, external flows and drawdown must remain separate. |
| F4 Returns | `investment-performance.ts`; aligned periods, TWR, benchmarks, Sharpe, linked attribution, fees/tax/FX | Code present. Final regression must include reconciliation. |
| F5 Capital use | `operations-capital.ts`, philanthropy workspace; requests, diligence, linked approvals, commitments/payments | Code present. Verify budget/approval/payment state gates and prevent overpayment/refund. |
| F6 Long-term modelling | Correlated seeded projections, costs/tax/inflation, spending, transfers, private-sale assumptions | Code present. Apply a constitutional dividend budget to both Financials and the saved spending scenario; preserve reproducibility. |
| O1 Daily office | Operations task list, agenda/week, recurring occurrences, meeting details, completion evidence | Code present. Verify shared IDs/state, participant filters, recurrence and completion requirements. |
| O2 SFO/MFO | Provider budgets and like-for-like horizon comparison | Code present. Cost settings should remain secondary to daily work. |
| O3 Reporting | `operations-report.ts`, saved snapshots and board pack | Code present. Fresh exported pack must read current saved inputs and flag absent/invalid source state. |
| D1 Population/backup | `case-model.ts`; schema validation, import planning, rollback, exports | Code present. Export/restore every current module, including review/settings metadata added for release. Preserve case isolation. |
| D2 Submission evidence | AI implementation notes, methods/report page and submission directory | Product evidence present. Actual team contributions, historic prompts, professor approval and VLE submission are external records; do not fabricate or mark completed by app code. |
| Q1 Usability | Host semantic components and canonical tokens; prior screenshots/scripts | Fresh desktop/mobile, light/dark, keyboard and chart-label checks required for final release. Prior screenshots are historical evidence only. |

## Additional documented frontend threads

| Thread | Audit finding | Release treatment |
|---|---|---|
| ERPNext / calendar / all donor code | Current ERPNext implementation mainly translates organisation patterns; Cal.diy uses week ordering; other donors have substantial host/analysis/policy code | Require a per-donor source-to-host ledger distinguishing copied/adapted code, UI masks/configuration and reference-only ideas, with exact files/commit/license. Never equate a clone or notice with frontend integration. |
| Accounting/trading source controls | Earlier ERPNext importer removed; current primary pages have no source-status administration | Gap at audit. Provide local sample/disconnected/consent-required/failed display states, record identity/date and readable existing snapshots. No live service is required. |
| Warning/FMEA queue | No current persisted explicit-scoring workspace found | Gap at audit. Derive findings from current records; retain owner/evidence; permit explicit severity/occurrence/detection inputs. Missing scores must not become low risk or a fabricated RPN. |
| KPI/persona home | Family case has identity, six links and readiness; optional studio is separate | Gap at audit. Make the primary home answer what needs action using saved-state KPIs and source links; persona is a view, not authorization or a second ledger. |
| Cold visit/profile flow | Public login delegates to host profile shell; public legacy/splash/verify stubs remain | Latest user correction supersedes separate role/OTP screens. Ship a coherent host profile/case entry and clean or archive misleading public stubs; do not add real auth. |
| Ghostfolio X-ray/look-through | Host analysis presentation/preferences and truthful missing-provider states | Retained frontend contribution. Provider-backed constituents and real evaluator are excluded unless independently implemented; do not replace unavailable evidence with fabricated exposure. |
| Constitution authoring/IPS donor | Text/Markdown import, revisions, candidate extraction, source-line review, activation, guarded fixture mutations | Retained frontend/code contribution. Word/PDF/OCR ingestion is not a proven current feature; selected supplied source population is separate from general document extraction. |
| Assistant | Local delayed faux stream and fixed ending | Keep honestly labelled offline demonstration or secondary. Live AI is excluded. |
| Walkthrough/studio | Optional `office/overview` presentation uses existing model owners | Presentation only; cannot substitute for editing/calculation acceptance. Recording artefacts are not required to run the MVP. |
| Settings | Administration entry, donor settings inherited | Confirm infrequent currency/data/provider configuration is consolidated, not repeated as daily primary work. |

## Release and documentation gates

1. Ordered package/UI/SDK type checks, relevant smoke/model suites, root static build with `/FamilyBizness` base, and `verify-donor-pass.mjs` must pass on the final source.
2. Inspect the actual root `dist/` package, not only `apps/portfolio/dist`: entry, deep links, assets, token file, legal notices and no donor backend/Git metadata.
3. `.github/workflows/pages.yml` deploys `main` with Bun install, frozen portfolio lockfile, root build, type/smoke/provenance checks and Pages artifact upload. Verify the actual workflow/deployed URL after publication.
4. `Trace.md` still begins with an empty stub matrix and obsolete login/queue descriptions at audit. Replace contradictory current claims with one maintained trace; mark historical intake documents explicitly historical.
5. `legacy.html` still says placeholder narrative and incorrectly describes login as splash/verification stubs. Remove misleading release text or make it a deliberate optional narrative page.
6. Legal notices are distributed under `public/open-source`; ERPNext copied/adapted source must carry its applicable GPL provenance. Preserve original clones outside the shipped tree.
7. Real auth/MFA, live accounting/trading/calendar sync, background notifications, payments, brokerage execution, legal instruments and multiuser infrastructure remain excluded by the documented static-MVP contract and the user's donor-stripping instruction. Their absence is not an unfinished frontend integration.

## Evidence status

The initial audit above recorded source inspection only. Subsequent execution and resolution are recorded in the coordinated closure below and the linked release record. No legal review is implied.

### Review/source gap implementation

The audit's source-status and warning-review gaps now have a bounded frontend implementation in `office-review-model.ts` and `office-review-workspace.tsx`. Findings read the existing saved records; only review ownership, evidence, explicit scores and display preferences are new state. The workspace reads host activities through the existing adapter and does not add a ledger or service. Corrective actions share the operations register, including the literal `please fix` message for constitutional corrections. Four focused model tests passed during implementation. Final route, backup, browser and release-gate verification belongs to the coordinating release pass; no deployment is established by this note.


## Coordinated release closure

The implementation gaps identified above are closed for the browser-local MVP contract. The historical/code-inspection rows describe the audit starting point; this section is the current release gate result.

| Acceptance group | Completed evidence |
|---|---|
| G1-G3 | Existing governance/ownership/continuity model tests and routed workspaces; independent case setup and source-linked KPI home |
| C1-C3 | Per-case constitution library/selection/revisions, typed policy and source invalidation tests; packaged browser adoption of two distinct custom packs and active selection |
| E1-E3 | Scoped dated estate/trust engine tests; consistent direct/holding/cash-trust alternatives and funding reduction tests; packaged ownership filters and all three alternative rows |
| P1-P3 / F1-F6 | Constrained investment/financial/performance/transfer tests and current routed workspaces; saved-input reports; visible GBM/OU donor lab exercised in packaged browser |
| O1-O3 | ERP Task metadata and evidence-gated bulk completion; Cal agenda/week and same-zone overlap controls; FMEA reviews/corrective actions/source states; shared board-report owners |
| D1 / Q1 | Transactional case/constitution/review backups, independent profile persistence; root Pages-base artifact, self-hosted font, legacy redirects, desktop/mobile/dark visual inspection and no page errors in acceptance journey |
| D2 | Actual implementation notes, source ledger and release evidence documented. Genuine institutional/team submission evidence remains supplied by its owners and is not fabricated |

Local gates: 186 smoke tests across 30 files passed, plus the added recurrence regression passed separately; package/UI/frontend TypeScript passed; root static build, original branding/license audit and six-donor frontend/mount/license manifest audit passed. `verify-mvp-release.cjs` passed the packaged independent-case/constitution, ERP, estate, review/source, calendar and lab journey. Desktop/mobile and settled light/dark screens were inspected.

Public deployment status and revision are maintained in [Release - MVP](../03%20-%20Architecture/Release%20-%20MVP.md). Production services/auth/financial execution remain intentionally excluded rather than falsely marked implemented. All six active software donors are accounted for in the contribution ledger; Golden Bird remains one data/constitution example.

Public closure: the [successful Pages deployment and public acceptance journey](../03%20-%20Architecture/Release%20-%20MVP.md) are verified. Golden Bird is an optional assignment case; independent constitution adoption and selection were exercised in a separate family workspace.
