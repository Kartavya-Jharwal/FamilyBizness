import { z } from "zod";
import { normalSource } from "./simulation-donor";
import type { EffectivePolicy } from "./policy-engine";
const pct = z.number().finite().min(0).max(100);
export const securitySchema = z.object({id:z.string().min(1),name:z.string().min(1),sector:z.string().min(1),currency:z.enum(["GBP","USD","EUR"]),kind:z.enum(["equity","bond","cash","private"]),expected:z.number().finite().min(-50).max(50),volatility:pct,min:pct,max:pct,current:pct,fee:pct,taxRate:pct,liquid:z.boolean(),saleHaircut:pct});
export const transferEventSchema=z.object({id:z.string().min(1),year:z.number().int().min(1).max(90),kind:z.enum(["cost","contribution","internal-transfer"]),amount:z.number().finite().nonnegative(),fromGeneration:z.number().int().min(1).max(10),toGeneration:z.number().int().min(1).max(10),sharePercent:z.number().min(0).max(100),source:z.string().min(1)});
export const investmentSchema = z.object({generationShares:z.array(z.object({generation:z.number().int().min(1).max(10),share:pct})).min(1).max(10).default([{generation:1,share:100},{generation:2,share:0},{generation:3,share:0}]),events:z.array(transferEventSchema).max(100).default([]),source:z.string().min(1),currency:z.enum(["GBP","USD","EUR"]),securities:z.array(securitySchema).min(2).max(6),correlation:z.array(z.array(z.number().finite().min(-1).max(1))),excludedSectors:z.array(z.string()),cashMin:pct,equityMax:pct,illiquidMax:pct,riskMax:pct,target:z.number().min(-50).max(50),seed:z.string().min(1),years:z.number().int().min(1).max(90),paths:z.number().int().min(20).max(2000),initial:z.number().positive().max(1e12),spend:z.number().nonnegative().max(1e11),inflation:z.number().min(-5).max(30),reserve:z.number().nonnegative().max(1e12),eventYear:z.number().int().min(1).max(90),eventCost:z.number().nonnegative().max(1e12),allowPrivateSale:z.boolean()}).superRefine((p,ctx)=>{
  const issue=(message:string)=>ctx.addIssue({code:"custom",message});
  if(new Set(p.securities.map(s=>s.id)).size!==p.securities.length) issue("Security IDs must be unique.");
  if(p.securities.some(s=>s.min>s.max)) issue("Security minimum cannot exceed its maximum.");
  if(Math.abs(p.securities.reduce((a,s)=>a+s.current,0)-100)>1e-6) issue("Current weights must sum to 100%.");
  if(new Set(p.events.map(e=>e.id)).size!==p.events.length)issue("Transfer event IDs must be unique.");
  if(new Set(p.generationShares.map(g=>g.generation)).size!==p.generationShares.length||Math.abs(p.generationShares.reduce((s,g)=>s+g.share,0)-100)>1e-6)issue("Generation shares must be unique and total 100%.");
  try{generationTimeline(p);}catch(e){issue(String(e));}
  try { validateCorrelation(p.correlation,p.securities.length); } catch(e) {issue(e instanceof Error?e.message:"Invalid correlation");}
});
export type InvestmentInput=z.infer<typeof investmentSchema>;
export function bindInvestmentPolicy(p:InvestmentInput,policy:EffectivePolicy|null){const next={...p,excludedSectors:[...p.excludedSectors]};for(const rule of policy?.rules??[]){if(rule.kind==="cash-minimum")next.cashMin=Math.max(next.cashMin,rule.value);if(rule.kind==="equity-maximum")next.equityMax=Math.min(next.equityMax,rule.value);if(rule.kind==="illiquid-maximum")next.illiquidMax=Math.min(next.illiquidMax,rule.value);if(rule.kind==="excluded-sector")next.excludedSectors.push(rule.text);}return next;}
export const investmentDefaults:InvestmentInput={generationShares:[{generation:1,share:100},{generation:2,share:0},{generation:3,share:0}],events:[],source:"Fictional securities and forward assumptions; replace source clauses and dated market inputs",currency:"GBP",securities:[
  {id:"EQ-GLOBAL",name:"Global equity fund",sector:"Diversified equities",currency:"GBP",kind:"equity",expected:7,volatility:18,min:0,max:70,current:45,fee:.25,taxRate:20,liquid:true,saleHaircut:0},
  {id:"EQ-ENERGY",name:"Energy equity basket",sector:"Fossil energy",currency:"USD",kind:"equity",expected:8,volatility:25,min:0,max:20,current:10,fee:.3,taxRate:20,liquid:true,saleHaircut:0},
  {id:"BOND",name:"Investment-grade bonds",sector:"Fixed income",currency:"GBP",kind:"bond",expected:4,volatility:6,min:0,max:80,current:25,fee:.15,taxRate:20,liquid:true,saleHaircut:0},
  {id:"CASH",name:"Treasury cash",sector:"Cash",currency:"GBP",kind:"cash",expected:2,volatility:0,min:0,max:100,current:10,fee:0,taxRate:20,liquid:true,saleHaircut:0},
  {id:"PRIVATE",name:"Private property vehicle",sector:"Real estate",currency:"GBP",kind:"private",expected:6,volatility:12,min:0,max:25,current:10,fee:1,taxRate:20,liquid:false,saleHaircut:20},
],correlation:[[1,.65,.15,0,.4],[.65,1,.1,0,.3],[.15,.1,1,0,.1],[0,0,0,1,0],[.4,.3,.1,0,1]],excludedSectors:[],cashMin:10,equityMax:70,illiquidMax:25,riskMax:12,target:5,seed:"family-office-correlated-01",years:30,paths:500,initial:10000000,spend:250000,inflation:2.5,reserve:1000000,eventYear:20,eventCost:1000000,allowPrivateSale:false};

