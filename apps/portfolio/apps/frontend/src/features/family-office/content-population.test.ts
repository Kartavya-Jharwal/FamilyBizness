import { describe, expect, it } from "vitest";
import { annualOfficeDiary, decodeOperations } from "./operations-model";
import { initialIht, ihtSchema } from "./estate-iht-model";
describe("illustrative office content", () => {
 it("provides valid, distinct meetings in December and the following January", () => {
  const rows = annualOfficeDiary("2026-11-06");
  expect(decodeOperations(JSON.stringify({version:1,obligations:rows})).obligations).toHaveLength(112);
  expect(rows.filter(row=>row.due.startsWith("2026-12"))).toHaveLength(8);
  expect(rows.filter(row=>row.due.startsWith("2027-01"))).toHaveLength(8);
  expect(rows.every(row=>row.meeting && row.source.includes("Illustrative"))).toBe(true);
 });
 it("shows gift examples without claiming an exemption", () => {
  const data = ihtSchema.parse(initialIht());
  expect(data.gifts).toHaveLength(2);
  expect(data.gifts.every(g=>g.exempt===0 && g.date<data.deathDate)).toBe(true);
 });
});
