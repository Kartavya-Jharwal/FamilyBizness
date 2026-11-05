import { beforeEach, expect, it } from "vitest";
import { ensureFamilyOfficeCase } from "./family-office-case";
import { familyOfficeCaseId } from "./family-office-constitution";
import { sendPleaseFix, updatePleaseFix, repairRequests, assignPleaseFix, guardPleaseFixChanges } from "./please-fix-model";
import { operationsKey, decodeOperations } from "./operations-model";
import { sourceKey } from "./source-model";
beforeEach(()=>{localStorage.clear();ensureFamilyOfficeCase(localStorage);});
it("routes one literal request into the existing operations register and enforces the assigned role and completion evidence",()=>{
 const id=familyOfficeCaseId;
 expect(()=>sendPleaseFix(localStorage,id,"office-role-4","FO-INSTRUMENTS","Associate","")).toThrow(/Patriarch/);
 const sent=sendPleaseFix(localStorage,id,"office-role-0","FO-INSTRUMENTS","Associate","");
 expect(repairRequests(localStorage,id).find(row=>row.id===sent.actionId)?.title).toBe("please fix");
 expect(sendPleaseFix(localStorage,id,"office-role-0","FO-INSTRUMENTS","Associate","").actionId).toBe(sent.actionId);
 expect(()=>updatePleaseFix(localStorage,id,"office-role-5",sent.actionId,"accept","")).toThrow(/assigned/);
 updatePleaseFix(localStorage,id,"office-role-4",sent.actionId,"accept","");
 expect(()=>updatePleaseFix(localStorage,id,"office-role-4",sent.actionId,"resolve","")).toThrow(/evidence/);
 updatePleaseFix(localStorage,id,"office-role-4",sent.actionId,"resolve","English-law instrument cross-reference reviewed and corrected in instrument schedule.");
 expect(repairRequests(localStorage,id).find(row=>row.id===sent.actionId)?.status).toBe("Complete");
 updatePleaseFix(localStorage,id,"office-role-0",sent.actionId,"reopen","");
 expect(repairRequests(localStorage,id).find(row=>row.id===sent.actionId)?.status).toBe("Open");
 assignPleaseFix(localStorage,id,"office-role-0",sent.actionId,"Family technician");
 expect(repairRequests(localStorage,id).find(row=>row.id===sent.actionId)?.owner).toBe("Associate / family technician");
 expect(()=>updatePleaseFix(localStorage,id,"office-role-5",sent.actionId,"accept","")).toThrow(/assigned/);
});
it("blocks closing an out-of-date clause snapshot until the current clause is reviewed again",()=>{
 const id=familyOfficeCaseId,sent=sendPleaseFix(localStorage,id,"office-role-0","FO-INSTRUMENTS","Family technician","");
 const raw=JSON.parse(localStorage.getItem(sourceKey(id))!);raw.sources.find((row:{id:string})=>row.id==="FO-INSTRUMENTS").interpretation+=" Record current instrument schedules.";localStorage.setItem(sourceKey(id),JSON.stringify(raw));
 expect(()=>updatePleaseFix(localStorage,id,"office-role-6",sent.actionId,"resolve","Reviewed corrected linkage")).toThrow(/changed/);
 sendPleaseFix(localStorage,id,"office-role-0","FO-INSTRUMENTS","Family technician","Reissued against corrected source clause");
 updatePleaseFix(localStorage,id,"office-role-6",sent.actionId,"resolve","Reviewed corrected linkage");
 expect(repairRequests(localStorage,id).find(row=>row.id===sent.actionId)?.evidence).toContain("Reviewed");
});

it("blocks generic ERP and bulk edits from changing, completing or deleting repair requests",()=>{
 const id=familyOfficeCaseId,sent=sendPleaseFix(localStorage,id,"office-role-0","FO-INSTRUMENTS","Associate","");
 const before=decodeOperations(localStorage.getItem(operationsKey(id))!);
 expect(()=>guardPleaseFixChanges(before,structuredClone(before))).not.toThrow();
 for(const action of ["complete","assign","delete"]){const after=structuredClone(before),row=after.obligations.find(item=>item.id===sent.actionId)!;if(action==="complete"){row.status="Complete";row.evidence="Bulk completion";}else if(action==="assign")row.owner="Family technician";else after.obligations=after.obligations.filter(item=>item.id!==sent.actionId);expect(()=>guardPleaseFixChanges(before,after)).toThrow(/Family constitution/);}
});
