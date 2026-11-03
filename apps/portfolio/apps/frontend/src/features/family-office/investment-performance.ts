import { z } from "zod";
const nonnegative=z.number().finite().nonnegative();
export const performanceSchema=z.object({source:z.string().min(1),currency:z.enum(["GBP","USD","EUR"]),annualInflation:z.number().min(-50).max(100).default(2.5),targetAnnual:z.number().min(-100).max(100).default(6),riskFreeAnnual:z.number().min(-50).max(100),periods:z.array(z.object({month:z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),fees:nonnegative,taxes:nonnegative,assets:z.array(z.object({id:z.string().min(1),sector:z.string().min(1),currency:z.enum(["GBP","USD","EUR"]),opening:nonnegative,flowAtStart:z.number().finite(),closing:nonnegative,income:nonnegative,fees:nonnegative,taxes:nonnegative,fxStart:z.number().positive(),fxEnd:z.number().positive(),benchmarkWeight:z.number().min(0).max(100),benchmarkReturn:z.number().min(-99.99).max(1000)})).min(1).max(100)})).min(2).max(120)}).superRefine((p,ctx)=>{
 const issue=(message:string)=>ctx.addIssue({code:"custom",message});
 let previous=-1;let previousAssets:typeof p.periods[number]["assets"]|null=null;
 for(const period of p.periods){const [y,m]=period.month.split("-").map(Number),index=y*12+m;if(previous>=0&&index!==previous+1)issue("Performance periods must be consecutive ascending calendar months.");previous=index;
 if(Math.abs(period.assets.reduce((s,a)=>s+a.benchmarkWeight,0)-100)>1e-6)issue(`Benchmark weights for ${period.month} must sum to 100%.`);
 if(new Set(period.assets.map(a=>a.id)).size!==period.assets.length)issue("Asset IDs must be unique within each month.");
 const opening=period.assets.reduce((s,a)=>s+(a.opening+a.flowAtStart)*a.fxStart,0),ending=period.assets.reduce((s,a)=>s+(a.closing+a.income)*a.fxEnd,0);
 if(Math.abs(period.fees-period.assets.reduce((s,a)=>s+a.fees*a.fxEnd,0))>.01||Math.abs(period.taxes-period.assets.reduce((s,a)=>s+a.taxes*a.fxEnd,0))>.01)issue("Period fee/tax totals must reconcile to security-level charges converted at closing FX.");
 if(opening<=0||ending<=0)issue("Each month needs positive invested capital and a positive after-cost ending value.");
 for(const a of period.assets)if(a.opening+a.flowAtStart<0||(a.opening+a.flowAtStart===0&&(a.closing+a.income)>0))issue("Asset capital cannot be negative; a zero-capital row cannot have ending proceeds.");
 if(previousAssets){for(const a of period.assets){const before=previousAssets.find(r=>r.id===a.id);if(before){if(a.currency!==before.currency||Math.abs(a.opening-before.closing-before.income)>.01||Math.abs(a.fxStart-before.fxEnd)>1e-8)issue(`${period.month} ${a.id}: opening must reconcile to prior closing plus retained income and prior closing FX.`);}else if(a.opening!==0)issue("New assets need zero opening value and an explicit start flow.");}for(const before of previousAssets)if(!period.assets.some(a=>a.id===before.id)&&before.closing+before.income>.01)issue("A disposed asset must appear with an explicit withdrawal and zero ending value before removal.");}previousAssets=period.assets;
 }
});
export type PerformanceInput=z.infer<typeof performanceSchema>;
export const performanceDefaults:PerformanceInput={annualInflation:2.5,targetAnnual:6,source:"Synthetic monthly base-currency valuations; flows/rebalancing at month start, income retained at month end",currency:"GBP",riskFreeAnnual:3,periods:(()=>{let equity=600000,bonds=400000;return Array.from({length:12},(_,i)=>{
 const eq=[.02,-.03,.04,.01,.015,-.02,.03,.01,-.01,.025,.005,.02][i],bond=[.003,.002,-.005,.004,.003,.002,.005,.001,.004,.002,.003,.002][i];
 const total=equity+bonds,eqStart=total*.6,bondStart=total*.4,eqEnd=eqStart*(1+eq)-480,bondEnd=bondStart*(1+bond)-320;const row={month:`2026-${String(i+1).padStart(2,"0")}`,fees:500,taxes:300,assets:[{id:"EQ",sector:"Equity",currency:"GBP" as const,opening:equity,flowAtStart:eqStart-equity,closing:eqEnd,income:0,fees:300,taxes:180,fxStart:1,fxEnd:1,benchmarkWeight:50,benchmarkReturn:(eq-.002)*100},{id:"BOND",sector:"Bonds",currency:"GBP" as const,opening:bonds,flowAtStart:bondStart-bonds,closing:bondEnd,income:0,fees:200,taxes:120,fxStart:1,fxEnd:1,benchmarkWeight:50,benchmarkReturn:(bond+.001)*100}]};equity=eqEnd;bonds=bondEnd;return row;
});})()};
export function performance(raw:PerformanceInput){
 const p=performanceSchema.parse(raw),rf=(1+p.riskFreeAnnual/100)**(1/12)-1;let wealth=1,netWealth=1,benchmark=1,peak=1,worst=0;
 const rows=p.periods.map(period=>{
  const capital=period.assets.reduce((sum,a)=>sum+(a.opening+a.flowAtStart)*a.fxStart,0);
  const assets=period.assets.map(a=>{const start=(a.opening+a.flowAtStart)*a.fxStart,weight=start/capital,localStart=a.opening+a.flowAtStart,localReturn=localStart>0?(a.closing+a.income+a.fees+a.taxes)/localStart-1:0,fxReturn=a.fxEnd/a.fxStart-1;return {...a,weight,return:start>0?(a.closing+a.income+a.fees+a.taxes)*a.fxEnd/start-1:0,localReturn,fxContribution:(1+localReturn)*fxReturn};});
  const gross=assets.reduce((s,a)=>s+a.weight*a.return,0),cost=(period.fees+period.taxes)/capital,net=gross-cost,bm=assets.reduce((s,a)=>s+a.benchmarkWeight/100*a.benchmarkReturn/100,0);
  const sectors=[...new Set(assets.map(a=>a.sector))].map(sector=>{const items=assets.filter(a=>a.sector===sector),wp=items.reduce((s,a)=>s+a.weight,0),wb=items.reduce((s,a)=>s+a.benchmarkWeight/100,0),rp=wp>0?items.reduce((s,a)=>s+a.weight*a.return,0)/wp:0,rb=wb>0?items.reduce((s,a)=>s+a.benchmarkWeight/100*a.benchmarkReturn/100,0)/wb:0;return {sector,wp,wb,rp,rb,allocation:(wp-wb)*(rb-bm),selection:wb*(rp-rb),interaction:(wp-wb)*(rp-rb)};});
  const allocation=sectors.reduce((s,a)=>s+a.allocation,0),selection=sectors.reduce((s,a)=>s+a.selection,0),interaction=sectors.reduce((s,a)=>s+a.interaction,0);
  wealth*=1+gross;netWealth*=1+net;benchmark*=1+bm;peak=Math.max(peak,netWealth);const drawdown=1-netWealth/peak;worst=Math.max(worst,drawdown);
  return {month:period.month,capital,gross,net,bm,cost,sectors,assets,allocation,selection,interaction,residual:gross-bm-allocation-selection-interaction,wealth,netWealth,benchmark,drawdown};
 });
 const n=rows.length,mean=rows.reduce((s,r)=>s+r.net,0)/n,variance=rows.reduce((s,r)=>s+(r.net-mean)**2,0)/(n-1),vol=Math.sqrt(variance)*Math.sqrt(12),grossTwr=wealth-1,netTwr=netWealth-1,benchmarkTwr=benchmark-1;
 const k=(rp:number,rb:number)=>Math.abs(rp-rb)<1e-10?1/(1+rp):(Math.log1p(rp)-Math.log1p(rb))/(rp-rb),overall=k(grossTwr,benchmarkTwr);
 const linked={allocation:0,selection:0,interaction:0};for(const row of rows){const coefficient=k(row.gross,row.bm)/overall;for(const key of ["allocation","selection","interaction"] as const)linked[key]+=row[key]*coefficient;}
 const losses=rows.map(r=>-r.net).sort((a,b)=>a-b),monthlyVaR95=losses[Math.ceil(.95*n)-1],tail=losses.filter(v=>v>=monthlyVaR95),monthlyCVaR95=tail.reduce((a,b)=>a+b,0)/tail.length;
 return {annualisedReal:(netWealth**(12/n))/(1+p.annualInflation/100)-1,targetGap:netWealth**(12/n)-1-p.targetAnnual/100,rows,grossTwr,netTwr,benchmarkTwr,annualisedNet:netWealth**(12/n)-1,annualisedVolatility:vol,sharpe:vol>1e-12?(mean-rf)*12/vol:null,maxDrawdown:worst,linked,attributionResidual:grossTwr-benchmarkTwr-linked.allocation-linked.selection-linked.interaction,feeTaxImpact:grossTwr-netTwr,monthlyVaR95,monthlyCVaR95,observations:n};
}

