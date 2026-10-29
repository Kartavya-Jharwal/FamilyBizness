# Product Requirements - MVP Feature Scope

This document is the working feature inventory for the FamilyBizness prototype: what the current donor integrations contribute, what the prototype demonstrates, and what a fuller product still needs. Product identity and the six mandated pillars remain canonical in [Identity](../00%20-%20Canonical/Identity.md) and [Pillars](Pillars.md). The cold-visit sequence is defined in [Auth Flow](Auth%20Flow.md).

## Product brief

FamilyBizness is a wealth-management platform concept for a single-family office. It brings estate planning, family-business financial affairs, portfolio oversight, governance and succession into one family context across generations. The intended audience is the family patriarch, family board members, and business CEOs or managing directors. The legal baseline for estate and wealth structuring is English law.

The current product is a publicly viewable functional prototype. It combines a branded static entry site with a browser-based portfolio workspace and selected governance and investment-analysis features. Its data and identity flows are demonstrations; it is not a live financial service or secure family portal.

## Donor and foundation contributions

| Source | Role in FamilyBizness | Included contribution | Boundary |
|---|---|---|---|
| **Wealthfolio** | Main portfolio application and UI foundation | React application shell and reusable UI; sample portfolio dashboard, accounts, holdings, activity, income, performance, spending, net worth, assets, goals and insights workflows; local static-data adapter; profile and theme patterns; Classic design foundations | Adapted into the FamilyBizness portfolio workspace. Sample records and local browser changes are for demonstration; no broker connection, live data service or production financial platform is implied. Original notices and licenses are retained. |
| **Ghostfolio** | Selected investment-analysis workflows | X-ray investment-review presentation and rule preferences, explanatory attribution/history panels, and fund/ETF look-through presentation, adapted into the portfolio app's Insights area | Wealthfolio remains the owner of portfolio data, scope, period, formatting and theme. Missing live constituents and unevaluated investment rules remain unavailable; this does not add a second portfolio ledger or real investment evaluator. Attribution is included in the app. |
| **Policy-as-code / constitution module** | Constitution authoring and policy workflow | Markdown constitution drafting and source preview; verified plain-text/Markdown import; local revision saving; candidate clause extraction with source lines; review notes; assumption-gap inspection; Markdown/JSON exports; explicit activation of a saved revision as a local Investment Policy Statement (IPS) | This is user-authorized, agent-authored source rather than a separately identified third-party product. It uses local browser state and the portfolio's fictional fixture valuations. It does not provide legal approval, trustee sign-off, document OCR, broad financial modelling, or brokerage-level transaction control. |
| **Wealthfolio Classic design foundation and FamilyBizness tokens** | Shared visual system | Centralized colour, typography, spacing, radius and chart roles consumed by the entry shell and portfolio UI; donor components restyled with FamilyBizness branding and host semantic theme roles | Shared design values belong in `packages/tokens/tokens.css`. Donor-specific alternate themes and some component styling remain local to the portfolio UI. |
| **[ERPNext](../02%20-%20Strategy/ERPNext%20-%20Donor%20Intake%20And%20Integration%20Plan.md)** | New finance and operations reference donor | Local source captured for statement/report hierarchy, company/account dimensions, shareholder events, reconciliation and issue/action workflows | Intake only. No ERP backend, live accounting connector, family graph, estate calculation or KPI home is integrated by cloning it. |
| **[cal.diy](../02%20-%20Strategy/Calendar%20-%20Donor%20Intake%20And%20Integration%20Plan.md)** | New obligations-calendar reference donor | Local scheduling source captured for calendar, agenda and detail interaction patterns | Intake only. Requires adaptation from appointment booking to family-office responsibilities and obligations; no external sync or notification service is enabled. |
| **[Simulation scaffold](../02%20-%20Strategy/Simulation%20-%20Donor%20Scaffold%20And%20Integration%20Plan.md)** | New local Bun/browser module | Small seeded stochastic and Monte Carlo examples, with client-side visual exploration as a separate donor scaffold | Not integrated into the portfolio. Fictional uncalibrated scenarios remain separate from source statements and approved planning models. |

