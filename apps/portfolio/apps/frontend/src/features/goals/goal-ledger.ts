import type { Goal, SaveUpPreviewInputDTO, SaveUpOverviewDTO } from "@/lib/types";
/** Goal targets are commitments, not expenditure: never count them as transactions. */
export function normaliseGoal(goal: Goal): Goal {
 const target = Math.max(0, goal.targetAmount ?? goal.summaryTargetAmount ?? 0);
 const current = Math.max(0, goal.summaryCurrentValue ?? 0);
 return { ...goal, targetAmount: target, summaryTargetAmount: target, summaryCurrentValue: current, summaryProgress: target ? Math.min(1,current/target) : 0, statusHealth: current >= target && target > 0 ? "on_track" : goal.statusHealth, updatedAt: new Date().toISOString() };
}
export function goalCommitments(goals: Goal[]) {
 const active = goals.filter(g => g.statusLifecycle !== "archived");
 return { target: active.reduce((s,g)=>s+(g.targetAmount ?? g.summaryTargetAmount ?? 0),0), funded: active.reduce((s,g)=>s+(g.summaryCurrentValue ?? 0),0), remaining: active.reduce((s,g)=>s+Math.max(0,(g.targetAmount ?? g.summaryTargetAmount ?? 0)-(g.summaryCurrentValue ?? 0)),0) };
}
export function previewSavings(p: SaveUpPreviewInputDTO, now = new Date()): SaveUpOverviewDTO {
 for (const value of [p.currentValue,p.targetAmount,p.monthlyContribution,p.expectedAnnualReturn]) if (!Number.isFinite(value)) throw new Error("Enter finite planning inputs.");
 if (p.expectedAnnualReturn <= -1 || p.monthlyContribution < 0 || p.currentValue < 0 || p.targetAmount < 0) throw new Error("Invalid savings assumptions.");
 const end = p.targetDate ? new Date(p.targetDate) : now;
 const months = Math.max(0, Math.min(1200, Math.ceil((end.getTime()-now.getTime())/(365.25/12*86400000)) || 0));
 const rate = Math.pow(1+p.expectedAnnualReturn,1/12)-1;
 let value=p.currentValue; let completion: string|null = value>=p.targetAmount ? now.toISOString().slice(0,10):null;
 const trajectory = Array.from({length:months+1},(_,month)=>{
  if(month) value=value*(1+rate)+p.monthlyContribution;
  const date=new Date(now); date.setUTCMonth(date.getUTCMonth()+month);
  if(!completion && value>=p.targetAmount) completion=date.toISOString().slice(0,10);
  return {date:date.toISOString().slice(0,10),nominal:value,optimistic:value,pessimistic:value,target:p.targetAmount};
 });
 const growth=Math.pow(1+rate,months),annuity=rate ? (growth-1)/rate : months;
 return {currentValue:p.currentValue,targetAmount:p.targetAmount,progress:p.targetAmount?Math.min(1,p.currentValue/p.targetAmount):0,health:value>=p.targetAmount?"on_track":"off_track",projectedValueAtTargetDate:value,requiredMonthlyContribution:annuity?Math.max(0,(p.targetAmount-p.currentValue*growth)/annuity):Math.max(0,p.targetAmount-p.currentValue),projectedCompletionDate:completion,trajectory};
}
