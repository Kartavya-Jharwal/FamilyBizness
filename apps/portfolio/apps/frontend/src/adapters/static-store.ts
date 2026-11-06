/**
 * In-browser demo store for the static GitHub Pages shell.
 * Persists mutable slices to localStorage; seed data fills the rest.
 */

import type {
  GoalFundingRule,
  GoalPlan,
  Account,
  AccountValuation,
  Goal,
  CurrentValuationResponse,
  Holding,
  IncomeSummary,
  NetWorthHistoryPoint,
  NetWorthResponse,
  PortfolioAllocations,
  PortfolioWithAccounts,
  Settings,
  SimplePerformanceResult,
  TaxonomyCategory,
} from "@/lib/types";
import { HoldingType } from "@/lib/constants";
import { DEFAULT_LOCALE } from "@/i18n/locales";
import { selectedProfileId } from "@/features/profiles/session";
import { enforceIps, readActiveIps, type IpsFacts } from "@/features/governance/constitution/ips";
import { SAMPLE_CURRENCY, SAMPLE_ACCOUNTS, SAMPLE_GOALS, SAMPLE_POSITIONS, SAMPLE_SPENDING_CATEGORIES } from "./demo-family";

import { readPreparedOfficePortfolio, type PreparedPosition } from "./prepared-office-portfolio";

const STORAGE_KEY = "fb-demo-store-v2";

export type DemoAccount = Account;

type DemoStore = {
  goalFunding?: Record<string, GoalFundingRule[]>;
  goalPlans?: Record<string, GoalPlan>;
  accounts: DemoAccount[];
  settings: Settings;
  portfolios: PortfolioWithAccounts[];
  goals: Goal[];
  spendingSettings: { enabled: boolean; accountIds: string[]; excludedCategoryIds: string[] };
  categories: TaxonomyCategory[];
};

const NOW = new Date().toISOString();
const AS_OF = NOW.slice(0, 10);

function emptyTaxonomy(id: string, name: string) {
  return { taxonomyId: id, taxonomyName: name, color: "#64748b", categories: [] };
}

function monetary(local: number, base = local) {
  return { local, base };
}

function seedSettings(): Settings {
  return {
    theme: "system",
    themeId: "classic",
    font: "font-sans",
    language: DEFAULT_LOCALE,
    formattingRegion: "en-GB",
    baseCurrency: SAMPLE_CURRENCY,
    defaultReturnMetric: "twr",
    timezone: "Europe/London",
    onboardingCompleted: true,
    autoUpdateCheckEnabled: false,
    menuBarVisible: true,
    syncEnabled: false,
  };
}

function seedAccounts(): DemoAccount[] {
  return SAMPLE_ACCOUNTS.map((account, index) => ({
    id: account.id, name: account.name, accountType: account.kind, group: account.group,
    balance: account.value, currency: SAMPLE_CURRENCY, isDefault: index === 0, isActive: true,
    isArchived: false, trackingMode: "HOLDINGS", createdAt: new Date(NOW), updatedAt: new Date(NOW),
  }));
}

function seedPortfolios(): PortfolioWithAccounts[] {
  return [
    { id: "pf-main", name: "Family Office", accountIds: SAMPLE_ACCOUNTS.map(a => a.id), sortOrder: 0, createdAt: NOW, updatedAt: NOW },
    { id: "pf-long-term", name: "Long-term Family Capital", accountIds: ["acc-public", "acc-private"], sortOrder: 1, createdAt: NOW, updatedAt: NOW },
    { id: "pf-next-generation", name: "Next Generation", accountIds: ["acc-education"], sortOrder: 2, createdAt: NOW, updatedAt: NOW },
  ];
}

function seedCategories(): TaxonomyCategory[] {
  const groups = [
    { id: "spending_categories", names: SAMPLE_SPENDING_CATEGORIES },
    { id: "income_sources", names: ["Investment dividends", "Interest income", "Family business distributions"] },
    { id: "savings_categories", names: ["Next generation education", "Long-term family capital", "Arts and cultural patronage"] },
  ];
  return groups.flatMap(({ id, names }) => names.map((name, index) => ({
    id: id === "spending_categories" ? `family-category-${index}` : `${id}-${index}`,
    taxonomyId: id, name, key: `family-${index}`, color: "var(--color-sea)",
    sortOrder: index, createdAt: NOW, updatedAt: NOW,
  })));
}