## Feature inventory

Status key: **Prototype included** means a user can explore the feature with demo data or local browser behavior. **Partial** means a narrow workflow exists but does not meet the full product need. **Not implemented** means it remains a product requirement or navigation stub.

| Feature area | Status | Current coverage | Remaining product work |
|---|---|---|---|
| Public landing page | Prototype included | Brand-first landing page, product introduction, CTA links and six capability links. | Replace placeholder family-specific material with approved narrative and content. |
| Family history / legacy | Partial | Cold-visitor page wireframe introduces founding story, values and continuity, with a route into the sign-in journey. | Add the real family history and governance-approved content; support future content ownership and review. |
| Member sign-in / persona experience | Partial, simulated | The intended prototype experience represents different family members or roles and may show a member-specific demo context. It is smoke-and-mirrors only: it does not verify identity or enforce permissions. The public shell's current sign-in CTA opens the portfolio demo directly, so the member-persona path is not yet a complete cold-visit flow. | Connect the narrative, demo member choice, welcome and verification screens into one clear prototype journey. For a real service, implement secure identity, MFA, session management, role-based access and recovery separately. |
| Family welcome and security verification | Not implemented beyond stubs | Splash and one-time-code screens exist as nonfunctional waypoints; no challenge is issued or checked. | Design family-branded welcome, real verification and device/session trust only when production authentication is in scope. |
| Portfolio overview | Prototype included | Dashboard with fictional family-office portfolio and account-level figures, allocation summaries, performance/history context and navigation to detailed modules. | Replace fixtures with approved, reconciled data sources; define family-wide and entity-level aggregation and data-quality states. |
| Accounts, holdings and assets | Prototype included | Browse and edit a local demo set of accounts, holdings and asset profiles; sample account edits persist in the browser, and reset restores the fixture. | Add governed real data ingestion, ownership/entity relationships, currency/valuation reconciliation and audited change workflows. |
| Activity and cash operations | Prototype included | Explore sample activity, search and category drill-down; supported local demo actions exercise the shared sample data. | Connect custodians or approved source systems; implement reconciliation, approvals and production transaction controls. |
| Income and spending | Prototype included | Sample income and dividend summaries, monthly spending, category and asset/account breakdowns, with related insights. | Add verified source data, family/business entity scope, budgets, commitments and forecasting. |
| Performance and portfolio analytics | Prototype included | Sample performance history, period selection and host portfolio summaries; totals reconcile against the local demo fixture. | Define production return methodology, cash-flow treatment, fees, taxes, FX, benchmark ownership and audit-quality reporting. |
| Insights and allocation | Prototype included | Wealthfolio-owned overview and allocation views for sample assets, sectors, regions, currencies and accounts. | Add validated data feeds and family-approved target allocation, risk and decision workflows. |
| Ghostfolio X-ray review | Partial | Integrated rule cards and preference controls appear in the Insights analysis workspace. Enabled state is separate from fulfilled or unavailable state; existing host portfolio reads provide the scope. | Provide an approved, validated rule evaluator, evidence, thresholds and review governance. Current demo outcomes are illustrative or explicitly unevaluated. |
| Attribution, history and fund look-through | Partial | Selected attribution/history panels and a distinct fund look-through view use host holdings and host date/scope state. Missing data and exclusions are surfaced rather than fabricated. | Connect dated constituent data; resolve fee, tax, FX and external-flow attribution; validate coverage, denominator and duplicate-exposure treatment. |
| Constitution drafting | Prototype included | Edit Markdown, preview source text safely, import verified `.md`, `.markdown` or `.txt` text, save/reload local revisions, inspect candidate clauses with source lines, add local review notes, and export Markdown or JSON. An explicitly loaded fictional working example contains four supported rules and two fenced optional review examples. Future modelling-input gaps sit in a separate collapsed checklist. | Support secure collaborative storage, document permissions, robust multi-user revision control, approved legal document sources, and formal review/approval. PDF and Word extraction are not connected. |
| Policy-as-code and local IPS | Partial | Read-only draft checks show current fixture findings before activation. A user must save and explicitly review a revision before activating it. Supported percentage limits for public equities, fixed income, cash and private illiquid exposure are assessed against local USD sample positions. Account creation/deletion and fixture reset are guarded before the local mutation commits; unsupported changes require review or are rejected while an IPS is active. Drafts are not automatically active. | Define and validate the family's actual policy vocabulary, data contracts, exception process, evaluator and approval roles. Extend only when observation inputs are complete and authorized. No rule is sent to a broker or applied to real assets. |
| Governance and succession | Not implemented beyond pillar stub | Governance and succession are represented in the capability navigation and constitution-source concepts. | Build family board, decision rights, succession pathways, delegated authority, meeting/decision records and continuity workflows. |
| Estate and wealth structuring | Not implemented beyond pillar stub | English law is the stated product baseline; no estate structuring engine is included. | Define supported structures, ownership maps, beneficiary and succession views, planning scenarios and qualified review boundaries. |
| Financial modelling | Not implemented as a product capability | Portfolio demo calculations summarize fictional fixtures; the constitution workspace displays assumption gaps but does not create a family financial model. | Specify cash-flow, tax, liquidity, distributions, intergenerational scenarios and other approved planning models with validated inputs. |
| SFO / MFO operating model | Not implemented beyond pillar stub | The entry site names this as a product pillar. | Specify office roles, service workflows, responsibilities, reporting cadence, entity coverage and any multi-family configuration. |
| AI assistant | Demonstration only | Four suggested prompts and custom text use the same delayed local faux stream and fixed demo failure. Cancellation is handled; no model or network request occurs. | Decide whether an assistant belongs in the product, then define data access, permissions, human review, safety and an authorized service integration. |
| Attribution and open-source records | Prototype included | Adapted donor licenses, provenance and notices are distributed, with an open-source attribution route in the portfolio app. | Keep records current as more source is adapted and review licenses before future distribution. |

