import { describe, expect, it } from "vitest";
import type { AccountValuation, Holding, PerformanceResult } from "@/lib/types";
import {
  analysisHoldings,
  evolutionSeries,
  fundLookThrough,
  returnDetail,
  ruleEnabled,
} from "./read-model";
import { invoke } from "@/adapters/web/core";

const holding = (overrides: Partial<Holding> = {}): Holding =>
  ({
    id: "position",
    accountId: "a",
    holdingType: "security",
    quantity: 1,
    instrument: {
      id: "fund",
      symbol: "SAMPLE",
      name: "Sample fund",
      currency: "USD",
      quoteMode: "MANUAL",
      instrumentType: "FUND",
    },
    baseCurrency: "USD",
    localCurrency: "USD",
    marketValue: { local: 100, base: 100 },
    weight: 1,
    asOfDate: "2026-10-01",
    ...overrides,
  }) as Holding;
const result = (
  overrides: Partial<PerformanceResult> = {},
): PerformanceResult => ({
  scope: { id: "all", currency: "USD" },
  period: { startDate: "2026-01-01", endDate: "2026-10-01" },
  mode: "valueReturn",
  returns: { valueReturn: 0.12 },
  attribution: { fees: 0 } as PerformanceResult["attribution"],
  risk: {},
  dataQuality: { status: "partial" },
  series: [],
  summary: {
    amount: 12,
    percent: 0.12,
    amountStatus: "complete",
    percentStatus: "complete",
    method: "valueReturn",
    basis: "marketValue",
    quality: "partial",
    basisStatus: "complete",
    reasons: [],
  },
  ...overrides,
});

