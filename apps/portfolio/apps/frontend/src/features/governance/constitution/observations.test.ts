import { describe, expect, it } from "vitest";
import { readPolicyObservation, type ObservationRequirement } from "./observations";

const required: ObservationRequirement = {
  metric: "holding-exposure",
  unit: "percent",
  scopeId: "profile:demo/account:a",
  asOf: "2026-10-28",
  denominator: "investable-assets",
};
const evidence = { ...required, value: 0, source: "host-test-fixture", coverage: 1, basis: "host" };

describe("policy observation intake", () => {
  it("preserves an observed zero and copies evidence without evaluating a rule", () => {
    const result = readPolicyObservation(evidence, required);
    expect(result).toEqual({ state: "available", observation: evidence });
    if (result.state === "available") expect(result.observation).not.toBe(evidence);
  });

  it.each([
    null,
    { ...evidence, value: undefined },
    { ...evidence, value: NaN },
    { ...evidence, value: Infinity },
    { ...evidence, value: "0" },
    { ...evidence, value: false },
    { ...evidence, basis: "illustrative" },
    { ...evidence, source: " " },
    { ...evidence, coverage: 0.99 },
    { ...evidence, coverage: 2 },
    { ...evidence, scopeId: "profile:other/account:a" },
    { ...evidence, metric: "total-exposure" },
    { ...evidence, unit: "fraction" },
    { ...evidence, denominator: "net-worth" },
    { ...evidence, denominator: undefined },
    { ...evidence, asOf: "2026-10-27" },
    { ...evidence, asOf: "2026-02-30" },
  ])("does not manufacture availability for incomplete or mismatched evidence %#", (input) => {
    expect(readPolicyObservation(input, required).state).toBe("unavailable");
  });

  it("requires a declared matching currency for monetary observations", () => {
    const money = { ...required, unit: "currency", currency: "GBP" };
    expect(readPolicyObservation({ ...evidence, ...money }, { ...required, unit: "currency" }).state).toBe("unavailable");
    expect(readPolicyObservation({ ...evidence, unit: "currency" }, money).state).toBe("unavailable");
    expect(readPolicyObservation({ ...evidence, ...money, currency: "USD" }, money).state).toBe("unavailable");
    expect(readPolicyObservation({ ...evidence, ...money }, money).state).toBe("available");
  });

  it("retains a recorded false distinctly from a missing approval observation", () => {
    const approval = { ...required, metric: "approval", unit: "boolean" };
    expect(readPolicyObservation({ ...evidence, ...approval, value: false }, approval).state).toBe("available");
    expect(readPolicyObservation({ ...evidence, ...approval, value: undefined }, approval).state).toBe("unavailable");
    expect(readPolicyObservation({ ...evidence, ...approval, value: 0 }, approval).state).toBe("unavailable");
  });

  it("rejects an undefined context rather than comparing matching empty fields", () => {
    const invalid = { ...required, scopeId: "", asOf: "2026-02-30" };
    expect(readPolicyObservation({ ...evidence, ...invalid }, invalid).state).toBe("unavailable");
  });
});
