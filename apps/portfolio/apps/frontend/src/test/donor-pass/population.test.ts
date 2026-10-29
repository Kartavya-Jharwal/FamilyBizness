import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { invoke } from "@/adapters/web/core";
import {
  demoHoldings,
  demoNetWorth,
  demoNetWorthHistory,
  getDemoStore,
  resetDemoStore,
} from "@/adapters/static-store";
import { SAMPLE_ACCOUNTS, SAMPLE_POSITIONS } from "@/adapters/demo-family";
import type {
  Account,
  CurrentValuationResponse,
  Holding,
  IncomeSummary,
  PortfolioAllocations,
} from "@/lib/types";
beforeEach(() => {
  localStorage.clear();
  resetDemoStore();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error("Network forbidden in smoke test");
    }),
  );
});
afterEach(() => {
  resetDemoStore();
  vi.unstubAllGlobals();
});
it("populates one reconciled fictional family dataset across the two donors", async () => {
  const accounts = await invoke<Account[]>("get_accounts");
  const positions = await invoke<Holding[]>("get_holdings_list", {
    filter: { type: "all" },
  });
  const value = positions.reduce(
    (sum, holding) => sum + holding.marketValue.base,
    0,
  );
  const valuation = await invoke<CurrentValuationResponse>(
    "get_current_valuation",
    { filter: { type: "all" } },
  );
  expect(accounts).toHaveLength(SAMPLE_ACCOUNTS.length);
  expect(positions).toHaveLength(SAMPLE_POSITIONS.length);
  expect(value).toBe(
    SAMPLE_ACCOUNTS.reduce((sum, account) => sum + account.value, 0),
  );
  expect(valuation.summary.totalValueBase).toBe(value);
  expect(demoNetWorth().netWorth).toBe(value);
  expect(demoNetWorthHistory().at(-1)?.netWorth).toBe(value);
  expect(
    positions.reduce((sum, holding) => sum + holding.weight, 0),
  ).toBeCloseTo(1);
  expect(getDemoStore().goals.length).toBeGreaterThan(0);
  expect(fetch).not.toHaveBeenCalled();
});
it.each(SAMPLE_ACCOUNTS)(
  "reconciles account $id across holdings, allocations and valuation",
  async (account) => {
    const filter = { type: "account", accountId: account.id };
    const holdings = await invoke<Holding[]>("get_holdings_list", { filter });
    const valuation = await invoke<CurrentValuationResponse>(
      "get_current_valuation",
      { filter },
    );
    const allocations = await invoke<PortfolioAllocations>(
      "get_portfolio_allocations",
      { filter },
    );
    expect(holdings.every((holding) => holding.accountId === account.id)).toBe(
      true,
    );
    expect(
      holdings.reduce((sum, holding) => sum + holding.marketValue.base, 0),
    ).toBe(account.value);
    expect(valuation.summary.totalValueBase).toBe(account.value);
    expect(
      allocations.assetClasses.categories.reduce(
        (sum, category) => sum + category.value,
        0,
      ),
    ).toBe(account.value);
  },
);
it("reconciles income breakdowns and keeps unknown scopes empty", async () => {
  const income = await invoke<IncomeSummary[]>("get_income_summary", {
    filter: { type: "all" },
  });
  for (const summary of income) {
    expect(
      Object.values(summary.byMonth).reduce((sum, value) => sum + value, 0),
    ).toBe(summary.totalIncome);
    expect(
      Object.values(summary.byType).reduce((sum, value) => sum + value, 0),
    ).toBe(summary.totalIncome);
    expect(
      Object.values(summary.byAsset).reduce(
        (sum, value) => sum + value.income,
        0,
      ),
    ).toBe(summary.totalIncome);
    expect(
      Object.values(summary.byAccount).reduce(
        (sum, value) => sum + value.total,
        0,
      ),
    ).toBe(summary.totalIncome);
  }
  expect(
    await invoke("get_holdings_list", {
      filter: { type: "account", accountId: "missing" },
    }),
  ).toEqual([]);
});
it("persists cheap local edits and keeps deleted sample accounts out of totals", async () => {
  const original = demoNetWorth().netWorth;
  await invoke("delete_account", { accountId: "acc-public" });
  expect(
    demoHoldings().some((holding) => holding.accountId === "acc-public"),
  ).toBe(false);
  expect(demoNetWorth().netWorth).toBe(original - 4200000);
  expect(
    JSON.parse(localStorage.getItem("fb-demo-store-v2")!).accounts.some(
      (account: Account) => account.id === "acc-public",
    ),
  ).toBe(false);
  const holdings = await invoke<Holding[]>("get_holdings_list", {
    filter: { type: "all" },
  });
  const current = await invoke<CurrentValuationResponse>(
    "get_current_valuation",
    { filter: { type: "all" } },
  );
  expect(
    holdings.reduce((sum, holding) => sum + holding.marketValue.base, 0),
  ).toBe(current.summary.totalValueBase);
});
it("reloads saved samples and resets only its own dataset", async () => {
  localStorage.setItem("unrelated-app", "keep");
  await invoke("update_account", {
    accountUpdate: { id: "acc-public", name: "Renamed sample" },
  });
  vi.resetModules();
  const reloaded = await import("@/adapters/static-store");
  expect(
    reloaded
      .getDemoStore()
      .accounts.find((account) => account.id === "acc-public")?.name,
  ).toBe("Renamed sample");
  reloaded.resetDemoStore();
  expect(localStorage.getItem("unrelated-app")).toBe("keep");
  expect(reloaded.demoHoldings()).toHaveLength(SAMPLE_POSITIONS.length);
});
