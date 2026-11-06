# Walkthrough - Visual Story And Recording

## Entry

Open `/portfolio/#/office/overview` in the packaged site (or `/#/office/overview` on the frontend development server). The landing page has an **Interactive walkthrough** link; the application menu calls it **Stewardship studio**. Every planning workspace also links to the visual walkthrough.

The studio is the presentation layer over existing validated financial, governance, estate, simulation, operations and source-register models. It reads saved inputs and keeps presentation adjustments in memory. It does not post transactions, activate IPS, execute transfers or mark authoritative obligations complete. Invalid saved data gives a recovery instruction rather than silently replacing it with examples.

## Visual language

A dark canvas, warm gold accents, generous spacing and a serif headline distinguish the presentation from the editing workspaces. Colours and display tokens live only in `packages/tokens/tokens.css`. Numeric transitions, diagram state changes and chart updates make the effect of each decision visible. Reduced-motion preference is respected.

The first screen leads with the family's capital, concentrated business exposure, liquid investments and capital use. Six chapters keep the narrative aligned to the rubric without making the audience navigate technical input forms. Detailed calculation and source screens remain one click away.

## Recording flow

Use a desktop viewport around 1600 × 1050 or 1920 × 1080. Select **Enter focus view** to hide surrounding application chrome; Escape exits. Start from **Reset scenarios** before recording. **Play walkthrough** runs six ten-second chapters, making a sample adjustment after 3.5 seconds in each. Pause or change chapters for a narrated demonstration.

1. **Wealth:** show the asset mix; reduce public equities by 20%. Family capital and the allocation ring update. The stress applies to public equities only.
2. **Succession:** transfer 60% of the first participant's current holding/votes to the second. The ownership cards animate and the simple-majority observation changes. This is an analytical threshold, not a claimed constitutional rule.
3. **Constitution:** raise the illustrative cash minimum to 30%. The source → parameter → decision flow changes from within-constraint to review when appropriate. Real source selection and IPS activation remain separate.
4. **Estate:** model additional funding equal to the entered shortfall. The gauge reaches full coverage; arranging that funding and statutory tax assessment remain separate tasks.
5. **Portfolio:** reduce scenario spending by 35%. The seeded real-wealth percentiles recalculate; use the values-screen switch to compare an eligible-universe restriction. These are hypothetical outputs, not forecasts.
6. **Stewardship:** preview a review on one obligation. Explain that owners, dates and completion evidence are recorded in the operations workspace; the walkthrough does not change those records.

For a longer walkthrough, demonstrate the sliders manually and open the relevant underlying workspace after each chapter. Close with the source register to show how the team's selected Assignment 1 excerpts map into the tool.

## Honest presentation

Keep the visible interactive-scenario label and session-only footer in the recording. Do not describe the movement as a live market feed. Sample values come from existing defaults or saved planning inputs. Financial, estate and portfolio scenarios retain their own currencies and source assumptions; no unlabelled FX conversion is performed. The user still needs to populate and review the chosen family case.

## Verification

`ci/verify-studio-ui.cjs` checks six chapters at desktop/mobile widths, live market/ownership/rule/liquidity/spending responses, auto demonstration, focus-mode exit and unchanged local storage. Screenshots and recorded results live in `apps/portfolio/artifacts/studio/`. The presentation model tests check scoped stress calculation, unchanged source inputs and damaged-data recovery.

The cash-threshold adjustment in the Constitution chapter also feeds the Portfolio chapter's session-only allocation search. This demonstrates cross-pillar cause and effect without activating or modifying the saved IPS.
