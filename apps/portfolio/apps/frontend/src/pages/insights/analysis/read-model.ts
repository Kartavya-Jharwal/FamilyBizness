// Adapted from the Ghostfolio analysis donor. See public/open-source/ghostfolio/NOTICE.md.
// This boundary only translates host reads; it does not evaluate investment rules.
import type { AccountValuation, Holding, PerformanceResult } from "@/lib/types";

const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
export const REVIEW_RULES = [
  {
    id: "equity-concentration",
    title: "Equity concentration",
    requirement:
      "Mapped equity classifications, a complete valuation and an agreed concentration threshold.",
  },
  {
    id: "fee-ratio",
    title: "Fee ratio",
    requirement:
      "Fees and investment-volume inputs for the same period, with an agreed fee threshold.",
  },
] as const;
export type RuleId = (typeof REVIEW_RULES)[number]["id"];
export type RulePreferences = Record<RuleId, boolean>;
export function ruleEnabled(
  preferences: Partial<RulePreferences> | null,
  id: RuleId,
) {
  return typeof preferences?.[id] === "boolean" ? preferences[id] : true;
}

export function analysisHoldings(holdings: Holding[], currency: string) {
  const seen = new Set<string>();
  const exclusions: { id: string; name: string; reason: string }[] = [];
  const positions: Holding[] = [];
  for (const holding of holdings) {
    const key = `${holding.accountId}:${holding.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (holding.isClosed) continue;
    const name =
      holding.instrument?.name ?? holding.instrument?.symbol ?? holding.id;
    const instrumentId = holding.instrument?.id;
    // An aggregate and its underlying accounts are alternative representations.
    const overlapping =
      instrumentId &&
      holdings.some(
        (other) =>
          other !== holding &&
          !other.isClosed &&
          (other.accountId !== holding.accountId || other.id !== holding.id) &&
          other.instrument?.id === instrumentId &&
          ((holding.sourceAccountIds?.length &&
            (holding.sourceAccountIds.includes(other.accountId) ||
              other.sourceAccountIds?.some((id) =>
                holding.sourceAccountIds?.includes(id),
              ))) ||
            other.sourceAccountIds?.includes(holding.accountId)),
      );
    const reason = overlapping
      ? "Overlapping account and aggregate records"
      : holding.baseCurrency !== currency
        ? "Base currency differs; no conversion applied"
        : !finite(holding.marketValue?.base)
          ? "Base value unavailable"
          : holding.marketValue.base < 0
            ? "Short exposure requires a separate denominator"
            : !holding.asOfDate
              ? "Valuation date unavailable"
              : null;
    if (reason) exclusions.push({ id: key, name, reason });
    else positions.push(holding);
  }
  const dates = [
    ...new Set(positions.map((p) => p.asOfDate.slice(0, 10))),
  ].sort();
  const total = positions.reduce(
    (sum, position) => sum + position.marketValue.base,
    0,
  );
  return { positions, exclusions, total, dates, mixedDates: dates.length > 1 };
}

// All weights at this boundary are fractions (0..1), never percentage points.
export interface FundConstituents {
  instrumentId: string;
  asOfDate: string;
  constituents: { id: string; name: string; weight: number }[];
}
export function fundLookThrough(
  model: ReturnType<typeof analysisHoldings>,
  snapshots: FundConstituents[],
) {
  const funds = model.positions.filter(
    (p) =>
      p.holdingType.toLowerCase() !== "cash" &&
      p.assetKind !== "PRIVATE_EQUITY" &&
      ["ETF", "FUND", "MUTUALFUND", "MUTUAL_FUND"].includes(
        p.instrument?.instrumentType?.toUpperCase() ?? "",
      ),
  );
  const excluded: { id: string; name: string; reason: string }[] = [];
  const companies = new Map<
    string,
    {
      id: string;
      name: string;
      value: number;
      parents: {
        id: string;
        name: string;
        value: number;
        weight: number;
        asOfDate: string;
      }[];
    }
  >();
  let coveredFundValue = 0;
  let coveredFunds = 0;
  for (const fund of funds) {
    const name = fund.instrument?.name ?? fund.id;
    const matches = snapshots.filter(
      (s) => s.instrumentId === fund.instrument?.id,
    );
    const snapshot = matches.length === 1 ? matches[0] : undefined;
    const weights = snapshot?.constituents ?? [];
    const sum = weights.reduce(
      (total, constituent) => total + constituent.weight,
      0,
    );
    const invalid =
      weights.some(
        (c) => !c.id || !finite(c.weight) || c.weight < 0 || c.weight > 1,
      ) ||
      sum > 1.000001 ||
      new Set(weights.map((c) => c.id)).size !== weights.length;
    if (
      model.mixedDates ||
      !snapshot ||
      !weights.length ||
      invalid ||
      snapshot.asOfDate !== fund.asOfDate.slice(0, 10)
    ) {
      excluded.push({
        id: fund.id,
        name,
        reason: model.mixedDates
          ? "Mixed valuation dates"
          : !snapshot
            ? "Constituent data unavailable"
            : invalid
              ? "Invalid constituent weights"
              : "Missing or mismatched constituent date",
      });
      continue;
    }
    coveredFunds++;
    coveredFundValue += fund.marketValue.base;
    for (const constituent of weights) {
      const value = fund.marketValue.base * constituent.weight;
      const company = companies.get(constituent.id) ?? {
        id: constituent.id,
        name: constituent.name,
        value: 0,
        parents: [],
      };
      company.value += value;
      company.parents.push({
        id: `${fund.accountId}:${fund.id}`,
        name,
        value,
        weight: constituent.weight,
        asOfDate: snapshot.asOfDate,
      });
      companies.set(constituent.id, company);
    }
  }
  const exposures = [...companies.values()].sort((a, b) => b.value - a.value);
  const coveredExposure = exposures.reduce(
    (total, company) => total + company.value,
    0,
  );
  return {
    funds,
    excluded,
    coveredFunds,
    coveredFundValue,
    coveredExposure,
    exposures,
    fundValue: funds.reduce((total, fund) => total + fund.marketValue.base, 0),
    excludedNonFunds: model.positions.length - funds.length,
  };
}

export function returnDetail(
  result: PerformanceResult | undefined,
  currency: string,
) {
  if (
    !result ||
    result.scope.currency !== currency ||
    result.mode === "notApplicable" ||
    ["noData", "notApplicable"].includes(result.dataQuality.status)
  )
    return null;
  const summary =
    result.summary?.method === result.mode ? result.summary : undefined;
  return {
    method: result.mode,
    quality: result.dataQuality.status,
    period: result.period,
    amount:
      summary?.amountStatus === "complete" && finite(summary.amount)
        ? summary.amount
        : null,
    percent:
      summary?.percentStatus === "complete" && finite(summary.percent)
        ? summary.percent
        : null,
    breakdown: (
      [
        ["income", "Income"],
        ["realizedPnl", "Realised P&L"],
        ["unrealizedPnlChange", "Unrealised P&L change"],
        ["fxEffect", "Currency effect"],
        ["fees", "Fees"],
        ["taxes", "Taxes"],
        ["residual", "Residual"],
      ] as const
    ).map(([key, label]) => ({
      key,
      label,
      value: finite(result.attribution?.[key]) ? result.attribution[key] : null,
    })),
    warnings: [
      ...(result.dataQuality.warnings ?? []),
      ...(result.summary?.reasons ?? []),
    ],
  };
}

export function evolutionSeries(rows: AccountValuation[], currency: string) {
  // The host adapter returns one TOTAL row per date; reject ambiguous series.
  const seen = new Set<string>();
  return rows
    .filter(
      (row) =>
        row.accountId === "TOTAL" &&
        row.baseCurrency === currency &&
        finite(row.totalValueBase) &&
        row.valueStatus === "complete",
    )
    .sort((a, b) => a.valuationDate.localeCompare(b.valuationDate))
    .flatMap((row) => {
      if (seen.has(row.valuationDate)) return [];
      seen.add(row.valuationDate);
      if (
        rows.filter(
          (other) =>
            other.accountId === "TOTAL" &&
            other.valuationDate === row.valuationDate,
        ).length !== 1
      )
        return [];
      return [{ date: row.valuationDate, value: row.totalValueBase }];
    });
}
