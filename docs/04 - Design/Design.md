# Design

## Shared foundations

The single source for shared colours, typography, spacing and geometry is [`packages/tokens/tokens.css`](../../packages/tokens/tokens.css). The default portfolio theme and the preview shell consume this file. The foundations are adapted from Wealthfolio's Classic theme; see [upstream design references](../../upstream/README.md) for provenance and attribution.

Classic supplies light and dark surface roles, semantic colours, chart and series palettes, and Inter, Merriweather and JetBrains Mono font stacks. The shell uses the shared sans stack and light and dark palette. Donor-specific alternate themes and component styling remain in the portfolio app; they are not yet a fully unified design system.

Change shared values in the token file, then consume them through semantic roles. When changing the portfolio's theme definitions, regenerate its theme stylesheet using `bun run themes:generate` from `apps/portfolio/apps/frontend`.

## Preview shell

The first viewport leads with the brand and a single CTA group. Pillars follow the hero.

## Incoming donor views

ERPNext and cal.diy are intake references for the requested finance/operations and obligations-calendar slices. Their original shells and global styles do not become the host design system. Future KPI-tree home, persona views, family/ownership graphs, succession events, source-linked statements and IPS/risk views should use the existing host components and canonical semantic roles. Connector previews must distinguish sample-loaded, disconnected, consent-required and failed states. Statement and trade details should show their accounting/trading source and observation date. FMEA/RPN views require explicit scoring inputs and must not turn missing evidence into a low-risk score.

The local simulation donor should consume canonical tokens and distinguish fictional scenario parameters, generated paths and summarized outcomes. Label chart axes, units, percentile bands and the seed; limit visible paths so labels and distributions remain readable. These intake views are planned independently of the existing live preview.

## Constitution workspace

The constitution feature reuses Portfolio's shell and UI components, with a desktop source/inspector split and stacked narrow-screen panels. Its source-text preview escapes markup and uses the host theme. The separate Next palette, font pipeline and forced-light editor remain in the donor snapshot. Implementation scope and visual acceptance are tracked in: [Policy Module - Donor Audit And Integration Plan](../02%20-%20Strategy/Policy%20Module%20-%20Donor%20Audit%20And%20Integration%20Plan.md).

## Release blockers

Unreadable text and overlapping chart labels are release blockers. Render and inspect relevant light and dark views and viewport sizes before shipping UI changes.

## Analysis donor review

The local analysis workbench uses canonical tokens for its neutral shell and light/dark charts. Retained views and extraction ownership are defined in [Ghostfolio - Integration Plan](../02%20-%20Strategy/Ghostfolio%20-%20Integration%20Plan.md). Fork attribution remains visible in a dedicated legal view.

The React extraction uses host semantic theme roles, components, density, formatting and Insights navigation. Rule statuses, return methods and look-through denominators are reconciled through an explicit read boundary, with unavailable inputs visible. The integration plan owns the mapping contract, evidence and remaining provider/evaluator work. No parallel donor theme or new primitive palette was introduced.

The combined product shell uses neutral FB artwork and FamilyBizness labels. Original donor names and credits remain visible on the dedicated legal page. Scripted assistant progress and the fixed ending are labelled as a preview; source logos and obsolete onboarding screenshots are omitted from the distributed product. Scoped review evidence lives in [Donor - Combined Pass Sign-Off](../02%20-%20Strategy/Donor%20-%20Combined%20Pass%20Sign-Off.md).
