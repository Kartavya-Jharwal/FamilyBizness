# MVP Release

Current source revision: `64ae3e4175bc70fe42e024407d4c31b2a81bfdc5` (visual stewardship). Current source and local package implement the [requested priorities](../05%20-%20Requirements/Audit%20-%20Remaining%20Assignment%20Work.md). The previous public deployment remains separate until hosting is unblocked.

## Delivered locally

- One daily navigation and one Administration panel; SFO terminology uses assets under stewardship and consolidated family capital.
- Natural-language IPS instructions compile through the donated parser into hard limits. Reviewed adoption updates the document, sources, mandate and rule snapshots transactionally.
- Populated, reconciled financial records and dated AUM; visible capital allocation, treasury runway, succession funding, DCF/multiple values and a sensitivity heatmap.
- Current/optimal portfolio weights and Monte Carlo percentile fan, with spending and reserve controls.
- Donated ERP task masks and calendar week/agenda structures, with a side-panel family-meeting scheduler.
- Existing profile API and immutable session admission now use one local command engine. Browser entry uses donor avatars and makes no profile-server requests.

Local demo: `http://localhost:4178/FamilyBizness/` while the preview process is running. Handover: `artifacts/submission/FamilyBizness - MVP.zip`, containing the verified local static artifact, corresponding source archive, current docs and targeted browser evidence.

## Verification scope

Only the user's priorities were tested. Six focused model checks passed: statement/AUM/valuation consistency; donor-parser-to-rule enforcement (including 10% to 15% cash and two to three reviewers); invalid policy rollback; seeded spending-sensitive Monte Carlo; council recurrence/conflict logic; shared profile command sessions.

The packaged priority browser journey passed with no page errors and no profile API requests: profile entry, one navigation, reactive DCF/sensitivity, reviewed IPS change, constrained portfolio, Monte Carlo, ERP task creation, council meeting save/reload, agenda/week persistence, responsive capital/portfolio/calendar and dark-mode tokens. The resulting screens were visually inspected. Canonical chart/axis/legend colours and the calendar layout token are reused; no new palette is embedded.

The build passed. The final frontend and node-configuration type checks passed for the committed source. The six-donor source/mount/license audit passed. The broader historical smoke suite was deliberately not rerun; the workflow now invokes the focused priority file instead.

## Publishing block

[GitHub Actions run 42105011960](https://github.com/Kartavya-Jharwal/FamilyBizness/actions/runs/42105011960) refused to start the build, reporting: **The job was not started because your account is locked due to a billing issue.** It executed no build/test steps and skipped deployment. This is a hosting-account block, not an application/test failure. The source push succeeded.

The previous public marker identified application revision `4b05b2a03f9c4a47250b45e73e91eea51378d463`; it must not be described as the revised visual experience. The failed workflow can be rerun after the GitHub account is unlocked. No account/payment changes were made.

Detailed donor provenance: [frontend ledger](Donors%20-%20Frontend%20Contribution%20Ledger.md). Policy and scenario decisions: [combined charter](../00%20-%20Canonical/Family%20Office%20-%20Combined%20Operating%20Charter.md). Prior release evidence remains in Git history.
