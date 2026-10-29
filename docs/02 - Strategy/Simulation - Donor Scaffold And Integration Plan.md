# Simulation - Donor Scaffold And Integration Plan

Status: local scaffold implemented and checked, 28 October 2026. Product facts remain in [Identity](../00%20-%20Canonical/Identity.md); requested scope is in [MVP Feature Scope](../05%20-%20Requirements/Product%20Requirements%20-%20MVP%20Feature%20Scope.md#next-donor-scope).

## Purpose and provenance

`donor/contenders/simulation-lab/` is a small, locally authored Bun + Vite + TypeScript donor, created for the user's requested simulation module. There is no external application clone or upstream commit. The source and dependencies are local and ignored by parent Git. The module is not integrated into Portfolio, the parent workspace or the Pages build.

The scaffold demonstrates two stochastic processes with explicit fictional parameters and bounded client-side Monte Carlo runs. Accounting and trading systems remain the sources of actual financial records. Simulated paths do not create a second ledger or overwrite host observations.

## Installed libraries

| Dependency | Exact version | Use | License / source |
|---|---|---|---|
| seedrandom | 3.0.5 | Local seeded PRNG; explicit seed only, no global replacement | MIT; [official package and usage](https://www.npmjs.com/package/seedrandom) |
| simple-statistics | 7.8.7 | Terminal mean and population-quantile summaries | ISC; [official documentation](https://simple-statistics.github.io/docs/) |
| uPlot | 1.6.32 | Numeric time-series paths/percentiles and terminal histogram | MIT; [upstream documentation](https://github.com/leeoniya/uPlot/blob/master/docs/README.md) |
| Vite / TypeScript | 6.4.5 / 5.9.3 | Browser development, strict checking and static bundling | Development tooling |
| @types/bun / @types/seedrandom | 1.3.3 / 3.0.8 | Bun test and PRNG types | Development types |

The donor has its own `package.json` and `bun.lock`; no root dependency or workspace was added. Installed package notices are preserved. Distribution of library notices and the existing canonical design-foundation credits must accompany any later host extraction/release.

## Included slice

| Capability | Implemented behavior | Limits |
|---|---|---|
| GBM example | Exact lognormal transitions for `dX = μX dt + σX dW`, with explicit initial level, annual drift and volatility | Constant parameters; no calibration, flows, fees, tax, jumps or correlation |
| OU example | Exact Gaussian transitions for `dX = κ(θ − X) dt + σ dW`, with reversion speed, long-run level and diffusion in index units per square-root year | Abstract index; values can be negative; not a rate or liquidity forecast |
| Monte Carlo | Explicit seed, 20–2,000 paths, 12–240 steps and 0.1–10 years; invalid/non-finite inputs rejected | At most 480,000 transitions per run; synchronous small browser runs, no worker/remote computation |
| Visualization | Eight example paths, pointwise P10/median/P90 curves, terminal histogram, mean/percentile cards and numeric percentile table | Curves are simulation percentiles, not confidence intervals or approved forecasts |
| Theme and layout | Direct canonical token import, light/dark control, responsive single-column mobile layout | No additional token palette or host route integration |
| Reproducibility | Same model, seed and inputs reproduce identical output; PRNG is scoped to each run | Changing steps changes random-draw assignment; no cross-configuration path identity promise |

The transitions follow the standard GBM and OU solutions: [University of Queensland Monte Carlo notes, GBM simulation algorithm](https://people.smp.uq.edu.au/DirkKroese/mccourse.pdf), and [NYU stochastic-calculus assignment, OU transition law](https://math.nyu.edu/~goodman/teaching/StochCalc2018/assignments/assignment2.pdf). Code implements the formulas independently; no source code from those notes was copied.

## Run locally

From the repository root:

```powershell
cd donor/contenders/simulation-lab
bun install --frozen-lockfile
bun test
bun run build
bun run dev --port 5177
```

Browse `http://127.0.0.1:5177/`. `bun run preview --port 4177` serves the production `dist/`. The source imports `packages/tokens/tokens.css` directly through a repository-relative path, so keep the donor inside this checkout when running it.

## Verification evidence

- Bun 1.3.14 on Windows. Installation completed with 23 packages. The restricted Bun install crashed and a restricted build could not read its current directory; the authorized local install, tests and build succeeded outside that restriction. No application workaround or disabled compiler check was introduced.
- `bun test`: **6 tests passed, 0 failed**, covering deterministic replay for both models, different-seed divergence, analytic zero-noise GBM/OU solutions, analytic terminal moments within sampling tolerance, quantile ordering, histogram conservation and input/work bounds. Local evidence: `donor/contenders/simulation-lab/artifacts/Model-Tests.log`.
- `bun run build`: strict TypeScript check and Vite production build passed. Output is about 71 kB JS (31 kB gzip) plus 10 kB CSS. Evidence: `artifacts/Build.log` inside the donor.
- Browser QA checked both models, a repeat run with identical summary, light/dark desktop, and 390-pixel mobile layout. No browser console errors/warnings were captured. Mobile document and viewport widths matched (390 px); chart containers had no horizontal overflow. Readable labels and legends were visually checked. A legend-index issue discovered during review was fixed and the build repeated.
- Screenshots are local under `donor/contenders/simulation-lab/artifacts/`: `GBM-Light-Desktop.png`, `GBM-Light-Mobile.png`, `OU-Dark-Desktop.png` and `OU-Dark-Mobile.png`. The normal browser viewport was restored after testing.

Default 500-path, 120-step, five-year runs completed in approximately 37–61 ms during the local browser review; this is an observation on this machine, not a performance guarantee. The GBM default terminal mean was 129.02 index units and OU default mean was 100.05, using the displayed seed and model defaults. These are illustrative generated outputs, not canonical product numbers.

## Host integration contract and remaining work

1. Extract only the pure simulation boundary and selected charts into the portfolio application; preserve current routing, theme, formatting and data ownership.
2. Record model identity/version, seed, parameters, time units, scenario purpose and any source-input provenance with outputs. Keep generated assumptions visibly separate from actual accounting/trade observations.
3. Add approved scenario definitions before linking outputs to succession liquidity, IPS warnings or FMEA. A scenario result must not claim a measured breach or approved risk score.
4. Add Web Workers, cancellation and memory budgets before expanding beyond the small current work limits. Add export/persistence only after a source/output schema and ownership decision.
5. Correlated processes, quasi Monte Carlo, variance reduction, regime switching, advanced SDE solvers, calibration, stress testing, sensitivities and optimized asset allocation remain future modules. None is implied by having the starter libraries installed.
6. Re-run model/property tests and host visual acceptance after extraction. Preserve dependency licenses and canonical token/design attribution in the distributed host.
