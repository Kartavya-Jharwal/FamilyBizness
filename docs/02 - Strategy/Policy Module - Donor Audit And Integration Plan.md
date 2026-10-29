# Policy Module - Donor Audit And Integration Plan

Status: host feature and simplified working policy demonstration verified, 29 October 2026. Product scope follows [Identity](../00%20-%20Canonical/Identity.md).

## Implementation checkpoint

The user clarified that a separate agent authored this project from their exploratory policy-as-code seed prompt and explicitly authorized reuse. The seed text was not supplied. This is recorded as user-supplied agent-authored source, without an invented upstream URL, author identity or license. [Snapshot manifest](../../upstream/policy-module.snapshot.json) preserves the original 27 per-file hashes. The donor remains unchanged.

The lazy `/governance/constitution` route is integrated into Portfolio navigation. Host UI/tokens replace the Next shell and global stylesheet. The first slice includes Markdown authoring, escaped source-text preview, append/replace verified text import, one-envelope local revision saves, conflict/error reporting, candidate clause/source-line inspection, local review notes, assumption gaps and coherent Markdown/JSON draft exports. Source edits mark old notes stale; line insertion alone does not detach notes. No binary extraction, remote assignment, brokerage transaction enforcement or new financial data store is claimed. Local IPS enforcement is described below.

Adapted parser, normalizer and assumption contract live under `apps/portfolio/apps/frontend/src/features/governance/constitution/`. The feature uses existing Zod; its original MIT license is distributed beside [source notice](../../apps/portfolio/apps/frontend/public/open-source/policy-module/NOTICE.md). No Next, editor, font or external rule-engine dependency was added. There is one local evaluator. Draft checks now provide a read-only preview against the existing scoped local fixtures; explicit review and activation are still required for an IPS to guard local mutations. No independent sample metric store was imported.

The host-owned observation boundary requires matching metric, unit, profile/account scope, date, source, complete coverage and any required currency/denominator; zero and false remain distinct from missing data. It performs no financial calculation or mutation. Local review notes are scoped to profile storage; the revision check detects a previously saved revision but is not a transactional multi-tab lock.

Initial authoring/observation slice, historical checkpoint: `bun run --cwd apps/portfolio/apps/frontend test src/features/governance/constitution` recorded **33 passing tests** (21 observation, 9 workspace/parser, 3 rendered UI). The current policy set and later combined verification are recorded below; this earlier count predates active-IPS and working-example tests. The feature remains in the permanent donor smoke gate.

## Decision

**Good conditional fit as the constitution and policy-authoring donor.** Keep Portfolio (`apps/portfolio`) as the main application and integrate selected capabilities there. Keep `apps/web` as the existing entry shell and Pages packaging boundary. Do not create a third production application, second financial ledger or second design system.

The new source is `donor/contenders/policy-module`, a Next/React application. Its package still calls itself `nextjs-postgresql-template`; that is template metadata, not evidence of a working database. Document and review persistence is browser-local. Source is useful for constitution linkage and governance; it does not establish a full succession, estate or approval system.

## Evidence and selection

All paths below are relative to the new donor root.

| Source | Finding | Disposition |
|---|---|---|
| `src/components/constitution-workspace.tsx` | Markdown authoring, revision/save controls, extracted policy inspector and hardcoded `sampleMetrics` | Adopt workflow; split orchestration into host feature hooks/components; replace independent metrics |
| `src/lib/documents.ts` | Master document compilation, schema validation, local revision check | Adapt with profile-scoped host persistence; preserve document text and source references |
| `src/lib/policy.ts`, `nlp-engine.ts` | Deterministic clause recognition, structured gates, unresolved clauses | Adopt selectively with boundary tests; show extraction as provisional interpretation |
| `src/lib/contract.ts` | Supplied/delegated/missing assumptions, source lines and gate references | Adopt contract concept; missing assumptions remain missing, not financial defaults |
| `src/lib/rule-engine-adapter.ts` | Local rule engine plus fallback evaluator in workspace | Reconcile outcomes before use; no automatic authority to enforce transactions |
| `src/lib/review.ts` | Local review queue, weak array-only stored-data validation, storage writes silently swallowed | Adapt as local review notes, validate records and report save failures; no claim of sent messages or recorded trustee approval |
| `src/components/import-dialog.tsx` | Text reads locally; binary imports explicitly simulated; 10 MB cap | Retain truthful distinctions; no PDF/Word extraction claim; validate content and replacement flow |
| `src/components/markdown-editor.tsx` | Sanitized Markdown preview; Next dynamic import; forced light mode | Replace Next loader with host lazy loading; preserve sanitization; support host theme and accessible dialogs |
| `src/lib/exports.ts`, `public/artifacts/` | Derived document/AST/contract exports, including SQL | Retain Markdown/JSON first; defer SQL export and avoid parallel editable generated truth |
| `src/app/globals.css`, `layout.tsx` | Separate palette, global selectors, Google font pipeline | Leave donor styling in reference; map to canonical tokens and host UI |
| `scripts/policy-check.ts` | Script generates artifacts as well as checking seed policy; not wired into package build | Extract meaningful regression assertions into host tests; no writes to source artifacts during ordinary tests |

