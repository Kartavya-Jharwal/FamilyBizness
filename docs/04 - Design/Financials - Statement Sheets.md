# Financial Statement Sheets

The Capital & liquidity page places native financial tables directly below its capital metrics. The owning record remains `finance-book-model.ts`; the sheet projection groups that existing ledger and its consolidation output without creating a second statement store.

## Sheet structure

- **Summary sheets**: book assets, liabilities, capital, income, cash movement and closing cash by entity, adjustment and consolidated group. A separate table identifies the family fair-value perimeter so book group capital is not confused with beneficial family capital or AUM.
- **Balance sheet**: source asset/liability classes, net assets, equity and reconciliation difference. Matched intercompany balances and subsidiary carrying values are visible through the adjustment column.
- **Income statement**: revenue/investment income, expense deductions and period net income. Internal income is eliminated by the existing consolidation owner.
- **Cash flow**: opening cash; operating, investing and financing movements; net movement; FX translation; closing cash and reconciliation difference. Reserves remain a balance constraint rather than a cash expense.

Entity columns and closing/period/opening FX follow the existing financial book. Every caption carries the source statement date and reporting currency. The source has a single statement date; the implementation does not invent comparative historical statements from AUM observations.

## Table contract

Use actual `table`, `caption`, `thead`, `tbody`, column headers and row headers. Numeric values have tabular figures, aligned currency amounts and nonbreaking cells; narrative cells wrap. Wide statements scroll inside a named, keyboard-focusable region, leaving the viewport contained on phones. Surface, radius, spacing and typography come from the host theme and canonical tokens. Totals use a ruled row rather than an additional card.

The expanded finance editor uses the same semantic table contract for source records, FX, dated AUM, valuation sensitivities and forecasts. Its existing record editors, source import/export and save events remain authoritative.

## Verification

`financial-statement-sheets.test.tsx` checks translated entity/group balances, the subsidiary elimination, income and the opening-to-closing cash bridge. It also verifies native table headers and all statement tabs. Combined responsive rendering belongs to the parent release checks.
