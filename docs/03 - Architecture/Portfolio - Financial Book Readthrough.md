# Portfolio Financial Book Read-through

## One valuation owner

For the prepared office, the saved Financial Book owns its asset perimeter, liabilities, reporting currency, FX, DCF mark and dated AUM. `prepared-office-portfolio.ts` projects those records into existing Wealthfolio account/holding/valuation DTOs; it does not persist another financial ledger. The existing static store remains the preference/profile metadata owner and the fallback for archived/custom case profiles.

`pf-main` covers the whole selected family asset perimeter. `pf-long-term` covers only the recorded listed/private investment sleeves. Operating-company equity replaces its carrying investment once, as defined by `fairValueWealth`; subsidiary assets are not added a second time. Net capital subtracts the recorded owner liabilities.

## Sleeve and cash treatment

The listed sleeve is split using saved liquid-security weights, including its cash security. The private sleeve uses saved illiquid-security weights. Each bucket is normalised within its Financial Book value, so changing an investment weight cannot silently change total book AUM. Separate treasury cash remains separate. Family FIRE liquidity is the book's cash plus listed investment sleeve; cash look-through also identifies the cash inside that sleeve.

Saved allocation classifications pass through with their source-record ID. Where native security currencies differ from reporting currency, local values are derived using the provided book FX rates. Missing classification/FX prevents a constituent split instead of guessing a market rate. Current account DTOs are reporting views, not new bank accounts.

## History and performance

Recorded total-AUM observations are used directly. The current statement-date mark reads the live book/DCF value; prior observations are not rescaled into invented per-account histories. Individual accounts expose their current point only until account-level dated observations exist. Historical total DTOs carry unknown acquisition basis; their required cash/investment breakdown fields must not be read as an audited historical asset split.

Acquisition cost and gain fields stay null/unknown for these book-derived positions. Value changes are not presented as verified TWR. The performance data-quality response states that historical account/cash splits and acquisition bases are not recorded. The legacy account fixture retains its earlier behavior for archived/custom profiles.

Whole-perimeter income comes from owner-entity income records and is posted on the statement report date; it has no fabricated prior-month/security attribution. Activity-table rows come from owner cash movements with report-date/source comments. The separate saved budget/spending planning seed is not represented as the consolidated financial statement ledger.

## Persistence and refresh

Book reads and projections do not rewrite stored accounts or prior cases. Saved custom account names/groups are retained; unlinked custom accounts remain saved and excluded from the book valuation perimeter. Account financial edits and reporting-currency edits route to the Financial Book owner. Missing or invalid prepared books raise a recovery error instead of silently substituting a different portfolio.

The app invalidates donor account/holding/valuation/allocation/net-capital query caches on book/investment record events. The projection additionally keys its read cache by the exact saved source strings.

## Checks

`prepared-office-portfolio.test.ts` verifies common AUM across accounts, holdings and allocations; the investment-sleeve scope; cash look-through; net liabilities; exact dated totals; unknown bases; native FX reconciliation; live DCF reads; metadata preservation; archived-profile fallback; invalid/missing-book behavior; and owner income/cash movements. Existing static donor tests continue to verify the legacy fallback.
