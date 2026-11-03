# Design

The shared source for colours, typography, spacing, geometry and chart roles is [tokens.css](../../packages/tokens/tokens.css). Portfolio's semantic UI components and theme take precedence when donor frontend code is adapted. Foundation provenance: [upstream](../../upstream/README.md).

## Product structure

The public first viewport leads with FamilyBizness. Pillars follow it. Entry leads into Portfolio's profile chooser and family setup. Each family owns its case and constitution selection; Golden Bird is an optional teaching example. The family workspace is the single KPI/action home. Family business groups governance, constitution linkage, estate, operations and financial reports. Calendar presents the shared operational records; advanced presentation/lab surfaces stay secondary.

## Donor adaptation

Donor visual masks, controls and UI logic are integrated into host components. ERP-derived task/ownership interfaces share the existing operations and estate records. Calendar controls/list/week interactions retain meetings, family participants and conflict visibility. The [contribution ledger](../03%20-%20Architecture/Donors%20-%20Frontend%20Contribution%20Ledger.md) records exact extraction/provenance; a clone or concept reference alone is not a delivered UI contribution.

Use semantic surface, text, input, status and chart roles; do not import a donor's global palette or another font pipeline. The public entry uses the canonical font stack and self-hosted font file. Labels, statuses and uncertainty must remain readable without depending on colour.

## Working interactions

Daily work prioritizes the next action, its owner, date and evidence. Source configuration, data tools, provider costs and model setup are expandable/administrative controls. Constitution tools show source-to-parameter-to-result links. Missing inputs and unscored FMEA findings never appear as successful/low-risk evaluations. Numeric assumptions are editable in their owning workspaces; JSON is an advanced portable format.

Portfolio scenarios show actual computed outputs with units, legends and separate expected/observed/nominal/real definitions. Estate alternatives retain economic scope and separate charges at different dates. Tables scroll locally on narrow screens. Calendar meetings remain stacked/readable when overlapping.

## Release gates

Unreadable text, overlapping chart labels, viewport overflow, inaccessible controls and runtime errors in acceptance journeys block release. Verify relevant desktop/mobile and light/dark states on the packaged artifact. Current evidence is maintained in [MVP acceptance](../05%20-%20Requirements/Release%20-%20MVP%20Acceptance%20Matrix.md) and [integration](../03%20-%20Architecture/Integration%20-%20Family%20Office%20Workspaces.md).