/** PSD Cholesky permits exact zero eigenvalues, rejecting inconsistent singular rows. */
export function validateCorrelation(a:number[][],n:number) {
  if(a.length!==n||a.some(r=>r.length!==n)) throw new Error("Correlation must be a square matrix matching securities.");
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) if(!Number.isFinite(a[i][j])||Math.abs(a[i][j])>1+1e-10||Math.abs(a[i][j]-a[j][i])>1e-8||(i===j&&Math.abs(a[i][j]-1)>1e-8)) throw new Error("Correlation must be finite, symmetric, bounded and have unit diagonal.");
  const l=Array.from({length:n},()=>Array(n).fill(0) as number[]);
  for(let i=0;i<n;i++) for(let j=0;j<=i;j++) {
    let v=a[i][j]; for(let k=0;k<j;k++) v-=l[i][k]*l[j][k];
    if(i===j){if(v < -1e-8) throw new Error("Correlation matrix is not positive semidefinite."); l[i][j]=Math.sqrt(Math.max(0,v));}
    else if(l[j][j]>1e-10) l[i][j]=v/l[j][j];
    else if(Math.abs(v)>1e-8) throw new Error("Correlation matrix is not positive semidefinite.");
  } return l;
}
const dot=(a:number[],b:number[])=>a.reduce((sum,x,i)=>sum+x*b[i],0);
export function covariance(p:InvestmentInput){return p.securities.map((s,i)=>p.securities.map((t,j)=>s.volatility*t.volatility*p.correlation[i][j]/10000));}
export function portfolioStats(p:InvestmentInput,w:number[]){const cov=covariance(p);return {expected:dot(w,p.securities.map(s=>s.expected)),volatility:Math.sqrt(Math.max(0,dot(w,cov.map(r=>dot(r,w)))))*100,fee:dot(w,p.securities.map(s=>s.fee)),expectedTax:dot(w,p.securities.map(s=>Math.max(0,s.expected)*s.taxRate/100))};}
function solveLinear(matrix:number[][],rhs:number[]):number[]|null {
  const n=rhs.length,a=matrix.map((r,i)=>[...r,rhs[i]]);
  for(let col=0;col<n;col++) {let pivot=col;for(let r=col+1;r<n;r++)if(Math.abs(a[r][col])>Math.abs(a[pivot][col]))pivot=r;
    if(Math.abs(a[pivot][col])<1e-12)return null;[a[col],a[pivot]]=[a[pivot],a[col]];
    const d=a[col][col];for(let j=col;j<=n;j++)a[col][j]/=d;
    for(let r=0;r<n;r++)if(r!==col){const v=a[r][col];for(let j=col;j<=n;j++)a[r][j]-=v*a[col][j];}
  }return a.map(r=>r[n]);
}
interface Constraint {a:number[];b:number;label:string}
function constraints(p:InvestmentInput,target?:number):Constraint[]{
  const n=p.securities.length,rows:Constraint[]=[];
  p.securities.forEach((s,i)=>{const a=Array(n).fill(0) as number[];a[i]=1;const locked=!s.liquid&&!p.allowPrivateSale;rows.push({a,b:(locked?Math.max(s.min,s.current):s.min)/100,label:`${s.id} minimum / locked holding`},{a:a.map(v=>-v),b:-(p.excludedSectors.some(v=>v.trim().toLowerCase()===s.sector.toLowerCase())?0:(locked?Math.min(s.max,s.current):s.max)/100),label:`${s.id} maximum / screen`});});
  rows.push({a:p.securities.map(s=>s.kind==="cash"?1:0),b:p.cashMin/100,label:"Cash floor"},{a:p.securities.map(s=>s.kind==="equity"?-1:0),b:-p.equityMax/100,label:"Equity cap"},{a:p.securities.map(s=>!s.liquid?-1:0),b:-p.illiquidMax/100,label:"Illiquid cap"});
  if(target!==undefined)rows.push({a:p.securities.map(s=>s.expected/100),b:target/100,label:"Required return"});
  return rows.filter(r=>r.a.some(v=>v!==0)||r.b>0);
}
export interface QPSolution {weights:number[];variance:number;active:string[];stationarity:number;primalViolation:number;dualViolation:number;setsTested:number}
/** Enumerates independent active sets for the convex minimum-variance QP. */
export function minimumVariance(p:InvestmentInput,target?:number):QPSolution|null {
  const n=p.securities.length,ineq=constraints(p,target),cov=covariance(p),ridge=1e-10;
  let found:QPSolution|null=null,tested=0;
  function check(indices:number[]){tested++;const rows=[{a:Array(n).fill(1) as number[],b:1,label:"Budget"},...indices.map(i=>ineq[i])],m=rows.length;
    const matrix=Array.from({length:n+m},()=>Array(n+m).fill(0) as number[]),rhs=Array(n+m).fill(0) as number[];
    for(let i=0;i<n;i++){for(let j=0;j<n;j++)matrix[i][j]=cov[i][j]+(i===j?ridge:0);for(let j=0;j<m;j++)matrix[i][n+j]=-rows[j].a[i];}
    rows.forEach((r,i)=>{matrix[n+i]=[...r.a,...Array(m).fill(0)];rhs[n+i]=r.b;});
    const result=solveLinear(matrix,rhs);if(!result)return;
    const w=result.slice(0,n),multipliers=result.slice(n),primal=Math.max(Math.abs(w.reduce((a,b)=>a+b,0)-1),...ineq.map(r=>Math.max(0,r.b-dot(r.a,w)))),dual=Math.max(0,...multipliers.slice(1).map(v=>-v));
    if(primal>1e-7||dual>1e-7)return;
    const stationarity=Math.max(...w.map((_,i)=>Math.abs(dot(cov[i],w)+ridge*w[i]-rows.reduce((sum,r,j)=>sum+r.a[i]*multipliers[j],0))));
    found={weights:w.map(v=>Math.abs(v)<1e-10?0:v),variance:dot(w,cov.map(r=>dot(r,w))),active:indices.map(i=>ineq[i].label),stationarity,primalViolation:primal,dualViolation:dual,setsTested:tested};
  }
  function combos(start:number,left:number,selected:number[]){if(found)return;if(left===0){check(selected);return;}for(let i=start;i<=ineq.length-left&&!found;i++)combos(i+1,left-1,[...selected,i]);}
  for(let count=0;count<=n-1&&!found;count++)combos(0,count,[]);
  return found;
}
export function optimiseSecurities(raw:InvestmentInput){
  const p=investmentSchema.parse(raw);const base=minimumVariance(p);
  if(!base)return {status:"infeasible" as const,reason:"No allocation satisfies security, screen, budget and concentration constraints.",best:null,iterations:0,returnGap:null};
  if(Math.sqrt(Math.max(0,base.variance))*100>p.riskMax+1e-6)return {status:"infeasible" as const,reason:"Minimum achievable risk exceeds the volatility limit.",best:null,iterations:0,returnGap:null};
  let best=base,low=portfolioStats(p,base.weights).expected,high=Math.max(...p.securities.map(s=>s.expected)),iterations=0;
  for(;iterations<24&&high-low>1e-6;iterations++){const target=(low+high)/2,result=minimumVariance(p,target);if(result&&Math.sqrt(Math.max(0,result.variance))*100<=p.riskMax+1e-7){best=result;low=target;}else high=target;}
  const stats=portfolioStats(p,best.weights);
  return {status:stats.expected+1e-5>=p.target?"optimal" as const:"target-unattainable" as const,reason:stats.expected+1e-5>=p.target?"Maximum-return efficient allocation within the entered risk cap (numerical tolerance).":"Best feasible return is below the required target.",best:{...best,...stats},iterations,returnGap:high-low};
}

