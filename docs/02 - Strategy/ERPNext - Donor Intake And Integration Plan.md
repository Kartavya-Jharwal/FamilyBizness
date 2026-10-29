# ERPNext - Donor Intake And Integration Plan

Status: local reference donor cloned and inspected; no ERPNext service, connector or host feature has been installed. Product identity remains in [Identity](../00%20-%20Canonical/Identity.md); current coverage is summarized in [MVP Feature Scope](../05%20-%20Requirements/Product%20Requirements%20-%20MVP%20Feature%20Scope.md).

## Source and setup

| Item | Recorded value |
|---|---|
| Source | https://github.com/frappe/erpnext.git |
| Local destination | `donor/contenders/erpnext/` |
| Checkout | `develop`, shallow clone with depth 1 |
| Commit | `4d8a0664a9e2a0375025ac2685841ed05095f023` |
| Commit timestamp | `2026-10-28T19:20:42Z` |
| Intake recorded | `2026-10-28T23:44:21Z` |
| License evidence | Original `license.txt` contains GPL version 3; `package.json` declares `GPL-3.0`. Original `attributions.md` and `TRADEMARK_POLICY.md` are retained. |
| Parent repository boundary | The clone is ignored by the FamilyBizness repository. No donor source is staged or committed. Its source and nested Git metadata are retained as a reference snapshot. |

ERPNext is a full ERP built on Frappe, not a standalone React/Bun UI donor. This checkout declares Python 3.14 or newer and Frappe `>=17.0.0-dev,<18.0.0`; its accounting reports call Frappe database/query APIs. Root JavaScript scripts address the banking frontend rather than a static build of the whole ERP. Installing dependencies or running its backend is outside this intake. Extract selected information architecture, schemas and presentation patterns into the existing FamilyBizness host; do not bundle the ERP backend to obtain a few screens.

## User-requested product direction

The accounting package is the source of record for cash flow and income statements. The trading/custody application is the source of trade logs. FamilyBizness organizes and links those records with portfolio oversight, IPS evidence, warnings and priorities. It must not become a competing bookkeeping or trading ledger.

The prototype should show connector buttons and fictional loaded data. HMRC consent, Xero, QuickBooks and a trading-provider choice are examples of entry points; their presence in the UI must not imply a live connection or granted consent. A manual-entry affordance delegates entry/correction to the selected accounting or trading system, or records an explicitly labelled local draft. It must not silently post an authoritative financial transaction into FamilyBizness.

Additional requested product slices are:

- Governance/succession: family graph, ownership graph and event log, viewed through a succession scenario.
- Estate/structuring: ownership graph and a future fixture-based IHT/trust scenario with liquidity at a succession event.
- Operating model: KPI tree as the home screen, persona views and an obligations calendar. The calendar donor is a separate intake.
- Policy monitoring: connect normalized financial/trade evidence to IPS findings and an FMEA-style warning queue. Risk priority scoring needs an explicit specification before scores are presented as meaningful.

ERPNext is strongest as a financial reporting and operational workflow reference for pillars five and six. Its company and shareholding records can inform portions of pillars one and three. It is not a complete family graph, succession engine or English-law estate-planning implementation.

## Source capability map

Paths in this table are relative to the ERPNext donor root. They are inspected source evidence, not claims of integrated FamilyBizness features.

