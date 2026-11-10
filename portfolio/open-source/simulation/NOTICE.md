# Simulation Extraction

The GBM/OU model interfaces, parameter validation, exact transitions, path summaries and histogram assembly in `simulation-donor.ts` were extracted from the locally agent-authored `donor/contenders/simulation-lab/src/models.ts` on 2 November 2026. This was a local project, not third-party application source. The original file used seedrandom and simple-statistics; this integration replaces those imports with a local seeded integer generator and linear-interpolated quantiles. Exact streams and quantile conventions therefore differ from the standalone demonstration. No third-party library implementation was copied and no donor runtime or installation is required.

The host adds a three-asset constrained allocation grid and a separate annual wealth model with inflation-linked spending and a succession outflow. Model tests cover replay, analytic zero-noise transitions, covariance, constraints, depletion, reconciled financial statements and contribution arithmetic. All default numbers are fictional editable assumptions.

Finance statement hierarchy was informed by the documented ERPNext intake mapping. No ERPNext code or database engine is included in these finance modules. The planning model is an independently authored read/scenario boundary, not an accounting ledger.


## Frontend extraction

`simulation-lab-workspace.tsx` also adapts `simulation-lab/src/main.ts`: GBM/OU control masks, model switching, explicit seed and bounded run controls, terminal summary, example paths/percentile range, terminal histogram and accessible result table. React, Portfolio controls and the host Recharts library replace direct DOM/uPlot code. The independent theme switch and donor global styles are removed. It is a collapsed exploratory section in the existing Portfolio scenario page, not another dashboard or financial-data store. The original local source and extracted paths are fingerprinted in `../donor-manifest.json`.
