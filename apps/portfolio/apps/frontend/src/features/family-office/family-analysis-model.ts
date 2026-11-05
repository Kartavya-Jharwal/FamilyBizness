/** Reporting adapter over the existing book and securities engines. No second ledger. */
import { projectPreparedOffice } from "@/adapters/prepared-office-portfolio";
import { fairValueWealth, cashForecast, type FinanceBook } from "./finance-book-model";
import { portfolioStats, projectSecurities, type InvestmentInput } from "./investment-model";
import type { AllocationMetadata } from "./allocation-metadata";
import { resolveFundedProgress, resolvePortfolioDrawRate, deriveRetirementReadiness } from "@/features/goals/retirement-planner/lib/dashboard-math";
export const allocationDimensions = [
  ["platform", "By platform"], ["currency", "By currency"], ["assetClass", "By asset class"], ["holding", "By holding"], ["sector", "By sector"], ["continent", "By continent"], ["marketRegion", "By market region"], ["marketDevelopment", "Developed / other markets"], ["accountType", "By account type"], ["provider", "By ETF provider"],
] as const;
export type AllocationDimension = typeof allocationDimensions[number][0];
export type ExposureRow = Record<AllocationDimension, string> & { id: string; value: number; classification: string; entity: string; geography?:AllocationMetadata["geography"] };
function classifications(metadata:AllocationMetadata|undefined,platform:string,accountType:string){const geography=metadata?.geography;return {platform:metadata?.platform??platform,provider:metadata?.provider??"Provider not recorded",accountType:metadata?.accountType??accountType,geography,continent:geography?.length===1?geography[0].continent:geography?.length?"Multiple continents":"Geography not recorded",marketRegion:geography?.length===1?geography[0].region:geography?.length?"Multiple regions":"Region not recorded",marketDevelopment:geography?.length===1?geography[0].marketDevelopment:"Other / unclassified markets",classification:metadata?.source??"Classification source not recorded"};}
export function officeExposures(book: FinanceBook, investment: InvestmentInput, basis: "aum" | "net" = "aum") {
  const projection=projectPreparedOffice(book,investment),wealth=projection.wealth;
  const rows:ExposureRow[]=projection.positions.map(position=>{const record=book.balances.find(row=>row.id===position.sourceRecordId)!,business=record.id===book.valuationAccountId;return {id:position.id,value:position.value,entity:book.entities.find(e=>e.id===position.entity)!.name,currency:position.currency,holding:position.name,sector:position.sector,assetClass:business?"Operating business":position.kind==="cash"?"Cash":position.kind==="equity"?"Public equities":position.kind==="fixed"?"Fixed income":position.kind==="private"?"Private assets":"Other assets",...classifications(position.allocation,position.kind==="cash"?"Treasury bank not recorded":"Custodian not recorded",position.kind==="cash"?"Treasury account":"Direct ownership")};});
  if (basis === "net") for (const liability of book.balances.filter(r => book.wealthOwnerIds.includes(r.entity) && r.kind === "liability")) rows.push({id:liability.id,value:-liability.amount*book.fx.find(f=>f.currency===liability.currency)!.closing,entity:book.entities.find(e=>e.id===liability.entity)!.name,currency:liability.currency,assetClass:"Liabilities",holding:liability.account,sector:"Financing liabilities",...classifications(liability.allocation,"Borrowing facility not recorded","Debt account")});
  return { rows, denominator: basis === "aum" ? wealth.grossAum : wealth.fairValue, wealth };
}
export function allocationGroups(rows: ExposureRow[], dimension: AllocationDimension, denominator: number) {
  const grouped = new Map<string, number>();
  for (const row of rows) {
    if(row.geography?.length && ["continent","marketRegion","marketDevelopment"].includes(dimension))for(const region of row.geography){const label=dimension==="continent"?region.continent:dimension==="marketRegion"?region.region:region.marketDevelopment;grouped.set(label,(grouped.get(label)??0)+row.value*region.weight/100);}
    else grouped.set(row[dimension],(grouped.get(row[dimension])??0)+row.value);
  }
  return [...grouped].map(([name, value]) => ({ name, value, proportion: denominator > 0 ? value / denominator * 100 : 0 })).sort((a,b) => b.value-a.value);
}
export function liquidFamilyWeights(book: FinanceBook, p: InvestmentInput) {
  const projection=projectPreparedOffice(book,p),capital=projection.wealth.liquidAssets,cash=projection.positions.filter(row=>row.kind==="cash").reduce((n,row)=>n+row.value,0),cashSecurities=p.securities.filter(s=>s.kind==="cash"),cashWeight=cashSecurities.reduce((n,s)=>n+s.current,0);
  const weights=p.securities.map(s=>s.kind==="cash"?cash/capital*(cashWeight>0?s.current/cashWeight:1/cashSecurities.length):s.liquid?projection.positions.filter(row=>row.id.endsWith(`-${s.id}`)&&book.balances.find(r=>r.id===row.sourceRecordId)?.category==="listed").reduce((n,row)=>n+row.value,0)/capital:0);
  if(capital<=0||Math.abs(weights.reduce((n,w)=>n+w,0)-1)>1e-6)throw Error("Map treasury and liquid investment mandates before running family FIRE.");
  return weights;
}
export function familyFire(book: FinanceBook, p: InvestmentInput, withdrawalPercent: number, annualIncome: number) {
  if (!Number.isFinite(withdrawalPercent) || withdrawalPercent <= 0 || withdrawalPercent > 20 || annualIncome < 0 || !Number.isFinite(annualIncome)) throw Error("Use a positive withdrawal policy up to 20% and nonnegative recurring income.");
  const capital = fairValueWealth(book).liquidAssets, netSpending = Math.max(0,p.spend-annualIncome), target = netSpending/(withdrawalPercent/100)+p.reserve, weights=liquidFamilyWeights(book,p);
  const input={...p,initial:capital,spend:netSpending}, projection=projectSecurities(input,weights), stats=portfolioStats(p,weights), funded=resolveFundedProgress(undefined,capital,target);
  const fiYear=projection.series.find(row=>row.median>=target)?.year??null;
  const readiness=deriveRetirementReadiness({overview:{requiredCapitalReachable:true,successStatus:projection.reserveSuccess>=.9?"success":"at-risk",failureAge:projection.series.find(row=>row.median<=0)?.year},plannerMode:"fire",isFinanciallyIndependent:capital>=target,effectiveFiAge:fiYear,desiredAge:0,horizonAge:p.years});
  const drawRate=resolvePortfolioDrawRate({requiredCapitalReachable:true,portfolioValueAtAge:capital,grossWithdrawalAtAge:netSpending,annualIncomeAtAge:annualIncome,annualSpendingAtAge:p.spend,portfolioEndAtAge:capital});
  return {capital,netSpending,target,weights,projection,stats,funded,fiYear,readiness,drawRate,gap:Math.max(0,target-capital)};
}
export function philanthropyAllocation(book: FinanceBook) {
  const rows=cashForecast(book).filter(r=>book.wealthOwnerIds.includes(r.entity)), first=rows[0]?.month.slice(0,4);
  return rows.filter(r=>r.month.startsWith(first??"none")).reduce((n,r)=>n+r.philanthropy*book.fx.find(f=>f.currency===r.currency)!.closing,0);
}
