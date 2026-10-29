// Adapted from the user-supplied agent-authored policy module. See public/open-source/policy-module/NOTICE.md.
import type { PolicyDocument, PolicyGate } from "./policy";

/**
 * The bridge between the constitution and the downstream wealth modules.
 * Every rule in the master document projects to a named assumption; every
 * modelling assumption the finance modules need but the document has not
 * supplied is listed as an explicit gap the principal can delegate.
 */
export type AssumptionState = "supplied" | "delegated" | "missing";

export type Assumption = {
  key: string;
  label: string;
  value: number | boolean | string | null;
  unit: string | null;
  sourceLine: number | null;
  gateId: string | null;
  state: AssumptionState;
  note: string;
};

export type AssumptionDomain = {
  id: string;
  title: string;
  consumedBy: string;
  summary: string;
  assumptions: Assumption[];
};

export type PolicyAssumptionsContract = {
  schemaVersion: "1.0";
  derivedFrom: "family-constitution-master";
  sourceTitle: string;
  generatedAt: string;
  counts: { supplied: number; delegated: number; missing: number; domains: number };
  domains: AssumptionDomain[];
};

type DomainSpec = {
  id: string;
  title: string;
  consumedBy: string;
  summary: string;
  /** recommended assumptions that may not be stated in the document */
  recommended: Array<{ key: string; label: string; unit: string; note: string }>;
};