## Audit findings and integration treatment

1. **Provenance clarified:** user-supplied agent-authored source, with reuse explicitly authorized. Original seed text and upstream license metadata are unavailable. The snapshot and exact origin statement are retained; dependency license preservation remains mandatory.
2. **Sample facts are independent:** `sampleMetrics` contains fictional liquidity, allocation, distribution, approval and currency inputs. They must never be presented as observations of Portfolio's current account scope.
3. **Currency and unknown states:** the rule adapter only rejects a currency mismatch when both currency fields are present; absence of observation currency must also prevent monetary evaluation. Do not coerce missing approvals to an actual approval decision. Verify fallback parity and non-finite observations.
4. **Persistence is a prototype:** two localStorage writes do not make document content and revision atomic. Revision comparison is not transactional multi-tab locking. Review writes may report apparent success without persistence. Use one versioned envelope, explicit errors and recoverable conflict handling.
5. **Unverified UI/build:** source inspection is not runtime, dependency-compatibility, keyboard, dark-mode or visual sign-off. No dependency vulnerability or license audit has been claimed.
6. **Mixed export revisions:** workspace exports current `content` alongside a policy compiled from delayed `analysisContent`. Compile all export payloads from one immutable document snapshot; test immediate export after editing.
7. **Delegations lost or miscounted:** workspace passes an empty set to `withDelegations`, while the inspector has separate review state. That function counts original rather than transformed domains. Centralize review state and count the final exported contract.
8. **Evaluator disagreement:** numeric failures in the fallback can report breach where the engine adapter uses enforcement to select review. Establish a single status specification and parity tests before displaying results.
9. **Import/export limits:** import accepts 10 MB but the master schema caps content at 60,000 characters; validate before applying edits. RTF is raw text, not a parsed document. If CSV survives extraction, neutralize spreadsheet formula cells. SQL's conflict-ignore behavior does not update changed or remove retired rules; defer this format.

## Ownership and semantics

Portfolio owns routing, navigation, current profile, account scope, currency, theme, financial fixtures and their reset behavior. The existing Insights analysis adapter continues to own normalized holdings and return semantics. The policy feature owns document revisions, candidate clauses, assumption gaps and local review notes. It reads financial observations without mutating accounts or enabling X-ray rules automatically.

Introduce a typed observation boundary containing metric key, value or explicit unavailable state, unit, currency where relevant, account scope, as-of date, source and coverage. A matching number alone is insufficient. Concentration needs an agreed denominator and classification; liquidity months needs agreed eligible reserves and spending; distribution rate needs a defined period and denominator. Portfolio does not currently supply all of these.

Keep extraction state (`recognized` / `needs definition`), observation availability and evaluation result separate. A clause may be recognized while its evaluation remains unavailable. Preserve source document ID, revision and line references; editing a clause must invalidate stale mappings and reviews. Stable clause IDs must not rely solely on line position. Proposed assumption schemas should be versioned and validated at boundaries.

## Implementation sequence and remaining extensions

