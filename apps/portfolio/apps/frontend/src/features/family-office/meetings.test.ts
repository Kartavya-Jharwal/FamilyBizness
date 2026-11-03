import { expect, it } from "vitest";
import { boardReport, decodeOperations, initialOperations, operationsKey, sampleFamilyMeetings, scheduleOccurrences, validateObligation, weekRows } from "./operations-model";
it("keeps meetings and tasks in the same profile register and week",()=>{
 const records={version:1 as const,obligations:[...initialOperations("2026-11-02").obligations,...sampleFamilyMeetings("2026-11-02")]};
 const saved=decodeOperations(JSON.stringify(records));
 expect(saved.obligations).toHaveLength(6);
 expect(weekRows(saved.obligations,"2026-11-02").filter(r=>r.meeting)).toHaveLength(2);
 expect(operationsKey("patriarch")).not.toBe(operationsKey("associate"));
 expect(boardReport(saved.obligations,"2026-11-02")).toContain("Europe/London");
 expect(boardReport(saved.obligations,"2026-11-02")).toContain("founder, successor, steward");
});
it("validates participants, times and zones before any import is accepted",()=>{
 const row=sampleFamilyMeetings("2026-11-02")[0];
 expect(validateObligation(row)).toBeNull();
 for(const meeting of [{...row.meeting!,end:"09:00"},{...row.meeting!,attendees:[]},{...row.meeting!,timeZone:"Bad/Zone"},{...row.meeting!,attendees:["founder","founder"]}]) {
  expect(()=>decodeOperations(JSON.stringify({version:1,obligations:[{...row,meeting}]}))).toThrow();
 }
});
it("retains meeting details when generating recurring occurrences",()=>{
 const row={...sampleFamilyMeetings("2026-11-02")[0],schedule:{frequency:"Weekly" as const,until:"2026-11-30"}};
 const result=scheduleOccurrences({version:1,obligations:[row]},"2026-11-18");
 expect(result.obligations.length).toBeGreaterThan(1);
 expect(result.obligations[1].meeting).toEqual(row.meeting);
});
