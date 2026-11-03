import { expect,it } from "vitest";
import { goldenBirdModules } from "./golden-bird-case";
import { caseModules } from "./case-model";
import { operationsKey,decodeOperations } from "./operations-model";
import { createOfficeReviewAction,deriveOfficeFindings,initialOfficeReview,officeReviewKey,officeReviewSchema,reviewRpn } from "./office-review-model";

function memory(){const values=new Map<string,string>();return {values,getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);},removeItem:(k:string)=>{values.delete(k);}};}
function populated(){const store=memory();for(const [id,value] of Object.entries(goldenBirdModules())){const module=caseModules.find(m=>m.id===id);if(module)store.setItem(module.key("p"),JSON.stringify(value));}return store;}

it("derives missing and continuity findings from saved source state without inventing scores",()=>{
  const missing=deriveOfficeFindings(memory(),"p");expect(missing.map(f=>f.id)).toContain("book-missing");expect(missing.map(f=>f.id)).toContain("sources-missing");
  const findings=deriveOfficeFindings(populated(),"p");expect(findings.some(f=>f.id.startsWith("continuity-"))).toBe(true);expect(findings.some(f=>f.id==="book-invalid")).toBe(false);
  expect(reviewRpn({})).toBeNull();expect(reviewRpn({severity:5,occurrence:2})).toBeNull();expect(reviewRpn({severity:5,occurrence:2,detection:3})).toBe(30);
});

it("finds forecast reserve breaches and flagged host activity evidence",()=>{
  const store=populated(),key="profile:p:family-office:book:1",book=JSON.parse(store.getItem(key)!);book.forecast[0].operating=1e9;store.setItem(key,JSON.stringify(book));
  const findings=deriveOfficeFindings(store,"p",{count:10,needsReview:2,asOf:"2026-11-03",source:"Host activity records"});
  expect(findings.some(f=>f.id==="forecast-reserve-gap"&&f.status==="breach")).toBe(true);expect(findings.find(f=>f.id==="activities-review")?.detail).toContain("2 of 10");
});

it("creates one please-fix action in the existing register and retains its evidence on repeated review",()=>{
  const store=memory(),finding=deriveOfficeFindings(store,"p").find(f=>f.id==="sources-missing")!;
  const review={findingId:finding.id,owner:"Family technician",evidence:"Please link the adopted constitution clauses",severity:3,occurrence:2,detection:4};
  const first=createOfficeReviewAction(store,"p",initialOfficeReview,finding,review);const operations=decodeOperations(store.getItem(operationsKey("p"))!);expect(operations.obligations[0].title).toBe("please fix");
  const second=createOfficeReviewAction(store,"p",first.state,finding,{...review,evidence:"Review record updated"});
  expect(second.existing).toBe(true);expect(decodeOperations(store.getItem(operationsKey("p"))!).obligations).toHaveLength(1);
  operations.obligations[0].status="Complete";operations.obligations[0].evidence="Source clauses adopted";store.setItem(operationsKey("p"),JSON.stringify(operations));
  const recurring=createOfficeReviewAction(store,"p",second.state,finding,review);
  expect(recurring.existing).toBe(false);const saved=decodeOperations(store.getItem(operationsKey("p"))!);expect(saved.obligations).toHaveLength(2);expect(saved.obligations[0].evidence).toBe("Source clauses adopted");expect(officeReviewSchema.parse(JSON.parse(store.getItem(officeReviewKey("p"))!)).reviews[0].actionId).toBe(recurring.actionId);
});

it("rolls back an appended action if review metadata cannot be saved",()=>{
  const store=memory(),finding=deriveOfficeFindings(store,"p")[0];let rejected=false;
  const failing={...store,setItem:(k:string,v:string)=>{if(k===officeReviewKey("p")&&!rejected){rejected=true;throw new Error("quota");}store.setItem(k,v);}};
  expect(()=>createOfficeReviewAction(failing,"p",initialOfficeReview,finding,{findingId:finding.id,owner:"Associate",evidence:"Review exception"})).toThrow("quota");expect(store.values.size).toBe(0);
});