1. **Capture donor:** retain the current local folder unchanged. Resolve provenance; record source revision or supplied snapshot hash, ownership/license and selected file mapping in an upstream reference record. Add original legal texts to the host legal distribution only when established. Never commit the clone.
2. **Characterize logic:** isolate parser/document/contract code and add tests for unknown prose, comparator boundaries, currency, unsupported metrics, clause edits and engine/fallback parity. Prefer one verified evaluator; defer live financial evaluation until observation contracts are satisfied.
3. **Port a vertical slice:** proposed host path `src/features/governance/constitution/`, with a lazy route `/governance/constitution` inside the existing HashRouter. Deliver edit, preview, local save/reload, extracted clauses and assumption gaps. No Next server, health endpoint, donor app layout or independent auth.
4. **Integrate design:** reuse `@fb/ui` cards, tabs, buttons, dialogs, notices and tables. Replace donor colours/fonts/spacing with semantic roles backed by `packages/tokens/tokens.css`. Use a document/inspector split on desktop and accessible tabs on narrow screens; show draft, saved revision and unresolved meanings distinctly. Disable forced-light editor styling. Do not copy global CSS.
5. **Connect data cautiously:** translate supported host reads through the observation boundary. Unavailable metrics remain unavailable. Keep fictional demonstrations visibly separate from scoped Portfolio observations. Add local review notes and verified text imports, with profile isolation and loss-prevention feedback.
6. **Verify and integrate:** extend the existing donor gate, provenance audit and legal view. Validate Pages base paths, refresh/deep links, light/dark/mobile rendering, keyboard focus and sample reset. Then update Trace with actual implemented clause-to-feature mappings. Keep removal decisions tied to dependency evidence; archive source remains in the donor folder.

The [type-check repair plan](Portfolio%20-%20Type%20Checking%20Repair%20Plan.md) is a separate prerequisite for a clean combined project check. Its early configuration/package fixes can proceed alongside donor characterization; adding the new module must not conceal the inherited diagnostics.

## Acceptance tests for this donor

- Parsing preserves unrecognized clauses; threshold equality, negation and unsupported prose cannot silently produce a pass.
- Missing/non-finite observations, missing currency, scope mismatch and incomplete coverage remain unavailable. Real and fallback evaluators agree on supported cases.
- Save/reload, corrupt storage, quota failure, stale revisions, profile changes and resets have explicit outcomes; failures do not display a successful save or review submission.
- Binary import never claims extraction; cancellation, invalid text, hostile Markdown and oversized input are handled. Preview sanitization remains active and external content behavior is explicit.
- Export is derived from the selected revision; stale generated artifacts are not confused with saved edits. Editing a clause invalidates related evaluation evidence.
- Existing faux-chat/population/analysis tests remain green. New module causes no AI/provider/backend calls; IPS guards host financial mutations without introducing a second ledger or valuation engine.
- Host full typecheck after its repair, `bun run donor:verify`, provenance audit and desktop/mobile visual checks all pass before combined acceptance. These are future acceptance criteria, not results of this audit.

## Reusable donor intake

Use Portfolio as the integration destination for subsequent donors. Keep original sources under `donor/contenders`, shared foundation references under `upstream`, and one intake/ownership plan per donor under Strategy. Adopt only gaps in the capability map; route overlap to the existing owner. Preserve license/attribution in legal records while adapting product identity, tokens and vocabulary. The older standalone [conversion playbook](Donor%20-%20Conversion%20Playbook.md) describes an earlier phase; its full-UI silo approach is not the intended integration architecture here.

## Active IPS enforcement

A saved revision becomes active only after an explicit review acknowledgement and activation. The active snapshot stores its exact source, revision, profile, all-local-account scope, currency and review timestamp. Editing or saving a later draft does not replace it; deactivation is explicit. This records a local user action, not trustee or legal approval.

The actual mutation boundary is `mutateDemoStore`: it applies the requested mutation to a copy, assesses the proposed financial state, persists it, then commits memory. Known violations and missing/unsupported facts reject before either financial memory or persisted data changes. Storage failure also prevents memory commit. Fixture reset follows the same guard. Corrupt active policy records fail closed rather than becoming inactive.

Supported constraints are reviewed public-equity, fixed-income and cash percentage boundaries and private illiquid exposure. Observations come from the existing `SAMPLE_POSITIONS` filtered by the proposed account set, reconciled against account balances, in USD. The denominator is the total remaining local fixture position value, not net worth, flow-adjusted returns or fund look-through. The UI displays the exact scope, as-of date and fixture source.

Account creation/deletion and reset are evaluated. Currency, balance, archival, active-state and tracking-mode changes lack supported post-change valuations and require review. Renaming an account does not alter financial facts. Unsupported active clauses also require review before financial account changes. Existing activity/trade/holding mutation commands that cannot project valuations reject while an IPS is active instead of claiming approved success. There is no new trade engine and no real brokerage enforcement. Goals, notes and category labels do not change these holdings and are outside this financial guard.