const DOMAINS: DomainSpec[] = [
  {
    id: "financials",
    title: "Financials",
    consumedBy: "Balance sheet · income statement · cash-flow statement · business valuation",
    summary: "Consolidated family wealth, including the operating business and its concentrated risk.",
    recommended: [
      { key: "operating_business_value", label: "Operating business valuation", unit: "currency", note: "Latest independent or management valuation, with date and method." },
      { key: "concentration_single_company", label: "Single-company concentration", unit: "% of net worth", note: "Share of total family wealth represented by the operating business." },
    ],
  },
  {
    id: "capital-under-management",
    title: "Capital under management",
    consumedBy: "AUM dashboard · asset-class and entity attribution · growth & drawdown series",
    summary: "Total assets overseen by the family office, by asset class and entity.",
    recommended: [
      { key: "entity_split", label: "Assets by legal entity", unit: "% of AUM", note: "Trust, company, foundation and personal holdings kept separately." },
    ],
  },
  {
    id: "returns",
    title: "Returns",
    consumedBy: "Required-vs-realised return · Sharpe ratio · benchmark attribution",
    summary: "Targets, risk-adjusted outcomes, and real/after-tax versus nominal/gross measures.",
    recommended: [
      { key: "required_return_nominal", label: "Required return (nominal)", unit: "% p.a.", note: "The hurdle the mandate is asked to achieve before inflation and tax." },
      { key: "target_real_return", label: "Target real return", unit: "% p.a.", note: "Purchasing-power objective after inflation." },
      { key: "benchmark_mix", label: "Benchmark asset mix", unit: "%", note: "Neutral benchmark used for performance attribution." },
    ],
  },
  {
    id: "use-of-capital",
    title: "Use of capital",
    consumedBy: "Distribution policy · reinvestment · philanthropy · next-generation ventures",
    summary: "How capital is deployed between spending, giving, enterprise and succession.",
    recommended: [
      { key: "philanthropy_allocation", label: "Philanthropy allocation", unit: "% of portfolio", note: "Annual giving envelope, separate from family spending." },
      { key: "next_gen_venture_budget", label: "Next-generation venture budget", unit: "currency", note: "Capital reserved for next-generation enterprise or seed activity." },
    ],
  },
  {
    id: "liquidity",
    title: "Liquidity & cash flow",
    consumedBy: "Cash-flow modelling · capital-call planning · succession-event reserves",
    summary: "Whether the portfolio can meet commitments, spending and events without forced sales.",
    recommended: [
      { key: "capital_call_stress_horizon", label: "Capital-call stress horizon", unit: "months", note: "Unfunded commitments assumed to be called under stress." },
      { key: "succession_event_reserve", label: "Succession-event reserve", unit: "currency", note: "Liquidity held apart for estate tax, buy-outs or ownership transitions." },
    ],
  },
  {
    id: "risk",
    title: "Risk",
    consumedBy: "Volatility · drawdown · value-at-risk · correlation and concentration",
    summary: "How much portfolio risk the family is willing to carry, and how it is measured.",
    recommended: [
      { key: "volatility_budget", label: "Volatility budget", unit: "% p.a.", note: "Acceptable annualised portfolio volatility." },
      { key: "max_drawdown_tolerance", label: "Maximum drawdown tolerance", unit: "%", note: "Loss at which the mandate must be formally reviewed." },
      { key: "var_confidence", label: "Value-at-risk confidence", unit: "%", note: "Confidence level and horizon used for VaR reporting." },
    ],
  },
  {
    id: "costs",
    title: "Tax drag, fees & cost of ownership",
    consumedBy: "After-tax return calculation · total cost of ownership reporting",
    summary: "Frictions that determine the difference between gross performance and family wealth.",
    recommended: [
      { key: "tax_drag", label: "Tax drag", unit: "% p.a.", note: "Estimated annual tax leakage across the consolidated structure." },
      { key: "fee_load", label: "Total fee load", unit: "% p.a.", note: "Management, custody, performance and structuring costs." },
    ],
  },
  {
    id: "liability-matching",
    title: "Asset–liability matching",
    consumedBy: "Spending sustainability across generations · liability discounting",
    summary: "Whether assets are timed and shaped to meet known future family obligations.",
    recommended: [
      { key: "planning_horizon", label: "Generational planning horizon", unit: "years", note: "Period over which spending sustainability is modelled." },
    ],
  },
  {
    id: "scenarios",
    title: "Scenario & probabilistic testing",
    consumedBy: "Stress tests · sensitivity analysis · Monte Carlo projections",
    summary: "How the mandate behaves under paths other than the central forecast.",
    recommended: [
      { key: "monte_carlo_trials", label: "Monte Carlo trials", unit: "count", note: "Simulation count used for wealth-projection confidence intervals." },
      { key: "stress_library", label: "Stress scenarios", unit: "text", note: "Named shocks: equity drawdown, rate shock, liquidity freeze, inflation." },
    ],
  },
  {
    id: "transfer",
    title: "Wealth transfer",
    consumedBy: "Multi-generational transfer modelling · succession event planning",
    summary: "How capital moves between generations, entities and causes.",
    recommended: [
      { key: "transfer_events", label: "Defined transfer events", unit: "text", note: "Gifting, succession, sale or settlement events the model must anticipate." },
    ],
  },
  {
    id: "currency",
    title: "Currency exposure",
    consumedBy: "FX exposure reporting · hedging treatment",
    summary: "Base currency, translation exposure and whether to hedge.",
    recommended: [
      { key: "base_currency", label: "Reporting base currency", unit: "currency", note: "Currency in which all consolidated statements are stated." },
      { key: "hedging_policy", label: "Hedging policy", unit: "text", note: "Whether, how much, and by what method foreign currency is hedged." },
    ],
  },
  {
    id: "private-markets",
    title: "Private & illiquid assets",
    consumedBy: "Valuation policy · hold-period assumptions · capital-call modelling",
    summary: "How private equity, venture, real estate and direct holdings are valued and funded.",
    recommended: [
      { key: "valuation_policy", label: "Valuation policy", unit: "text", note: "Method and frequency for valuing holdings without a public price." },
      { key: "hold_period", label: "Assumed hold period", unit: "years", note: "Average hold used in illiquidity and return modelling." },
    ],
  },
  {
    id: "art-patronage",
    title: "Art, collections & patronage",
    consumedBy: "Cultural asset register · insurance & loan tracking · patronage budget",
    summary: "Collections and cultural commitments held as both family legacy and balance-sheet assets.",
    recommended: [
      { key: "collection_valuation_basis", label: "Collection valuation basis", unit: "text", note: "Appraisal method, cadence and appraiser for art and collectibles." },
      { key: "patronage_commitment", label: "Annual patronage commitment", unit: "currency", note: "Standing support for institutions, exhibitions or artists." },
      { key: "collection_insurance_cover", label: "Insurance cover", unit: "currency", note: "Insured value, exclusions and loan-out conditions." },
      { key: "deaccession_policy", label: "Deaccession policy", unit: "text", note: "When a work may be sold and who must approve it." },
    ],
  },
  {
    id: "estate-planning",
    title: "Estate planning",
    consumedBy: "Succession instruments · probate exposure · beneficiary schedules",
    summary: "How ownership passes on death or incapacity, and the instruments that govern it.",
    recommended: [
      { key: "testamentary_instruments", label: "Wills & testamentary instruments", unit: "text", note: "Governing wills, their jurisdictions, and date last reviewed." },
      { key: "beneficiary_schedule", label: "Beneficiary schedule", unit: "text", note: "Named beneficiaries and their entitlement basis per entity." },
      { key: "incapacity_provisions", label: "Incapacity provisions", unit: "text", note: "Powers of attorney and successor decision-makers." },
      { key: "probate_exposure", label: "Probate-exposed assets", unit: "% of net worth", note: "Share of wealth that would pass through probate rather than a structure." },
    ],
  },
  {
    id: "generational-tax",
    title: "Generational transfer tax",
    consumedBy: "Wealth-transfer modelling · gifting schedule · liquidity for duties",
    summary: "The tax cost of moving capital between generations, and the reliefs available.",
    recommended: [
      { key: "estate_tax_rate", label: "Estate / inheritance tax rate", unit: "%", note: "Headline rate in each relevant jurisdiction." },
      { key: "lifetime_exemption", label: "Lifetime exemption remaining", unit: "currency", note: "Unused nil-rate band or lifetime gift exemption." },
      { key: "annual_gift_allowance", label: "Annual gift allowance", unit: "currency", note: "Tax-free gifting capacity per donor per year." },
      { key: "business_property_relief", label: "Business / agricultural relief", unit: "%", note: "Relief applicable to the operating company or land holdings." },
      { key: "duty_liquidity_cover", label: "Liquidity reserved for duties", unit: "currency", note: "Cash earmarked so heirs are not forced to sell assets to pay tax." },
    ],
  },
  {
    id: "tax-residence",
    title: "Tax residence & regions",
    consumedBy: "After-tax returns by jurisdiction · treaty treatment · reporting obligations",
    summary: "Where the family and its entities are taxed, and the treaty position between them.",
    recommended: [
      { key: "family_tax_residences", label: "Family tax residences", unit: "text", note: "Jurisdiction of each taxable family member or branch." },
      { key: "entity_tax_domiciles", label: "Entity tax domiciles", unit: "text", note: "Where each trust, holdco and fund is resident for tax." },
      { key: "treaty_positions", label: "Treaty positions relied upon", unit: "text", note: "Double-taxation treaties affecting dividends, interest and gains." },
      { key: "reporting_regimes", label: "Reporting regimes", unit: "text", note: "CRS, FATCA, registers of beneficial ownership and filing dates." },
      { key: "withholding_rates", label: "Withholding rates", unit: "%", note: "Applicable withholding on cross-border income by source." },
    ],
  },
  {
    id: "tax-planning",
    title: "Tax efficiency & timing",
    consumedBy: "After-tax return modelling · loss harvesting · realisation timing",
    summary: "Lawful planning levers: timing, allowances, loss relief and structure choice.",
    recommended: [
      { key: "realisation_policy", label: "Gain realisation policy", unit: "text", note: "When gains are crystallised relative to allowances and rate changes." },
      { key: "loss_carryforward", label: "Loss carry-forward available", unit: "currency", note: "Capital losses available to offset future gains." },
      { key: "tax_advantaged_wrappers", label: "Tax-advantaged wrappers", unit: "text", note: "Pensions, charitable vehicles and exempt structures in use." },
      { key: "planning_review_cadence", label: "Planning review cadence", unit: "text", note: "How often the position is revisited with advisers, and on what triggers." },
    ],
  },
  {
    id: "holdco",
    title: "Holding company structure",
    consumedBy: "Consolidation · intercompany flows · operating-company governance",
    summary: "The holdco/opco arrangement through which operating businesses are owned.",
    recommended: [
      { key: "holdco_jurisdiction", label: "Holdco jurisdiction", unit: "text", note: "Where the top holding company is incorporated and managed." },
      { key: "subsidiary_register", label: "Subsidiaries & ownership percentages", unit: "text", note: "Each operating company, its stake and its consolidation treatment." },
      { key: "dividend_policy", label: "Intercompany dividend policy", unit: "text", note: "How cash moves from operating companies up to the holdco." },
      { key: "consolidation_basis", label: "Consolidation basis", unit: "text", note: "Full consolidation, equity method or fair value per holding." },
      { key: "opco_concentration_limit", label: "Operating-company concentration limit", unit: "% of net worth", note: "Ceiling on single-company exposure before diversification is required." },
    ],
  },
  {
    id: "trust-vehicles",
    title: "Trusts & fiduciary vehicles",
    consumedBy: "Entity register · distribution authority · perpetuity and situs modelling",
    summary: "The trusts and fiduciary structures that hold capital on the family's behalf.",
    recommended: [
      { key: "trust_register", label: "Trust register", unit: "text", note: "Each trust, its type (discretionary, fixed, purpose) and settlor." },
      { key: "trust_situs", label: "Trust situs & governing law", unit: "text", note: "Jurisdiction and law governing each settlement." },
      { key: "trustee_powers", label: "Trustee powers & limits", unit: "text", note: "Investment, distribution and delegation powers per deed." },
      { key: "perpetuity_horizon", label: "Perpetuity / vesting horizon", unit: "years", note: "When each trust must vest or terminate." },
      { key: "distribution_discretion", label: "Distribution discretion", unit: "text", note: "Who decides distributions and under what standard." },
    ],
  },
  {
    id: "diversification",
    title: "Diversified holdings",
    consumedBy: "Correlation matrix · sector & geographic attribution · concentration alerts",
    summary: "Whether the portfolio is genuinely diversified rather than merely numerous.",
    recommended: [
      { key: "sector_cap", label: "Sector exposure cap", unit: "%", note: "Maximum exposure to any single industry sector." },
      { key: "geographic_cap", label: "Geographic exposure cap", unit: "%", note: "Maximum exposure to any single country or region." },
      { key: "manager_concentration", label: "Manager concentration cap", unit: "%", note: "Maximum capital with any single external manager." },
      { key: "correlation_assumption", label: "Correlation assumptions", unit: "text", note: "Correlation matrix used in risk and scenario modelling." },
    ],
  },
  {
    id: "values",
    title: "Values-based screens",
    consumedBy: "ESG return impact · exclusion tracking",
    summary: "The return and opportunity cost of the exclusions carried over from the constitution.",
    recommended: [
      { key: "screen_return_impact", label: "Assumed return impact of screens", unit: "% p.a.", note: "Estimated tracking difference introduced by values-based exclusions." },
    ],
  },
];