function seed(): DemoStore {
  return {
    goalPlans: {}, goalFunding: {},
    accounts: seedAccounts(),
    settings: seedSettings(),
    portfolios: seedPortfolios(),
    goals: SAMPLE_GOALS.map((goal) => ({ ...goal })),
    spendingSettings: { enabled: true, accountIds: ["acc-cash"], excludedCategoryIds: [] },
    categories: seedCategories(),
  };
}

function load(): DemoStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DemoStore>;
      return {
        goalFunding: parsed.goalFunding ?? {},
        goalPlans: parsed.goalPlans ?? {},
        accounts: Array.isArray(parsed.accounts) ? parsed.accounts : seedAccounts(),
        settings: { ...seedSettings(), ...(parsed.settings ?? {}) },
        portfolios: Array.isArray(parsed.portfolios) ? parsed.portfolios : seedPortfolios(),
        goals: Array.isArray(parsed.goals) ? parsed.goals : SAMPLE_GOALS.map((goal) => ({ ...goal })),
        spendingSettings: parsed.spendingSettings ?? { enabled: true, accountIds: ["acc-cash"], excludedCategoryIds: [] },
        categories: Array.isArray(parsed.categories) ? parsed.categories : seedCategories(),
      };
    }
  } catch {
    /* ignore */
  }
  return seed();
}

