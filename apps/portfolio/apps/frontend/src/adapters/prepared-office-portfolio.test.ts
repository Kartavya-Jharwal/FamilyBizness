import { beforeEach, expect, it, vi } from "vitest";
vi.mock("@/features/profiles/session", async importOriginal => ({ ...await importOriginal<typeof import("@/features/profiles/session")>(), selectedProfileId: () => "family-office-composite" }));
import { ensureFamilyOfficeCase } from "@/features/family-office/family-office-case";
import { financeBookSchema, fairValueWealth } from "@/features/family-office/finance-book-model";
import { preparedOfficeId } from "@/features/profiles/profile-workspace";
import { readPreparedOfficePortfolio } from "./prepared-office-portfolio";
import { demoCurrentValuation, demoHoldings, demoAllocations, demoNetWorth, demoNetWorthHistory, demoValuationHistory, getDemoStore, mutateDemoStore } from "./static-store";
import { invoke } from "./web/core";
const bookKey = `profile:${preparedOfficeId}:family-office:book:1`;
beforeEach(() => { localStorage.clear(); ensureFamilyOfficeCase(localStorage); });

it("reads the same book AUM through donor accounts, holdings, allocations, scopes and family capital", async () => {
  const book = financeBookSchema.parse(JSON.parse(localStorage.getItem(bookKey)!));
  const wealth = fairValueWealth(book);
  expect(getDemoStore().accounts.reduce((sum, row) => sum + row.balance, 0)).toBeCloseTo(wealth.grossAum);
  expect(demoCurrentValuation().summary.totalValueBase).toBeCloseTo(wealth.grossAum);
  expect(demoHoldings().reduce((sum, row) => sum + row.marketValue.base, 0)).toBeCloseTo(wealth.grossAum);
  expect(demoAllocations().totalValue).toBeCloseTo(wealth.grossAum);
  expect(demoNetWorth().netWorth).toBeCloseTo(wealth.fairValue);
  expect(demoNetWorth().liabilities.total).toBe(1000000);
  expect(demoHoldings().every(row => row.costBasis === null && row.totalGain === null)).toBe(true);
  const mandate = await invoke<ReturnType<typeof demoCurrentValuation>>("get_current_valuation", { filter: { type: "portfolio", portfolioId: "pf-long-term" } });
  expect(mandate.summary.totalValueBase).toBe(8000000);
  expect(demoCurrentValuation().summary.cashBalanceBase).toBe(4800000);
  expect(demoHoldings().every(row => Math.abs(row.marketValue.local * Number(row.fxRate) - row.marketValue.base) < .01)).toBe(true);
  expect(demoHoldings().some(row => row.localCurrency === "USD")).toBe(true);
  expect(demoHoldings().some(row => row.localCurrency === "EUR")).toBe(true);
});

it("uses exact dated total observations while withholding invented historical account splits", async () => {
  const book = financeBookSchema.parse(JSON.parse(localStorage.getItem(bookKey)!));
  const history = await invoke<ReturnType<typeof demoValuationHistory>>("get_historical_valuations", { filter: { type: "all" } });
  expect(history).toHaveLength(book.wealthHistory.length);
  expect(history[0].totalValueBase).toBe(book.wealthHistory[0].grossAum);
  expect(history.at(-1)?.totalValueBase).toBeCloseTo(fairValueWealth(book).grossAum);
  expect(history.every(row => row.basisStatus === "unknown")).toBe(true);
  const account = await invoke<ReturnType<typeof demoValuationHistory>>("get_historical_valuations", { filter: { type: "account", accountId: "acc-public" } });
  expect(account).toHaveLength(1);
  expect(account[0].valuationDate).toBe(book.asOf);
  expect(demoNetWorthHistory().at(-1)?.netWorth).toBeCloseTo(fairValueWealth(book).fairValue);
});

it("refreshes directly from saved DCF values and preserves custom store metadata without a second financial ledger", () => {
  const before = demoCurrentValuation().summary.totalValueBase;
  mutateDemoStore(store => { store.accounts.find(row => row.id === "acc-public")!.name = "Reviewed investment custody"; });
  const saved = localStorage.getItem("fb-demo-store-v2");
  const book = financeBookSchema.parse(JSON.parse(localStorage.getItem(bookKey)!));
  book.dcf.discount = 11; localStorage.setItem(bookKey, JSON.stringify(book));
  expect(demoCurrentValuation().summary.totalValueBase).not.toBe(before);
  expect(demoCurrentValuation().summary.totalValueBase).toBeCloseTo(fairValueWealth(book).grossAum);
  expect(getDemoStore().accounts.find(row => row.id === "acc-public")?.name).toBe("Reviewed investment custody");
  expect(localStorage.getItem("fb-demo-store-v2")).toBe(saved);
  expect(readPreparedOfficePortfolio(localStorage, "archived-custom-profile")).toBeNull();
});

it("does not hide an invalid saved book behind unrelated donor fixtures", () => {
  localStorage.setItem(bookKey, "{}");
  expect(() => demoCurrentValuation()).toThrow();
  localStorage.removeItem(bookKey);
  expect(() => demoCurrentValuation()).toThrow(/missing/);
});

it("reads reported owner income and cash activities without inventing per-security income or prior-period transactions", async () => {
  const income = await invoke<import("@/lib/types").IncomeSummary[]>("get_income_summary", { filter: { type: "all" } });
  expect(income.find(row => row.period === "ALL")?.totalIncome).toBe(600000);
  expect(income.find(row => row.period === "ALL")?.byAsset).toEqual({});
  const rows = await invoke<{ data: { id: string; date: Date; amount: string; activityType: string }[] }>("search_activities", {});
  expect(rows.data).toHaveLength(2);
  expect(rows.data.every(row => row.id.startsWith("book-movement-") && row.date.toISOString().slice(0,10) === "2026-11-05")).toBe(true);
  expect(rows.data.find(row => row.activityType === "WITHDRAWAL")?.amount).toBe("200000");
});
