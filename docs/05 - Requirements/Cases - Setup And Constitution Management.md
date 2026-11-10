# Office Profiles and Constitution Administration

The current product direction is a prepared family office using the [Smith Family Constitution](../00%20-%20Canonical/Smith%20Family%20-%20Constitution.md). It supersedes the earlier primary flow of creating independent family cases and authoring constitutions.

## Enter the prepared office

Choose a visitor profile in Portfolio. Built-in roles and newly added visitor profiles use the same existing module keys under the prepared office scope. Each browser load keeps its own immutable session identity; changing persona reloads the application. Add profile records a visitor name and does not ask for a business, template or new constitution.

The office is populated once through validated module import. Failed writes roll back; subsequent loads preserve saved changes. Older independent case profiles and the original Golden Bird sample remain separate and recoverable in the secondary entry section. The former `createFamilyCase` helper remains compatible with earlier packs and tests; it is not the main product setup UI.

## Read the charter and act

**Family constitution** is a dedicated primary destination on desktop and the mobile bottom bar. It starts on **Family charter** for the prepared office. Selected priorities link to actual checks, governance/continuity, estate, operations, calendar and stewardship reviews. The source rationale identifies the four supplied constitutions and explains choices where they conflict. No combined source-business balance sheet is invented.

**Constitution checks** retains the existing cash and reserved-vote calculations. **Source clauses** retains excerpt, interpretation and trace. The library, parameter editing, alternate packs, import/export and pause controls are inside closed **Constitution administration and revisions**. They are maintenance tools, not an invitation for every visiting family to draft a constitution.

## Preserve the existing data boundary

Adopted revisions validate allocation totals, reviewed sources and parameters. Source changes invalidate dependent checks. The dividend-budget action atomically updates the existing financial forecast and saved spending scenario; decision reviews enter the shared operations log. Portable case packs include constitution/source/check records, ownership, continuity, book, estate, investments, responsibilities and review metadata.

Case identity, saved-data readiness and portable JSON backups are in the donor Settings workspace under **Data → Family records & recovery**. Daily work starts with cash, overdue responsibilities, estate funding, continuity and the action queue. The calendar and ERP frontend read the same operations records.

Verification and publication evidence: [MVP release](../03%20-%20Architecture/Release%20-%20MVP.md).

## Daily experience and administration

The daily home now shows capital, liquidity, concentration, upcoming meetings and responsibilities. Capital & liquidity opens visible DCF/multiple/sensitivity and funding views. Portfolio & scenarios opens allocation and Monte Carlo; Family business defaults to ERP tasks. **Investment policy statement** and **Family constitution** have separate navigation tabs. The mandate owns its concise rules and expandable dated review/adoption controls; the constitution owns clauses, repair requests and revisions. Settings opens the existing Wealthfolio preferences directly, with categorical tabs and office/profile controls integrated into the same route. Legacy Administration links redirect to their owning page. Revised prepared-office data are populated once with a recovery snapshot; routine visits do not require setup.

## The please fix request

The Patriarch sends the literal **please fix** request against a selected saved clause, choosing Associate or Family technician. The existing office-review action creates a single linked obligation in the shared operations register; repeating a request preserves its active assignment and appends the current reviewed snapshot. No parallel ticket store is introduced.

The assigned role accepts the request, records the corrected instrument/linkage and outcome, and resolves it with evidence. The Patriarch can reassign an open request or reopen a resolved one. Other personas can read the shared queue. The UI uses existing persona selection as workflow context; it does not claim security authentication. A changed source clause or constitution revision blocks closure until the Patriarch reissues against the current snapshot. Progress, resolution evidence and dated activity stay on the same ERP obligation. Calendar/ERP records refresh through the shared record-update event. The generic ERP editor opens the dedicated repair queue; its persistence boundary rejects edits, deletion, reset and bulk completion of repair requests. Earlier requests receive a current clause snapshot when the Patriarch assigns them. Workflow role identity comes from the immutable admitted session scope, rather than a mutable selected-profile browser preference.

Focused checks: `please-fix-model.test.ts` covers literal-message creation, duplicate preservation, assignment, role restrictions, evidence, reopening and stale-clause review.