type RuleSource = {
  key: string;
  match: (gate: PolicyGate) => boolean;
  value: (gate: PolicyGate) => Assumption["value"];
  label: string;
};

const RULE_SOURCES: Array<{ domain: string; sources: RuleSource[] }> = [
  {
    domain: "financials",
    sources: [
      { key: "allocation_drift_band", label: "Allocation drift band", match: (g) => g.field === "allocationDriftPoints", value: (g) => g.threshold },
      { key: "leverage_policy", label: "Portfolio leverage policy", match: (g) => g.field === "borrowing", value: (g) => (g.comparator === "approval-required" ? "approval required" : "prohibited") },
    ],
  },
  {
    domain: "capital-under-management",
    sources: [
      { key: "asset_exposure", label: "Asset-class exposure limits", match: (g) => g.field === "assetExposurePercent" || g.field === "assetExposureAmount", value: (g) => g.threshold },
      { key: "illiquid_ceiling", label: "Illiquid investment ceiling", match: (g) => g.field === "illiquidPercent", value: (g) => g.threshold },
    ],
  },
  {
    domain: "returns",
    sources: [{ key: "rebalancing_discipline", label: "Rebalancing trigger", match: (g) => g.field === "allocationDriftPoints", value: (g) => g.threshold }],
  },
  {
    domain: "use-of-capital",
    sources: [{ key: "distribution_ceiling", label: "Distribution ceiling", match: (g) => g.field === "annualDistributionPercent", value: (g) => g.threshold }],
  },
  {
    domain: "liquidity",
    sources: [{ key: "cash_reserve_months", label: "Cash reserve", match: (g) => g.field === "liquidityMonths", value: (g) => g.threshold }],
  },
  {
    domain: "risk",
    sources: [
      { key: "single_position_ceiling", label: "Single-position ceiling", match: (g) => g.field === "singlePositionPercent", value: (g) => g.threshold },
      { key: "concentration_ceiling", label: "Concentration ceiling", match: (g) => g.field === "singlePositionPercent", value: (g) => g.threshold },
    ],
  },
  {
    domain: "private-markets",
    sources: [{ key: "illiquid_ceiling", label: "Illiquid exposure ceiling", match: (g) => g.field === "illiquidPercent", value: (g) => g.threshold }],
  },
  {
    domain: "values",
    sources: [{ key: "exclusion_threshold", label: "Restricted-revenue threshold", match: (g) => g.field === "restrictedRevenuePercent", value: (g) => g.threshold }],
  },
  {
    domain: "liquidity",
    sources: [{ key: "distribution_ceiling", label: "Distributable reserve limit", match: (g) => g.field === "annualDistributionPercent", value: (g) => g.threshold }],
  },
];

