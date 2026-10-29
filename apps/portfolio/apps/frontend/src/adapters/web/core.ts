// Static demo adapter core — invoke serves fixtures / localStorage (no HTTP).
import type { Logger } from "../types";
import { selectedProfileId } from "@/features/profiles/session";
import { readActiveIps } from "@/features/governance/constitution/ips";
import type { Account, AccountScope, Goal, NewGoal, NewTaxonomyCategory, Settings, TaxonomyCategory } from "@/lib/types";
import { SAMPLE_ACCOUNTS, SAMPLE_MONTHLY_SPENDING, SAMPLE_POSITIONS, SAMPLE_SPENDING_CATEGORIES } from "../demo-family";
import {
  demoAiProviders,
  demoAllocations,
  demoAppInfo,
  demoCurrentValuation,
  demoHealthStatus,
  demoHoldings,
  demoIncomeSummary,
  demoNetWorth,
  demoNetWorthHistory,
  demoSimplePerformance,
  demoSpendingSettings,
  demoValuationHistory,
  getDemoStore,
  mutateDemoStore,
} from "../static-store";

/** True in every Tauri build (desktop and mobile); use getPlatform() for the OS */
export const isTauri = false;

/** True when running in the web environment */
export const isWeb = true;

export const API_PREFIX = "/api/v1";
export const EVENTS_ENDPOINT = `${API_PREFIX}/events/stream`;
export const AI_CHAT_STREAM_ENDPOINT = `${API_PREFIX}/ai/chat/stream`;

type CommandMap = Record<string, { method: string; path: string }>;

/** Kept for parity with shared modules that index COMMANDS[command]. */
export const COMMANDS: CommandMap = {};

export const logger: Logger = {
  error: (...args: unknown[]) => console.error(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  info: (...args: unknown[]) => console.info(...args),
  debug: (...args: unknown[]) => console.debug(...args),
  trace: (...args: unknown[]) => console.debug(...args),
};

function emptyPage<T = unknown>() {
  return { data: [] as T[], meta: { totalRowCount: 0 } };
}

function asPartialSettings(value: unknown): Partial<Settings> {
  return value && typeof value === "object" ? (value as Partial<Settings>) : {};
}

function scopedAccountIds(filter: AccountScope | undefined): string[] {
  if (!filter || filter.type === "all") return getDemoStore().accounts.map((account) => account.id);
  if (filter.type === "account") return [filter.accountId];
  if (filter.type === "accounts") return filter.accountIds;
  return getDemoStore().portfolios.find((portfolio) => portfolio.id === filter.portfolioId)?.accountIds ?? [];
}

function sampleCashActivities() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, monthOffset) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthOffset, 5)).toISOString();
    return SAMPLE_SPENDING_CATEGORIES.map((name, index) => ({
      id: `expense-${monthOffset}-${index}`, accountId: "acc-cash", activityType: "WITHDRAWAL", status: "POSTED",
      activityDate: date, createdAt: date, updatedAt: date, currency: "USD", amount: String(SAMPLE_MONTHLY_SPENDING[index]),
      notes: name, isUserModified: false, needsReview: false, sourceSystem: "MANUAL", netAmount: -SAMPLE_MONTHLY_SPENDING[index],
      netAmountBase: -SAMPLE_MONTHLY_SPENDING[index], visibleSpendingAmount: SAMPLE_MONTHLY_SPENDING[index],
      cashFlowBucket: "spending", splits: [],
      assignments: [{ id: `assignment-${monthOffset}-${index}`, activityId: `expense-${monthOffset}-${index}`,
        taxonomyId: "spending_categories", categoryId: `family-category-${index}`, weight: 10000,
        source: "manual", createdAt: date, updatedAt: date }],
    }));
  }).flat();
}

