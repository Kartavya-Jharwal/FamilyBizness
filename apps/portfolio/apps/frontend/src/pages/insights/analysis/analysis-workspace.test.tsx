import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import {
  InvestmentReviewPage,
  FundLookThroughPage,
} from "./analysis-workspace";
import { FundExposure } from "./fund-exposure";
import { analysisHoldings, fundLookThrough } from "./read-model";
import type { Holding } from "@/lib/types";
const mocks = vi.hoisted(() => ({
  holdings: vi.fn(),
  history: vi.fn(),
  privacy: { isBalanceHidden: false },
}));
vi.mock("./use-analysis-data", () => ({
  useAnalysisHoldings: mocks.holdings,
  useAnalysisHistory: mocks.history,
}));
vi.mock("@/hooks/use-balance-privacy", () => ({
  useBalancePrivacy: () => mocks.privacy,
}));
const holding: Holding = {
  id: "h",
  accountId: "a",
  holdingType: "security",
  quantity: 1,
  weight: 1,
  baseCurrency: "USD",
  localCurrency: "USD",
  marketValue: { base: 100, local: 100 },
  asOfDate: "2026-10-01",
  instrument: { id: "fund", symbol: "EXAMPLE", name: "Example fund", currency: "USD", quoteMode: "MANUAL", instrumentType: "FUND" },
};
beforeEach(() => {
  localStorage.clear();
  mocks.privacy.isBalanceHidden = false;
  mocks.holdings.mockReturnValue({
    model: analysisHoldings([holding], "USD"),
    currency: "USD",
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
});
function show(element: React.ReactNode) {
  return render(<MemoryRouter>{element}</MemoryRouter>);
}

it("saves review preferences without presenting a fulfilled result", () => {
  show(<InvestmentReviewPage />);
  expect(screen.getAllByText("Not evaluated")).toHaveLength(2);
  fireEvent.click(
    screen.getByRole("switch", { name: "Enable fee ratio review" }),
  );
  expect(screen.getByText("Disabled")).toBeInTheDocument();
  expect(
    screen.getByRole("switch", { name: "Enable fee ratio review" }),
  ).not.toBeChecked();
  expect(
    Object.values(localStorage).some((value) =>
      value.includes('"fee-ratio":false'),
    ),
  ).toBe(true);
});
it("keeps loading, failed reads and empty scopes separate from successful analysis", () => {
  mocks.holdings.mockReturnValue({ isLoading: true });
  const view = show(<InvestmentReviewPage />);
  expect(screen.getByLabelText("Loading analysis")).toBeInTheDocument();
  const retry = vi.fn();
  mocks.holdings.mockReturnValue({
    isLoading: false,
    isError: true,
    refetch: retry,
  });
  view.rerender(
    <MemoryRouter>
      <InvestmentReviewPage />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledOnce();
  mocks.holdings.mockReturnValue({
    model: analysisHoldings([], "USD"),
    currency: "USD",
  });
  view.rerender(
    <MemoryRouter>
      <InvestmentReviewPage />
    </MemoryRouter>,
  );
  expect(screen.getByText(/No eligible holdings/)).toBeInTheDocument();
});
it("shows zero coverage rather than fabricated company exposure", () => {
  show(<FundLookThroughPage />);
  expect(
    screen.getByRole("heading", { name: "Constituent data unavailable" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Not covered")).toBeInTheDocument();
  expect(screen.getByText("Example fund")).toBeInTheDocument();
});
it("renders parent-fund disclosure with fraction formatting and unrepresented value", () => {
  const coverage = fundLookThrough(analysisHoldings([holding], "USD"), [
    {
      instrumentId: "fund",
      asOfDate: "2026-10-01",
      constituents: [{ id: "company", name: "Example company", weight: 0.6 }],
    },
  ]);
  show(<FundExposure coverage={coverage} currency="USD" />);
  expect(screen.getByText("Example company")).toBeInTheDocument();
  expect(screen.getByText(/60\.00% within fund/)).toBeInTheDocument();
  expect(screen.getByText(/100\.00% of represented exposure/)).toBeInTheDocument();
  expect(screen.getByText("$40.00")).toBeInTheDocument();
});
it("respects host balance privacy in fund disclosures", () => {
  mocks.privacy.isBalanceHidden = true;
  const coverage = fundLookThrough(analysisHoldings([holding], "USD"), [
    {
      instrumentId: "fund",
      asOfDate: "2026-10-01",
      constituents: [{ id: "company", name: "Example company", weight: 0.6 }],
    },
  ]);
  show(<FundExposure coverage={coverage} currency="USD" />);
  expect(screen.queryByText("$60.00")).not.toBeInTheDocument();
});
