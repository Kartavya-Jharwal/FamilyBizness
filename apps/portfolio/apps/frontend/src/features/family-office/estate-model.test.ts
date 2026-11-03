import { describe, expect, it } from "vitest";
import { calculateEstate, initialEstate } from "./estate-model";
describe("estate liquidity stress model",()=>{
  it("uses the owner's economic share and separates funding from estate assets",()=>{
    const input=initialEstate(); const result=calculateEstate(input,60);
    expect(result.businessInterest).toBe(6000000);
    expect(result.netEstate).toBe(6750000);
    expect(result.assumedTax).toBe(2025000);
    expect(result.eventNeed).toBe(2125000);
    expect(result.available).toBe(790000);
    expect(result.shortfall).toBe(1335000);
    expect(result.additionalMonthlySaving).toBe(55625);
    expect(calculateEstate({...input,cashAvailable:900000},60).netEstate).toBe(result.netEstate);
  });
  it("handles no tax need and immediate succession without division by zero",()=>{
    expect(calculateEstate({...initialEstate(),assumedTaxRate:0,costs:0},60).coverage).toBeNull();
    expect(calculateEstate({...initialEstate(),monthsToEvent:0},60).additionalMonthlySaving).toBeNull();
  });
  it("does not produce a tax refund or negative liquidity for excess liabilities and reserves",()=>{
    const result=calculateEstate({...initialEstate(),liabilities:20000000,reservedSpending:20000000},60);
    expect(result.netEstate).toBe(0); expect(result.assumedTax).toBe(0); expect(result.available).toBe(0);
  });
  it("rejects malformed numerical and ownership inputs",()=>{
    expect(()=>calculateEstate(initialEstate(),101)).toThrow();
    expect(()=>calculateEstate({...initialEstate(),assumedTaxRate:Infinity},60)).toThrow();
    expect(()=>calculateEstate({...initialEstate(),monthsToEvent:1.5},60)).toThrow();
    expect(()=>calculateEstate({...initialEstate(),businessValue:-1},60)).toThrow();
  });
});
