# Donor - Combined Pass Sign-Off

Engineering checkpoint for the combined static prototype, 2026-10-27. Product facts remain in [Identity](../00%20-%20Canonical/Identity.md). Analysis ownership and semantic mapping remain in [Ghostfolio - Integration Plan](Ghostfolio%20-%20Integration%20Plan.md).

## Scope of this pass

The portfolio donor and retained analysis workflows now run as one React application in `apps/portfolio`, delivered beneath the preview shell. There is one sample portfolio dataset, host scope/period state, theme system and profile preference mechanism. The standalone contender clones remain local provenance/reference sources and are not bundled.

This pass completes the scripted assistant, population regression pack and editing/branding review. It does not provide production financial calculations, live AI, broker connections, constituent feeds or investment-rule evaluation.

## Repeatable gate

From the repository root, after installing root and `apps/portfolio` dependencies:

```powershell
bun run donor:smoke
bun run donor:verify
```

The first command runs **39 tests across six files**. The second runs that suite, the parent static build, then `scripts/verify-donor-pass.mjs`. The Pages workflow also runs the smoke suite and provenance audit before uploading its artifact. The audit does not require ignored donor clones, so it can run in CI.

## What is signed off

| Area | Evidence / accepted behaviour |
|---|---|
| Faux chat | Four prompt choices and custom text use the same local stream. Typed event envelopes match the application contract. Chunks arrive after a delay and terminate in the fixed `DEMO-418` failure. No model/tool call, fetch or prompt persistence occurs. |
| Cancellation | Cancellation clears the pending timer; navigation aborts work. Cancelled runs cannot post a late ending into a later run. Restart and completion restore the controls. Tested in the rendered chat as well as the stream. |
| Sample population | Account/position totals, current valuation, allocations, net worth and final history point reconcile. Every seeded account scope reconciles independently. Unknown scopes are empty. |
| Sample mutations | Cheap browser account edits persist across module reload. Deleting a seeded sample account removes its positions and values from the shared read models. Reset restores its own sample dataset and preserves unrelated browser storage. |
| Income and spending | Monthly income, type, asset and account breakdowns reconcile. Activity search, category drill-down, monthly spending/insight totals and value-history semantics remain covered by the prior workflow tests, now run in the same Vitest pack. |
| Analysis | The previous 15 mapping/view tests remain in the gate. Investment-rule outcomes and constituent data stay explicitly unavailable. No copied donor portfolio or fabricated host exposures are introduced. |
| Product branding | Product copy, translations, module imports, identifiers, metadata and logo references were edited. Upstream product names remain only in legal attribution files and the legal page within the combined application. The product shell identifies as FamilyBizness. |
| Original credits | Both original application licenses, attribution and trademark records are distributed and linked from `/open-source`. Original SDK and design-foundation notices and five font licenses are included. Byte comparison and a captured original-license hash guard against accidental license edits. |
| Editing pass | Removed visible provider/add-on/connection configuration, updater and server-encryption affordances from the static flow. About and export describe the prototype accurately; export produces a local sample JSON snapshot. Duplicate adapter cases and the obsolete default native adapter export were corrected. |
| Legacy references | A broader recursive source deletion was rejected by automatic approval review. Those reference sources remain intact. The build omits the known unused onboarding screenshots carrying old logos from generated output; it does not delete original reference assets. This is not a claim that all inherited dead source has been pruned. |

## Review evidence and limits

Automated output and browser screenshots live under `apps/portfolio/artifacts/`. The built preview was reviewed for the scripted ending, debranded navigation, sample population, integrated Insights, visible licenses and mobile layout. Text contrast and chart-label collisions remain release blockers for each later visual change.

This is a sign-off for the scoped static donor pass, not a full-product or publication sign-off. The full inherited TypeScript/test surface is not clean: unrelated native references, missing removed-feature types and workspace declaration outputs remain in the recorded type-check diagnostics. The owned smoke suite and static build are the enforced gate for this checkpoint. No commit, public deployment or actual financial transaction was performed.

## Incoming donors

Add new donors through the existing [conversion playbook](Donor%20-%20Conversion%20Playbook.md). Keep the current ownership matrix, single host dataset, semantic token boundary and visible unavailable states. Preserve each donor's original legal records separately, remove product marks, and add focused cases to this gate when a new donor changes behaviour. This avoids repeating the setup while retaining regression checks; a later donor must not silently replace this checkpoint's owners or loosen its assertions.