function sampleBudget(periodKey?: string) {
  const rows = SAMPLE_SPENDING_CATEGORIES.map((name, index) => ({
    taxonomyId: "spending_categories", categoryId: `family-category-${index}`, groupId: null, parentId: null,
    name: getDemoStore().categories.find((category) => category.id === `family-category-${index}`)?.name ?? name,
    color: "var(--color-sea)", icon: null, target: SAMPLE_MONTHLY_SPENDING[index] * 1.2,
    actual: SAMPLE_MONTHLY_SPENDING[index], rolloverIn: 0, rolloverOut: 0,
    remaining: SAMPLE_MONTHLY_SPENDING[index] * 0.2, overspent: false,
    hasDefaultTarget: true, hasMonthOverride: false, rolloverEnabled: false,
  }));
  const actual = SAMPLE_MONTHLY_SPENDING.reduce((sum, amount) => sum + amount, 0);
  return { state: { groups: [], groupAssignments: [], targets: [], rolloverSettings: [] },
    computed: { currency: "USD", periodKey: periodKey ?? new Date().toISOString().slice(0, 7), fxAsOf: null,
      groupRows: [], ungroupedRows: rows, incomeRows: [], totals: { spendingPlanned: actual * 1.2,
        spendingActual: actual, spendingRemaining: actual * 0.2, incomePlanned: 0, incomeActual: 0,
        groupBuffer: 0, rolloverIn: 0, rolloverOut: 0, overspentCount: 0 } } };
}

function sampleSpendingReport(request: { startDate?: string; endDate?: string; accountIds?: string[] } = {}) {
  const rows = sampleCashActivities().filter((row) =>
    (!request.startDate || row.activityDate.slice(0, 10) >= request.startDate.slice(0, 10)) &&
    (!request.endDate || row.activityDate.slice(0, 10) <= request.endDate.slice(0, 10)) &&
    (!request.accountIds?.length || request.accountIds.includes(row.accountId)));
  const outflow = rows.reduce((sum, row) => sum + row.visibleSpendingAmount, 0);
  const spendingBreakdown = SAMPLE_SPENDING_CATEGORIES.map((_, index) => {
    const matching = rows.filter((row) => row.assignments[0].categoryId === `family-category-${index}`);
    return { taxonomyId: "spending_categories", categoryId: `family-category-${index}`,
      amount: matching.reduce((sum, row) => sum + row.visibleSpendingAmount, 0), count: matching.length };
  }).filter((category) => category.count);
  const days = [...new Set(rows.map((row) => row.activityDate.slice(0, 10)))];
  return { baseCurrency: "USD", current: { income: 0, outflow, saved: 0, net: -outflow, count: rows.length },
    prior: { income: 0, outflow: 0, saved: 0, net: 0, count: 0 }, spendingBreakdown,
    incomeBreakdown: [], savingsBreakdown: [], byDay: days.map((date) => ({ date, income: 0,
      outflow: rows.filter((row) => row.activityDate.startsWith(date)).reduce((sum, row) => sum + row.visibleSpendingAmount, 0) })),
    byDayByCategory: rows.map((row) => ({ date: row.activityDate.slice(0, 10), taxonomyId: "spending_categories",
      categoryId: row.assignments[0].categoryId, amount: row.visibleSpendingAmount, count: 1 })) };
}

