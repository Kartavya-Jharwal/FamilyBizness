import { beforeEach, expect, it } from "vitest";
import { ensureFamilyOfficeCase, familyOfficeModules } from "./family-office-case";
import { fairValueWealth } from "./finance-book-model";
import { allocationDimensions, allocationGroups, officeExposures, familyFire, liquidFamilyWeights } from "./family-analysis-model";
beforeEach(()=>{localStorage.clear();ensureFamilyOfficeCase(localStorage);});
const inputs=()=>({book:familyOfficeModules().book,investment:{...familyOfficeModules().investments,paths:20}});
it("reconciles every allocation lens to the same non-overlapping AUM perimeter",()=>{
 const {book,investment}=inputs(); investment.securities.find(row=>row.id==="EQ-ENERGY")!.currency="USD"; if(!book.fx.some(row=>row.currency==="USD"))book.fx.push({currency:"USD",opening:.78,closing:.78,average:.78}); const scope=officeExposures(book,investment,"aum");
 for(const [dimension] of allocationDimensions){const groups=allocationGroups(scope.rows,dimension,scope.denominator);expect(groups.reduce((n,row)=>n+row.value,0)).toBeCloseTo(fairValueWealth(book).grossAum,6);expect(groups.reduce((n,row)=>n+row.proportion,0)).toBeCloseTo(100,8);}
 expect(scope.rows.find(row=>row.id.endsWith("-EQ-ENERGY"))?.currency).toBe("USD");
 expect(allocationGroups(scope.rows,"marketDevelopment",scope.denominator).some(row=>row.name==="Developed markets"&&row.value>0)).toBe(true);
 expect(allocationGroups(scope.rows,"continent",scope.denominator).length).toBeGreaterThan(2);
});
it("keeps liabilities negative when changing from gross AUM to net family capital",()=>{
 const {book,investment}=inputs(),scope=officeExposures(book,investment,"net"),groups=allocationGroups(scope.rows,"holding",scope.denominator);
 expect(groups.some(row=>row.value<0)).toBe(true);
 expect(groups.reduce((n,row)=>n+row.value,0)).toBeCloseTo(fairValueWealth(book).fairValue,6);
 expect(groups.reduce((n,row)=>n+row.proportion,0)).toBeCloseTo(100,8);
});
it("uses accessible treasury/listed capital and excludes private/business wealth from family FIRE",()=>{
 const {book,investment}=inputs(),weights=liquidFamilyWeights(book,investment),result=familyFire(book,investment,4,0);
 expect(weights.reduce((n,w)=>n+w,0)).toBeCloseTo(1,10);
 investment.securities.forEach((security,i)=>{if(!security.liquid)expect(weights[i]).toBe(0);});
 expect(result.capital).toBe(fairValueWealth(book).liquidAssets);
 expect(weights[investment.securities.findIndex(s=>s.kind==="cash")]*result.capital).toBeCloseTo(4800000,6);
 expect(result.target).toBe(investment.spend/.04+investment.reserve);
 expect(result.drawRate).toBeCloseTo(investment.spend/result.capital,10);
 expect(result.capital).toBeLessThan(fairValueWealth(book).grossAum);
});
it("reuses seeded securities projections and responds to external family income",()=>{
 const {book,investment}=inputs(),base=familyFire(book,investment,4,0),repeat=familyFire(book,investment,4,0),supported=familyFire(book,investment,4,300000);
 expect(base.projection).toEqual(repeat.projection);
 expect(supported.gap).toBeLessThan(base.gap);
 expect(supported.projection.terminalMedian).toBeGreaterThanOrEqual(base.projection.terminalMedian);
 expect(()=>familyFire(book,investment,0,0)).toThrow(/withdrawal/);
});

it("adds saved model classifications once while preserving user financial edits and classification choices",()=>{
 const key="profile:family-office-composite:family-office:book:1",investmentKey="profile:family-office-composite:family-office:investment:1";
 const book=JSON.parse(localStorage.getItem(key)!),investment=JSON.parse(localStorage.getItem(investmentKey)!);
 book.balances.find((row:{id:string})=>row.id==="H-CASH").amount=4321000;
 investment.securities[0].allocation={platform:"Family-selected custodian",provider:"Selected provider",source:"Board custom classification"};
 localStorage.setItem(key,JSON.stringify(book));localStorage.setItem(investmentKey,JSON.stringify(investment));localStorage.removeItem("profile:family-office-composite:allocation-classifications:v1");ensureFamilyOfficeCase(localStorage);
 const nextBook=JSON.parse(localStorage.getItem(key)!),nextInvestment=JSON.parse(localStorage.getItem(investmentKey)!);
 expect(nextBook.balances.find((row:{id:string})=>row.id==="H-CASH").amount).toBe(4321000);
 expect(nextInvestment.securities[0].allocation.platform).toBe("Family-selected custodian");
 expect(nextInvestment.securities[0].allocation.source).toBe("Board custom classification");
 expect(nextInvestment.securities[0].allocation.geography.reduce((n:number,row:{weight:number})=>n+row.weight,0)).toBe(100);
});
