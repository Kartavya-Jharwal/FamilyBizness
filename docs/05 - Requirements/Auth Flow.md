# Entry and profile flow

The public entry and continuity narrative lead to profile selection inside Portfolio; legacy login/splash/verification URLs redirect there. The primary experience is the prepared office defined by [combined operating charter](../00%20-%20Canonical/Family%20Office%20-%20Combined%20Operating%20Charter.md).

A cold visitor chooses Patriarch, Family board, Managing director, CEO, Associate, Legal counsel or Family technician. These personas share one charter, calendar, financial/estate inputs and operational evidence. **Add profile** adds a visitor to this office; it does not create a new family business or ask for a constitution. Each application load retains its immutable session scope while the planning storage resolves to the prepared office ID.

A returning visitor resumes their profile. A browser last used with an earlier independent workspace is shown the revised office entry once; the original data is retained. Earlier workspaces and the Golden Bird source example are secondary, expandable recovery choices. No source case is overwritten by composite population.

Constitution revisions, case identity, saved-data inspection and portable import/export are administrative tools. They remain available but do not lead the daily flow. Persona selection is local navigation, not real authentication, MFA or server access control.

Product form and audiences: [Identity](../00%20-%20Canonical/Identity.md).

## Profile engine integration

The static adapter dispatches profile state/create/update/unlock/lock commands to `local-engine.ts` through the existing profile API. ProfileShell consumes that command boundary and uses the donor avatar/session components. Entry has no separate storage mutation implementation. Choosing a profile reloads into its immutable scope; locking revokes it and returns to entry. Local storage errors retain recovery state. Setup, renaming and earlier-workspace recovery are secondary controls.