function sampleSpendingInsight(request: { startDate?: string; endDate?: string; compareStartDate?: string; compareEndDate?: string; accountIds?: string[] } = {}) {
  const report = sampleSpendingReport(request);
  const start = request.startDate ?? new Date().toISOString();
  const end = request.endDate ?? new Date().toISOString();
  const days = Math.max(1, Math.ceil((Date.parse(end) - Date.parse(start)) / 86400000) + 1);
  const priorEnd = request.compareEndDate ?? new Date(Date.parse(start) - 86400000).toISOString();
  const priorStart = request.compareStartDate ?? new Date(Date.parse(priorEnd) - (days - 1) * 86400000).toISOString();
  const priorReport = sampleSpendingReport({ startDate: priorStart, endDate: priorEnd, accountIds: request.accountIds });
  const months = [...new Set(report.byDay.map((day) => day.date.slice(0, 7)))].sort();
  const count = Math.max(months.length, 1);
  const categories = report.spendingBreakdown.map((row) => {
    const index = Number(row.categoryId.slice("family-category-".length));
    const budget = SAMPLE_MONTHLY_SPENDING[index] * 1.2 * count;
    const priorSpent = priorReport.spendingBreakdown.find((prior) => prior.categoryId === row.categoryId)?.amount ?? 0;
    return { ...row, name: getDemoStore().categories.find((category) => category.id === row.categoryId)?.name ?? SAMPLE_SPENDING_CATEGORIES[index], color: "var(--color-sea)", icon: null,
      parentId: null, budget: { total: budget, monthlyBreakdown: [] }, spent: row.amount, priorSpent,
      deltaVsPriorPct: priorSpent ? (row.amount - priorSpent) / priorSpent : null, remaining: budget - row.amount, overspent: row.amount > budget,
      pctOfTotalSpent: report.current.outflow ? row.amount / report.current.outflow * 100 : null, txnCount: row.count };
  });
  const planned = categories.reduce((sum, category) => sum + category.budget.total, 0);
  const spent = report.current.outflow;
  const group = { id: "family-office", name: "Family office", key: "family-office", color: "var(--color-sea)",
    icon: null, sortOrder: 0, isSystem: false, createdAt: start, updatedAt: end };
  const priorSpent = priorReport.current.outflow;
  return { period: { start, end, months, dayCount: days },
    prior: { start: priorStart, end: priorEnd, months: [...new Set(priorReport.byDay.map((day) => day.date.slice(0, 7)))], dayCount: days }, currency: "USD", foreignCurrencies: [], nativeOutflowByCurrency: {},
    headline: { spent, income: 0, saved: 0, netCashflow: -spent, budget: planned, remaining: planned - spent,
      priorSpent, deltaVsPriorPct: priorSpent ? (spent - priorSpent) / priorSpent : null, pace: { dailyAvg: 0, daysElapsed: 0, daysRemaining: 0,
        projectedSpend: spent, expectedSpendToDate: 0 }, status: "on_track" },
    groups: [{ group, budget: { total: planned, monthlyBreakdown: [] }, buffer: { total: 0, monthlyBreakdown: [] },
      spent, priorSpent, deltaVsPriorPct: priorSpent ? (spent - priorSpent) / priorSpent : null, remaining: planned - spent, overspent: false,
      pctOfTotalSpent: spent ? 100 : null, categories }],
    uncategorized: { spent: 0, priorSpent: 0, deltaVsPriorPct: null, pctOfTotalSpent: null, txnCount: 0 },
    incomeBreakdown: [], savingsBreakdown: [],
    byDay: report.byDay.map((day) => ({ date: day.date, spent: day.outflow, income: day.income })),
    byDayByCategory: report.byDayByCategory,
    byMonth: months.map((month) => ({ month, spent: report.byDay.filter((day) => day.date.startsWith(month))
      .reduce((sum, day) => sum + day.outflow, 0), income: 0, saved: 0 })) };
}

/**
 * Static invoke — demo fixtures + localStorage. Unknown commands return safe empties.
 */
