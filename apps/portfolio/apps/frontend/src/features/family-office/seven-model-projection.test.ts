import {it,expect} from "vitest";
import {compareSevenModels} from "./seven-model-projection";
import {investmentDefaults} from "./investment-model";
it("graphs seven reproducible models tied to saved financial inputs",()=>{
 const p={...investmentDefaults,years:3,paths:20};
 const runs=compareSevenModels(p,1000000);expect(runs).toHaveLength(7);expect(runs).toEqual(compareSevenModels(p,1000000));
 for(const run of runs){expect(run.series[0].median).toBe(1000000);expect(run.series).toHaveLength(4);expect(run.series.every(v=>Number.isFinite(v.median))).toBe(true);}
 const higherSpend=compareSevenModels({...p,spend:p.spend*2},1000000);
 runs.forEach((run,i)=>expect(higherSpend[i].series.at(-1)!.median).toBeLessThanOrEqual(run.series.at(-1)!.median));
 const moreCapital=compareSevenModels(p,2000000);expect(moreCapital[0].series.at(-1)!.median).toBeGreaterThan(runs[0].series.at(-1)!.median);
});
it("handles cash depletion and reserve failure under each model",()=>{
 const runs=compareSevenModels({...investmentDefaults,years:2,paths:20,spend:1e8},100);
 for(const run of runs){expect(run.depletion).toBe(1);expect(run.reserveSuccess).toBe(0);expect(run.series.at(-1)!.median).toBe(0);}
});