describe("host analysis semantic boundary", () => {
  it("keeps separate accounts, deduplicates exact records and does not mutate host inputs", () => {
    const a = holding();
    const b = holding({ accountId: "b" });
    const inputs = [a, a, b];
    const before = structuredClone(inputs);
    expect(analysisHoldings(inputs, "USD").total).toBe(200);
    expect(inputs).toEqual(before);
  });
  it("rejects overlapping aggregate and account representations", () => {
    const model = analysisHoldings(
      [
        holding(),
        holding({
          id: "aggregate",
          accountId: "TOTAL",
          sourceAccountIds: ["a"],
        }),
      ],
      "USD",
    );
    expect(model.total).toBe(0);
    expect(model.exclusions).toHaveLength(2);
  });
  it("does not manufacture FX, missing values or a short-exposure denominator", () => {
    const model = analysisHoldings(
      [
        holding({ baseCurrency: "GBP" }),
        holding({ id: "missing", marketValue: { base: NaN, local: 100 } }),
        holding({ id: "short", marketValue: { base: -10, local: -10 } }),
      ],
      "USD",
    );
    expect(model.total).toBe(0);
    expect(model.exclusions).toHaveLength(3);
  });
  it("keeps disabled rules independent and never interprets invalid saved values as enabled states", () => {
    expect(ruleEnabled({ "fee-ratio": false }, "fee-ratio")).toBe(false);
    expect(ruleEnabled({ "fee-ratio": false }, "equity-concentration")).toBe(
      true,
    );
    expect(ruleEnabled(null, "fee-ratio")).toBe(true);
  });
  it("preserves return method, fraction units, period and partial quality; missing is not zero", () => {
    const detail = returnDetail(result(), "USD")!;
    expect(detail.method).toBe("valueReturn");
    expect(detail.percent).toBe(0.12);
    expect(detail.quality).toBe("partial");
    expect(detail.period.endDate).toBe("2026-10-01");
    expect(detail.breakdown.find((row) => row.key === "fees")?.value).toBe(0);
    expect(
      detail.breakdown.find((row) => row.key === "fxEffect")?.value,
    ).toBeNull();
    expect(returnDetail(result(), "GBP")).toBeNull();
    expect(
      returnDetail(result({ dataQuality: { status: "noData" } }), "USD"),
    ).toBeNull();
    const incomplete = result();
    incomplete.summary!.amountStatus = "unavailable";
    expect(returnDetail(incomplete, "USD")?.amount).toBeNull();
  });
  it("aggregates shared constituent IDs across funds with an explicit partial-coverage denominator", () => {
    const model = analysisHoldings(
      [holding(), holding({ id: "b", accountId: "b" })],
      "USD",
    );
    const look = fundLookThrough(model, [
      {
        instrumentId: "fund",
        asOfDate: "2026-10-01",
        constituents: [{ id: "company", name: "Sample company", weight: 0.6 }],
      },
    ]);
    expect(look.coveredFundValue).toBe(200);
    expect(look.coveredExposure).toBe(120);
    expect(look.exposures).toHaveLength(1);
    expect(look.exposures[0].parents).toHaveLength(2);
    expect(look.coveredExposure / look.coveredFundValue).toBe(0.6);
  });
  it("does not claim coverage without constituents or for private holdings labelled as generic funds", () => {
    const model = analysisHoldings(
      [holding(), holding({ id: "private", assetKind: "PRIVATE_EQUITY" })],
      "USD",
    );
    const look = fundLookThrough(model, []);
    expect(look.funds).toHaveLength(1);
    expect(look.coveredFunds).toBe(0);
    expect(look.exposures).toEqual([]);
    expect(look.excludedNonFunds).toBe(1);
  });
  it("rejects mismatched dates, mixed valuation dates, duplicate snapshots and invalid weights", () => {
    const model = analysisHoldings([holding()], "USD");
    const snapshot = {
      instrumentId: "fund",
      asOfDate: "2026-09-01",
      constituents: [{ id: "company", name: "Company", weight: 0.5 }],
    };
    expect(fundLookThrough(model, [snapshot]).coveredFunds).toBe(0);
    snapshot.asOfDate = "2026-10-01";
    expect(fundLookThrough(model, [snapshot, snapshot]).coveredFunds).toBe(0);
    snapshot.constituents[0].weight = 1.5;
    expect(fundLookThrough(model, [snapshot]).coveredFunds).toBe(0);
    snapshot.constituents[0].weight = 0.5;
    const mixed = analysisHoldings(
      [holding(), holding({ id: "different-date", asOfDate: "2026-10-02" })],
      "USD",
    );
    expect(fundLookThrough(mixed, [snapshot]).coveredFunds).toBe(0);
  });
  it("does not sum aggregate history with its account rows or retain ambiguous duplicate dates", () => {
    const row = {
      accountId: "TOTAL",
      valuationDate: "2026-01-01",
      baseCurrency: "USD",
      totalValueBase: 100,
      valueStatus: "complete",
    } as AccountValuation;
    expect(evolutionSeries([row, { ...row, accountId: "a" }], "USD")).toEqual([
      { date: "2026-01-01", value: 100 },
    ]);
    expect(evolutionSeries([row, { ...row }], "USD")).toEqual([]);
    expect(evolutionSeries([row], "GBP")).toEqual([]);
  });
  it("uses real host static reads for account scope and preserves unavailable attribution", async () => {
    const filter = { type: "account", accountId: "acc-public" };
    const positions = await invoke<Holding[]>("get_holdings_list", { filter });
    const model = analysisHoldings(positions, "USD");
    expect(model.total).toBe(4200000);
    expect(
      model.positions.every((position) => position.accountId === "acc-public"),
    ).toBe(true);
    const performance = await invoke<PerformanceResult>(
      "calculate_performance_history",
      {
        filter,
        itemId: "TOTAL",
        itemType: "account",
        startDate: "2026-01-01",
        endDate: "2026-10-27",
      },
    );
    const detail = returnDetail(performance, "USD")!;
    expect(detail.method).toBe("valueReturn");
    expect(detail.breakdown.every((row) => row.value === null)).toBe(true);
    expect(detail.period.startDate! >= "2026-01-01").toBe(true);
  });
});
