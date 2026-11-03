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

## Current MVP release evidence

The [release record](../03%20-%20Architecture/Release%20-%20MVP.md) owns the final deployed revision, workflow, complete verification results and packaged handover. The [acceptance matrix](../05%20-%20Requirements/Release%20-%20MVP%20Acceptance%20Matrix.md) maps the documented software threads to implementation and executed gates. The [donor ledger](../03%20-%20Architecture/Donors%20-%20Frontend%20Contribution%20Ledger.md) distinguishes actual copied/adapted code and UI masks from workflow inspiration.

The earlier focused results above are supplementary evidence, not the final release test total. `scripts/verify-mvp-release.cjs` covers the combined independent-case, constitution, ERP, estate, review, source, calendar and simulation journeys against either a packaged or public build.

## What the team supplies

Selected case and Assignment 1 excerpts; source-based interpretation of the final results; actual team-member contributions; authentic chat exports/screenshots where required by the module; final board pack and input snapshot after population; and the VLE submission. No professor authorisation, historic prompt record or real client figures have been fabricated.

## Running the packaged platform

`dist/` is the static build. In the source workspace, `bun run preview` serves it. A static web host can serve the same directory. The platform uses browser-local saved inputs and has no server database. The public entry is `index.html`; the main planning application is `/portfolio/#/office/case`. Use the release record and deployed `release.json` to identify the published build.