export const invoke = async <T>(
  command: string,
  payload?: Record<string, unknown>,
): Promise<T> => {
  void COMMANDS[command];
  const p = payload ?? {};
  const s = getDemoStore();
  if (/^(create_activity|update_activity|save_activities|delete_activity|delete_activities|import_activities|link_transfer_activities|unlink_transfer_activities|save_holdings|update_holdings|save_snapshot|create_snapshot)$/.test(command)) {
    const active = typeof localStorage === "undefined" ? null : readActiveIps(localStorage, selectedProfileId() ?? "static-demo");
    if (active) throw new Error(`IPS revision ${active.revision} needs review: this local preview cannot project ${command} into portfolio valuations. No trade, activity or holding mutation was performed.`);
  }

  switch (command) {
    case "get_settings":
      return s.settings as T;
    case "update_settings": {
      const patch = asPartialSettings(p.settingsUpdate ?? p);
      mutateDemoStore((st) => {
        st.settings = { ...st.settings, ...patch };
      });
      return getDemoStore().settings as T;
    }
    case "get_accounts":
      return s.accounts as T;
    case "create_account": {
      const input = (p.account ?? p) as Partial<Account>;
      const id = `acc-${crypto.randomUUID().slice(0, 8)}`;
      const account: Account = {
        id,
        name: String(input.name ?? "New account"),
        accountType: (input.accountType as Account["accountType"]) ?? "SECURITIES",
        group: input.group,
        balance: 0,
        currency: String(input.currency ?? "USD"),
        isDefault: false,
        isActive: true,
        isArchived: false,
        trackingMode: (input.trackingMode as Account["trackingMode"]) ?? "NOT_SET",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mutateDemoStore((st) => {
        st.accounts.push(account);
      });
      return account as T;
    }
    case "update_account": {
      const input = (p.accountUpdate ?? p) as Partial<Account> & {
        id?: string;
        accountId?: string;
      };
      const id = input.id ?? input.accountId;
      mutateDemoStore((st) => {
        const i = st.accounts.findIndex((a) => a.id === id);
        if (i >= 0) st.accounts[i] = { ...st.accounts[i], ...input, updatedAt: new Date() };
      });
      return getDemoStore().accounts.find((a) => a.id === id) as T;
    }
    case "delete_account": {
      mutateDemoStore((st) => {
        st.accounts = st.accounts.filter((a) => a.id !== p.accountId && a.id !== p.id);
      });
      return undefined as T;
    }
    case "get_portfolios":
      return s.portfolios as T;
    case "create_portfolio":
    case "update_portfolio_entry":
    case "delete_portfolio_entry":
      return (command === "delete_portfolio_entry" ? undefined : s.portfolios[0]) as T;
    case "get_holdings":
    case "get_holdings_list": {
      const accountIds = scopedAccountIds(p.filter as AccountScope | undefined);
      const holdings = demoHoldings().filter((holding) => accountIds.includes(holding.accountId));
      const total = holdings.reduce((sum, holding) => sum + holding.marketValue.base, 0);
      return holdings.map((holding) => ({ ...holding, weight: total ? holding.marketValue.base / total : 0 })) as T;
    }
    case "get_asset_holdings":
      return demoHoldings().filter((holding) => holding.instrument?.id === p.assetId) as T;
    case "get_assets":
    case "get_asset_profile": {
      const assets = SAMPLE_POSITIONS.filter((position) => position.kind !== "cash").map((position) => ({
        id: `asset-${position.id}`, kind: position.kind === "private" ? "PRIVATE_EQUITY" : "INVESTMENT",
        name: position.name, displayCode: position.symbol, isActive: true, quoteMode: "MANUAL", quoteCcy: "USD",
        instrumentType: "FUND", instrumentSymbol: position.symbol, createdAt: "2025-01-01", updatedAt: "2025-01-01",
      }));
      return (command === "get_assets" ? assets : assets.find((asset) => asset.id === p.assetId) ?? null) as T;
    }
    case "get_latest_quotes":
      return {} as T;
    case "get_holding": {
      const assetId = p.assetId as string | undefined;
      const accountId = p.accountId as string | undefined;
      return (demoHoldings().find(
        (h) =>
          h.id === p.id ||
          (assetId &&
            h.instrument?.id === assetId &&
            (!accountId || h.accountId === accountId)),
      ) ?? null) as T;
    }
    case "get_asset_lots":
    case "get_snapshots":
    case "get_snapshot_by_date":
    case "get_holdings_by_allocation":
      return [] as T;
    case "get_historical_valuations": {
      const accountIds = scopedAccountIds(p.filter as AccountScope | undefined);
      const startDate = p.startDate as string | undefined;
      const endDate = p.endDate as string | undefined;
      const rows = demoValuationHistory().filter((row) => accountIds.includes(row.accountId) &&
        (!startDate || row.valuationDate >= startDate) && (!endDate || row.valuationDate <= endDate));
      const totals = new Map<string, (typeof rows)[number]>();
      for (const row of rows) {
        const existing = totals.get(row.valuationDate);
        if (!existing) totals.set(row.valuationDate, { ...row, accountId: "TOTAL" });
        else {
          for (const key of ["totalValue", "totalValueBase", "costBasis", "costBasisBase", "bookBasis", "bookBasisBase", "netContribution", "netContributionBase", "cashBalance", "cashBalanceBase", "investmentMarketValue", "investmentMarketValueBase", "performanceEligibleValueBase"] as const) {
            existing[key] = (existing[key] ?? 0) + (row[key] ?? 0);
          }
        }
      }
      return [...totals.values()] as T;
    }
    case "get_latest_valuations": {
      const ids = (p.accountIds as string[] | undefined) ?? SAMPLE_ACCOUNTS.map((account) => account.id);
      const history = demoValuationHistory();
      return ids
        .map((id) => [...history].reverse().find((v) => v.accountId === id))
        .filter(Boolean) as T;
    }
    case "get_current_valuation": {
      const valuation = demoCurrentValuation();
      const ids = scopedAccountIds(p.filter as AccountScope | undefined);
      const accounts = valuation.accounts.filter((account) => ids.includes(account.accountId));
      const cash = accounts.reduce((sum, account) => sum + account.cashBalanceBase, 0);
      const invested = accounts.reduce((sum, account) => sum + account.investmentMarketValueBase, 0);
      const total = cash + invested;
      return { ...valuation, accounts, summary: { ...valuation.summary,
        scopeId: ids.join(","), cashBalanceBase: cash, investmentMarketValueBase: invested,
        totalValueBase: total, accountCount: accounts.length,
        holdingsCount: SAMPLE_POSITIONS.filter((position) => ids.includes(position.accountId)).length,
        currencySplit: [{ currency: "USD", valueBase: total, percentage: total ? 100 : 0 }],
        cashCurrencySplit: [{ currency: "USD", valueBase: cash, percentage: cash ? 100 : 0 }],
      } } as T;
    }
    case "get_app_info":
      return demoAppInfo() as T;
    case "get_platform":
      return {
        os: "web",
        arch: "static",
        is_mobile: false,
        is_desktop: true,
        is_tauri: false,
        capabilities: { connect_sync: false, device_sync: false, cloud_sync: false },
      } as T;
    case "is_auto_update_check_enabled":
      return false as T;
    case "check_update":
      return { updateAvailable: false, latestVersion: demoAppInfo().version } as T;
    case "get_goals":
      return s.goals as T;
    case "get_goal":
      return (s.goals.find((goal) => goal.id === p.goalId) ?? null) as T;
    case "get_goal_funding":
      return (p.goalId === "goal-education" ? [{ id: "funding-education", goalId: "goal-education",
        accountId: "acc-education", sharePercent: 100, createdAt: "2025-01-01", updatedAt: "2025-01-01" }] : []) as T;
    case "get_goal_plan":
    case "get_retirement_overview":
    case "get_save_up_overview":
      return null as T;
    case "create_goal": {
      const input = p.goal as NewGoal;
      const goal: Goal = { ...input, id: input.id ?? `goal-${crypto.randomUUID()}`,
        statusLifecycle: input.statusLifecycle ?? "active", statusHealth: input.statusHealth ?? "not_applicable",
        priority: input.priority ?? 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mutateDemoStore((store) => store.goals.push(goal));
      return goal as T;
    }
    case "update_goal": {
      const goal = p.goal as Goal;
      mutateDemoStore((store) => { store.goals = store.goals.map((item) => item.id === goal.id ? goal : item); });
      return goal as T;
    }
    case "delete_goal":
      mutateDemoStore((store) => { store.goals = store.goals.filter((goal) => goal.id !== p.goalId); });
      return undefined as T;
    case "search_activities": {
      const accountIds = p.accountIdFilter as string[] | undefined;
      const types = p.activityTypeFilter as string[] | undefined;
      const keyword = String(p.assetIdKeyword ?? "").toLowerCase();
      const spendingRows = sampleCashActivities().map((row) => ({ id: row.id, accountId: row.accountId, accountName: "Family Office Operating Cash",
          accountCurrency: "USD", assetId: "", assetSymbol: "", assetName: row.notes,
          activityType: row.activityType, status: row.status, date: new Date(row.activityDate),
          amount: row.amount, currency: row.currency, quantity: null, unitPrice: null, fee: null,
          needsReview: false, comment: row.notes, createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt) }));
      const now = new Date();
      const incomeRows = Array.from({ length: 12 }, (_, offset) => {
        const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 5));
        return [
          { accountId: "acc-public", accountName: "Long-term Family Capital", assetId: "asset-global-equity", assetSymbol: "GLOBAL", assetName: "Global Equity Fund", activityType: "DIVIDEND", amount: "7200" },
          { accountId: "acc-income", accountName: "Income and Reserves", assetId: "asset-income", assetSymbol: "INCOME", assetName: "Diversified Income Fund", activityType: "INTEREST", amount: "4800" },
        ].map((row, index) => ({ ...row, id: `income-${offset}-${index}`, accountCurrency: "USD", currency: "USD",
          status: "POSTED", date, quantity: null, unitPrice: null, fee: null, needsReview: false,
          comment: "", createdAt: date, updatedAt: date }));
      }).flat();
      const rows = [...incomeRows, ...spendingRows].filter((row) =>
        (!accountIds?.length || accountIds.includes(row.accountId)) && (!types?.length || types.includes(row.activityType)) &&
        (p.needsReviewFilter === undefined || row.needsReview === p.needsReviewFilter) &&
        (!keyword || `${row.assetName} ${row.assetSymbol}`.toLowerCase().includes(keyword)) &&
        (!p.dateFrom || row.date.toISOString().slice(0, 10) >= String(p.dateFrom)) &&
        (!p.dateTo || row.date.toISOString().slice(0, 10) <= String(p.dateTo)))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      const page = Number(p.page ?? 0), pageSize = Number(p.pageSize ?? 25);
      return { data: rows.slice(page * pageSize, (page + 1) * pageSize), meta: { totalRowCount: rows.length } } as T;
    }
    case "list_cash_activities": {
      const filter = (p.filter ?? {}) as { accountIds?: string[]; startDate?: string; endDate?: string; activityTypes?: string[] };
      return sampleCashActivities().filter((row) =>
        (!filter.accountIds?.length || filter.accountIds.includes(row.accountId)) &&
        (!filter.activityTypes?.length || filter.activityTypes.includes(row.activityType)) &&
        (!filter.startDate || row.activityDate.slice(0, 10) >= filter.startDate.slice(0, 10)) &&
        (!filter.endDate || row.activityDate.slice(0, 10) <= filter.endDate.slice(0, 10))) as T;
    }
    case "get_activity_assignments":
      return (sampleCashActivities().find((activity) => activity.id === p.activityId)?.assignments ?? []) as T;
    case "get_activity_splits":
      return [] as T;
    case "search_cash_activities": {
      const request = (p.request ?? {}) as { status?: string; limit?: number; offset?: number; search?: string;
        accountIds?: string[]; categoryIds?: string[]; activityTypes?: string[]; startDate?: string; endDate?: string;
        minAmount?: number; maxAmount?: number };
      const rows = sampleCashActivities().filter((row) =>
        request.status !== "uncategorized" && request.status !== "needs_review" &&
        (!request.accountIds?.length || request.accountIds.includes(row.accountId)) &&
        (!request.activityTypes?.length || request.activityTypes.includes(row.activityType)) &&
        (!request.categoryIds?.length || request.categoryIds.includes(row.assignments[0].categoryId)) &&
        (!request.search || row.notes.toLowerCase().includes(request.search.toLowerCase())) &&
        (!request.startDate || row.activityDate.slice(0, 10) >= request.startDate.slice(0, 10)) &&
        (!request.endDate || row.activityDate.slice(0, 10) <= request.endDate.slice(0, 10)) &&
        (request.minAmount === undefined || row.visibleSpendingAmount >= request.minAmount) &&
        (request.maxAmount === undefined || row.visibleSpendingAmount <= request.maxAmount));
      return { items: rows.slice(request.offset ?? 0, (request.offset ?? 0) + (request.limit ?? rows.length)), totalCount: rows.length } as T;
    }
    case "get_income_summary":
      return demoIncomeSummary(scopedAccountIds(p.filter as AccountScope | undefined)) as T;
    case "get_portfolio_allocations":
      return demoAllocations(scopedAccountIds(p.filter as AccountScope | undefined)) as T;
    case "calculate_accounts_simple_performance":
      return demoSimplePerformance() as T;
    case "calculate_performance_history": {
      const filter = (p.filter ?? (String(p.itemId).startsWith("acc-")
        ? { type: "account", accountId: p.itemId } : { type: "all" })) as AccountScope;
      const history = p.itemType === "symbol" ? [] : await invoke<ReturnType<typeof demoValuationHistory>>(
        "get_historical_valuations", { filter, startDate: p.startDate, endDate: p.endDate },
      );
      const start = history[0]?.totalValueBase ?? 0;
      const end = history.at(-1)?.totalValueBase ?? 0;
      const valueReturn = start ? (end - start) / start : null;
      return {
        scope: { id: String(p.itemId ?? "demo"), currency: "USD" },
        period: { startDate: history[0]?.valuationDate, endDate: history.at(-1)?.valuationDate },
        mode: valueReturn === null ? "notApplicable" : "valueReturn",
        returns: { twr: null, irr: null, valueReturn, annualizedValueReturn: null },
        risk: {}, attribution: {},
        dataQuality: { status: valueReturn === null ? "noData" : "partial", warnings: [], notApplicableReasons: [] },
        summary: valueReturn === null ? undefined : { amount: end - start, percent: valueReturn, method: "valueReturn",
          basis: "marketValue", quality: "partial", amountStatus: "complete", percentStatus: "complete", basisStatus: "complete", reasons: [] },
        series: start ? history.map((row) => ({ date: row.valuationDate, value: (row.totalValueBase - start) / start })) : [],
      } as T;
    }
    case "calculate_performance_summary":
      return {
        scope: { id: String(p.itemId ?? "demo"), currency: "USD" },
        summary: null,
        series: [],
      } as T;
    case "get_performance_summaries":
      return {} as T;
    case "get_exchange_rates":
    case "get_latest_exchange_rates":
      return [
        {
          id: "usd-usd",
          fromCurrency: "USD",
          toCurrency: "USD",
          rate: 1,
          source: "demo",
          timestamp: new Date().toISOString(),
        },
      ] as T;
    case "get_exchange_rates_for_dates":
      return [] as T;
    case "list_installed_addons":
    case "get_installed_addons":
    case "get_enabled_addons":
    case "get_enabled_addons_on_startup":
    case "fetch_addon_store_listings":
      return [] as T;
    case "get_market_data_providers":
    case "get_market_data_providers_settings":
    case "get_custom_providers":
    case "get_exchanges":
      return [] as T;
    case "search_symbol":
    case "get_quote_history":
    case "fetch_dividends":
      return [] as T;
    case "list_asset_logos":
      return [] as T;
    case "get_asset_logo":
      return null as T;
    case "get_health_status":
    case "run_health_checks":
      return demoHealthStatus() as T;
    case "get_dismissed_health_issues":
      return [] as T;
    case "get_health_config":
      return {
        stalePriceWarningDays: 7,
        stalePriceErrorDays: 30,
        criticalMvThresholdPercent: 5,
        enabled: true,
      } as T;
    case "get_database_encryption_status":
      return { enabled: false, supported: false } as T;
    case "list_database_backups":
    case "backup_database":
      return (command === "backup_database" ? { filename: "demo.db" } : []) as T;
    case "get_spend_categories":
    case "list_categorization_rules":
    case "list_rule_presets":
    case "list_event_types":
    case "list_events":
      return [] as T;
    case "get_spending_settings":
      return demoSpendingSettings() as T;
    case "update_spending_settings":
      mutateDemoStore((store) => { store.spendingSettings = { ...store.spendingSettings, ...(p.update as object) }; });
      return demoSpendingSettings() as T;
    case "get_budget":
    case "get_budget_readonly":
      return sampleBudget(p.periodKey as string | undefined) as T;
    case "get_spending_report":
      return sampleSpendingReport(p.request as { startDate?: string; endDate?: string; accountIds?: string[] }) as T;
    case "get_spending_insight":
      return sampleSpendingInsight(p.request as { startDate?: string; endDate?: string; accountIds?: string[] }) as T;
    case "get_spending_context":
      return demoSpendingSettings() as T;
    case "get_contribution_limits":
      return [] as T;
    case "get_taxonomies":
      return ["spending_categories", "income_sources", "savings_categories"].map((id, index) => ({
        id, name: ["Family spending", "Income sources", "Savings purposes"][index], color: "var(--color-sea)",
        isSystem: true, isSingleSelect: true, sortOrder: index, createdAt: "2025-01-01", updatedAt: "2025-01-01", scope: "activity" })) as T;
    case "get_taxonomy": {
      const id = String(p.id);
      const names = id === "spending_categories" ? SAMPLE_SPENDING_CATEGORIES : id === "income_sources"
        ? ["Investment dividends", "Interest income", "Family business distributions"] : id === "savings_categories"
          ? ["Next generation education", "Long-term family capital", "Arts and cultural patronage"] : null;
      if (!names) return null as T;
      const taxonomy = { id, name: id === "spending_categories" ? "Family spending" : id === "income_sources" ? "Income sources" : "Savings purposes", color: "var(--color-sea)",
        isSystem: true, isSingleSelect: true, sortOrder: 0, createdAt: "2025-01-01", updatedAt: "2025-01-01", scope: "activity" };
      const categories = s.categories.filter((category) => category.taxonomyId === id);
      return { taxonomy, categories } as T;
    }
    case "create_category": {
      const input = p.category as NewTaxonomyCategory;
      if (s.categories.some((category) => category.taxonomyId === input.taxonomyId && category.key === input.key)) {
        throw new Error("A category with this key already exists in the taxonomy");
      }
      const category: TaxonomyCategory = { ...input, id: input.id ?? `category-${crypto.randomUUID()}`,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mutateDemoStore((store) => store.categories.push(category));
      return category as T;
    }
    case "update_category": {
      const category = p.category as TaxonomyCategory;
      mutateDemoStore((store) => { store.categories = store.categories.map((item) => item.id === category.id ? category : item); });
      return category as T;
    }
    case "delete_category": {
      const id = String(p.categoryId);
      if (sampleCashActivities().some((row) => row.assignments.some((assignment) => assignment.categoryId === id))) {
        throw new Error("This category is used by sample transactions.");
      }
      mutateDemoStore((store) => { store.categories = store.categories.filter((category) => category.id !== id); });
      return 1 as T;
    }
    case "get_asset_taxonomy_assignments":
      return [] as T;
    case "get_migration_status":
      return { needsMigration: false, legacyCount: 0 } as T;
    case "get_secret":
    case "get_addon_secret":
    case "get_addon_storage_item":
      return null as T;
    case "set_secret":
    case "delete_secret":
    case "set_addon_secret":
    case "delete_addon_secret":
    case "set_addon_storage_item":
    case "delete_addon_storage_item":
      return undefined as T;
    case "get_net_worth":
      return demoNetWorth() as T;
    case "get_net_worth_history":
      return demoNetWorthHistory() as T;
    case "get_alternative_holdings":
      return [] as T;
    case "get_ai_providers":
      return demoAiProviders() as T;
    case "list_ai_models":
      return { models: [], supportsListing: false } as T;
    case "list_ai_threads":
      return emptyPage() as T;
    case "get_ai_thread":
    case "get_ai_thread_messages":
    case "get_ai_thread_tags":
      return (command === "get_ai_thread_messages" || command === "get_ai_thread_tags"
        ? []
        : null) as T;
    case "list_allocation_targets":
    case "list_allocation_target_weights":
    case "list_target_constraints":
      return [] as T;
    case "get_allocation_target":
      return null as T;
    case "get_allocation_target_drift":
      return { items: [], totalValue: 0 } as T;
    case "update_portfolio":
    case "recalculate_portfolio":
    case "synch_quotes":
    case "sync_market_data":
      return undefined as T;
    case "reset_all_provider_history":
    case "reset_provider_history":
      throw new Error("Provider history reset is unavailable in the static demo; no data was changed.");
    case "get_sync_session_status":
    case "restore_sync_session":
    case "get_user_info":
    case "get_device_sync_state":
    case "device_sync_engine_status":
    case "get_device":
      return null as T;
    case "list_broker_connections":
    case "list_broker_accounts":
    case "get_synced_accounts":
    case "get_platforms":
    case "get_broker_sync_states":
    case "get_broker_ingest_states":
    case "get_import_runs":
    case "get_data_import_runs":
    case "list_devices":
    case "get_subscription_plans":
    case "get_subscription_plans_public":
      return [] as T;
    case "clear_sync_session":
    case "store_sync_session":
    case "post_login_bootstrap":
    case "device_sync_trigger_cycle":
    case "device_sync_start_background_engine":
    case "device_sync_stop_background_engine":
      return undefined as T;
    case "get_agent_access_status":
      return { enabled: false, tokenCount: 0 } as T;
    case "list_agent_access_tokens":
    case "list_agent_audit_log":
      return [] as T;
    default:
      console.warn(`[static-demo] unhandled command "${command}" — returning empty`);
      if (
        command.startsWith("list_") ||
        command.startsWith("get_") ||
        command.startsWith("search_")
      ) {
        return [] as T;
      }
      return undefined as T;
  }
};

export function openUrl(url: string): Promise<void> {
  window.open(url, "_blank", "noopener,noreferrer");
  return Promise.resolve();
}

export function getPlatform() {
  return invoke("get_platform");
}
