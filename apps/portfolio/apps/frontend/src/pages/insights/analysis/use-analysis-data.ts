import {
  calculatePerformanceHistory,
  getHistoricalValuations,
} from "@/adapters";
import { useHoldings } from "@/hooks/use-holdings";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useAccountScopeStore } from "@/lib/account-scope-store";
import { useSettingsContext } from "@/lib/settings-provider";
import { getPerformanceDateRangeForRequest } from "@/lib/performance-date-range";
import {
  DASHBOARD_PERIOD_STORAGE_KEY,
  portfolioViewForPick,
  type DashboardPeriodPick,
} from "@/features/spending/lib/dashboard-period-sync";
import { formatZonedDateKey } from "@/features/spending/lib/timezone";
import type { DateRange } from "@/lib/types";
import { parseLocalDate } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/query-keys";
import { format, subDays, subMonths } from "date-fns";
import { analysisHoldings } from "./read-model";

export function useAnalysisHoldings() {
  const client = useQueryClient();
  const scope = useAccountScopeStore((state) => state.scope);
  const { settings } = useSettingsContext();
  const currency = settings?.baseCurrency ?? "USD";
  const query = useHoldings(scope);
  return {
    ...query,
    refetch: () =>
      client.refetchQueries({ queryKey: [QueryKeys.HOLDINGS, scope] }),
    currency,
    model: analysisHoldings(query.holdings, currency),
  };
}

export function useAnalysisHistory() {
  const scope = useAccountScopeStore((state) => state.scope);
  const { settings } = useSettingsContext();
  const todayISO = formatZonedDateKey(new Date(), settings?.timezone);
  const today = parseLocalDate(todayISO);
  const [savedRange] = usePersistentState<DateRange | undefined | null>(
    "performance:dateRange",
    null,
  );
  const [pick] = usePersistentState<DashboardPeriodPick | null>(
    DASHBOARD_PERIOD_STORAGE_KEY,
    null,
  );
  const view = pick && portfolioViewForPick(pick, todayISO);
  // Same period policy as the host Performance workspace; no donor date store.
  const sharedRange =
    view?.code === "1D"
      ? { from: subDays(today, 7), to: today }
      : view?.code === "ALL"
        ? { from: new Date(1970, 0, 1), to: today }
        : view?.range;
  const range = getPerformanceDateRangeForRequest(
    sharedRange ??
      (savedRange === null
        ? { from: subMonths(today, 12), to: today }
        : savedRange),
  );
  const start = range?.from ? format(range.from, "yyyy-MM-dd") : undefined;
  const end = range?.to ? format(range.to, "yyyy-MM-dd") : undefined;
  const query = useQuery({
    queryKey: ["analysis-history", scope, start ?? null, end ?? null],
    queryFn: async () => {
      const [performance, valuations] = await Promise.all([
        calculatePerformanceHistory(
          "account",
          "TOTAL",
          start,
          end,
          undefined,
          scope,
        ),
        getHistoricalValuations(scope, start, end),
      ]);
      return { performance, valuations };
    },
  });
  return {
    ...query,
    requestedPeriod: start && end ? `${start} – ${end}` : "All time",
  };
}
