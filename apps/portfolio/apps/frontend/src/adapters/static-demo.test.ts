import { describe, expect, it } from "vitest";
import { SAMPLE_ACCOUNTS, SAMPLE_POSITIONS } from "./demo-family";
import { demoAllocations, demoCurrentValuation, demoHoldings, demoIncomeSummary } from "./static-store";
import { invoke } from "./web/core";

describe("family-office sample data", () => {
  it("reconciles accounts, positions, valuation and allocations", () => {
    const accountTotal = SAMPLE_ACCOUNTS.reduce((sum, account) => sum + account.value, 0);
    const positionTotal = SAMPLE_POSITIONS.reduce((sum, position) => sum + position.value, 0);
    expect(positionTotal).toBe(accountTotal);
    expect(demoCurrentValuation().summary.totalValueBase).toBe(accountTotal);
    expect(demoHoldings().reduce((sum, holding) => sum + holding.marketValue.base, 0)).toBe(accountTotal);
    expect(demoAllocations().assetClasses.categories.reduce((sum, category) => sum + category.value, 0)).toBe(accountTotal);
  });

  it("returns the income periods expected by the Income screen and respects account scope", async () => {
    const all = demoIncomeSummary(SAMPLE_ACCOUNTS.map((account) => account.id));
    expect(all.map((item) => item.period)).toEqual(["ALL", "YTD", "LAST_YEAR", "TWO_YEARS_AGO"]);
    expect(all.find((item) => item.period === "ALL")?.totalIncome).toBeGreaterThan(0);
    const income = await invoke<typeof all>("get_income_summary", { filter: { type: "account", accountId: "acc-cash" } });
    expect(income.find((item) => item.period === "ALL")?.totalIncome).toBe(0);
  });

  it("keeps scoped holdings and valuation aligned", async () => {
    const filter = { type: "account", accountId: "acc-education" };
    const holdings = await invoke<ReturnType<typeof demoHoldings>>("get_holdings_list", { filter });
    const valuation = await invoke<ReturnType<typeof demoCurrentValuation>>("get_current_valuation", { filter });
    expect(holdings).toHaveLength(1);
    expect(holdings[0].marketValue.base).toBe(valuation.summary.totalValueBase);
    const assetHoldings = await invoke<ReturnType<typeof demoHoldings>>("get_asset_holdings", { assetId: "asset-education" });
    const asset = await invoke<{ name: string }>("get_asset_profile", { assetId: "asset-education" });
    expect(assetHoldings).toHaveLength(1);
    expect(asset.name).toBe(assetHoldings[0].instrument?.name);
  });

  it("provides a value-change history without inventing time-weighted returns", async () => {
    const result = await invoke<{ mode: string; returns: { twr: number | null }; series: unknown[] }>(
      "calculate_performance_history", { itemType: "account", itemId: "acc-education" },
    );
    expect(result.mode).toBe("valueReturn");
    expect(result.returns.twr).toBeNull();
    expect(result.series.length).toBeGreaterThan(1);
  });

  it("populates family spending categories and reconciles a monthly report", async () => {
    const taxonomy = await invoke<{ categories: { name: string }[] }>("get_taxonomy", { id: "spending_categories" });
    expect(taxonomy.categories.map((category) => category.name)).toContain("Arts and cultural patronage");
    const date = new Date();
    const month = date.toISOString().slice(0, 7);
    const report = await invoke<{ current: { outflow: number }; spendingBreakdown: { amount: number }[] }>("get_spending_report", {
      request: { startDate: `${month}-01`, endDate: `${month}-28` },
    });
    expect(report.current.outflow).toBeGreaterThan(0);
    expect(report.spendingBreakdown.reduce((sum, row) => sum + row.amount, 0)).toBe(report.current.outflow);
    const insight = await invoke<{ headline: { spent: number; priorSpent: number }; groups: { categories: { spent: number }[] }[] }>("get_spending_insight", {
      request: { startDate: `${month}-01`, endDate: `${month}-28` },
    });
    expect(insight.headline.spent).toBe(report.current.outflow);
    expect(insight.headline.priorSpent).toBeGreaterThan(0);
    expect(insight.groups.flatMap((group) => group.categories).reduce((sum, category) => sum + category.spent, 0)).toBe(report.current.outflow);
    const patronage = await invoke<{ items: { notes: string }[]; totalCount: number }>("search_cash_activities", {
      request: { categoryIds: ["family-category-1"], startDate: `${month}-01`, endDate: `${month}-28` },
    });
    expect(patronage.totalCount).toBe(1);
    expect(patronage.items[0].notes).toBe("Arts and cultural patronage");
    const activities = await invoke<{ data: unknown[]; meta: { totalRowCount: number } }>("search_activities", { page: 0, pageSize: 10 });
    expect(activities.data.length).toBeGreaterThan(0);
    expect(activities.meta.totalRowCount).toBeGreaterThanOrEqual(activities.data.length);
    const review = await invoke<{ meta: { totalRowCount: number } }>("search_activities", { needsReviewFilter: true });
    expect(review.meta.totalRowCount).toBe(0);
  });
});
