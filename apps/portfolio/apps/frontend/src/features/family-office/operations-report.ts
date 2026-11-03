import { activeConstitution, type ConstitutionPack } from "./constitution-pack-model";
import { financeSchema, financials, aumHistory, returnContributions } from "./finance-model";
import { governanceKey, governanceSchema } from "./governance-model";
import { estateKey, estateSchema, calculateEstate } from "./estate-model";
import { ihtKey, ihtSchema, calculateIht } from "./estate-iht-model";
import { simulationSchema, allocation, optimise, wealthProjection } from "./simulation-model";
import { SourcePackSchema, sourceKey } from "./source-model";
import { operationsKey, decodeOperations, boardReport, type OperationsData, type Obligation } from "./operations-model";
import { capitalKey, capitalSchema, capitalTotals } from "./operations-capital";
import { servicesKey, servicesSchema, serviceCosts } from "./operations-service-model";
import { evaluateRules, readEffectivePolicy } from "./policy-engine";
import { financeBookSchema, consolidateBook, fairValueWealth, forecastPolicyFacts, dcfValue, cashForecast } from "./finance-book-model";
import { investmentSchema, bindInvestmentPolicy, optimiseSecurities, projectSecurities } from "./investment-model";
import { performanceSchema, performance } from "./investment-performance";
import { distributionInputSchema, voteInputSchema, evaluateDistribution, evaluateReservedDecision, goldenBirdTraceCurrent } from "./golden-bird-rules";

