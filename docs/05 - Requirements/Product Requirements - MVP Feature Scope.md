# MVP Feature Scope

FamilyBizness is a browser-local functional MVP for governance, estate planning, investment oversight and the day-to-day family office. [Identity](../00%20-%20Canonical/Identity.md) owns product facts. The [release acceptance matrix](Release%20-%20MVP%20Acceptance%20Matrix.md) owns verification status; [Integration](../03%20-%20Architecture/Integration%20-%20Family%20Office%20Workspaces.md) owns current routes/data boundaries.

## Completed product surface

| Area | Delivered MVP behavior |
|---|---|
| Entry and family setup | Brand-first introduction, continuity narrative, profile selection inside Portfolio, named independent cases, blank or optional teaching template, returning profile resume |
| Constitutions | Multiple packs per case, active selection, editable adopted parameters, reviewed source snapshots, revision/adoption, source invalidation, import/export and pause; Golden Bird is one optional example |
| Governance and succession | Participants, entity economic/voting interests, RACI workflows, approvals/history, weighted constitutional decisions, continuity prerequisites/evidence, before/after scenarios and event log |
| Estate and structuring | Scoped English-law IHT, gifts/reliefs/bands, holding/ownership register, direct/holding/cash-trust comparison, separate trust lifecycle and timed succession-liquidity schedule |
| Portfolio and risk | Host portfolio/holdings/activity/insights; constrained continuous allocation, correlations, screens and counterfactual, stress/concentration, fees/tax/private assets, historical VaR/CVaR, drawdown/Sharpe and seeded generation projections |
| Financial stewardship | Entity balances/income/cash/equity reconciliation, matched eliminations, entered FX, DCF/multiple sensitivity, non-overlapping family wealth perimeter, AUM observations and monthly capital-use forecasts |
| Day-to-day office | Source-linked KPI/action home, owner/persona views, ERP-derived task masks/list/detail/bulk actions, completion evidence, grants/ventures and provider/SFO-MFO comparisons |
| Calendar | Donor-derived calendar controls, agenda/week views, family Council/Board/member meetings, explicit zones/participants, same-zone overlap warnings, recurrence and shared task records |
| Reviews and sources | Saved-record findings, explicit optional FMEA scores, stale-review detection, corrective and **please fix** actions in the existing queue; sample/disconnected/consent-required/failed source display states with observed financial/trade snapshots |
| Reporting and portability | Saved-source board pack/input snapshot, validated full case and constitution-library import/export, rollback on failed writes, missing/invalid evidence surfaced |
| Donor audit | Actual transferred/adapted frontend code, field masks and UI logic recorded with source fingerprints, host paths and distributed licenses; no runtime donor clone/server dependence |

## Frontend donor contract

The [contribution ledger](../03%20-%20Architecture/Donors%20-%20Frontend%20Contribution%20Ledger.md) owns the exact contributions. Wealthfolio is the application/UI foundation; Ghostfolio supplies retained analysis UI; the policy module supplies parser/inspector workflow; ERPNext supplies Task/Shareholder masks and list/detail behaviors; Cal.diy supplies calendar component structures and overlap behavior; the local simulation donor supplies seeded models and visible process-lab controls. Portfolio primitives and canonical tokens take precedence over donor styling.

## Operational limits of the shipped MVP

This release intentionally has no donor servers, production identity/MFA, live accounting/broker/calendar synchronization, external invitation/message delivery, transaction execution or shared multiuser database. Source buttons demonstrate frontend states and inspect existing saved/sample records. These services are excluded by the user's static-frontend contract, not left unfinished donor integrations.

Unknown external fund constituents, unauthenticated legal approvals and unsupported tax cases are not fabricated to show success. The retained analysis donor may display unavailable data when the host cannot supply it. Binary document OCR, live AI, production advice/calibration and institutional authorization remain outside the MVP. User/company-specific legal documents, actual client statements and team submission evidence can be supplied without requiring a new application.

## Acceptance and release

The [whole-brief contract](Acceptance%20-%20Whole%20Brief.md) defines functional acceptance. The release gate combines source/type/model checks, production static packaging, donor provenance, and desktop/mobile/keyboard/contrast checks on the packaged artifact. A successful local build alone is not a public deployment; the release record states the deployed URL and revision separately.
