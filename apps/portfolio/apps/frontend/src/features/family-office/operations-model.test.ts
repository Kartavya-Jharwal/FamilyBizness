import { describe, expect, it } from "vitest";
import { boardReport, decodeOperations, initialOperations, monday, operationsMetrics, shiftDate, validDate, validateObligation, weekRows, scheduleOccurrences, occurrenceDate, cancelFutureOccurrences } from "./operations-model";

describe("office operations", () => {
  it("materialises month-end recurrence without drift, duplicating or losing evidence",()=>{
    expect(occurrenceDate("2028-01-31","Monthly",1)).toBe("2028-02-29");
    expect(occurrenceDate("2028-01-31","Monthly",2)).toBe("2028-03-31");
    const root={...initialOperations("2028-01-31").obligations[0],due:"2028-01-31",schedule:{frequency:"Monthly" as const,until:"2028-06-30"}};
    const first=scheduleOccurrences({version:1,obligations:[root]},"2028-03-31");
    expect(first.obligations.map(r=>r.due)).toEqual(["2028-01-31","2028-02-29","2028-03-31"]);
    first.obligations[1].status="Complete";first.obligations[1].evidence="Signed minutes";
    const second=scheduleOccurrences(first,"2028-04-30");expect(second.obligations).toHaveLength(4);expect(second.obligations[1].evidence).toBe("Signed minutes");
    const stopped=cancelFutureOccurrences(second,root.id,"2028-02-01");expect(stopped.obligations[1].status).toBe("Complete");expect(stopped.obligations[2].status).toBe("Cancelled");expect(scheduleOccurrences(stopped,"2028-12-31").obligations).toHaveLength(4);
  });
  it("keeps date-only weeks stable across month, year and DST boundaries", () => {
    expect(monday("2026-11-01")).toBe("2026-10-26");
    expect(shiftDate("2026-12-31", 1)).toBe("2027-01-01");
    expect(shiftDate("2026-03-29", 1)).toBe("2026-03-30");
    expect(validDate("2026-02-29")).toBe(false);
    expect(validDate("2028-02-29")).toBe(true);
  });
  it("includes the start and excludes next week's start", () => {
    const row = initialOperations("2026-11-02").obligations[0];
    const rows = [ { ...row, id: "next", due: "2026-11-09" }, { ...row, id: "last", due: "2026-11-08" }, { ...row, id: "first", due: "2026-11-02" } ];
    expect(weekRows(rows, "2026-11-02").map(item => item.id)).toEqual(["first", "last"]);
  });
  it("excludes scenarios and cancelled/completed records from overdue count", () => {
    const data = initialOperations("2026-11-02");
    expect(operationsMetrics(data.obligations, "2026-11-02")).toEqual({ open: 3, overdue: 1, complete: 0, scenarios: 1 });
    data.obligations[1].status = "Cancelled";
    expect(operationsMetrics(data.obligations, "2026-11-02").overdue).toBe(0);
  });
  it("requires completion evidence and rejects invalid imports without partial acceptance", () => {
    const data = initialOperations("2026-11-02");
    expect(decodeOperations(JSON.stringify(data))).toEqual(data);
    data.obligations[0].status = "Complete";
    expect(validateObligation(data.obligations[0])).toContain("evidence");
    expect(() => decodeOperations(JSON.stringify(data))).toThrow();
    data.obligations[0].evidence = "Minutes reviewed";
    expect(() => decodeOperations(JSON.stringify(data))).not.toThrow();
    data.obligations[0].sourceRoute = "javascript:alert(1)";
    expect(() => decodeOperations(JSON.stringify(data))).toThrow();
  });
  it("rejects duplicate IDs and retains evidence/source/scenario labels in reports", () => {
    const data = initialOperations("2026-11-02");
    const report = boardReport(data.obligations, "2026-11-02");
    expect(report).toContain("SCENARIO ONLY");
    expect(report).toContain("Illustrative reporting cadence");
    data.obligations.push(data.obligations[0]);
    expect(() => decodeOperations(JSON.stringify(data))).toThrow();
  });
  it("rejects unknown or traversing workspace links and impossible dates", () => {
    const data = initialOperations("2026-11-02");
    for (const path of ["/office/../../settings", "/office/missing", "//example.com", "/office/finance?execute=true"]) {
      data.obligations[0].sourceRoute = path;
      expect(() => decodeOperations(JSON.stringify(data))).toThrow();
    }
    data.obligations[0].sourceRoute = "/office/sources";
    data.obligations[0].due = "2026-04-31";
    expect(() => decodeOperations(JSON.stringify(data))).toThrow();
    data.obligations[0].due = "2026-04-30";
    expect(() => decodeOperations(JSON.stringify(data))).not.toThrow();
  });
});