function unitFor(gate: PolicyGate) {
  return gate.currency ?? gate.unit ?? null;
}

export function buildAssumptionsContract(document: PolicyDocument, generatedAt = new Date().toISOString()): PolicyAssumptionsContract {
  const domains: AssumptionDomain[] = DOMAINS.map((spec) => {
    const supplied: Assumption[] = [];
    for (const group of RULE_SOURCES.filter((entry) => entry.domain === spec.id)) {
      for (const source of group.sources) {
        const gate = document.gates.find((candidate) => candidate.recognitionStatus === "executable" && source.match(candidate));
        if (gate) {
          supplied.push({
            key: source.key,
            label: source.label,
            value: source.value(gate),
            unit: unitFor(gate),
            sourceLine: gate.sourceLine,
            gateId: gate.id,
            state: "supplied",
            note: gate.statement,
          });
        }
      }
    }

    const providedKeys = new Set(supplied.map((entry) => entry.key));
    const gaps: Assumption[] = spec.recommended
      .filter((entry) => !providedKeys.has(entry.key))
      .map((entry) => ({
        key: entry.key,
        label: entry.label,
        value: null,
        unit: entry.unit,
        sourceLine: null,
        gateId: null,
        state: "missing",
        note: entry.note,
      }));

    return { id: spec.id, title: spec.title, consumedBy: spec.consumedBy, summary: spec.summary, assumptions: [...supplied, ...gaps] };
  });

  const all = domains.flatMap((domain) => domain.assumptions);
  return {
    schemaVersion: "1.0",
    derivedFrom: "family-constitution-master",
    sourceTitle: document.title,
    generatedAt,
    counts: {
      supplied: all.filter((entry) => entry.state === "supplied").length,
      delegated: all.filter((entry) => entry.state === "delegated").length,
      missing: all.filter((entry) => entry.state === "missing").length,
      domains: domains.length,
    },
    domains,
  };
}

/** Mark local review assignments and count the resulting contract. */
export function withDelegations(contract: PolicyAssumptionsContract, delegatedKeys: Set<string>): PolicyAssumptionsContract {
  const domains = contract.domains.map((domain) => ({ ...domain, assumptions: domain.assumptions.map((assumption) =>
    delegatedKeys.has(`${domain.id}:${assumption.key}`) && assumption.state === "missing"
      ? { ...assumption, state: "delegated" as const } : assumption) }));
  const all = domains.flatMap((domain) => domain.assumptions);
  return { ...contract, domains, counts: { ...contract.counts,
    delegated: all.filter((entry) => entry.state === "delegated").length,
    missing: all.filter((entry) => entry.state === "missing").length } };
}
