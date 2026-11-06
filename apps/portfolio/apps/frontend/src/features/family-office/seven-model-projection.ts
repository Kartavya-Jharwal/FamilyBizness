import { simulate,defaults,modelNames,quantileSorted,type Model } from "./simulation-donor";
import { portfolioStats,type InvestmentInput } from "./investment-model";
/** Aggregate portfolio approximation: common annual cash flows, individual models differ only in return dynamics. */
export function compareSevenModels(p:InvestmentInput,initial:number) {
 const stats=portfolioStats(p,p.securities.map(s=>s.current/100));
 return (Object.keys(modelNames) as Model[]).map(model=>{
  const run=simulate({...defaults,model,seed:p.seed,initial:100,longRun:100,years:p.years,steps:Math.max(12,p.years),paths:Math.min(p.paths,500),drift:Math.max(-.5,Math.min(.5,stats.expected/100)),volatility:model==="ou"?stats.volatility:stats.volatility/100});
  const paths=run.paths.map(path=>{
   const wealth=[initial];
   for(let year=1;year<=p.years;year++){
    const prior=path[Math.round((year-1)*run.parameters.steps/p.years)],current=path[Math.round(year*run.parameters.steps/p.years)];
    const gross=prior>0?Math.max(0,current/prior):0;
    const income=p.events.filter(e=>e.year===year&&e.kind==="contribution").reduce((s,e)=>s+e.amount,0);
    const costs=p.events.filter(e=>e.year===year&&e.kind==="cost").reduce((s,e)=>s+e.amount,0)+p.spend*(1+p.inflation/100)**(year-1)+(year===p.eventYear?p.eventCost:0);
    wealth.push(Math.max(0,wealth[year-1]*Math.max(0,gross-(stats.fee+stats.expectedTax)/100)+income-costs));
   }
   return wealth.map((v,year)=>v/(1+p.inflation/100)**year);
  });
  const series=Array.from({length:p.years+1},(_,year)=>{const values=paths.map(path=>path[year]).sort((a,b)=>a-b);return {year,p10:quantileSorted(values,.1),median:quantileSorted(values,.5),p90:quantileSorted(values,.9)};});
  return {model,name:modelNames[model],series,reserveSuccess:paths.filter(path=>path[p.years]>=p.reserve).length/paths.length,depletion:paths.filter(path=>path.some(v=>v===0)).length/paths.length};
 });
}
