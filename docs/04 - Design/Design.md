# Design

The shared source for colours, typography, spacing, geometry and chart roles is [tokens.css](../../packages/tokens/tokens.css). Portfolio's semantic UI components and theme take precedence when donor frontend code is adapted. Foundation provenance: [upstream](../../upstream/README.md).

## Product structure

The public first viewport leads with FamilyBizness. Pillars follow it. Entry leads into Portfolio's visitor-profile chooser for one prepared family office. The combined charter selects from all four supplied constitutions; creating a family or authoring a constitution is not the main flow. Earlier saved workspaces stay secondary. The family workspace is the single KPI/action home. Family business groups governance, constitution linkage, estate, operations and financial reports. Calendar presents the shared operational records; advanced presentation/lab surfaces stay secondary.

## Donor adaptation

Donor visual masks, controls and UI logic are integrated into host components. ERP-derived task/ownership interfaces share the existing operations and estate records. Calendar controls/list/week interactions retain meetings, family participants and conflict visibility. The [contribution ledger](../03%20-%20Architecture/Donors%20-%20Frontend%20Contribution%20Ledger.md) records exact extraction/provenance; a clone or concept reference alone is not a delivered UI contribution.

Use semantic surface, text, input, status and chart roles; do not import a donor's global palette or another font pipeline. The public entry uses the canonical font stack and self-hosted font file. Labels, statuses and uncertainty must remain readable without depending on colour.

## Working interactions

Daily work prioritizes the next action, its owner, date and evidence. Source configuration, data tools, provider costs and model setup are expandable/administrative controls. Constitution linkage opens a readable family charter with selected priorities and links to the actual work. Checks and source-to-parameter-to-result links remain accessible; library/revision tools and case/backup controls are expandable administration. Missing inputs and unscored FMEA findings never appear as successful/low-risk evaluations. Numeric assumptions are editable in their owning workspaces; JSON is an advanced portable format.

Portfolio scenarios show actual computed outputs with units, legends and separate expected/observed/nominal/real definitions. Estate alternatives retain economic scope and separate charges at different dates. Tables scroll locally on narrow screens. Calendar meetings remain stacked/readable when overlapping.

## Release gates

Unreadable text, overlapping chart labels, viewport overflow, inaccessible controls and runtime errors in acceptance journeys block release. Verify relevant desktop/mobile and light/dark states on the packaged artifact. Current evidence is maintained in [MVP acceptance](../05%20-%20Requirements/Release%20-%20MVP%20Acceptance%20Matrix.md) and [integration](../03%20-%20Architecture/Integration%20-%20Family%20Office%20Workspaces.md).

## SFO taxonomy and daily navigation

Daily navigation has five destinations: Stewardship, Capital & liquidity, Portfolio & scenarios, Family business, and Calendar. Administration is the single secondary home for constitution/IPS revisions, configuration, profiles, data and provider controls. A workspace title does not repeat the global navigation or the project disclosure.

Use **AUM** for gross assets overseen by the office, **consolidated family capital** for the family-owned asset perimeter after liabilities, **available liquidity** for cash accessible to the relevant entity, and **business concentration** for the operating-company exposure. These are distinct measures. Personal donor terms such as “your net worth” are removed from visible English copy; existing data/API keys remain compatible. A reporting perimeter and date belong beside capital metrics, not in a repeated introductory essay.

Daily views lead with decisions, numbers, charts and the next action. Constitution provenance, interpretations, editing and model assumptions belong in the relevant detail or Administration panel. Portfolio component roles and the canonical token source continue to own visual styling.

## Visual stewardship revision

Lead with AUM, treasury liquidity, operating-business concentration and cash headroom. Capital charts show allocation, history, DCF versus multiple value, sensitivity and succession funding. Portfolio charts show current/proposed weights and a seeded Monte Carlo percentile fan. IPS cards pair concise instructions with numerical limits and observations. Calendar defaults to meetings in a week grid, with agenda retained and a side-panel editor. ERP uses the donated task masks in its own daily tab. Detailed methods, source records and JSON editors are expandable; infrequent constitution/configuration work is in Administration. Shared semantic surfaces, text and chart roles come from tokens.css; calendar day width is a canonical layout token.
