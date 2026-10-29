// React adaptation of the Ghostfolio analysis donor; upstream notices accompany this feature.
import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Layers, Info, ScanLine } from "lucide-react";
import {
  AmountDisplay,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useAmountFormatting,
  useNumberFormatting,
} from "@fb/ui";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useBalancePrivacy } from "@/hooks/use-balance-privacy";
import {
  REVIEW_RULES,
  evolutionSeries,
  fundLookThrough,
  returnDetail,
  ruleEnabled,
  type RulePreferences,
} from "./read-model";
import { useAnalysisHistory, useAnalysisHoldings } from "./use-analysis-data";
import { FundExposure } from "./fund-exposure";

function AnalysisCredit() {
  return (
    <p className="text-muted-foreground text-xs">
      <Link className="underline underline-offset-4" to="/open-source">
        Open-source attribution and licenses
      </Link>
    </p>
  );
}
function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/50 text-muted-foreground flex gap-3 rounded-lg border p-4 text-sm">
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
function Loading() {
  return (
    <div aria-label="Loading analysis" className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
function Failure({ retry }: { retry: () => void }) {
  return (
    <Notice>
      <p>Analysis inputs could not be loaded. No results are shown.</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={retry}>
        Try again
      </Button>
    </Notice>
  );
}

export function InvestmentReviewPage() {
  const { model, currency, isLoading, isError, refetch } =
    useAnalysisHoldings();
  const [preferences, setPreferences] =
    usePersistentState<Partial<RulePreferences> | null>(
      "analysis:review-rules",
      {},
    );
  const [tab, setTab] = useState("review");
  const { isBalanceHidden } = useBalancePrivacy();
  const enabled = REVIEW_RULES.filter((rule) =>
    ruleEnabled(preferences, rule.id),
  ).length;
  if (isLoading) return <Loading />;
  if (isError) return <Failure retry={() => void refetch()} />;
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <ScanLine
            aria-hidden="true"
            className="text-muted-foreground size-5"
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            Portfolio X-ray
          </h1>
          <Badge variant="outline">Preview</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Review investment questions and understand the data behind your
          portfolio.
        </p>
      </header>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="X-ray views">
          <TabsTrigger value="review">Investment review</TabsTrigger>
          <TabsTrigger value="returns">Return detail</TabsTrigger>
        </TabsList>
        <TabsContent value="review" className="mt-5 space-y-5">
          <Notice>
            Fictional sample portfolio · Rules are not evaluated. Enabling a rule
            saves your review preference; it does not assess your investments.
            Data Health remains a separate workspace.
          </Notice>
          {!model.positions.length ? (
            <Notice>
              No eligible holdings in this scope. Choose another account to
              review available inputs.
            </Notice>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>
                    Portfolio value in scope · {currency}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AmountDisplay
                    value={model.total}
                    currency={currency}
                    isHidden={isBalanceHidden}
                    className="text-2xl font-semibold tabular-nums"
                  />
                  <p className="text-muted-foreground mt-2 text-xs">
                    {model.positions.length} holdings · cash included
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Review coverage</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">0 / {enabled}</p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Enabled rules evaluated · no pass/fail score
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Valuation dates</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">
                    {model.dates.length === 1 ? model.dates[0] : "Mixed dates"}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {model.mixedDates
                      ? "Align dates before evaluating rules"
                      : "Source holding snapshot"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          <section aria-label="Investment review rules" className="space-y-3">
            {REVIEW_RULES.map((rule) => {
              const active = ruleEnabled(preferences, rule.id);
              return (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <CardTitle className="text-base">
                          {rule.title}
                        </CardTitle>
                        <Badge variant={active ? "info-subtle" : "outline"}>
                          {active ? "Not evaluated" : "Disabled"}
                        </Badge>
                      </div>
                      <Switch
                        aria-label={`Enable ${rule.title.toLowerCase()} review`}
                        checked={active}
                        onCheckedChange={(checked) =>
                          setPreferences((previous) => ({
                            ...previous,
                            [rule.id]: checked,
                          }))
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="text-muted-foreground">{rule.requirement}</p>
                    <p>
                      {active
                        ? "Evaluation is unavailable for this rule. No outcome or threshold has been assumed."
                        : "Excluded from review coverage. Re-enable to include it in your review list."}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </section>
          {!!model.exclusions.length && (
            <Notice>
              {model.exclusions.length} holding records excluded from readable
              value:{" "}
              {model.exclusions
                .map((row) => `${row.name}: ${row.reason}`)
                .join("; ")}
              . Totals above cover readable inputs only.
            </Notice>
          )}
        </TabsContent>
        <TabsContent value="returns" className="mt-5">
          <ReturnDetail currency={currency} />
        </TabsContent>
      </Tabs>
      <AnalysisCredit />
    </div>
  );
}

function ReturnDetail({ currency }: { currency: string }) {
  const query = useAnalysisHistory();
  const { isBalanceHidden } = useBalancePrivacy();
  const formatting = useNumberFormatting();
  const amounts = useAmountFormatting();
  if (query.isLoading) return <Loading />;
  if (query.isError) return <Failure retry={() => void query.refetch()} />;
  const detail = returnDetail(query.data?.performance, currency);
  const series = evolutionSeries(query.data?.valuations ?? [], currency);
  const method =
    detail?.method === "valueReturn"
      ? "Value return"
      : detail?.method === "timeWeighted"
        ? "Time-weighted return"
        : detail?.method === "symbolPriceBased"
          ? "Price return"
          : "Unavailable";
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Requested period: {query.requestedPeriod}
        </p>
        <Link
          className="text-sm underline underline-offset-4"
          to="/insights?tab=performance"
        >
          Change period in Performance
        </Link>
      </div>
      <Notice>
        Uses the same account scope and period as Performance. Value return
        describes valuation change; it is not a money-weighted return or TWR.
        Missing attribution is shown as unavailable.
      </Notice>
      {!detail ? (
        <Notice>
          No compatible return data for this currency and period. Choose a wider
          period in Performance or another account.
        </Notice>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{method}</CardTitle>
                <Badge
                  variant={
                    detail.quality === "partial" ? "warning-subtle" : "outline"
                  }
                >
                  {detail.quality === "partial"
                    ? "Partial data"
                    : "Available data"}
                </Badge>
              </div>
              <CardDescription>
                Source period: {detail.period.startDate ?? "Unavailable"} –{" "}
                {detail.period.endDate ?? "Unavailable"} · {currency}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground mb-1 text-sm">
                  Period amount
                </p>
                {detail.amount === null ? (
                  <p>Unavailable</p>
                ) : (
                  <AmountDisplay
                    value={detail.amount}
                    currency={currency}
                    isHidden={isBalanceHidden}
                    className="text-2xl font-semibold tabular-nums"
                  />
                )}
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-sm">
                  Period return · not annualised
                </p>
                <p className="text-2xl font-semibold tabular-nums">
                  {isBalanceHidden
                    ? "••••"
                    : detail.percent === null
                      ? "Unavailable"
                      : formatting.formatPercent(detail.percent)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Return breakdown</CardTitle>
              <CardDescription>
                Components for this period. Missing data is shown as unavailable.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="divide-y">
                {detail.breakdown.map((row) => (
                  <div
                    key={row.key}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                  >
                    <dt>{row.label}</dt>
                    <dd className="tabular-nums">
                      {row.value === null ? (
                        <span className="text-muted-foreground">
                          Unavailable
                        </span>
                      ) : (
                        <AmountDisplay
                          value={row.value}
                          currency={currency}
                          isHidden={isBalanceHidden}
                        />
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
          {!!detail.warnings.length && (
            <Notice>{detail.warnings.join(" · ")}</Notice>
          )}
        </>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity aria-hidden="true" className="size-4" />
            Portfolio evolution
          </CardTitle>
          <CardDescription>
            Historical total value, including cash · {currency}. Dates may
            differ from the current holding snapshot.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isBalanceHidden ? (
            <p className="text-muted-foreground py-8 text-sm">
              Chart hidden while balance privacy is enabled.
            </p>
          ) : series.length < 2 ? (
            <p className="text-muted-foreground py-8 text-sm">
              At least two compatible valuation dates are required.
            </p>
          ) : (
            <div
              className="h-64 w-full min-w-0"
              role="img"
              aria-label={`Portfolio value in ${currency}, ${series[0].date} to ${series.at(-1)?.date}`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={series}
                  margin={{ top: 12, right: 12, left: 12, bottom: 4 }}
                >
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    minTickGap={50}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickFormatter={(date) => String(date).slice(0, 7)}
                  />
                  <YAxis
                    width={72}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickFormatter={(value) =>
                      amounts.formatCompactAmount(value, currency, false)
                    }
                  />
                  <Tooltip
                    itemStyle={{ color: "var(--popover-foreground)" }}
                    labelStyle={{ color: "var(--popover-foreground)" }}
                    contentStyle={{
                      background: "var(--popover)",
                      color: "var(--popover-foreground)",
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value) => [
                      amounts.formatAmount(Number(value), currency),
                      "Portfolio value",
                    ]}
                  />
                  <Line
                    dataKey="value"
                    name="Portfolio value"
                    type="monotone"
                    stroke="var(--series-1)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer underline underline-offset-4">
              View historical values as a table
            </summary>
            <div className="mt-3 max-h-64 overflow-auto">
              <table className="w-full text-left">
                <caption className="sr-only">
                  Historical values in {currency}
                </caption>
                <thead>
                  <tr>
                    <th className="py-2">Date</th>
                    <th className="py-2 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {series.map((row) => (
                    <tr key={row.date} className="border-t">
                      <td className="py-2">{row.date}</td>
                      <td className="py-2 text-right tabular-nums">
                        <AmountDisplay
                          value={row.value}
                          currency={currency}
                          isHidden={isBalanceHidden}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </CardContent>
      </Card>
      <Notice>
        Investment contribution timeline unavailable: reconciled external flows
        are missing for this period. Purchases and cost basis
        are not substituted for contributions.
      </Notice>
    </div>
  );
}

export function FundLookThroughPage() {
  const { model, currency, isLoading, isError, refetch } =
    useAnalysisHoldings();
  const formatting = useNumberFormatting();
  const { isBalanceHidden } = useBalancePrivacy();
  // Host has no constituent provider. Never apply the donor's unrelated ETF fixtures.
  const coverage = fundLookThrough(model, []);
  if (isLoading) return <Loading />;
  if (isError) return <Failure retry={() => void refetch()} />;
  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-6">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Layers aria-hidden="true" className="text-muted-foreground size-5" />
          Fund look-through
        </h1>
        <p className="text-muted-foreground text-sm">
          Understand underlying companies across funds, with coverage shown
          before exposure.
        </p>
      </header>
      <Notice>
        Fictional sample portfolio · Constituent data is unavailable. A fund's
        position value is not its underlying-company exposure.
      </Notice>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Funds with constituent data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {coverage.coveredFunds} / {coverage.funds.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Fund value in scope · {currency}</CardDescription>
          </CardHeader>
          <CardContent>
            <AmountDisplay
              value={coverage.fundValue}
              currency={currency}
              isHidden={isBalanceHidden}
              className="text-2xl font-semibold tabular-nums"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Covered share of fund value</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {coverage.fundValue
                ? formatting.formatPercent(
                    coverage.coveredFundValue / coverage.fundValue,
                  )
                : "Unavailable"}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Underlying company exposure</CardTitle>
          <CardDescription>
            Company totals will aggregate matching constituent IDs across funds.
            Direct holdings are excluded from this view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coverage.exposures.length ? (
            <FundExposure coverage={coverage} currency={currency} />
          ) : (
            <div className="bg-muted/40 rounded-lg border border-dashed px-5 py-8 text-center">
              <Layers
                aria-hidden="true"
                className="text-muted-foreground mx-auto mb-3 size-6"
              />
              <h2 className="font-medium">
                {coverage.funds.length
                  ? "Constituent data unavailable"
                  : "No compatible funds in this scope"}
              </h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-sm">
                {coverage.funds.length
                  ? "No company exposures are inferred from fund names or allocations. Coverage and exclusions below show what is missing."
                  : "Choose an account holding funds to inspect its data coverage."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {!!coverage.excluded.length && (
        <Card>
          <CardHeader>
            <CardTitle>Coverage by fund</CardTitle>
            <CardDescription>
              Source holding dates: {model.dates.join(", ")}. Constituent dates
              must match before exposures are combined.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {coverage.excluded.map((fund) => (
              <div
                key={fund.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{fund.name}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {fund.reason}
                  </p>
                </div>
                <Badge variant="outline">Not covered</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <Notice>
        {coverage.excludedNonFunds} cash or non-fund holdings and{" "}
        {model.exclusions.length} incompatible records excluded. Coverage refers
        to fund value, not the whole portfolio. Partial constituent lists retain
        their unrepresented exposure.
      </Notice>
      <AnalysisCredit />
    </div>
  );
}
