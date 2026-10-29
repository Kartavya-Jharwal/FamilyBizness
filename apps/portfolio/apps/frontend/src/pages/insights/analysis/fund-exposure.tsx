import { AmountDisplay, useNumberFormatting } from "@fb/ui";
import { useBalancePrivacy } from "@/hooks/use-balance-privacy";
import type { fundLookThrough } from "./read-model";

export function FundExposure({
  coverage,
  currency,
}: {
  coverage: ReturnType<typeof fundLookThrough>;
  currency: string;
}) {
  const formatting = useNumberFormatting();
  const { isBalanceHidden } = useBalancePrivacy();
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Percentages below use represented company exposure as the denominator,
        not total portfolio value.
      </p>
      <p className="text-sm">
        Unrepresented value within covered funds:{" "}
        <AmountDisplay
          value={Math.max(
            0,
            coverage.coveredFundValue - coverage.coveredExposure,
          )}
          currency={currency}
          isHidden={isBalanceHidden}
        />
        . Partial lists are not scaled up to 100%.
      </p>
      {coverage.exposures.map((company) => (
        <details key={company.id} className="rounded-lg border p-4">
          <summary className="cursor-pointer text-sm focus-visible:outline-ring">
            <span className="font-medium">{company.name}</span>
            <span className="ms-3 inline-flex flex-wrap gap-3 tabular-nums">
              <AmountDisplay
                value={company.value}
                currency={currency}
                isHidden={isBalanceHidden}
              />
              <span>
                {isBalanceHidden
                  ? "••••"
                  : coverage.coveredExposure
                    ? formatting.formatPercent(
                        company.value / coverage.coveredExposure,
                      )
                    : "Unavailable"}{" "}
                of represented exposure
              </span>
            </span>
          </summary>
          <ul className="mt-4 space-y-3 text-sm">
            {company.parents.map((parent) => (
              <li key={parent.id} className="border-t pt-3">
                <p className="font-medium">{parent.name}</p>
                <p className="text-muted-foreground mt-1">
                  {formatting.formatPercent(parent.weight)} within fund ·{" "}
                  {parent.asOfDate}
                </p>
                <AmountDisplay
                  value={parent.value}
                  currency={currency}
                  isHidden={isBalanceHidden}
                />
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