function save(store: DemoStore) {
  if (typeof localStorage === "undefined") throw new Error("Local storage is unavailable; financial changes were not saved.");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

let store = typeof localStorage !== "undefined" ? load() : seed();

export function getDemoStore() {
  const prepared = readPreparedOfficePortfolio();
  if (!prepared) return store;
  const ids = new Set(prepared.accounts.map(row => row.id));
  const metadata = prepared.accounts.map(account => {
    const saved = store.accounts.find(row => row.id === account.id);
    const seed = SAMPLE_ACCOUNTS.find(row => row.id === account.id);
    return { ...account, ...(saved && (!seed || saved.name !== seed.name) ? { name: saved.name } : {}), ...(saved?.group && (!seed || saved.group !== seed.group) ? { group: saved.group } : {}) };
  });
  const custom = store.accounts.filter(account => !ids.has(account.id) && !SAMPLE_ACCOUNTS.some(seed => seed.id === account.id));
  const portfolios = prepared.portfolios.map(portfolio => { const saved = store.portfolios.find(row => row.id === portfolio.id); return { ...portfolio, ...(saved && !["Family Office", "Long-term Family Capital"].includes(saved.name) ? { name: saved.name } : {}) }; });
  return { ...store, settings: { ...store.settings, baseCurrency: prepared.currency }, accounts: [...metadata, ...custom], portfolios: [...portfolios, ...store.portfolios.filter(row => !["pf-main", "pf-long-term", "pf-next-generation"].includes(row.id))] };
}

export function mutateDemoStore(mutator: (s: DemoStore) => void) {
  const candidate = structuredClone(store);
  mutator(candidate);
  if (typeof localStorage !== "undefined") {
    const active = readActiveIps(localStorage, selectedProfileId() ?? "static-demo");
    const facts = (value: DemoStore): IpsFacts => ({ accounts: value.accounts, positions: [...SAMPLE_POSITIONS], currency: value.settings.baseCurrency, asOf: AS_OF, source: "local-demo-fixtures" });
    enforceIps(active, facts(store), facts(candidate));
  }
  save(candidate);
  store = candidate;
  if (typeof window !== "undefined") window.dispatchEvent(new Event("familybizness:record-updated"));
}

export function demoIpsFacts(): IpsFacts {
  return { accounts: store.accounts, positions: [...SAMPLE_POSITIONS], currency: store.settings.baseCurrency, asOf: AS_OF, source: "local-demo-fixtures" };
}

export function resetDemoStore() {
  mutateDemoStore((candidate) => Object.assign(candidate, seed()));
}

export function sampleAccounts() {
  const prepared = readPreparedOfficePortfolio();
  const displayed = getDemoStore().accounts;
  if (prepared) return prepared.accounts.map(account => ({ id: account.id, name: displayed.find(row => row.id === account.id)?.name ?? account.name, group: displayed.find(row => row.id === account.id)?.group ?? account.group, kind: account.accountType, value: prepared.positions.filter(row => row.accountId === account.id).reduce((sum, row) => sum + row.value, 0) }));
  return store.accounts.map(account => {
    const original = SAMPLE_ACCOUNTS.find(sample => sample.id === account.id);
    return { id: account.id, name: account.name, group: account.group, kind: account.accountType, value: original?.value ?? 0 };
  });
}
export function samplePositions(): PreparedPosition[] {
  const prepared = readPreparedOfficePortfolio();
  if (prepared) return prepared.positions;
  const ids = new Set(store.accounts.map(account => account.id));
  return SAMPLE_POSITIONS.filter(position => ids.has(position.accountId)).map(position => ({ ...position, localValue: position.value, currency: SAMPLE_CURRENCY, fx: 1, hasBasis: true, sourceRecordId: position.id, entity: "", sector: position.kind }));
}

/** Positions and summaries are derived from the same sample dataset. */
export function demoHoldings(): Holding[] {
  const total = samplePositions().reduce((sum, p) => sum + p.value, 0);
  return samplePositions().map((p) => {
    const isCash = p.kind === "cash";
    const gain = p.value - p.cost;
    return {
      id: `h-${p.id}`, holdingType: isCash ? HoldingType.CASH : HoldingType.SECURITY,
      assetKind: p.kind === "private" ? "PRIVATE_EQUITY" : "INVESTMENT", accountId: p.accountId,
      instrument: { id: `asset-${p.id}`, symbol: p.symbol, name: p.name, currency: p.currency, quoteMode: "MANUAL", instrumentType: isCash ? undefined : p.kind === "private" ? "EQUITY" : "FUND" },
      quantity: 1, localCurrency: p.currency, baseCurrency: readPreparedOfficePortfolio()?.currency ?? SAMPLE_CURRENCY, fxRate: p.fx,
      marketValue: monetary(p.localValue, p.value), costBasis: p.hasBasis ? monetary(p.cost) : null, price: p.localValue,
      unrealizedGain: p.hasBasis ? monetary(gain) : null, unrealizedGainPct: p.hasBasis && p.cost ? gain / p.cost : null,
      totalGain: p.hasBasis ? monetary(gain) : null, totalGainPct: p.hasBasis && p.cost ? gain / p.cost : null,
      weight: total ? p.value / total : 0, asOfDate: readPreparedOfficePortfolio()?.asOf ?? AS_OF,
    };
  });
}

function valuationPoint(
  accountId: string,
  date: string,
  totalValue: number,
  costBasis: number,
): AccountValuation {
  return {
    id: `val-${accountId}-${date}`,
    accountId,
    valuationDate: date,
    accountCurrency: SAMPLE_CURRENCY,
    baseCurrency: SAMPLE_CURRENCY,
    fxRateToBase: 1,
    cashBalance: accountId === "acc-cash" ? totalValue : 0,
    investmentMarketValue: accountId !== "acc-cash" ? totalValue : 0,
    totalValue,
    costBasis,
    bookBasis: costBasis,
    netContribution: costBasis,
    cashBalanceBase: accountId === "acc-cash" ? totalValue : 0,
    investmentMarketValueBase: accountId !== "acc-cash" ? totalValue : 0,
    totalValueBase: totalValue,
    costBasisBase: costBasis,
    bookBasisBase: costBasis,
    netContributionBase: costBasis,
    externalInflowBase: 0,
    externalOutflowBase: 0,
    externalFlowSource: "NO_FLOW",
    performanceEligibleValueBase: totalValue,
    valueStatus: "complete",
    basisStatus: "complete",
    calculatedAt: `${date}T00:00:00.000Z`,
  };
}

/** Monthly sample history; the latest observation matches the sample positions. */
export function demoValuationHistory(): AccountValuation[] {
  const prepared = readPreparedOfficePortfolio();
  if (prepared) {
    const points: AccountValuation[] = prepared.history.map(row => ({ ...valuationPoint("TOTAL", row.asOf, row.grossAum, 0), baseCurrency: prepared.currency, accountCurrency: prepared.currency, externalInflowBase: Math.max(0, row.externalFlow), externalOutflowBase: Math.max(0, -row.externalFlow), externalFlowSource: "STORED_GROSS" as const, basisStatus: "unknown" as const }));
    for (const account of prepared.accounts) {
      const cash = prepared.positions.filter(row => row.accountId === account.id && row.kind === "cash").reduce((sum, row) => sum + row.value, 0), total = Number(account.balance ?? 0);
      points.push({ ...valuationPoint(account.id, prepared.asOf, total, 0), accountCurrency: prepared.currency, baseCurrency: prepared.currency, cashBalance: cash, cashBalanceBase: cash, investmentMarketValue: total - cash, investmentMarketValueBase: total - cash, basisStatus: "unknown", externalFlowSource: "UNKNOWN" });
    }
    return points;
  }
  const today = new Date();
  const points: AccountValuation[] = [];
  for (let i = 0; i < 24; i++) {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 23 + i, 1)).toISOString().slice(0, 10);
    const factor = 0.82 + (0.18 * i / 23);
    let total = 0;
    for (const account of sampleAccounts()) {
      const value = Math.round(account.value * (account.kind === "CASH" ? 1 : factor));
      const cost = samplePositions().filter(p => p.accountId === account.id).reduce((sum, p) => sum + p.cost, 0);
      total += value;
      points.push(valuationPoint(account.id, date, value, cost));
    }
    points.push(valuationPoint("TOTAL", date, total, samplePositions().reduce((sum, p) => sum + p.cost, 0)));
  }
  return points;
}