export type SavedSnapshot<T>={status:"saved";key:string;value:T}|{status:"missing"|"invalid";key:string;error:string};
export function savedSnapshot<T>(store:Pick<Storage,"getItem">,key:string,parse:(raw:unknown)=>T):SavedSnapshot<T>{
 try{const raw=store.getItem(key);if(raw===null)return {status:"missing",key,error:"No saved input. On-screen example defaults are not an approved report source."};return {status:"saved",key,value:parse(JSON.parse(raw))};}catch(e){return {status:"invalid",key,error:e instanceof Error?e.message:"Unreadable input"};}
}
export function officeSnapshots(store:Pick<Storage,"getItem">,profile:string){return {
 distributionReview:savedSnapshot(store,`profile:${profile}:constitution-distribution:v1`,v=>distributionInputSchema.parse(v)),
 reservedReview:savedSnapshot(store,`profile:${profile}:constitution-vote:v1`,v=>voteInputSchema.parse(v)),
 finance:savedSnapshot(store,`profile:${profile}:family-office:finance:1`,v=>financeSchema.parse(v)),
 book:savedSnapshot(store,`profile:${profile}:family-office:book:1`,v=>financeBookSchema.parse(v)),
 investments:savedSnapshot(store,`profile:${profile}:family-office:investment:1`,v=>investmentSchema.parse(v)),
 performance:savedSnapshot(store,`profile:${profile}:family-office:performance:1`,v=>performanceSchema.parse(v)),
 governance:savedSnapshot(store,governanceKey(profile),v=>governanceSchema.parse(v)),
 estate:savedSnapshot(store,estateKey(profile),v=>estateSchema.parse(v)),
 statutoryEstate:savedSnapshot(store,ihtKey(profile),v=>ihtSchema.parse(v)),
 simulation:savedSnapshot(store,`profile:${profile}:family-office:simulation:1`,v=>simulationSchema.parse(v)),
 sources:savedSnapshot(store,sourceKey(profile),v=>SourcePackSchema.parse(v)),
 operations:savedSnapshot(store,operationsKey(profile),v=>decodeOperations(JSON.stringify(v))),
 capital:savedSnapshot(store,capitalKey(profile),v=>capitalSchema.parse(v)),
 services:savedSnapshot(store,servicesKey(profile),v=>servicesSchema.parse(v)),
};}
const table=(headings:string[],rows:(string|number)[][])=>`| ${headings.join(" | ")} |\n| ${headings.map(()=>"---").join(" | ")} |\n`+rows.map(r=>`| ${r.map(v=>String(v).replaceAll("|","\\|").replace(/[\r\n]+/g," ")).join(" | ")} |`).join("\n")+"\n";
const number=(v:number|null)=>v===null?"Not defined":v.toLocaleString("en-GB",{maximumFractionDigits:2});
export function fullBoardReport(store:Pick<Storage,"getItem">,profile:string,generatedAt=new Date().toISOString()){
 const snapshots=officeSnapshots(store,profile);const missing=Object.entries(snapshots).filter(([name,s])=>!["finance","estate","simulation"].includes(name)&&s.status!=="saved");
 const sections=[`# Family Office Board Pack\n\nGenerated ${generatedAt}. Profile: ${profile}. Local planning records and source assertions; this report does not authenticate approvals, execute payments, or create legal instruments. All outputs retain their source assumptions.\n\n## Data readiness\n\n${table(["Owner","State","Storage / evidence"],Object.entries(snapshots).map(([name,s])=>[name,s.status,s.status==="saved"?s.key:s.error]))}\n${missing.length} current owners need population or recovery. Legacy finance/estate/simulation archives are optional. Missing data is not treated as zero.`];
 const f=snapshots.finance,g=snapshots.governance,e=snapshots.estate,s=snapshots.simulation;
 let constitution:ConstitutionPack|null=null;try{constitution=activeConstitution(store,profile);}catch(error){sections.push(`## Constitution library requires recovery\n\n${String(error)}`);}
 if(snapshots.distributionReview.status==="saved"&&constitution&&goldenBirdTraceCurrent(store,profile,constitution.parameters.sourceIds.distribution)){
  const result=evaluateDistribution(snapshots.distributionReview.value,constitution.parameters);
  sections.push(`## Constitutional cash distribution\n\nSource: ${result.sourceId}; ${constitution.currency}.\n\n${table(["Measure","Value"],[["Funding headroom",number(result.headroom)],["Core reinvestment and reserves",number(result.allocations.coreReinvestmentAndReserves)],["Permitted dividends",number(result.allocations.permittedDividends)],["Ring-fenced growth",number(result.allocations.ringFencedGrowth)]])}\n${result.blockers.join("; ")||"Cash and distributable-profit safeguards passed."}`);
 }
 if(snapshots.reservedReview.status==="saved"&&constitution&&goldenBirdTraceCurrent(store,profile,constitution.parameters.sourceIds.reservedVoting)){
  const result=evaluateReservedDecision(snapshots.reservedReview.value,constitution.parameters);
  sections.push(`## Reserved decision review\n\nSource: ${result.sourceId}.\n\n${table(["Measure","Value"],[["Eligible issued voting rights",number(result.eligibleRights)],["Supporting eligible rights %",number(result.ownerPercent)],["Required Board recommendations",result.boardRequired],["Result",result.passed?"All checks passed":"Further approvals required"]])}`);
 }
 try{const policy=readEffectivePolicy(store,profile);sections.push(`## Active constitutional rules\n\n${policy?`Revision ${policy.revision}; reviewer ${policy.reviewer}; activated ${policy.activatedAt}.\n${table(["Rule","Source","Type","Value","Text"],policy.rules.map(r=>[r.id,r.sourceId,r.kind,r.value,r.text]))}`:"No additional generic policy is active. Specific constitutional checks, where populated, are reported separately."}`);if(policy&&snapshots.book.status==="saved"){const findings=evaluateRules(policy,forecastPolicyFacts(snapshots.book.value),["distribution-maximum","reserve-minimum"]);sections.push(table(["Rule","Source","Result","Requirement"],findings.map(r=>[r.ruleId,r.sourceId,r.status,r.requirement])));}}catch(error){sections.push(`## Policy or forecast review required\n\n${String(error)}`);}
 if(snapshots.book.status==="saved"){
  const b=snapshots.book.value,c=consolidateBook(b),dcf=dcfValue(b.dcf),wealth=fairValueWealth(b);
  sections.push(`## Consolidated entity statements and forecast\n\nSource: ${b.source}; as of ${b.asOf}; reporting currency ${b.currency}. Whole-entity consolidation and matched elimination semantics follow the Financials owner.\n\n${table(["Measure","Value"],[["Book assets",number(c.assets)],["Fair-value gross family AUM",wealth.errors.length?"Perimeter needs review":number(wealth.grossAum)],["Fair-value net family wealth",wealth.errors.length?"Perimeter needs review":number(wealth.fairValue)],["Liabilities",number(c.liabilities)],["Book net assets",number(c.netWorth)],["Cash",number(c.cash)],["Unrestricted cash",number(c.unrestrictedCash)],["Net income",number(c.netIncome)],["Balance residual",number(c.balanceResidual)],["DCF enterprise value",number(dcf.enterprise)],["DCF family equity",number(dcf.familyEquity)]])}\nReconciliation warnings: ${c.errors.join("; ")||"No unmatched eliminations reported; inspect entity checks below."}\n\nEntity checks: ${JSON.stringify(c.entityChecks)}\n\n${table(["Month","Entity","Opening","Receipts","Uses","Closing","Reserve","Headroom"],cashForecast(b).map(r=>[r.month,r.entity,number(r.opening),number(r.receiptsBase),number(r.uses),number(r.closing),number(r.reserveBase),number(r.headroom)]))}`);
 }
 if(snapshots.investments.status==="saved"){
  try{const p=bindInvestmentPolicy(snapshots.investments.value,readEffectivePolicy(store,profile)),r=optimiseSecurities(p);sections.push(`## Security-level constrained optimisation\n\nSource ${p.source}; currency ${p.currency}. ${r.status}: ${r.reason}. Numerical return bracket ${r.returnGap??"unavailable"}; iterations ${r.iterations}.`);
   if(r.best){const projection=projectSecurities(p,r.best.weights);sections.push(`${table(["Security","Sector","Currency","Weight %"],p.securities.map((a,i)=>[a.name,a.sector,a.currency,number(r.best!.weights[i]*100)]))}\nExpected return ${number(r.best.expected)}%; annual volatility ${number(r.best.volatility)}%. KKT stationarity ${r.best.stationarity}; primal violation ${r.best.primalViolation}; dual violation ${r.best.dualViolation}.\n\nCorrelated projection: seed ${p.seed}; ${p.paths} paths; ${p.years} years. Liquidity failure ${number(projection.liquidityFailure*100)}%; real reserve success ${number(projection.reserveSuccess*100)}%; terminal real median ${number(projection.terminalMedian)}; median nominal unfunded amount ${number(projection.medianUnfundedNominal)}. No calibrated forecast is implied.`);}
  }catch(err){sections.push(`## Investment calculation needs review\n\n${err instanceof Error?err.message:"Calculation failed"}`);}
 }
 if(snapshots.performance.status==="saved"){
  const p=snapshots.performance.value,r=performance(p);sections.push(`## Measured performance and attribution\n\nSource ${p.source}; currency ${p.currency}; ${r.observations} monthly observations.\n\n${table(["Measure","Value"],[["Gross time-weighted return %",number(r.grossTwr*100)],["Net time-weighted return %",number(r.netTwr*100)],["Benchmark return %",number(r.benchmarkTwr*100)],["Annualised net return %",number(r.annualisedNet*100)],["Annualised volatility %",number(r.annualisedVolatility*100)],["Sharpe",number(r.sharpe)],["Maximum drawdown %",number(r.maxDrawdown*100)],["Monthly historical VaR95 %",number(r.monthlyVaR95*100)],["Monthly historical CVaR95 %",number(r.monthlyCVaR95*100)],["Allocation attribution pp",number(r.linked.allocation*100)],["Selection attribution pp",number(r.linked.selection*100)],["Interaction attribution pp",number(r.linked.interaction*100)],["Attribution residual pp",number(r.attributionResidual*100)]])}`);
 }
 if(f.status==="saved"){
  const p=f.value,v=financials(p),contributions=returnContributions(p);
  sections.push(`## Legacy planning financials\n\nSource: ${p.source}; as of ${p.asOf}; currency ${p.currency}.\n\n${table(["Measure","Value"],[["AUM",number(v.aum)],["Liabilities",number(p.personalDebt)],["Net wealth",number(v.netWorth)],["Business enterprise valuation",number(v.enterprise)],["Attributable business equity",number(v.familyBusiness)],["Concentrated business exposure %",number(v.concentration)],["Income",number(v.income)],["Operating cash",number(v.operatingCash)],["Reinvestment",number(v.reinvestment)],["Distributions",number(p.distributions)],["Philanthropy",number(p.philanthropy)],["Next-generation ventures",number(p.ventures)],["Succession reserve",number(p.successionReserve)],["Closing cash projection",number(v.closingCash)],["Reserve headroom",number(v.reserveHeadroom)],["Target / realised %",`${p.target} / ${p.realised}`],["Net / real net return %",`${number(v.netReturn)} / ${number(v.realReturn)}`],["Benchmark %",p.benchmark],["Sharpe (gross)",number(v.sharpe)]])}\n### AUM history\n${table(["Year","Opening","External flow","Closing","Return %","Drawdown %"],aumHistory(p).map(r=>[r.year,r.opening,r.externalFlow,r.closing,number(r.returnPercent),number(r.drawdown)]))}\n### Return contributions\n${table(["Asset","Weight %","Return %","Contribution percentage points"],contributions.rows.map(r=>[r.asset,number(r.weight),r.rate,number(r.contribution)]))}\nUnexplained reported-return residual: ${number(contributions.residual)} percentage points; investigate source timing/coverage.`);
  try{const policy=readEffectivePolicy(store,profile);const findings=evaluateRules(policy,{currency:p.currency,distributionPercent:v.aum>0?p.distributions/v.aum*100:undefined,reserveAmount:p.successionReserve},["distribution-maximum","reserve-minimum"]);sections.push(`## Activated policy monitoring\n\n${policy?`Revision ${policy.revision}, reviewed by ${policy.reviewer} at ${policy.activatedAt}.`:"No activated policy. No compliance conclusion is inferred."}\n${table(["Rule","Source","Result","Observed","Requirement"],findings.map(r=>[r.ruleId,r.sourceId,r.status,r.observed,r.requirement]))}`);}catch(err){sections.push(`## Policy requires review\n\n${err instanceof Error?err.message:"Policy unavailable"}`);}
 }
 if(g.status==="saved")sections.push(`## Governance, ownership and succession\n\n${g.value.family}; ${g.value.business}. Source: ${g.value.source}.\n\n${table(["Participant","Role","Generation","Economic %","Voting %"],g.value.people.map(p=>[p.name,p.role,p.generation,p.ownership,p.voting]))}\n${table(["Decision","Status","Rule","Evidence"],g.value.decisions.map(d=>[d.title,d.status,d.ruleId,d.history.join("; ")]))}\n${table(["Succession event","Date","Transferor","Successor","Economic / voting %","Source"],g.value.successionEvents.map(ev=>[ev.description,ev.at,ev.from,ev.to,`${ev.ownership} / ${ev.voting}`,ev.source]))}`);
 if(e.status==="saved"){
  const owner=g.status==="saved"?g.value.people.find(p=>p.id===e.value.ownerId):undefined;
  if(owner){const v=calculateEstate(e.value,owner.ownership);sections.push(`## Legacy effective-rate estate stress scenario\n\nThis is an explicit stress proxy, not a statutory tax calculation. Source: ${e.value.source}. Owner ${owner.name}; currency ${e.value.currency}.\nStructure: ${e.value.structure}\nBeneficiaries: ${e.value.beneficiaries}\n\n${table(["Measure","Value"],[["Net estate",number(v.netEstate)],["Effective-rate tax proxy",number(v.assumedTax)],["Event liquidity need",number(v.eventNeed)],["Available liquidity",number(v.available)],["Shortfall",number(v.shortfall)]])}`);}else sections.push("## Estate input mismatch\n\nSaved owner is not present in saved governance data; no estate amount calculated.");
 }
 if(snapshots.statutoryEstate.status==="saved"){
  try { const input=snapshots.statutoryEstate.value,result=calculateIht(input);
  sections.push(`## Estate statutory scenario and liquidity schedule\n\nThe saved statutory rule-pack scenario is separate from the legacy effective-rate stress. Inputs and assumptions are preserved in the companion snapshot.\n\n${table(["Measure","Value"],[["Net estate",number(result.netEstate)],["Business relief",number(result.businessRelief)],["Residence nil-rate band",number(result.rnrb)],["Remaining nil-rate band",number(result.remainingNrb)],["Estate tax",number(result.estateTax)],["Gift tax",number(result.giftTax)],["Total tax",number(result.totalTax)],["Due date",String(result.dueDate)]])}\n${table(["Month","Funding","Reserve","Cumulative due","Balance","Shortfall"],result.liquiditySchedule.map(r=>[r.month,number(r.funding),number(r.reserve),number(r.cumulativeDue),number(r.balance),number(r.shortfall)]))}\nRule pack: ${JSON.stringify(result.rulePack)}`); } catch(err) { sections.push(`## Statutory estate needs review\n\n${err instanceof Error?err.message:"Unsupported estate input"}`); }
 }
 if(s.status==="saved"){
  const p=s.value,choices=optimise(p),current=allocation(p,p.currentEquity,p.currentBonds);const portfolio=choices.best??current;
  const output=wealthProjection(p,portfolio);const terminal=output.series.at(-1)!;
  sections.push(`## Legacy three-asset scenario\n\nRecomputed reproducibly for this report from saved inputs. Source: ${p.sourceRef}; ${p.currency}; seed ${p.seed}; ${p.paths} paths; ${p.years} years. Allocation search result is bounded by its model and constraints; no investment forecast is implied.\n\n${table(["Allocation","Equities %","Bonds %","Cash %","Expected return %","Volatility %"],[["Current",current.equity,current.bonds,current.cash,number(current.expected),number(current.volatility)],[choices.best?"Constrained candidate":"No feasible candidate; current used for projection",portfolio.equity,portfolio.bonds,portfolio.cash,number(portfolio.expected),number(portfolio.volatility)]])}\n${table(["Projection measure","Value"],[["Terminal real P10",number(terminal.p10)],["Terminal real median",number(terminal.median)],["Terminal real P90",number(terminal.p90)],["Paths depleted %",number(output.depleted*100)],["Real reserve met %",number(output.reserveMet*100)],["First-year loss 95th percentile %",number(output.firstYearLoss95*100)],["Median maximum drawdown %",number(output.medianDrawdown*100)]])}`);
 }
 if(snapshots.operations.status==="saved")sections.push(boardReport(snapshots.operations.value.obligations,generatedAt.slice(0,10)).replace(/^# /,"## "));
 if(snapshots.capital.status==="saved"){
  const c=snapshots.capital.value;sections.push(`## Philanthropy and next-generation ventures\n\nCurrency ${c.currency}. Payments are externally evidenced records, not transfers initiated by this platform.\n\n${table(["Request","Year","Kind","Amount","Status","Governance decision","Source"],c.records.map(r=>[r.title,r.year,r.kind,r.requested,r.status,r.decisionId,r.source]))}\n${table(["Date","Request","Type","Amount","Transaction reference","Evidence"],c.payments.map(p=>[p.date,p.recordId,p.kind,p.amount,p.reference,p.evidence]))}`);
  if(f.status==="saved")sections.push(table(["Budget scope","Committed","Paid","Outstanding"],(["Grant","Venture"] as const).map(kind=>{const t=capitalTotals(c,kind,Number(f.value.asOf.slice(0,4)));return [kind,t.committed,t.paid,t.outstanding];})));
 }
 const costBasis=snapshots.book.status==="saved"?{currency:snapshots.book.value.currency,aum:fairValueWealth(snapshots.book.value).grossAum}:f.status==="saved"?{currency:f.value.currency,aum:financials(f.value).aum}:null;
 if(snapshots.services.status==="saved"&&costBasis){
  const service=snapshots.services.value;if(service.currency===costBasis.currency){const costs=serviceCosts(service,costBasis.aum);sections.push(`## Operating model cost comparison\n\n${service.currency}; fixed escalation ${service.inflation}%; AUM growth ${service.aumGrowth}%; assumed tax uplift ${service.taxPercent}%.\n${table(["Year","AUM","SFO cost","MFO cost"],costs.map(r=>[r.year,number(r.assets),number(r.sfo),number(r.mfo)]))}\n${table(["Service","Provider","Owner","Model","Status","Review","Source"],service.services.map(r=>[r.name,r.provider,r.owner,r.model,r.status,r.reviewDue,r.source]))}`);}else sections.push("## Operating costs\n\nCurrency mismatch with Financials; costs not aggregated.");
 }
 if(snapshots.sources.status==="saved")sections.push(`## Constitution source trace\n\n${table(["ID","Assignment / section","Basis","Target / parameter","Review","Excerpt / interpretation"],snapshots.sources.value.sources.map(r=>[r.id,`${r.assignment} / ${r.section}`,r.basis,`${r.target} / ${r.parameter}`,`${r.status} / ${r.reviewer}`,`${r.excerpt} → ${r.interpretation}`]))}`);
 sections.push("## Reproducibility and review\n\nExport the accompanying board input snapshot to retain exact saved inputs. Synthetic labels and missing-source warnings must be resolved or disclosed. Validate units, dates, reconciliation, legal assumptions and ownership before relying on results. Local participant selections and imported approvals are not authenticated signatures.");
 return {markdown:sections.join("\n\n"),snapshot:{schema:1,generatedAt,profile,owners:snapshots}};
}
export function linkedWorkflowObligations(data:OperationsData,store:Pick<Storage,"getItem">,profile:string,due:string):OperationsData{
 const s=officeSnapshots(store,profile);const candidates:Obligation[]=[];
 const base={category:"Linked review",status:"Open" as const,recurrence:"One-off",notes:"",evidence:"",scenario:false,due};
 if(s.governance.status==="saved"){
  const g=s.governance.value;
  for(const d of g.decisions.filter(d=>d.status==="submitted")){
   const rule=g.rules.find(r=>r.id===d.ruleId);const person=g.people.find(p=>p.id===rule?.accountable);
   candidates.push({...base,id:`decision:${d.id}`,workflowId:d.id,title:`Decision review: ${d.title}`,owner:person?.name??"Unassigned",entity:g.business,source:`Governance decision ${d.id}; rule ${d.ruleId}; ${rule?.source??"Missing rule"}`,sourceRoute:"/office/governance"});
  }
  for(const e of g.successionEvents)candidates.push({...base,id:`succession:${e.id}`,workflowId:e.id,title:`Post-transfer review: ${e.description}`,owner:g.people.find(p=>p.id===e.to)?.name??e.to,entity:g.business,source:`Succession event ${e.id}, ${e.at}; ${e.source}`,sourceRoute:"/office/governance",scenario:true});
 }
 if(s.estate.status==="saved")candidates.push({...base,id:"estate:liquidity-review",workflowId:"estate",title:"Estate structure and liquidity review",owner:s.estate.value.ownerId,entity:"Family estate",source:s.estate.value.source,sourceRoute:"/office/estate",scenario:true});
 if(s.statutoryEstate.status==="saved")candidates.push({...base,id:"estate:statutory-liquidity-review",workflowId:"statutory-estate",title:"Statutory estate and liquidity review",owner:s.statutoryEstate.value.owner,entity:"Family estate",source:s.statutoryEstate.value.source,sourceRoute:"/office/estate",scenario:true});
 if(s.services.status==="saved")for(const service of s.services.value.services.filter(s=>s.status!=="Retired"))candidates.push({...base,id:`service:${service.id}`,workflowId:service.id,title:`Service review: ${service.name}`,owner:service.owner,entity:service.provider,source:service.source,sourceRoute:"/office",due:service.reviewDue});
 const ids=new Set(data.obligations.map(r=>r.id));return decodeOperations(JSON.stringify({version:1,obligations:[...data.obligations,...candidates.filter(c=>!ids.has(c.id))]}));
}
