# Constitution to tool trace

The prepared office uses the [combined operating charter](../00%20-%20Canonical/Family%20Office%20-%20Combined%20Operating%20Charter.md), selecting from all four source constitutions. Visitor personas share the same existing records. Current lifecycle: [Office profiles](../05%20-%20Requirements/Cases%20-%20Setup%20And%20Constitution%20Management.md).

| Constitutional topic | Runtime owner and dependent behavior | Evidence retained |
|---|---|---|
| Ownership and economic/voting interests | Governance register and entity graph; transfer scenarios and event log | Person/entity IDs, source, before/after snapshots, separate economic and voting shares |
| Governance bodies and decision rights | RACI workflow; constitutional reserved-decision checks | Competent role, eligible/disinterested rights denominator, quorum, Board recommendation, reviewer and history |
| Dividends and reserves | Constitutional cash waterfall; existing financial forecast and multigeneration spending input | Adopted clause, parameter pack, obligations/reserve/profit-capacity inputs and allocation result |
| Succession and continuity | Continuity prerequisites, interim readiness, estate funding, calendar and scenario events | Named owner/successor, trigger, date, dependencies and completion evidence |
| Values-based investing | Typed activated rules, sector screens, investment optimiser and screen counterfactual | Source revision, explicit limits/classifications and observed effects; Board-adopted values screen |
| Estate and holding/trust structure | Estate ownership register, scoped IHT engine, structure comparison and timed liquidity | Asset/legal-owner/beneficiary evidence, legal eligibility inputs, rule-pack date and funding assumptions |
| Office operations and disputes | Operations action queue and stewardship reviews; literal **please fix** message workflow | Sender/context, assignee, source link, notes, scoring inputs where selected, completion evidence |
| Reporting and information | Case readiness, board pack, source administration and portable case packs | Saved source state, observation date, missing/invalid inputs and source-linked computed results |

## Source lifecycle

The source register records document identity, section, selected text, interpretation, target, units/basis and local review. Constitution packs hold adopted parameters and select the active pack per profile. A missing, changed or unreviewed source cannot silently pass as the current binding. The generic typed-rule workflow separately freezes its own activated source revision.

The cash waterfall applies to remaining distributable cash after its safeguards; it is not an AUM withdrawal cap. Reserved owner approval uses eligible disinterested voting rights, while quorum uses eligible voter headcount and branch representation. Those scopes remain separate from generic number-of-approver rules and applicable company instruments.

## Selected source bindings

| Binding | Source selection | Existing consuming record/tool |
|---|---|---|
| FO-CASH / FO-VOTES | Golden Bird cash and disinterested authority; Calcot resilience/delegation | Adopted pack, cash/vote checks, budget application and board evidence |
| FO-OWNERS / FO-GOVERNANCE | Selected numerical ownership and governance; Calcot beneficiary distinction | Ownership graph, estate register and meeting roster |
| FO-EXIT | Calcot sale-or-retain plan | Recurring ERP readiness task, RACI preparation rule and dependent continuity actions |
| FO-TRANSFER | Vasnani staged liquidity and independent valuation | Estate-linked liquidity review task; no automatic sale/pricing engine |
| FO-EMPLOYMENT / FO-DEVELOPMENT | Vasnani entry experience; Sandoval mentoring; Calcot stewardship | Independent assessment rule, recurring mentoring and literacy reviews |
| FO-DISPUTES / FO-COMMS | Vasnani early discussion/material news; Sandoval papers/minutes | Shared review queue, calendar-linked deadlines and protocol tasks |
| FO-LEGACY | Community and education across the three added sources | Two draft requests, diligence, existing capital/approval/commitment workflow |
| FO-CONTINUITY / FO-INSTRUMENTS | Selected English-law review and authority | Estate/trust scenarios, instrument reviews, source revisions and literal please fix |

Original Golden Bird source material and its English-law adaptation remain internal/reference provenance, not the sole product constitution. Conflicting donor thresholds are selected explicitly in the charter rather than accumulated. Original family business accounts and cap tables are not merged.

## Donor and release evidence

The [frontend contribution ledger](Donors%20-%20Frontend%20Contribution%20Ledger.md) records actual donor code, masks, UI adaptations and licenses. The [MVP acceptance matrix](../05%20-%20Requirements/Release%20-%20MVP%20Acceptance%20Matrix.md) owns completion evidence; [integration](Integration%20-%20Family%20Office%20Workspaces.md) owns route/data boundaries. Historical donor intake documents are provenance and planning history, not current completion status.

## Natural-language IPS and visual stewardship

FO-IPS-MANDATE contains the Board-adopted concise investment instructions. The donated parser compiles cash, public-equity and illiquidity clauses. `office-ips.ts` maps those gates and explicit reserve/sector/approval instructions to the existing typed policy engine. `ips-adoption.ts` transactionally updates the donor document, reviewed source snapshot, charter revision, investment target/risk settings and active rules. Invalid text preserves the prior revision.

`capital-workspace.tsx` renders the existing book/valuation/liquidity engines directly, with live WACC/multiple inputs. `portfolio-visual.tsx` renders current/optimal weights and the existing seeded projection quantiles. The same saved record key updates both visual summaries and opened detail editors. No second financial ledger or optimiser is introduced.

The local profile command engine now serves both entry and the existing profile API. Persona sessions retain immutable scope while shared office records resolve to one prepared case. Calendar and ERP remain views of the existing operations register; calendar view preference is persisted locally.

The Wealthfolio visual pass reuses shared card components and exported card surfaces for daily financial workspaces. Composition CSS reads canonical dimensions and host semantic roles; calendar fields/sheets use existing field/overlay roles. The focused `scripts/verify-wealthfolio-art-direction.cjs` checks computed surface geometry and responsive light/dark rendering.
