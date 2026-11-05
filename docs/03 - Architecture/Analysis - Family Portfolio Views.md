# Family Portfolio Analysis Views

The existing Portfolio route owns query-backed sections: Portfolio & Monte Carlo, Allocations, Family FIRE, X-ray & risk and Return methods. No second portfolio ledger, projection engine or application shell is introduced.

## Allocation basis and saved classifications

`family-analysis-model.ts` consumes the same `projectPreparedOffice` read-through projection as Wealthfolio holdings and accounts. Listed (including sleeve cash) and private sleeves split by registered security weights within each owning book balance; they do not add securities on top of book assets. Gross AUM includes assets once. Net family capital additionally includes signed liabilities, so every allocation lens totals the same selected denominator.

Optional `allocation` metadata belongs to saved security and book-balance records. Its schema and prepared scenario assumptions have one owner in `allocation-metadata.ts`: custody platform, provider, account type, regional weights, development category and source. The named custodians/providers are fictional Board-model classifications; regional weights describe the assumed mandate and are not claimed to be audited fund constituents. Geography weights validate to 100%. Currency remains the instrument or book record's denomination and is never used as a shortcut for geography. Fresh prepared mandates include USD energy equities and EUR bonds with existing model FX rates, while all reporting/book values remain GBP. Older saved currency choices are preserved; the metadata migration does not redenominate them. Forward securities simulations assume constant FX/reporting-currency return inputs, not a separate stochastic FX process.

Fresh prepared records receive the metadata through the existing stewardship scenario. A once-only additive upgrade fills missing classification fields on known prepared IDs; it preserves saved balances, weights and user classifications, and rolls back writes on failure. Custom records without metadata retain an explicit unclassified bucket. No amount or new asset is invented by that migration. Restricted foundation assets remain outside beneficial-family AUM; philanthropy shows the existing forecast-year giving budget separately.

## Family FIRE

The family view reuses Wealthfolio retirement helpers `resolveFundedProgress`, `resolvePortfolioDrawRate` and `deriveRetirementReadiness`. It reuses `projectSecurities` for the actual correlated, inflation/fee/tax/liquidity-aware simulation. Accessible treasury cash, sleeve cash and listed capital set initial capital and liquid weights; operating-business value, locked private assets and restricted capital cannot fund withdrawals. The family target is annual spending less external recurring income, divided by the chosen withdrawal policy, plus the protected reserve. FIRE controls are preferences; financial and investment source records keep their existing owners. Changing annual family spending updates the same saved investment scenario.

The existing retirement service adapter references commands not implemented by the static host. The restored family view therefore does not mount a nonfunctional service-backed planner or claim those commands execute. Instead it retains the donor's readiness semantics and the already-working local JavaScript projector. It reports target funding, real-capital percentile paths, reserve survival, liquidity failures and annual tabular results.

## Ghostfolio X-ray and scenarios

The existing Ghostfolio-derived `InvestmentReviewPage` now accepts optional active family-mandate observations. Its actual rule-card structure evaluates the current equity ceiling, and displays weighted fee observation without fabricating an adopted fee ceiling. Original scoped holdings, exclusions and look-through handling remain in the donor component. Enabling a review preference does not disable the policy engine.

The family risk view evaluates the existing policy engine and projects the same registered securities under return headwinds, higher spending and a succession cash call. A seeded return/spending sensitivity grid and the existing stochastic-process lab expose Monte Carlo, GBM and mean-reversion controls without copying their engines. A cash call remains an outflow; it is not mislabeled as an asset-price shock.

## Return methods

The navigable methodology accordions reuse Wealthfolio's metric definitions and the saved monthly `investment-performance` engine outputs. Monthly observation tables, fees/tax, chained TWR, annualized/real returns, volatility, drawdown and linked Brinson attribution remain derived values. XIRR is explained as a dated investor-flow measure; a TWR or value change is never relabeled as a computed XIRR. Data-quality and currency-conversion assumptions are visible in their own concise sections.

Original donor provenance remains in the [frontend ledger](Donors%20-%20Frontend%20Contribution%20Ledger.md) and existing distributed notices. The new adapters belong to the host's financial records and engine contracts.
