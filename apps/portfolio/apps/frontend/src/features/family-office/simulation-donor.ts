// Extracted from local simulation-lab/src/models.ts; see public/open-source/simulation/NOTICE.md.
export function seededUniform(seed: string) {
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return () => { state += 0x6D2B79F5; let t = state; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function quantileSorted(values: number[], q: number) { const i = (values.length - 1) * q; const lo = Math.floor(i); return values[lo] + (values[Math.ceil(i)] - values[lo]) * (i - lo); }
const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

export const modelNames = { gbm: "Geometric Brownian motion", ou: "Ornstein-Uhlenbeck mean reversion", heston: "Heston stochastic volatility", merton: "Merton jump diffusion", regime: "Markov regime switching", garch: "GARCH(1,1) volatility", bootstrap: "Historical residual bootstrap" } as const;
export type Model = keyof typeof modelNames;
export interface Parameters { model: Model; seed: string; paths: number; steps: number; years: number; initial: number; drift: number; volatility: number; reversion: number; longRun: number }
export interface Run { parameters: Parameters; time: number[]; examples: number[][]; p10: number[]; median: number[]; p90: number[]; terminal: number[]; summary: { mean: number; p10: number; median: number; p90: number }; histogram: { centers: number[]; counts: number[] }; paths: number[][] }
export const defaults: Parameters = { model: "gbm", seed: "familybizness-demo-01", paths: 500, steps: 120, years: 5, initial: 100, drift: 0.05, volatility: 0.2, reversion: 1.5, longRun: 100 };

export function validate(p: Parameters): void {
  if (!(p.model in modelNames)) throw new Error("Choose a supported model.");
  if (!p.seed.trim() || p.seed.length > 100) throw new Error("Seed must contain 1–100 characters.");
  if (!Number.isInteger(p.paths) || p.paths < 20 || p.paths > 2000) throw new Error("Use 20–2,000 paths.");
  if (!Number.isInteger(p.steps) || p.steps < 12 || p.steps > 240) throw new Error("Use 12–240 time steps.");
  const ranges: [keyof Parameters, number, number][] = [["years", 0.1, 90], ["initial", 1, 1000], ["drift", -0.5, 0.5], ["volatility", 0, p.model !== "ou" ? 1 : 100], ["reversion", 0.01, 10], ["longRun", -1000, 1000]];
  for (const [key, min, max] of ranges) { const value = Number(p[key]); if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${key} must be between ${min} and ${max}.`); }
}

/** Explicit seeded Box–Muller normals: never mutates global Math.random. */
export function normalSource(seed: string) {
  const rng = seededUniform(seed);
  return () => Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng());
}

/** Exact discrete transitions of two constant-parameter SDEs, not calibrated forecasts. */
export function simulate(input: Parameters): Run {
  validate(input);
  const p = { ...input }; const normal = normalSource(p.seed); const uniform = seededUniform(`${p.seed}:uniform`); const dt = p.years / p.steps;
  const decay = Math.exp(-p.reversion * dt);
  const ouNoise = p.volatility * Math.sqrt(-Math.expm1(-2 * p.reversion * dt) / (2 * p.reversion));
  const paths = Array.from({ length: p.paths }, () => {
    const values = [p.initial]; let variance = p.volatility ** 2, previousShock = 0, stressed = false;
    for (let step = 1; step <= p.steps; step++) {
      const last = values[step - 1]; const z = normal();
      let logReturn = (p.drift - p.volatility ** 2 / 2) * dt + p.volatility * Math.sqrt(dt) * z;
      if (p.model === "heston") {
        // Full truncation Euler with fixed illustrative kappa=2, vol-of-vol=.3, rho=-.6.
        const vol = Math.sqrt(Math.max(0, variance));
        logReturn = (p.drift - variance / 2) * dt + vol * Math.sqrt(dt) * z;
        variance = Math.max(0, variance + 2 * (p.volatility ** 2 - variance) * dt + .3 * vol * Math.sqrt(dt) * (-.6 * z + .8 * normal()));
      } else if (p.model === "merton") {
        // Poisson jump count; intensity .3/year, Gaussian log jump N(-.12,.15�).
        const intensity = .3, jumpMean = -.12, jumpVol = .15;
        let clock = -Math.log(1 - uniform()) / intensity, jump = 0;
        while (clock < dt) { jump += jumpMean + jumpVol * normal(); clock += -Math.log(1 - uniform()) / intensity; }
        logReturn += -intensity * (Math.exp(jumpMean + jumpVol ** 2 / 2) - 1) * dt + jump;
      } else if (p.model === "regime") {
        if (uniform() < 1 - Math.exp(-(stressed ? 1 : .2) * dt)) stressed = !stressed;
        const vol = p.volatility * (stressed ? 1.8 : .8);
        logReturn = ((stressed ? -.1 : p.drift) - vol ** 2 / 2) * dt + vol * Math.sqrt(dt) * z;
      } else if (p.model === "garch") {
        // Per-step GARCH: alpha=.08, beta=.9; unconditional annual variance = entered variance.
        variance = .02 * p.volatility ** 2 + .08 * previousShock ** 2 + .9 * variance;
        previousShock = Math.sqrt(variance) * z;
        logReturn = (p.drift - variance / 2) * dt + previousShock * Math.sqrt(dt);
      } else if (p.model === "bootstrap") {
        // Static illustrative monthly residual fixture, centred and standardised.
        const residuals = [-2.1,-1.2,-.8,-.4,-.2,0,.1,.3,.5,.8,1.1,1.9];
        const average = residuals.reduce((a,b) => a+b,0) / residuals.length;
        const sd = Math.sqrt(residuals.reduce((a,b) => a+(b-average)**2,0) / residuals.length);
        logReturn = (p.drift - p.volatility ** 2 / 2) * dt + p.volatility * Math.sqrt(dt) * (residuals[Math.floor(uniform()*residuals.length)]-average)/sd;
      }
      const next = p.model === "ou" ? p.longRun + (last - p.longRun) * decay + ouNoise * z : last * Math.exp(logReturn);
      if (!Number.isFinite(next)) throw new Error("Scenario overflowed; reduce the parameters.");
      values.push(next);
    }
    return values;
  });
  const p10: number[] = [], median: number[] = [], p90: number[] = [];
  for (let step = 0; step <= p.steps; step++) {
    const column = paths.map(path => path[step]).sort((a, b) => a - b);
    p10.push(quantileSorted(column, 0.1)); median.push(quantileSorted(column, 0.5)); p90.push(quantileSorted(column, 0.9));
  }
  const terminal = paths.map(path => path[p.steps]).sort((a, b) => a - b);
  const low = terminal[0], high = terminal[terminal.length - 1];
  const width = (high - low || Math.max(1, Math.abs(low) * 0.02)) / 20;
  const start = high === low ? low - width * 10 : low;
  const counts = Array<number>(20).fill(0);
  for (const value of terminal) counts[Math.min(19, Math.max(0, Math.floor((value - start) / width)))]++;
  return { paths, parameters: p, time: Array.from({ length: p.steps + 1 }, (_, i) => i * dt), examples: paths.slice(0, 8), p10, median, p90, terminal, summary: { mean: mean(terminal), p10: p10[p.steps], median: median[p.steps], p90: p90[p.steps] }, histogram: { centers: counts.map((_, i) => start + (i + 0.5) * width), counts } };
}
