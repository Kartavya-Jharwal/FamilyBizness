import { describe, expect, it } from "vitest";
import { clauseKey, compileSnapshot, freshRecord, importText, loadWorkspace, saveWorkspace, workspaceKey } from "./workspace";
import { evaluatePolicy, parseConstitution } from "./policy";
import { buildAssumptionsContract, withDelegations } from "./contract";

function storage() { const values = new Map<string, string>(); return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } }; }
const text = "# Draft\n\n## Limits\n- Equities shall not exceed 45% of investable assets.";

describe("constitution workspace", () => {
  it("exports current text and extracted thresholds together without a delayed parse", () => {
    const record = { ...freshRecord(), content: text.replace("45%", "12%") };
    const exported = compileSnapshot(record);
    expect(exported.content).toContain("12%");
    expect(exported.policy.gates[0].threshold).toBe(12);
  });
  it("saves content and metadata in one validated envelope with profile isolation", () => {
    const store = storage(); const key = workspaceKey("one");
    const next = saveWorkspace(store, key, { ...freshRecord(), content: text });
    expect(loadWorkspace(store, key)).toEqual(next);
    expect(next.revision).toBe(1);
    expect(loadWorkspace(store, workspaceKey("two")).revision).toBe(0);
    expect(() => saveWorkspace(store, key, freshRecord())).toThrow("newer revision");
  });
  it("does not hide corrupt storage or report failed writes as saved", () => {
    const store = storage(); store.setItem("bad", "{");
    expect(() => loadWorkspace(store, "bad")).toThrow();
    expect(() => saveWorkspace({ ...store, setItem: () => { throw new Error("quota"); } }, "good", freshRecord())).toThrow("quota");
    expect(loadWorkspace(store, "good").revision).toBe(0);
  });
  it("preserves review identity across inserted lines and marks edited clauses stale", () => {
    const gate = parseConstitution(text).gates[0];
    const note = { key: clauseKey(gate), source: gate.statement, text: "Confirm denominator" };
    expect(compileSnapshot({ ...freshRecord(), content: `\n\n${text}`, notes: [note] }).notes[0].stale).toBe(false);
    expect(compileSnapshot({ ...freshRecord(), content: text.replace("45%", "40%"), notes: [note] }).notes[0].stale).toBe(true);
  });
  it("retains unsupported source text and rejects empty or oversized imports", () => {
    const prose = "# Draft\nA bespoke family narrative without a measurable rule.";
    expect(compileSnapshot({ ...freshRecord(), content: prose }).content).toBe(prose);
    expect(() => importText(text, " ", "append")).toThrow("empty");
    expect(() => importText(text, "x".repeat(60_000), "append")).toThrow("60,000");
    expect(importText(text, "# Verified", "replace")).toBe("# Verified");
  });
  it("counts transformed assumption delegation states", () => {
    const contract = buildAssumptionsContract(parseConstitution(text));
    const domain = contract.domains.find((d) => d.assumptions.some((a) => a.state === "missing"))!;
    const assumption = domain.assumptions.find((a) => a.state === "missing")!;
    const next = withDelegations(contract, new Set([`${domain.id}:${assumption.key}`]));
    expect(next.counts.delegated).toBe(1); expect(next.counts.missing).toBe(contract.counts.missing - 1);
  });
  it("preserves equality and unknown numeric observations", () => {
    const policy = parseConstitution(text);
    expect(evaluatePolicy(policy, { assetExposurePercent: { "Public equities": 45 } })[0].status).toBe("pass");
    expect(evaluatePolicy(policy, { assetExposurePercent: { "Public equities": NaN } })[0].status).toBe("not_configured");
    expect(evaluatePolicy(policy, {})[0].status).toBe("not_configured");
  });
  it("requires monetary currency rather than evaluating an unlabelled number", () => {
    const policy = parseConstitution("# Draft\nReal estate shall not exceed $15 million.");
    expect(evaluatePolicy(policy, { assetExposureAmount: { "Real estate": 1 } })[0].status).toBe("not_configured");
  });
  it("does not turn fenced examples into active candidate clauses", () => {
    expect(parseConstitution(`# Draft\n\u0060\u0060\u0060text\nEquities shall not exceed 45%.\n\u0060\u0060\u0060`).gates).toHaveLength(0);
  });
});
