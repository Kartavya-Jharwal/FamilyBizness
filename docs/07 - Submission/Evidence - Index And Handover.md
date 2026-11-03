# Evidence Index And Handover

## Included evidence

- [Platform design and evaluation report](Report%20-%20Platform%20Design%20And%20Evaluation.md): working draft with methodology and explicit case-population dependencies.
- [AI implementation record](../01%20-%20Notes/AI%20-%20Implementation%20Record.md): actual brief excerpts, review objections and resulting corrections; not an invented transcript.
- [Acceptance contract](../05%20-%20Requirements/Acceptance%20-%20Whole%20Brief.md): all six pillars and cross-cutting requirements.
- [Integration verification](../03%20-%20Architecture/Integration%20-%20Family%20Office%20Workspaces.md): current source ownership, scope and validation outcomes.
- [Population guide](../05%20-%20Requirements/Population%20-%20Inputs%20And%20Review%20Guide.md): final case input sequence.
- `apps/portfolio/artifacts/whole-brief/Whole Brief Results.json`: focused browser-flow results.
- `apps/portfolio/artifacts/whole-brief/Verified Board Pack.md`: QA export from illustrative records, not the team's final populated board pack.
- `apps/portfolio/artifacts/whole-brief/`: rendered evidence for the case, policy, governance, financial records, estate and projections. Partial earlier harness runs are not described as full passes.

## Model verification

The final targeted run passed 20 checks in five files: integrated financial/investment calculations, capital workflow, board reporting, policy activation and portable case data. The separate estate/governance agent reported 24 focused checks passed before its later usage-limit interruption. Do not count those as a new full-suite run by the parent. The current compiler/build status is owned by the integration document.

## What the team supplies

Selected case and Assignment 1 excerpts; source-based interpretation of the final results; actual team-member contributions; authentic chat exports/screenshots where required by the module; final board pack and input snapshot after population; and the VLE submission. No professor authorisation, historic prompt record or real client figures have been fabricated.

## Running the packaged platform

`dist/` is the static build. In the source workspace, `bun run preview` serves it. A static web host can serve the same directory. The platform uses browser-local saved inputs and has no server database. The public entry is `index.html`; the main planning application is `/portfolio/#/office/case`. Do not interpret a successful local build as proof that a public URL has been updated.
