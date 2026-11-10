# Entry and profile flow

The public entry and continuity narrative lead to profile selection inside Portfolio; legacy login/splash/verification URLs redirect there. The primary experience is the prepared office defined by the [Smith Family Constitution](../00%20-%20Canonical/Smith%20Family%20-%20Constitution.md).

A cold visitor chooses Patriarch, Family board, Managing director / CEO, Associate / family technician, or Legal counsel. These personas share one charter, calendar, financial/estate inputs and operational evidence. **Add profile** adds a visitor to this office; it does not create a new family business or ask for a constitution. Each application load retains its immutable session scope while the planning storage resolves to the prepared office ID.

A returning visitor normally resumes their profile; the public “Let’s log in” CTA explicitly requests the chooser, so the family can select who is visiting on every public-entry visit. A browser last used with an earlier independent workspace is shown the revised office entry once; the original data is retained. Earlier workspaces and the Golden Bird source example are secondary, expandable recovery choices. No source case is overwritten by composite population.

The Family constitution and Investment policy statement are dedicated navigation destinations. Their revision controls remain expandable. Case identity, saved-data inspection, portable import/export and profile preferences are categorical pages within the existing Settings workspace. Persona selection is local navigation, not real authentication, MFA or server access control.

Product form and audiences: [Identity](../00%20-%20Canonical/Identity.md).

## Profile engine integration

The static adapter dispatches profile state/create/update/unlock/lock commands to `local-engine.ts` through the existing profile API. ProfileShell consumes that command boundary and uses the donor avatar/session components. Entry has no separate storage mutation implementation. Choosing a profile reloads into its immutable scope; locking revokes it and returns to entry. Local storage errors retain recovery state. Setup, renaming and earlier-workspace recovery are secondary controls.

## Consolidated roles

The built-in director and CEO share one profile; Associate and Family technician share one profile and the same repair permissions. Legacy role IDs resolve to their consolidated role when selecting, unlocking or editing. Existing custom visitors remain available; the old registry is backed up before a mutating migration. The literal please fix queue normalises earlier assignee names into the combined associate/technician role.
