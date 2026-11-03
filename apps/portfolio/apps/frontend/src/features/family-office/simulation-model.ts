import { z } from "zod";
import { normalSource, quantileSorted } from "./simulation-donor";
export const simulationSchema = z.object({
  currency: z.enum(["GBP","USD","EUR"]).default("GBP"), sourceRef: z.string().min(1).max(500).default("Fictional planning assumptions; replace with source clause and input provenance"),
  seed: z.string().min(1).max(100), years: z.number().int().min(1).max(90), paths: z.number().int().min(20).max(2000),
  initial: z.number().min(1).max(1e12), spending: z.number().min(0).max(1e10), reserve: z.number().min(0).max(1e12),
  inflation: z.number().min(0).max(20), fees: z.number().min(0).max(10), taxDrag: z.number().min(0).max(20),
  equityReturn: z.number().min(-20).max(30), bondReturn: z.number().min(-20).max(30), cashReturn: z.number().min(-20).max(30),
  equityVol: z.number().min(0).max(80), bondVol: z.number().min(0).max(50), correlation: z.number().min(-1).max(1),
  cashMin: z.number().min(0).max(100), equityMax: z.number().min(0).max(100), riskMax: z.number().min(0).max(80), target: z.number().min(-20).max(30),
  currentEquity: z.number().min(0).max(100), currentBonds: z.number().min(0).max(100), excludeEquity: z.boolean(),
  transferYear: z.number().int().min(1).max(90), transferCost: z.number().min(0).max(1e12), stress: z.number().min(-90).max(0),
}).refine(p => p.currentEquity + p.currentBonds <= 100, "Current equity and bonds must total at most 100%.");
export type SimulationInput = z.infer<typeof simulationSchema>;
export const simulationDefaults: SimulationInput = { currency:"GBP", sourceRef:"Fictional planning assumptions; replace with source clause and input provenance", seed: "familybizness-plan-01", years: 30, paths: 500, initial: 9500000, spending: 300000, reserve: 1000000, inflation: 2.5, fees: 0.6, taxDrag: 0.8, equityReturn: 7, bondReturn: 4, cashReturn: 2, equityVol: 18, bondVol: 6, correlation: 0.2, cashMin: 10, equityMax: 70, riskMax: 12, target: 5, currentEquity: 50, currentBonds: 35, excludeEquity: false, transferYear: 20, transferCost: 1000000, stress: -30 };
export function allocation(p: SimulationInput, equity: number, bonds: number) {
  const cash = 100 - equity - bonds;
  const expected = (equity * p.equityReturn + bonds * p.bondReturn + cash * p.cashReturn) / 100;
  const volatility = Math.sqrt(Math.max(0, (equity * p.equityVol / 100) ** 2 + (bonds * p.bondVol / 100) ** 2 + 2 * equity / 100 * bonds / 100 * p.equityVol * p.bondVol * p.correlation));
  return { equity, bonds, cash, expected, volatility };
}
export function optimise(raw: SimulationInput, applyScreen = raw.excludeEquity) {
  const p = simulationSchema.parse(raw); const candidates = [];
  for (let equity = 0; equity <= 100; equity += 5) for (let bonds = 0; bonds <= 100 - equity; bonds += 5) {
    const a = allocation(p, equity, bonds);
    if (a.cash + 1e-8 >= p.cashMin && equity <= p.equityMax && (!applyScreen || equity === 0) && a.volatility <= p.riskMax + 1e-8) candidates.push(a);
  }
  candidates.sort((a, b) => b.expected - a.expected || a.volatility - b.volatility);
  return { best: candidates[0] ?? null, candidates };
}
export function wealthProjection(raw: SimulationInput, portfolio: ReturnType<typeof allocation>) {
  const p = simulationSchema.parse(raw); const normal = normalSource(p.seed); const r = portfolio.expected / 100 - (p.fees + p.taxDrag) / 100; const vol = portfolio.volatility / 100;
  const paths = Array.from({ length: p.paths }, () => {
    const path = [p.initial];
    for (let year = 1; year <= p.years; year++) {
      // log(1+r) preserves the entered arithmetic annual expected return.
      const beforeSpend = path[year - 1] * Math.exp(Math.log1p(r) - vol * vol / 2 + vol * normal());
      const next = Math.max(0, beforeSpend - p.spending * (1 + p.inflation / 100) ** (year - 1) - (year === p.transferYear ? p.transferCost : 0));
      if (!Number.isFinite(next)) throw new Error("Scenario overflowed; reduce horizon or risk assumptions.");
      path.push(next);
    } return path;
  });
  const series = Array.from({ length: p.years + 1 }, (_, year) => { const values = paths.map(path => path[year] / (1 + p.inflation / 100) ** year).sort((a, b) => a - b); return { year, p10: quantileSorted(values, .1), median: quantileSorted(values, .5), p90: quantileSorted(values, .9) }; });
  const terminal = paths.map(path => path[p.years] / (1 + p.inflation / 100) ** p.years).sort((a, b) => a - b);
  const losses = paths.map(path => 1 - path[1] / p.initial).sort((a, b) => a - b);
  const drawdowns = paths.map(path => { let peak = path[0], worst = 0; for (const v of path) { peak = Math.max(peak, v); worst = Math.max(worst, peak > 0 ? 1 - v / peak : 0); } return worst; }).sort((a, b) => a - b);
  return { series, terminal, depleted: paths.filter(path => path.some(v => v === 0)).length / p.paths, reserveMet: terminal.filter(v => v >= p.reserve).length / p.paths, firstYearLoss95: quantileSorted(losses, .95), medianDrawdown: quantileSorted(drawdowns, .5) };
}