export function demoCurrentValuation(): CurrentValuationResponse {
  const prepared = readPreparedOfficePortfolio();
  const total = sampleAccounts().reduce((sum, account) => sum + account.value, 0);
  const cash = samplePositions().filter(row => row.kind === "cash").reduce((sum, row) => sum + row.value, 0);
  const cashOf = (id: string) => samplePositions().filter(row => row.accountId === id && row.kind === "cash").reduce((sum, row) => sum + row.value, 0);
  const currency = prepared?.currency ?? SAMPLE_CURRENCY;
  return {
    summary: {
      scopeId: "all", baseCurrency: currency, cashBalanceBase: cash,
      investmentMarketValueBase: total - cash, totalValueBase: total,
      holdingsCount: samplePositions().length, accountCount: sampleAccounts().length,
      currencySplit: [...new Set(samplePositions().map(row => row.currency))].map(currency => { const valueBase = samplePositions().filter(row => row.currency === currency).reduce((sum, row) => sum + row.value, 0); return { currency, valueBase, percentage: total ? valueBase / total * 100 : 0 }; }),
      cashCurrencySplit: [...new Set(samplePositions().filter(row => row.kind === "cash").map(row => row.currency))].map(currency => { const valueBase = samplePositions().filter(row => row.kind === "cash" && row.currency === currency).reduce((sum, row) => sum + row.value, 0); return { currency, valueBase, percentage: cash ? valueBase / cash * 100 : 0 }; }),
      sourceDataAsOf: prepared?.asOf ?? AS_OF, calculatedAt: NOW, warnings: getDemoStore().accounts.some(row => !sampleAccounts().some(account => account.id === row.id)) ? ["Unlinked custom accounts are retained but are outside the financial-book valuation perimeter."] : [],
    },
    accounts: sampleAccounts().map((a) => ({
      accountId: a.id, accountName: a.name, accountType: a.kind, accountGroup: a.group,
      accountCurrency: currency, cashBalance: cashOf(a.id),
      investmentMarketValue: a.value - cashOf(a.id), totalValue: a.value,
      cashBalanceBase: cashOf(a.id),
      investmentMarketValueBase: a.value - cashOf(a.id), totalValueBase: a.value,
      fxRateToBase: 1, baseCurrency: currency, holdingsCount: samplePositions().filter(p => p.accountId === a.id).length,
      sourceDataAsOf: prepared?.asOf ?? AS_OF, calculatedAt: NOW, warnings: [],
    })),
  };
}

export function demoAllocations(accountIds: string[] = sampleAccounts().map((account) => account.id)): PortfolioAllocations {
  const positions = samplePositions().filter((position) => accountIds.includes(position.accountId));
  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const groups = [
    { id: "equity", name: "Public equities", kinds: ["equity"], color: "var(--color-sea)" },
    { id: "fixed", name: "Fixed income", kinds: ["fixed"], color: "var(--color-brass)" },
    { id: "private", name: "Private business investments", kinds: ["private"], color: "var(--color-ink-muted)" },
    { id: "cash", name: "Cash", kinds: ["cash"], color: "var(--chart-1)" },
    { id: "listed", name: "Listed investments — classification pending", kinds: ["listed"], color: "var(--chart-8)" },
    { id: "other", name: "Other recorded assets", kinds: ["other"], color: "var(--chart-9)" },
  ];
  return {
    assetClasses: { taxonomyId: "asset_class", taxonomyName: "Asset class", color: "var(--color-sea)",
      categories: groups.map(g => {
        const value = positions.filter(p => g.kinds.includes(p.kind)).reduce((sum, p) => sum + p.value, 0);
        return { categoryId: g.id, categoryName: g.name, color: g.color, value, percentage: totalValue ? value / totalValue * 100 : 0 };
      }).filter((category) => category.value > 0) },
    sectors: emptyTaxonomy("sector", "Sector"), regions: emptyTaxonomy("region", "Region"),
    riskCategory: emptyTaxonomy("risk", "Risk"), securityTypes: emptyTaxonomy("security_type", "Security type"),
    customGroups: [], totalValue,
  };
}

