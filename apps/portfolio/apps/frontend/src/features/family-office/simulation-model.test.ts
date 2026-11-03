import { describe, expect, it } from "vitest";
import { allocation, optimise, simulationDefaults, simulationSchema, wealthProjection } from "./simulation-model";
import { defaults, simulate } from "./simulation-donor";

describe("constrained liquid allocation",()=>{
 it("respects cash, equity, risk and eligibility limits",()=>{ const p={...simulationDefaults,cashMin:20,equityMax:40};const result=optimise(p); expect(result.best).not.toBeNull(); for(const row of result.candidates){expect(row.cash).toBeGreaterThanOrEqual(20); expect(row.equity).toBeLessThanOrEqual(40); expect(row.volatility).toBeLessThanOrEqual(p.riskMax+1e-8);} expect(optimise({...p,excludeEquity:true}).best?.equity).toBe(0); });
 it("retains an all-cash feasible candidate under tight constraints",()=>{expect(optimise({...simulationDefaults,cashMin:99.1,equityMax:0,cashReturn:1}).best?.cash).toBe(100); expect(optimise({...simulationDefaults,cashMin:0,equityMax:100,riskMax:0}).best?.cash).toBe(100);});
 it("uses covariance, including negative correlation",()=>{const p={...simulationDefaults,equityVol:10,bondVol:10,correlation:-1}; expect(allocation(p,50,50).volatility).toBeCloseTo(0);});
 it("validates bad allocations and caps work",()=>{expect(()=>simulationSchema.parse({...simulationDefaults,currentEquity:80,currentBonds:50})).toThrow();expect(()=>simulationSchema.parse({...simulationDefaults,paths:2001})).toThrow();});
});
describe("multi-generation projection",()=>{
 it("replays seed and changes with seed",()=>{const p={...simulationDefaults,paths:20,years:3};const a=allocation(p,50,40);expect(wealthProjection(p,a)).toEqual(wealthProjection(p,a));expect(wealthProjection(p,a)).not.toEqual(wealthProjection({...p,seed:"different"},a));});
 it("matches deterministic arithmetic growth with no risk or outflows",()=>{const p={...simulationDefaults,paths:20,years:2,initial:100,spending:0,fees:0,taxDrag:0,inflation:0,transferCost:0,cashReturn:10};const r=wealthProjection(p,allocation(p,0,0));expect(r.series[2].median).toBeCloseTo(121);});
 it("depletes without creating negative wealth and charges transfer once",()=>{const p={...simulationDefaults,paths:20,years:3,initial:100,spending:20,fees:0,taxDrag:0,inflation:0,transferCost:80,transferYear:2,cashReturn:0};const r=wealthProjection(p,allocation(p,0,0));expect(r.series.map(s=>s.median)).toEqual([100,80,0,0]);expect(r.depleted).toBe(1);expect(r.reserveMet).toBe(0);});
 it("keeps percentile ordering",()=>{const p={...simulationDefaults,paths:100,years:10};for(const row of wealthProjection(p,allocation(p,60,30)).series){expect(row.p10).toBeLessThanOrEqual(row.median);expect(row.median).toBeLessThanOrEqual(row.p90);}});
});
describe("integrated process donor",()=>{
 it("retains exact zero-noise GBM and OU transitions",()=>{const p={...defaults,paths:20,volatility:0};const g=simulate(p);expect(g.summary.mean).toBeCloseTo(p.initial*Math.exp(p.drift*p.years));const o=simulate({...p,model:"ou",longRun:80});expect(o.summary.mean).toBeCloseTo(80+(p.initial-80)*Math.exp(-p.reversion*p.years));});
 it("preserves seeded replay and histogram population",()=>{const a=simulate({...defaults,paths:20});expect(a).toEqual(simulate({...defaults,paths:20}));expect(a.histogram.counts.reduce((sum,n)=>sum+n,0)).toBe(20);});
});
