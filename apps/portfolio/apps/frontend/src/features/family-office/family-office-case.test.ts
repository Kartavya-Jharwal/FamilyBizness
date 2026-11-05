import { expect, it } from "vitest";
import { familyOfficeModules, ensureFamilyOfficeCase } from "./family-office-case";
import { familyOfficeCaseId, familyOfficeConstitution, familyOfficeSources } from "./family-office-constitution";
import { workspaceForProfile } from "@/features/profiles/profile-workspace";
import { caseModules, exportCase, importCase } from "./case-model";
import { consolidateBook } from "./finance-book-model";
import { evaluateDistribution } from "./golden-bird-rules";
import { constitutionTraceCurrent } from "./constitution-pack-model";
import { governanceSchema } from "./governance-model";

function storage() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); }, removeItem: (key: string) => { data.delete(key); } };
}
it("opens different office personas on one saved charter while preserving archived workspaces", () => {
  expect(workspaceForProfile("office-role-0")).toBe(workspaceForProfile("office-role-6"));
  expect(workspaceForProfile("office-member-visitor")).toBe(familyOfficeCaseId);
  expect(workspaceForProfile("golden-bird")).toBe("golden-bird");
  const store = storage(); ensureFamilyOfficeCase(store);
  const key = caseModules.find(m => m.id === "case")!.key(familyOfficeCaseId);
  const edited = { ...JSON.parse(store.getItem(key)!), preparedBy: "Family technician review" };
  store.setItem(key, JSON.stringify(edited)); ensureFamilyOfficeCase(store);
  expect(JSON.parse(store.getItem(key)!).preparedBy).toBe("Family technician review");
});
it("exports and restores a reconciled GBP composite without adding donor business balance sheets", () => {
  const store = storage(); ensureFamilyOfficeCase(store);
  const pack = exportCase(store, familyOfficeCaseId); const next = storage();
  importCase(JSON.stringify(pack), next, "restored");
  const modules = familyOfficeModules();
  expect(consolidateBook(modules.book).errors).toEqual([]);
  expect(modules.book.entities).toHaveLength(2);
  expect(modules.case.basis).toBe("composite-assignment");
  expect(modules.governance.people.reduce((n, p) => n + p.voting, 0)).toBe(100);
  expect(constitutionTraceCurrent(next, "restored", "FO-CASH")).toBe(true);
  expect(constitutionTraceCurrent(next, "restored", "FO-VOTES")).toBe(true);
});
it("keeps the cash basis and selected voting rule instead of stacking incompatible donor thresholds", () => {
  const modules = familyOfficeModules();
  const result = evaluateDistribution(modules["constitution-distribution"], familyOfficeConstitution.parameters);
  expect(result.blockers).toEqual([]);
  expect(result.allocations.permittedDividends).toBeCloseTo(result.distributableCash * .3);
  expect(familyOfficeConstitution.parameters.reservedOwnerPercent).toBe(75);
  expect(familyOfficeSources.find(s => s.id === "FO-CASH")!.interpretation).toContain("not additional cash percentages");
});
it("routes the three added constitutions into actual operations, continuity and grant records", () => {
  const modules = familyOfficeModules(); const ids = new Set(familyOfficeSources.map(s => s.id));
  for (const row of modules.operations.obligations) expect(ids.has(row.source)).toBe(true);
  expect(modules.operations.obligations.find(o => o.id === "fo-papers")!.due).toBe("2026-11-03");
  expect(modules.operations.obligations.find(o => o.id === "gb-board")!.due).toBe("2026-11-10");
  expect(modules.operations.obligations.find(o => o.id === "fo-minutes")!.due).toBe("2026-11-20");
  expect(modules.capital.records).toHaveLength(2);
  expect(modules.capital.records.every(r => r.status === "Draft")).toBe(true);
  expect(modules.governance.continuity.find(a => a.id === "fo-retain-fallback")!.dependsOn).toContain("fo-sale-readiness");
  const invalid = { ...modules.governance, continuity: modules.governance.continuity.map(a => a.id === "fo-retain-fallback" ? { ...a, status: "complete", evidence: "Fallback recorded" } : a) };
  expect(governanceSchema.safeParse(invalid).success).toBe(false);
});
it("invalidates the selected operating check when its source changes", () => {
  const store = storage(); ensureFamilyOfficeCase(store);
  const key = caseModules.find(m => m.id === "sources")!.key(familyOfficeCaseId);
  const source = JSON.parse(store.getItem(key)!); source.sources.find((s:{id:string})=>s.id==="FO-CASH").excerpt += " Unreviewed change.";
  store.setItem(key, JSON.stringify(source));
  expect(constitutionTraceCurrent(store, familyOfficeCaseId, "FO-CASH")).toBe(false);
});
it("rolls back population when storage refuses the completion marker", () => {
  const store = storage(); const failing = { ...store, setItem: (key: string, value: string) => { if (key.includes("visual-stewardship")) throw Error("Storage full"); store.setItem(key, value); } };
  expect(() => ensureFamilyOfficeCase(failing)).toThrow("Storage full");
  expect(caseModules.every(m => store.getItem(m.key(familyOfficeCaseId)) === null)).toBe(true);
});