export function demoIncomeSummary(accountIds: string[]): IncomeSummary[] {
  const prepared = readPreparedOfficePortfolio();
  if (prepared) {
    const fullScope = prepared.accounts.every(account => accountIds.includes(account.id));
    const source = fullScope ? prepared.book.income.filter(row => prepared.book.wealthOwnerIds.includes(row.entity) && row.kind === "income") : [];
    const total = source.reduce((sum, row) => sum + row.amount * prepared.book.fx.find(rate => rate.currency === row.currency)!.average, 0);
    const sourceYear = Number(prepared.asOf.slice(0, 4)), year = new Date().getUTCFullYear();
    return ["ALL", "YTD", "LAST_YEAR", "TWO_YEARS_AGO"].map((period): IncomeSummary => {
      const includes = period === "ALL" || sourceYear === year - (period === "YTD" ? 0 : period === "LAST_YEAR" ? 1 : 2);
      const totalIncome = includes ? total : 0;
      return { period, byMonth: totalIncome ? { [prepared.asOf.slice(0, 7)]: totalIncome } : {}, byType: totalIncome ? { OTHER: totalIncome } : {}, byAsset: {}, byCurrency: { [prepared.currency]: totalIncome }, byCurrencyBase: { [prepared.currency]: totalIncome }, byAccount: {}, totalIncome, currency: prepared.currency, monthlyAverage: totalIncome, yoyGrowth: null, unconvertedCurrencies: [] };
    });
  }
  const year = new Date().getUTCFullYear();
  const currentMonth = new Date().getUTCMonth() + 1;
  const streams = [
    { accountId: "acc-public", assetId: "asset-global-equity", symbol: "GLOBAL", name: "Global Equity Fund", type: "DIVIDEND", amount: 7200 },
    { accountId: "acc-income", assetId: "asset-income", symbol: "INCOME", name: "Diversified Income Fund", type: "INTEREST", amount: 4800 },
  ].filter((stream) => accountIds.includes(stream.accountId));
  const periods = ["ALL", "YTD", "LAST_YEAR", "TWO_YEARS_AGO"];
  return periods.map((period) => {
    const months: string[] = [];
    for (let y = year - 2; y <= year; y++) {
      for (let m = 1; m <= 12; m++) {
        if (y === year && m > currentMonth) continue;
        if (period === "YTD" && y !== year) continue;
        if (period === "LAST_YEAR" && y !== year - 1) continue;
        if (period === "TWO_YEARS_AGO" && y !== year - 2) continue;
        months.push(`${y}-${String(m).padStart(2, "0")}`);
      }
    }
    const byMonth = Object.fromEntries(months.map((month) => [month, streams.reduce((sum, stream) => sum + stream.amount, 0)]));
    const totalIncome = Object.values(byMonth).reduce((sum, amount) => sum + amount, 0);
    const byType = streams.reduce<Record<string, number>>((totals, stream) => {
      totals[stream.type] = (totals[stream.type] ?? 0) + stream.amount * months.length;
      return totals;
    }, {});
    const byAsset = Object.fromEntries(streams.map((stream) => [stream.assetId, {
      assetId: stream.assetId, kind: "INVESTMENT" as const, symbol: stream.symbol, name: stream.name, income: stream.amount * months.length,
    }]));
    const byAccount = Object.fromEntries(streams.map((stream) => [stream.accountId, {
      accountId: stream.accountId, accountName: sampleAccounts().find((account) => account.id === stream.accountId)?.name ?? stream.accountId,
      byMonth: Object.fromEntries(months.map((month) => [month, stream.amount])), total: stream.amount * months.length,
    }]));
    return { period, byMonth, byType, byAsset, byCurrency: { [SAMPLE_CURRENCY]: totalIncome }, byCurrencyBase: { [SAMPLE_CURRENCY]: totalIncome },
      byAccount, totalIncome, currency: SAMPLE_CURRENCY, monthlyAverage: months.length ? totalIncome / months.length : 0,
      yoyGrowth: null, unconvertedCurrencies: [] };
  });
}

