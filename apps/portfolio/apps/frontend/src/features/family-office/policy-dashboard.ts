import { evaluateRules, type EffectivePolicy } from "./policy-engine";
import { portfolioStats, type InvestmentInput } from "./investment-model";
export type PolicySignal = { id: string; label: string; light: "green" | "amber" | "red"; state: string; observed: string; requirement: string; sourceId?: string };
export function investmentPolicyFacts(p: InvestmentInput) {
 return { currency: p.currency, cashPercent: p.securities.filter(s => s.kind === "cash").reduce((n,s) => n+s.current,0), equityPercent: p.securities.filter(s => s.kind === "equity").reduce((n,s) => n+s.current,0), illiquidPercent: p.securities.filter(s => !s.liquid).reduce((n,s) => n+s.current,0), reserveAmount: p.reserve, sectors: p.securities.filter(s => s.current > 0).map(s => s.sector) };
}
export function policyDashboardSignals(policy: EffectivePolicy | null, p: InvestmentInput, reviewError = ""): PolicySignal[] {
 if (!policy || reviewError) return [{id:"policy-review",label:"Investment mandate",light:"amber",state:"Review required",observed:reviewError ? "Source review needed" : "No active mandate",requirement:reviewError || "Activate the reviewed family investment policy"}];
 const labels: Record<string,string> = {"cash-minimum":"Cash allocation","equity-maximum":"Public equities","illiquid-maximum":"Illiquid assets","reserve-minimum":"Succession reserve","excluded-sector":"Values screen"};
 const findings = evaluateRules(policy,investmentPolicyFacts(p),["cash-minimum","equity-maximum","illiquid-maximum","reserve-minimum","excluded-sector"]);
 const signals:PolicySignal[] = findings.map(f => {
  const rule = policy.rules.find(r => r.id===f.ruleId)!;
  const atLimit = f.status === "pass" && f.kind !== "excluded-sector" && Math.abs(Number(f.observed)-rule.value) <= Math.max(.1,rule.value*.1);
  const light = f.status === "breach" ? "red" : f.status === "missing" || atLimit ? "amber" : "green";
  const observed = f.kind === "excluded-sector" ? f.status === "pass" ? "Screen applied" : "Review exposures" : f.kind === "reserve-minimum" ? new Intl.NumberFormat("en-GB",{style:"currency",currency:policy.currency,maximumFractionDigits:0}).format(Number(f.observed)) : `${f.observed}%`;
  return {id:f.ruleId,label:labels[f.kind]??f.kind,light,state:f.status === "breach" ? "Outside mandate" : f.status === "missing" ? "Data required" : atLimit ? "Near limit" : "Within mandate",observed:f.status === "missing" ? "Unavailable" : observed,requirement:f.requirement,sourceId:f.sourceId};
 });
 const risk = portfolioStats(p,p.securities.map(s=>s.current/100)).volatility;
 signals.push({id:"portfolio-risk",label:"Portfolio volatility",light:risk>p.riskMax?"red":risk>=p.riskMax*.9?"amber":"green",state:risk>p.riskMax?"Above risk limit":risk>=p.riskMax*.9?"Near limit":"Within mandate",observed:`${risk.toFixed(1)}%`,requirement:`Annual volatility ≤ ${p.riskMax}%`,sourceId:"FO-IPS-MANDATE"});
 return signals;
}