Integration tests prove a 55% public-equity ceiling rejects removal of the cash account without changing memory/disk, permits removal of the education-equity account, leaves drafts inactive, retains active revision across edits, rejects unavailable/currency/scope facts, guards reset and surfaces persistence failures. The final coordinating gate covers these tests together with the existing population tests.

## Combined verification

The combined gate passed on 28 October 2026: complete package/frontend/tooling type checks, 83 focused tests across ten files, production build and distributed attribution checks. Evidence: `apps/portfolio/artifacts/IPS-Verify.log`. The final repeat after the separate unsupported-provider-reset correction also passed with 83 tests and exit code zero, recorded in `IPS-Final-Verify.log`.

Production preview QA verified saved-revision activation and the displayed source-line result, desktop light/dark rendering, and mobile width 390 with no horizontal overflow. Screenshots are under `apps/portfolio/artifacts/ips/`. The explicitly labelled QA policy was deactivated afterward and the original instructional draft restored; no invented investment threshold remains active. Theme and viewport preferences were restored. The built page reported no console errors.

This scoped gate does not imply that the entire inherited test suite passed. Its partial audit and focused resolutions are recorded in the separate type-check repair document.

## Working policy demonstration - 29 October 2026

The **Load working example** action replaces only the on-screen draft after confirmation when existing content is present. It does not save, activate or replace an active IPS. Existing saved family documents remain untouched. Four fictional teaching limits are chosen to work against the current shared fixture population: public equities at most 55%, fixed income at least 10%, cash at least 4%, and private markets at most 30%. These are sample thresholds, not recommended or approved family policy.

All four show a read-only **Pass** with the complete default fixture set. After saving and explicitly reviewing that revision, the existing guard rejects cash-account deletion and permits education-equity-account deletion. The denominator, USD scope and source are unchanged; no metric or observation is manufactured to force a pass.

Exactly two optional review examples cover a succession-event condition and a board-approved exception. They are displayed inside a fenced text block, outside the executable policy set. Copying one out of that block yields **Needs review** because no event or approval source is connected. Activating unresolved clauses still prevents unsupported financial changes. Conditional text can no longer be misread as an unconditional numeric limit. Common `fixed-income` and plural `private markets` wording is recognized, and a private-market minimum retains its minimum comparator rather than becoming a maximum.

The broad assumption catalogue is now under **Future modelling inputs**, collapsed initially and explained as an optional planning checklist. It is not presented as a list of failed policy checks. Read-only draft previews remain distinct from active, source-revision-specific IPS findings.

Focused verification for this change: **48 tests passed** across IPS, observation, workspace/parser and rendered UI suites, using bundled Node with a single Vitest worker. Coverage includes four passing sample rules, exact-revision activation, accepted/rejected mutations, two unresolved conditionals, comparator direction, no implicit activation, missing-data handling and persistence failures. The first Bun-launched run stalled and was stopped; the direct bundled-Node retry completed.

The coordinating pass also passed ordered UI/SDK declaration builds, strict frontend/tooling checks, **87 smoke tests across ten files**, the combined production build and the provenance audit. Evidence: [Policy Demo verification](../../apps/portfolio/artifacts/Policy-Demo-Verify.log). Existing bundler warnings are recorded with that gate.

Production browser review confirmed four passing draft checks, explicit saved-revision activation, and exactly two Needs review results after copying the optional conditional examples out of their fence. The active revision remained unchanged while the draft was edited. Desktop light/dark and 390-pixel mobile views were rendered and inspected; text remained readable and no horizontal overflow occurred. Screenshots and the machine-readable result are under `apps/portfolio/artifacts/ips/` (`Policy-Demo-QA.json`, `Desktop - Working Policy.png`, `Desktop - Working Policy Dark.png`, `Mobile - Draft Policy Checks.png`, and `Desktop - Two Review Examples.png`). No runtime page errors occurred; an inherited root favicon request returned 404 while the portfolio brand asset loaded successfully. QA ran in an isolated browser profile, leaving the user's saved documents, active policy and preferences untouched.

### Future source-linked warnings

The next intake will use accounting software as the source of cash-flow and income statements and trading platforms as the source of trade logs. IPS alerts should preserve those record IDs, imported dates, scope, source revision and rule evidence rather than creating a second ledger. A later FMEA/RPN priority view must have agreed severity, occurrence and detection scales and a documented scoring method before showing priorities; no score or formula is invented in this policy slice.