export function demoSimplePerformance(): SimplePerformanceResult[] {
  const total = sampleAccounts().reduce((sum, a) => sum + a.value, 0);
  return sampleAccounts().map((account) => {
    if (readPreparedOfficePortfolio()) return { accountId: account.id, totalValue: account.value, accountCurrency: readPreparedOfficePortfolio()!.currency, baseCurrency: readPreparedOfficePortfolio()!.currency, fxRateToBase: 1, totalGainLossAmount: null, cumulativeReturnPercent: null, portfolioWeight: total ? account.value / total : 0 };
    const cost = samplePositions().filter(p => p.accountId === account.id).reduce((sum, p) => sum + p.cost, 0);
    return { accountId: account.id, totalValue: account.value, accountCurrency: SAMPLE_CURRENCY, baseCurrency: SAMPLE_CURRENCY, fxRateToBase: 1,
      totalGainLossAmount: account.value - cost, cumulativeReturnPercent: cost ? (account.value - cost) / cost : 0,
      portfolioWeight: account.value / total };
  });
}

export function demoNetWorth(): NetWorthResponse {
  const prepared = readPreparedOfficePortfolio();
  if (prepared) return { changeAttributionAvailable: false, date: prepared.asOf, assets: { total: prepared.wealth.grossAum, breakdown: prepared.accounts.map(account => ({ category: account.id, name: account.name, value: Number(account.balance ?? 0) })) }, liabilities: { total: prepared.liabilities, breakdown: [{ category: "book-liabilities", name: "Family perimeter liabilities", value: prepared.liabilities }] }, netWorth: prepared.wealth.fairValue, currency: prepared.currency, oldestValuationDate: prepared.history[0]?.asOf ?? prepared.asOf, staleAssets: [] };
  const total = sampleAccounts().reduce((sum, a) => sum + a.value, 0);
  const cash = sampleAccounts().filter(a => a.kind === "CASH").reduce((sum, a) => sum + a.value, 0);
  return { date: AS_OF, assets: { total, breakdown: [
    { category: "investments", name: "Investments", value: total - cash },
    { category: "cash", name: "Cash", value: cash },
  ] }, liabilities: { total: 0, breakdown: [] }, netWorth: total, currency: SAMPLE_CURRENCY, oldestValuationDate: "2024-01-01", staleAssets: [] };
}

export function demoNetWorthHistory(): NetWorthHistoryPoint[] {
  const prepared = readPreparedOfficePortfolio();
  if (prepared) return prepared.history.map(row => ({ date: row.asOf, portfolioValue: row.grossAum, alternativeAssetsValue: 0, totalLiabilities: row.grossAum - row.netWealth, totalAssets: row.grossAum, netWorth: row.netWealth, cumulativeNetContribution: 0, netContribution: row.externalFlow, breakdown: {}, currency: prepared.currency }));
  return demoValuationHistory()
    .filter((v) => v.accountId === "TOTAL")
    .map((v) => ({
      date: v.valuationDate,
      portfolioValue: v.totalValueBase,
      alternativeAssetsValue: 0,
      totalLiabilities: 0,
      totalAssets: v.totalValueBase,
      netWorth: v.totalValueBase,
      cumulativeNetContribution: v.netContributionBase,
      netContribution: v.netContributionBase,
      breakdown: {},
      currency: SAMPLE_CURRENCY,
    }));
}

export function demoAppInfo() {
  return {
    version: "3.11.0-demo",
    dbPath: "(static demo)",
    logsDir: "(static demo)",
  };
}

export function demoHealthStatus() {
  return {
    overallSeverity: "INFO" as const,
    issueCounts: {},
    issues: [],
    checkedAt: NOW,
    isStale: false,
  };
}

export function demoSpendingSettings() {
  return getDemoStore().spendingSettings;
}

export function demoAiProviders() {
  return {
    providers: [],
    capabilities: {},
    defaultProvider: undefined,
  };
}