export function projectSecurities(raw:InvestmentInput,weights:number[]){
  const p=investmentSchema.parse(raw),n=p.securities.length;
  if(weights.length!==n||weights.some(w=>!Number.isFinite(w)||w< -1e-7)||Math.abs(weights.reduce((a,b)=>a+b,0)-1)>1e-6)throw new Error("Projection needs nonnegative weights summing to one.");
  const l=validateCorrelation(p.correlation,n),normal=normalSource(p.seed),all:number[][]=[],shortfalls:number[]=[],terminal:number[]=[];
  for(let path=0;path<p.paths;path++){
    const balances=weights.map(w=>p.initial*w),history=[p.initial];let shortfall=0;
    for(let year=1;year<=p.years;year++){
      const independent=Array.from({length:n},()=>normal());
      p.securities.forEach((s,i)=>{const shock=dot(l[i],independent),vol=s.volatility/100;const gross=balances[i]*Math.exp(Math.log1p(s.expected/100)-.5*vol*vol+vol*shock);const fee=gross*s.fee/100,tax=Math.max(0,gross-balances[i])*s.taxRate/100;balances[i]=Math.max(0,gross-fee-tax);});
      const inflows=p.events.filter(e=>e.year===year&&e.kind==="contribution").reduce((sum,e)=>sum+e.amount,0);if(inflows){const receiver=p.securities.findIndex(s=>s.liquid);if(receiver<0)throw new Error("A liquid receiving asset is required for contributions.");balances[receiver]+=inflows;}
      let need=p.events.filter(e=>e.year===year&&e.kind==="cost").reduce((sum,e)=>sum+e.amount,0)+p.spend*(1+p.inflation/100)**(year-1)+(year===p.eventYear?p.eventCost:0);
      for(const liquid of [true,false]){
        if(!liquid&&!p.allowPrivateSale)continue;
        const ids=p.securities.map((s,i)=>({s,i})).filter(({s})=>s.liquid===liquid);
        const available=ids.reduce((sum,{s,i})=>sum+balances[i]*(1-s.saleHaircut/100),0),fraction=available>0?Math.min(1,need/available):0;
        ids.forEach(({i})=>{balances[i]*=1-fraction;});need=Math.max(0,need-available*fraction);
      }
      shortfall+=need;
      // Rebalance only the liquid sleeve; private assets stay locked unless sold to meet an outflow.
      const liquidWealth=p.securities.reduce((sum,s,i)=>sum+(s.liquid?balances[i]:0),0),liquidWeight=p.securities.reduce((sum,s,i)=>sum+(s.liquid?weights[i]:0),0);
      if(liquidWeight>0)p.securities.forEach((s,i)=>{if(s.liquid)balances[i]=liquidWealth*weights[i]/liquidWeight;});
      const total=balances.reduce((a,b)=>a+b,0);if(!Number.isFinite(total))throw new Error("Projection overflow.");history.push(total/(1+p.inflation/100)**year);
    }all.push(history);shortfalls.push(shortfall);terminal.push(history.at(-1)!);
  }
  const quantile=(v:number[],q:number)=>{const a=[...v].sort((x,y)=>x-y),x=(a.length-1)*q;return a[Math.floor(x)]+(a[Math.ceil(x)]-a[Math.floor(x)])*(x-Math.floor(x));};
  const series=Array.from({length:p.years+1},(_,year)=>({year,p10:quantile(all.map(a=>a[year]),.1),median:quantile(all.map(a=>a[year]),.5),p90:quantile(all.map(a=>a[year]),.9)}));
  const ownership=generationTimeline(p);return {ownership,events:p.events,series,liquidityFailure:shortfalls.filter(v=>v>1e-6).length/p.paths,reserveSuccess:terminal.filter((v,i)=>v>=p.reserve&&shortfalls[i]<=1e-6).length/p.paths,medianUnfundedNominal:quantile(shortfalls,.5),terminalMedian:quantile(terminal,.5)};
}


export function generationTimeline(p:Pick<InvestmentInput,"generationShares"|"events"|"years">){
 const shares=new Map(p.generationShares.map(g=>[g.generation,g.share]));const result=[];
 for(const event of p.events){if(event.kind==="internal-transfer"&&(event.fromGeneration===event.toGeneration||!shares.has(event.fromGeneration)||!shares.has(event.toGeneration)||event.amount!==0))throw new Error("Internal transfers need two registered generations and zero cash amount; record taxes/costs as a separate cost event.");}
 for(let year=0;year<=90;year++){for(const event of p.events.filter(e=>e.year===year&&e.kind==="internal-transfer")){const held=shares.get(event.fromGeneration)!;if(event.sharePercent>held+1e-8)throw new Error(`Year ${year}: transfer exceeds generation ${event.fromGeneration}'s remaining economic interest.`);shares.set(event.fromGeneration,held-event.sharePercent);shares.set(event.toGeneration,shares.get(event.toGeneration)!+event.sharePercent);}if(year<=p.years)result.push({year,shares:Array.from(shares,([generation,share])=>({generation,share}))});}return result;
}
