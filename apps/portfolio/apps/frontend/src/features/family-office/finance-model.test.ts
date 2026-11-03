import { describe, expect, it } from "vitest";
import { aumHistory, financeDefaults, financeSchema, financials, returnContributions } from "./finance-model";

describe("family financial planning",()=>{
  it("counts the net business equity once and reconciles net worth and cash",()=>{
    const f=financials(financeDefaults);
    expect(f.equity).toBe(18000000); expect(f.aum).toBe(31500000);
    expect(f.aum-financeDefaults.personalDebt-f.netWorth).toBe(0);
    expect(f.closingCash).toBe(financeDefaults.openingCash+f.operatingCash-f.reinvestment-f.uses);
    expect(f.reserveHeadroom).toBe(f.closingCash-financeDefaults.successionReserve);
  });
  it("attributes business economics pro rata without scaling family investments",()=>{
    const f=financials({...financeDefaults,ownership:50});
    expect(f.familyBusiness).toBe(9000000); expect(f.aum).toBe(22500000);
    expect(f.attributableProfit).toBe(financials(financeDefaults).profit/2);
  });
  it("leaves Sharpe undefined at zero volatility and applies Fisher real-return formula",()=>{
    const f=financials({...financeDefaults,volatility:0}); expect(f.sharpe).toBeNull();
    expect(f.realReturn).toBeCloseTo((1.054/1.025-1)*100);
  });
  it("rejects invalid dates and economically impossible additive net returns",()=>{
    expect(()=>financeSchema.parse({...financeDefaults,asOf:"2026-02-30"})).toThrow();
    expect(()=>financeSchema.parse({...financeDefaults,realised:-100,fees:1})).toThrow();
  });
  it("separates cash-flow growth from investment gains and measures snapshot drawdown",()=>{
    const rows=aumHistory({...financeDefaults,history:[{year:2025,opening:100,externalFlow:50,closing:140},{year:2026,opening:140,externalFlow:0,closing:126}]});
    expect(rows[0].returnPercent).toBe(-10); expect(rows[1].drawdown).toBeCloseTo(10);
  });
  it("contributions sum to modelled return and expose supplied-return residual",()=>{
    const a=returnContributions(financeDefaults); expect(a.rows.reduce((sum,r)=>sum+r.weight,0)).toBeCloseTo(100);
    expect(a.total+a.residual).toBeCloseTo(financeDefaults.realised);
  });
});
