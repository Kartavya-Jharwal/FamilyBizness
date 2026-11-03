import { z } from "zod";
import { selectedProfileId } from "@/features/profiles/session";

export const financeStorageKey = () => `profile:${selectedProfileId() ?? "static-demo"}:family-office:finance:1`;
export function readFinanceScenario() {
  const raw = localStorage.getItem(financeStorageKey());
  return raw ? financeSchema.parse(JSON.parse(raw)) : financeDefaults;
}

const amount = z.number().finite().min(0).max(1e12);
const signedAmount = z.number().finite().min(-1e12).max(1e12);
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => { const d = new Date(`${v}T00:00:00Z`); return Number.isFinite(d.valueOf()) && d.toISOString().slice(0,10) === v; }, "Use a valid calendar date");
const historyDefaults = [{year:2024,opening:28000000,externalFlow:500000,closing:29500000},{year:2025,opening:29500000,externalFlow:0,closing:30000000},{year:2026,opening:30000000,externalFlow:0,closing:31500000}];
export const financeSchema = z.object({
  source: z.string().min(1).max(500), asOf: calendarDate, currency: z.enum(["GBP", "USD", "EUR"]),
  revenue: amount, costs: amount, depreciation: amount, interest: amount, businessTax: amount,
  multiple: z.number().min(0).max(100), businessDebt: amount, businessCash: amount,
  ownership: z.number().min(0).max(100), equities: amount, bonds: amount, property: amount, cash: amount, personalDebt: amount,
  openingCash: amount, investmentIncome: amount, workingCapitalIncrease: amount, capex: amount,
  distributions: amount, philanthropy: amount, ventures: amount, successionReserve: amount,
  target: z.number().min(-50).max(100), realised: z.number().min(-100).max(100), benchmark: z.number().min(-100).max(100),
  inflation: z.number().min(-10).max(50), fees: z.number().min(0).max(20), taxDrag: z.number().min(0).max(50),
  volatility: z.number().min(0).max(100), riskFree: z.number().min(-10).max(50),
  history: z.array(z.object({year:z.number().int().min(1900).max(2200),opening:amount,externalFlow:signedAmount,closing:amount})).max(30).default(historyDefaults),
  returnBusiness:z.number().min(-100).max(100).default(8), returnEquity:z.number().min(-100).max(100).default(7), returnBonds:z.number().min(-100).max(100).default(4), returnProperty:z.number().min(-100).max(100).default(5), returnCash:z.number().min(-100).max(100).default(2),
}).superRefine((p,ctx)=>{
  if(p.realised-p.fees-p.taxDrag < -100) ctx.addIssue({code:"custom",path:["realised"],message:"Return after fees and tax cannot be below −100%; review the additive drag approximation."});
  if(new Set(p.history.map(r=>r.year)).size !== p.history.length) ctx.addIssue({code:"custom",path:["history"],message:"History years must be unique."});
});
export type FinanceInput = z.infer<typeof financeSchema>;
export const financeDefaults: FinanceInput = {
  source: "Fictional composite SFO — replace with source reference", asOf: "2026-10-31", currency: "GBP",
  revenue: 12000000, costs: 8500000, depreciation: 500000, interest: 200000, businessTax: 560000,
  multiple: 6, businessDebt: 4000000, businessCash: 1000000, ownership: 100,
  equities: 5000000, bonds: 3000000, property: 4000000, cash: 1500000, personalDebt: 500000,
  openingCash: 1000000, investmentIncome: 350000, workingCapitalIncrease: 200000, capex: 700000,
  distributions: 800000, philanthropy: 100000, ventures: 150000, successionReserve: 500000,
  target: 6, realised: 7, benchmark: 6.5, inflation: 2.5, fees: 0.6, taxDrag: 1, volatility: 12, riskFree: 3,
  history:historyDefaults, returnBusiness:8, returnEquity:7, returnBonds:4, returnProperty:5, returnCash:2,
};
export function aumHistory(p: FinanceInput) {
  let peak = 0;
  return [...p.history].sort((a,b)=>a.year-b.year).map(row=>{
    peak=Math.max(peak,row.opening,row.closing);
    return {...row, gain:row.closing-row.opening-row.externalFlow, returnPercent:row.opening>0 ? (row.closing-row.opening-row.externalFlow)/row.opening*100 : null, drawdown:peak>0 ? (peak-row.closing)/peak*100 : null};
  });
}
export function returnContributions(p: FinanceInput) {
  const f = financials(p);
  const rows = ([ ["Operating business",f.familyBusiness,p.returnBusiness], ["Public equities",p.equities,p.returnEquity], ["Fixed income",p.bonds,p.returnBonds], ["Property",p.property,p.returnProperty], ["Cash",p.cash,p.returnCash] ] as [string,number,number][]).map(([asset,value,rate])=>({asset,value,rate,weight:f.aum>0 ? value/f.aum*100 : 0, contribution:f.aum>0 ? value/f.aum*rate : 0}));
  const total=rows.reduce((sum,row)=>sum+row.contribution,0);
  return {rows,total,residual:p.realised-total};
}
export function financials(raw: FinanceInput) {
  const p = financeSchema.parse(raw);
  const ebitda = p.revenue - p.costs;
  const enterprise = Math.max(0, ebitda * p.multiple);
  const equity = Math.max(0, enterprise - p.businessDebt + p.businessCash);
  const familyBusiness = equity * p.ownership / 100;
  const liquid = p.equities + p.bonds + p.cash;
  const aum = familyBusiness + liquid + p.property;
  const netWorth = aum - p.personalDebt;
  const profit = ebitda - p.depreciation - p.interest - p.businessTax;
  const attributableProfit = profit * p.ownership / 100;
  const income = attributableProfit + p.investmentIncome;
  const uses = p.distributions + p.philanthropy + p.ventures;
  const operatingCash = (profit + p.depreciation - p.workingCapitalIncrease) * p.ownership / 100 + p.investmentIncome;
  const reinvestment = p.capex * p.ownership / 100;
  const cashChange = operatingCash - reinvestment - uses;
  const closingCash = p.openingCash + cashChange;
  const netReturn = p.realised - p.fees - p.taxDrag;
  return { ebitda, enterprise, equity, familyBusiness, liquid, aum, netWorth, profit, attributableProfit, income, uses, operatingCash, reinvestment, cashChange, closingCash,
    reserveHeadroom: closingCash - p.successionReserve, netReturn,
    realReturn: ((1 + netReturn / 100) / (1 + p.inflation / 100) - 1) * 100,
    sharpe: p.volatility > 0 ? (p.realised - p.riskFree) / p.volatility : null,
    concentration: aum > 0 ? familyBusiness / aum * 100 : null,
    sustainableCash: operatingCash - reinvestment - p.successionReserve,
  };
}