| Requested capability | Inspected ERPNext source | Adaptation decision |
|---|---|---|
| Cash flow and income statements | `erpnext/accounts/report/cash_flow/`, `profit_and_loss_statement/`, `balance_sheet/`, `financial_statements.py` | Reuse report hierarchy and period/company/currency concepts. Display externally sourced report snapshots through a read boundary; do not port the general ledger calculation engine as a second accounting authority. |
| Consolidated and entity reporting | `erpnext/accounts/report/consolidated_financial_statement/`, `consolidated_trial_balance/`; `erpnext/setup/doctype/company/` | Reference entity grouping and company hierarchy. Define intercompany/elimination semantics before presenting family consolidation. A company tree is not a beneficial-ownership graph. |
| Account and dimension structure | `erpnext/accounts/doctype/account/`, `accounting_dimension/`, `budget/` | Reference taxonomy, filters and drill-down. Preserve external source account IDs and business-entity scope in normalized read models. |
| Source reconciliation and imports | `erpnext/accounts/doctype/bank_statement_import/`, `bank_transaction/`, `bank_reconciliation_tool/` | Reference import status, matching and source linkage. Initial host UI uses fixtures only; no real bank import or credential flow is included. |
| Ownership and succession event history | `erpnext/accounts/doctype/shareholder/`, `share_type/`, `share_transfer/`; `erpnext/accounts/report/share_balance/`, `share_ledger/` | Reference shareholders, share classes and issue/purchase/transfer events. Family relationships, beneficial ownership, trusts, inheritance events and scenario controls require a host-specific model. |
| Obligations and operations | `erpnext/projects/`, payment schedule/term DocTypes, budgets and accounting reports | Reference responsible party, due date, status and financial context. Calendar presentation and scheduling behavior belong to the separate cal.diy intake; do not run two obligation stores. |
| KPI home and persona views | Company, budget and financial-ratio/report structures | Use financial report facts as possible KPI inputs. The family-office KPI tree and persona-specific presentation are bespoke requirements; ERPNext does not establish the requested home screen. |
| FMEA and warning handling | `erpnext/quality_management/doctype/quality_goal/`, `quality_review/`, `non_conformance/`, `quality_action/` | Reference issue-to-action/review workflow only. No complete FMEA/RPN implementation was established by this inspection. Define severity, occurrence, detection, score ranges and escalation ownership before using a risk priority number. |
| HMRC, Xero and QuickBooks connectors | No matches found in the inspected `erpnext/erpnext_integrations` and `erpnext/regional` source for `hmrc`, `xero` or `quickbooks` | Treat these as requested host connector UI and future integration work. This narrow search is not a claim about all external ERPNext apps or all historical versions. |
| Trading-provider logs and IPS linkage | No supported trading-provider-to-IPS workflow established in this intake | Normalize source trade IDs, timestamps, instruments, quantity, currency and provenance through the existing portfolio host. The existing local IPS remains the policy owner; do not treat an imported trade as a FamilyBizness execution instruction. |

## Proposed integration boundary

1. **Source selection UI:** connector cards show provider, entity/account scope, demo versus connected state, last successful pull, consent state where applicable, coverage and errors. Initial actions load/reset fixtures. Real credentials and consent redirects are deferred.
2. **Read-only financial snapshots:** use one host read boundary for income statements, cash flow, source documents and related trade records. Every snapshot carries source/provider ID, source record/report ID, period/as-of date, entity/account scope, currency, units and coverage. Provider corrections replace or supersede source records rather than creating duplicate authoritative entries.
3. **Statement-to-evidence navigation:** drill from KPI to statement line, source report/transaction and related ownership or trade evidence. Trade and accounting records remain distinct even when linked; cash-flow statement values are not inferred merely from a list of trades.
4. **Policy findings:** evaluate only explicitly supported observations against the activated policy revision. Findings retain the clause, source revision, observation provenance and scope. A warning is separate from a live transaction block. Unknown or incomplete facts show `Needs review`, never an automatic pass.
5. **Operational home:** persona views filter the same KPI/obligation/evidence model. Family/ownership graphs and succession events are a deliberate host slice, not a relabelled ERP sales dashboard.
6. **Manual correction:** direct the user to the source application or keep a clearly marked local draft pending source entry. The authoritative report updates only after a later source pull/reconciliation.

## Gaps and deferred calculations

No IHT rates, exemptions, trust treatment or tax formulas are implemented by this intake. A later estate scenario needs explicit fixture assumptions and reviewed calculation rules, including event date, ownership/beneficiary state, asset values, liabilities and liquidity timing. ERPNext's share transfer record does not establish inheritance-tax treatment.

A later financial simulation module can consume approved snapshots/scenario assumptions through a separate contract. It must not overwrite actual statements, trade logs or activated policy. The simulation donor and calendar donor are separate workstreams.

Real connector access, provider authentication/consent, automated pulls, cloud persistence, production accounting reconciliation and trading execution are deferred. The current request authorizes donor setup and mapping; it does not require live financial access.

## Next implementation slice

- Define the source snapshot and provenance contracts against the existing portfolio adapters, then add a connector/demo-data panel and one read-only income-statement/cash-flow slice.
- Build one explicit succession scenario over a small family/ownership/event fixture, reusing the same entity IDs as the financial snapshots.
- Design KPI tree and persona views, then link obligations through the calendar adapter rather than importing a second application shell.
- Reuse the existing constitution/IPS owner for findings; specify the warning and FMEA/RPN model before implementing a scoring formula.
- Preserve copied-source GPL notices and attribution if code is later extracted, and map visual work into canonical tokens and host components. The original donor remains unchanged.

## Intake checks performed

The shallow clone completed. Its origin, branch, exact commit, license files and ignored status were checked. The source paths above were inspected. No dependency installation, ERPNext boot, database migration, live provider connection, tax calculation, main-app edit, commit or deployment was performed as part of this intake.