## MVP experience and key journeys

### Cold visitor

1. Land on the FamilyBizness brand page.
2. Read the family history and founding narrative.
3. Enter the mock member/persona sign-in experience.
4. See a member-oriented welcome screen.
5. Pass through the verification screen.
6. Enter the relevant portfolio workspace.

Only the branded shell and static page waypoints are currently connected. The proposed member choice and identity-specific experience are illustrative, and the public sign-in CTA currently skips directly to the portfolio demo. Production identity and verification are out of scope for the current prototype.

### Family office reviewer

1. Open the sample portfolio dashboard and choose an account scope or period.
2. Review holdings, performance, income, spending and allocation summaries.
3. Use Insights to inspect X-ray rules, attribution/history and available fund look-through.
4. Treat unavailable, illustrative and incomplete data as such; do not infer investment approval from a visual status.

### Constitution author

1. Draft or import verified text into the local constitution workspace.
2. Review candidate clauses, source lines and missing assumptions.
3. Add local review notes and export the document snapshot.
4. If desired, save and explicitly review a revision before activating it as a local demo IPS.
5. Inspect the findings and exercise the limited local fixture mutation guard.

This journey records local prototype actions only. It does not notify a trustee, create a legal approval, or control a brokerage account.

## Next donor scope

The next intake adds ERPNext as a finance and operations workflow reference, cal.diy as a calendar reference, and a small Bun/browser simulation module. These are local donor preparation tracks; cloning or scaffolding them does not make the capabilities below integrated features.

