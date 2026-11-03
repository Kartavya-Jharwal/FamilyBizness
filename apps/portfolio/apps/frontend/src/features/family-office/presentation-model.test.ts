import {describe,it,expect} from "vitest";
import {wealthComposition,loadPresentation} from "./presentation-model";
import {financeDefaults} from "./finance-model";
describe("presentation data boundary",()=>{
 it("shocks public equities only and preserves the source inputs",()=>{const before=JSON.stringify(financeDefaults);const result=wealthComposition(financeDefaults,-20);expect(result.change).toBe(-1000000);expect(result.rows[0].value).toBe(18000000);expect(JSON.stringify(financeDefaults)).toBe(before);});
 it("does not hide damaged saved data behind fictional defaults",()=>{expect(()=>loadPresentation({getItem:()=>"not valid JSON"},"demo")).toThrow();});
 it("provides a consistent default scene without writing storage",()=>{const state=loadPresentation({getItem:()=>null},"demo");expect(state.sources).toEqual([]);expect(state.governance.people.reduce((s,p)=>s+p.ownership,0)).toBe(100);});
});
