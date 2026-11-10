# Literature - References

The reading, standards and open-source projects behind FamilyBizness. Product facts live in [Identity](../00%20-%20Canonical/Identity.md); what code came from which project is in the [donor ledger](../03%20-%20Architecture/Donors%20-%20Frontend%20Contribution%20Ledger.md). These references are background only. Nothing in FamilyBizness is legal, tax or investment advice.

## Family business and family governance

- Tagiuri, R. and Davis, J. A. (1996). "Bivalent attributes of the family firm". *Family Business Review*, 9(2). The three-circle model (family, ownership, business) behind the platform's split between estate, governance and business views.
- Gersick, K. E., Davis, J. A., McCollom Hampton, M. and Lansberg, I. (1997). *Generation to Generation: Life Cycles of the Family Business*. Harvard Business School Press. Shapes the generational framing of goals and succession.
- Lansberg, I. (1999). *Succeeding Generations: Realizing the Dream of Families in Business*. Harvard Business School Press. Informs the succession and shared-dream articles of the family constitution.
- Hughes, J. E. (2004). *Family Wealth: Keeping It in the Family*. Bloomberg Press. Treats family wealth as human, intellectual and financial capital; behind the stewardship framing.

## Family offices

- UBS. *Global Family Office Report* (published annually). Background on how single-family offices allocate, govern and staff themselves.

## Investment policy and portfolio models

- CFA Institute (2010). *Elements of an Investment Policy Statement for Individual Investors*. The structure of the investment policy statement summary: objectives, constraints, review.
- Black, F. and Scholes, M. (1973). "The pricing of options and corporate liabilities". *Journal of Political Economy*, 81(3). Source of the geometric Brownian motion assumption used in the scenario lab.
- Uhlenbeck, G. E. and Ornstein, L. S. (1930). "On the theory of the Brownian motion". *Physical Review*, 36(5). The mean-reverting process offered as the alternative scenario model.

## English law baseline (estate structuring)

- Wills Act 1837.
- Inheritance Tax Act 1984.
- Trustee Act 2000.

These are named only as the legal baseline the demo assumes. Real structuring must be confirmed by qualified advisers.

## Accessibility and design standards

- W3C (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. The contrast and readability bar treated as a release blocker.

## Open-source software

| Project | Role in FamilyBizness | Licence |
|---|---|---|
| Wealthfolio | Application shell, portfolio, accounts, holdings, insights | AGPL |
| Ghostfolio | X-ray look-through and analysis views | AGPL |
| ERPNext | Task and shareholder field masks, project workspace | GPL |
| Cal.diy | Calendar composition and overlap handling | MIT |
| Dither Kit | Dithered chart paint and chart components | See [Dither Kit integration](../03%20-%20Architecture/Dither%20Kit%20-%20Source%20Integration.md) |
| React, React Router, Recharts, Vite, Bun | Runtime, routing, charts and build | MIT |

Exact revisions, file fingerprints and licence identifiers are in the in-app donor manifest linked from the donor ledger.