| Requested slice | Product requirement | Delivery boundary |
|---|---|---|
| Accounting connectors | Offer HMRC consent, Xero, QuickBooks and equivalent accounting-source entry points, with loaded sample records, sync/source status and a manual-entry option delegated to the accounting system. | Accounting software owns financial records, cash-flow statements and income statements. FamilyBizness reads and organizes source records; it must not become a second bookkeeping ledger. Prototype consent/sync controls must describe their simulated state accurately. |
| Trading connectors | Read trade logs from the family's trading platform, including Trading 212 or another selected provider, and organize them alongside source-linked financial views. | The trading platform owns trade records. No live connector, broker order execution or supported provider is implied by the requested UI. |
| Policy and risk links | Link financial/trade observations to the applicable IPS revision, source clause and warning. Provide a future FMEA view and RPN-based prioritization where the family defines the required scoring inputs. | A breach, missing evidence and an unsupported evaluation are distinct states. No default RPN score, frequency estimate or risk model is approved by this request. |
| Governance and succession | Show a family graph, ownership graph and event log together as a succession scenario. | Fixture scenarios precede real family data, delegated authority and legal approval workflows. |
| Estate and structuring | Reuse the ownership graph, with fixture-based IHT/trust calculations and liquidity at a succession event. | Calculation methods, assumptions, dates and legal review remain to be specified before implementation; no tax outcome is supplied by a donor clone. |
| Operating model | Use a KPI tree as the home view, with persona views and an obligations calendar. | KPI definitions, responsibility, source and cadence must be explicit. Calendar intake is a reusable UI/workflow reference, not an enabled external calendar service. |
| Simulation module | Scaffold a Bun module for seeded stochastic processes, Monte Carlo scenarios and client-side visual exploration, with one or two small sample runs. | Illustrative models operate on explicit fictional parameters. They do not replace accounting records, approved return forecasts, tax calculations or the portfolio ledger. |

ERPNext can inform finance and operating workflows, but is not assumed to supply the family graph, succession logic or estate calculations. Donor-specific fit, omissions and setup are recorded under Strategy.

## Cross-cutting product requirements

- **One portfolio data owner:** Insights and policy observations read from the host portfolio adapter; donor integrations must not introduce another financial ledger.
- **Visible uncertainty:** Missing, stale, unsupported, partial and unevaluated inputs must not appear as zero, approved, or successful results.
- **Traceability:** Constitution-derived candidates retain their source document and line. Do not claim an approved family rule until a family-authorized review process exists.
- **Prototype transparency:** Identify fictional portfolio data, local-only persistence, simulated sign-in and faux AI in user-facing contexts where needed to prevent confusion.
- **Shared design foundation:** Use the canonical token file and host UI/theme roles for shared elements; donor-specific styling should not fork shared token values.
- **Accessible and legible UI:** Check keyboard interaction, text contrast, chart labels, mobile layouts and light/dark themes before release.
- **Legal provenance:** Preserve donor attribution and original notices/licenses for distributed adapted material.

## Explicit non-goals for the current prototype

- Real login, multi-factor authentication, member authorization or secure handling of family data.
- Live bank, brokerage, market-price or fund-constituent connections.
- Regulated investment advice, production portfolio optimization or transaction execution.
- A production financial model or automatic interpretation of the family constitution as legally binding policy.
- Automated legal advice, estate-plan generation or trustee/family approval claims.
- Live AI or external transmission of family documents and financial information.

## Delivery and release notes

The entry shell is built as a static site for GitHub Pages and packages the portfolio workspace below it. Integration follows the contender-to-static-UI-to-host-application path. Each feature's source plan and detailed technical boundaries live in the linked donor strategy documents; this inventory is the product-facing summary of scope and remaining work.

For visual changes, rendered desktop and mobile views must be checked for readable text and non-overlapping chart labels. A focused donor smoke/build gate is documented in the engineering sign-off; a passed focused gate does not mean every inherited upstream test or every future product requirement is complete.
