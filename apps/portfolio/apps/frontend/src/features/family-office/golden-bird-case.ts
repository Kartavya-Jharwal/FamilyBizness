import { goldenBirdConstitutionPack, readConstitutionRegistry, constitutionRegistryKey } from "./constitution-pack-model";
import { goldenBirdEnglishCase as specification } from "./golden-bird-adaptation";
import { caseSchema, importCase, caseModules } from "./case-model";
import { governanceSchema } from "./governance-model";
import { financeBookSchema, consolidateBook, dcfValue, type FinanceBook } from "./finance-book-model";
import { ihtSchema, calculateIht } from "./estate-iht-model";
import { investmentDefaults, investmentSchema } from "./investment-model";
import { performanceDefaults, performanceSchema } from "./investment-performance";
import { initialServices, servicesSchema } from "./operations-service-model";
import { decodeOperations, occurrenceDate, shiftDate, type Obligation } from "./operations-model";
import { evaluateDistribution, distributionInputSchema, voteInputSchema } from "./golden-bird-rules";

export const goldenBirdProfileId = specification.identity.profileId;
export const goldenBirdCaseSources = specification.clauses;
const op = specification.operatingAssumptions;
const estate = specification.estateAssumptions;
const today = specification.identity.asOf;
const source = "Golden Bird English-law case · GBP planning accounts";
const founder = specification.succession.founderId;

export const constitutionCheckDefaults = {
  distribution: distributionInputSchema.parse({
    unrestrictedCash: op.unrestrictedCashGbp,
    unfundedDebtAndStatutory: op.twelveMonthDebtServiceGbp + op.twelveMonthStatutoryObligationsGbp,
    monthlyFixedCosts: op.monthlyFixedOperatingCostsGbp,
    operatingReserveAlreadyFunded: 0,
    approvedDignityReserve: op.dignityReserveGbp,
    dignityReserveAlreadyFunded: 0,
    feesAndCosts: 0,
    distributableProfitCapacity: op.accumulatedRealisedDistributableProfitsGbp,
    reserveApproved: true, solvent: !op.goingConcernWarning,
    covenantClear: !op.covenantBreachExpected, flagship: true,
    auditedComplianceYears: op.auditedFlagshipComplianceYears,
  }),
  vote: voteInputSchema.parse({
    owners: specification.owners.map(o => ({ id: o.id, rights: o.voting, eligible: true, present: true, supports: o.id !== "A1" })),
    boardMembers: specification.board.members.length,
    boardRecommending: specification.board.reservedRecommendationMembers,
    outsideLargestBranchPresent: true, legalApprovalsConfirmed: true,
  }),
};

/** Accounting and return inputs are the fictional case's working scenario. */
const financialScenario = {
  operatingBorrowing: 200_000, operatingCash: 120_000,
  operatingMonthlyReceipts: 40_000, operatingMonthlyCosts: 28_000,
  holdingMonthlyReceipts: 15_000, annualFcf: [85_000, 90_000, 96_000, 102_000, 110_000],
  discount: 10, terminalGrowth: 2, ebitda: 160_000, multiple: 6,
  annualPortfolioTarget: 5, spendingInflation: 2.5, protectedPortfolioReserve: 50_000,
};

function makeBook(): FinanceBook {
  const equity = specification.capital.seedFundingGbp + op.accumulatedRealisedDistributableProfitsGbp;
  const subsidiaryEquity = equity - op.unrestrictedCashGbp;
  const dividend = evaluateDistribution(constitutionCheckDefaults.distribution).allocations.permittedDividends;
  const balance = (id: string, entity: string, account: string, kind: "asset" | "liability" | "equity", category: "cash" | "private" | "operating" | "debt" | "capital", amount: number, elimination = "") => ({ id, entity, account, kind, category, currency: "GBP", amount, elimination });
  return financeBookSchema.parse({
    source, asOf: today, currency: "GBP", wealthHistory: [], wealthOwnerIds: ["holding"], valuationAccountId: "H-SUB",
    fx: [{ currency: "GBP", opening: 1, average: 1, closing: 1 }],
    entities: [
      { id: "holding", name: specification.identity.business, currency: "GBP", restrictedCash: false, openingCash: op.unrestrictedCashGbp, openingEquity: equity, capitalContributions: 0, distributions: 0 },
      { id: "business", name: "Golden Bird Hospitality Ltd", currency: "GBP", restrictedCash: false, openingCash: financialScenario.operatingCash, openingEquity: subsidiaryEquity, capitalContributions: 0, distributions: 0 },
    ],
    balances: [
      balance("H-CASH", "holding", "Holding company cash", "asset", "cash", op.unrestrictedCashGbp),
      balance("H-SUB", "holding", "Golden Bird Hospitality Ltd investment", "asset", "private", subsidiaryEquity, "ownership-business"),
      balance("H-EQUITY", "holding", "Share capital, premium and retained profits", "equity", "capital", equity),
      balance("B-CASH", "business", "Operating cash", "asset", "cash", financialScenario.operatingCash),
      balance("B-PROPERTY", "business", "Hospitality operating assets", "asset", "operating", subsidiaryEquity + financialScenario.operatingBorrowing - financialScenario.operatingCash),
      balance("B-DEBT", "business", "External borrowing", "liability", "debt", financialScenario.operatingBorrowing),
      balance("B-EQUITY", "business", "Subsidiary share capital and reserves", "equity", "capital", subsidiaryEquity, "ownership-business"),
    ], income: [], movements: [],
    forecast: Array.from({ length: 12 }, (_, i) => {
      const month = occurrenceDate(`${today.slice(0, 7)}-01`, "Monthly", i).slice(0, 7);
      return [
        { month, entity: "holding", currency: "GBP", receipts: financialScenario.holdingMonthlyReceipts, operating: op.monthlyFixedOperatingCostsGbp, capex: 0, distributions: dividend / 12, philanthropy: 0, ventures: 0, succession: 0, reserve: op.dignityReserveGbp },
        { month, entity: "business", currency: "GBP", receipts: financialScenario.operatingMonthlyReceipts, operating: financialScenario.operatingMonthlyCosts, capex: 0, distributions: 0, philanthropy: 0, ventures: 0, succession: 0, reserve: 0 },
      ];
    }).flat(),
    dcf: { source: "Golden Bird hospitality operating plan", currency: "GBP", fcf: financialScenario.annualFcf, discount: financialScenario.discount, growth: financialScenario.terminalGrowth, debt: financialScenario.operatingBorrowing, cash: financialScenario.operatingCash, ebitda: financialScenario.ebitda, multiple: financialScenario.multiple, ownership: 100 },
  });
}

function makeOperations() {
  const task = (id: string, title: string, owner: string, days: number, clause: string, route: string, category = "Stewardship"): Obligation => ({ id, title, owner, due: shiftDate(today, days), entity: specification.identity.business, category, status: "Open", source: clause, sourceRoute: route, recurrence: "One-off", notes: id === "gb-fix" ? "From F to the associate / family technician: please fix the constitution legality and instrument cross-references, then record the resolution here." : "", evidence: "", scenario: false });
  const meeting = (id: string, title: string, owner: string, days: number, attendees: string[], frequency: "Monthly" | "Quarterly" | "Annual", clause: string): Obligation => ({
    ...task(id, title, owner, days, clause, "/office/governance", "Family meeting"),
    recurrence: frequency, schedule: { frequency, until: shiftDate(today, 365) },
    meeting: { start: "10:00", end: "11:30", timeZone: "Europe/London", attendees, location: "Golden Bird family office", agenda: "Review constitutional actions, liquidity, operating results and succession readiness." },
  });
  return decodeOperations(JSON.stringify({ version: 1, obligations: [
    meeting("gb-council", "Family Council", "A1", 2, specification.council.members, "Monthly", "GB-ART4-BODIES"),
    meeting("gb-board", "Holding Board stewardship review", "Alex Morgan", 3, specification.board.members, "Quarterly", "GB-ART14-REPORTING"),
    meeting("gb-assembly", "Annual Family Assembly", "A1", 30, specification.council.members, "Annual", "GB-ART4-BODIES"),
    meeting("gb-owner-review", "Registered owners review", "F", 4, specification.owners.map(o=>o.id), "Annual", "GB-APP-A-OWNERS"),
    { ...meeting("gb-owner-review-midyear", "Registered owners midyear review", "F", 4, specification.owners.map(o=>o.id), "Annual", "GB-ART4-BODIES"), due: occurrenceDate(shiftDate(today, 4), "Monthly", 6) },
    task("gb-distribution", "Certify Article 7 cash waterfall and dividend budget", "Alex Morgan", 5, "GB-ART7-DISTRIBUTIONS", "/office/finance"),
    task("gb-operating-pack", "Prepare monthly operating and liquidity pack", "Jordan Blake", 3, "GB-ART14-REPORTING", "/office/finance"),
    task("gb-interim", `Confirm interim CEO and alternate within ${specification.parameters.interimConfirmationDays} days of an emergency`, "Alex Morgan", 7, "GB-ART8-CONTINUITY", "/office/governance"),
    task("gb-instruments", "Review will, LPA and settlement instruments", "Sam Ellis", 14, "GB-ART8-ESTATE-REVIEW", "/office/estate"),
    task("gb-fix", "please fix", "Associate / family technician", 6, "GB-APP-F-LEGAL", "/office/sources", "Constitution legality"),
    task("gb-valuation", "Annual independent share valuation", "Sam Ellis", 30, "GB-ART3-INSTRUMENTS", "/office/finance"),
  ] }));
}

export function goldenBirdModules() {
  const book = makeBook();
  const groupValue = dcfValue(book.dcf).equity + op.unrestrictedCashGbp;
  const dividend = evaluateDistribution(constitutionCheckDefaults.distribution).allocations.permittedDividends;
  const governance = governanceSchema.parse({
    schemaVersion: 1, family: specification.identity.family, business: specification.identity.business,
    source: "Golden Bird English-law constitution · Articles 3–8 and ownership schedule",
    people: specification.people,
    rules: [
      { id: "board-pack", title: "Prepare and review the stewardship pack", responsible: "ceo", accountable: "independent-chair", consulted: "Company secretary; independent advisers", informed: "Holding Board and Family Council", source: "GB-ART14-REPORTING · case administrative workflow", approvers: ["independent-chair", "independent-director"], minimumApprovals: 1, continuityRequired: false },
      { id: "continuity", title: "Review interim leadership readiness", responsible: "independent-director", accountable: "independent-chair", consulted: "Family Council; company secretary", informed: "Registered owners", source: "GB-ART8-CONTINUITY · readiness review, separate from appointment", approvers: ["independent-chair", "independent-director"], minimumApprovals: 1, continuityRequired: true },
    ], decisions: [], successionEvents: [],
    entities: [
      { id: "family-holding", name: specification.identity.business, type: "holding-company", source: "GB-APP-A-OWNERS", owners: specification.owners.map(o=>({ ownerId: o.id, economic: o.ownership, votes: o.voting })) },
      { id: "operating-business", name: "Golden Bird Hospitality Ltd", type: "operating-company", source: "Golden Bird case group structure", owners: [{ ownerId: "family-holding", economic: 100, votes: 100 }] },
    ],
    continuity: [
      { id: "gb-interim-mandate", title: "Evidence interim CEO and alternate authority", ownerId: "independent-chair", successorId: specification.succession.interimCeo, trigger: "incapacity", status: "pending", evidence: "", source: "GB-ART8-CONTINUITY", dueDate: shiftDate(today, 7), dependsOn: [], required: true },
      { id: "gb-handover", title: "Prepare banking, records and signatory handover", ownerId: "ceo", successorId: specification.succession.interimCeo, trigger: "retirement", status: "pending", evidence: "", source: "GB-ART8-CONTINUITY", dueDate: shiftDate(today, 30), dependsOn: ["gb-interim-mandate"], required: true },
      { id: "gb-estate-funding", title: "Review estate instruments and succession liquidity", ownerId: "independent-director", successorId: "C1", trigger: "death", status: "pending", evidence: "", source: "GB-ART8-ESTATE-REVIEW", dueDate: shiftDate(today, 14), dependsOn: [], required: true },
    ],
  });
  const statutoryEstate = ihtSchema.parse({
    schemaVersion: 1, owner: founder, deathDate: estate.deathScenarioDate, source: "Golden Bird English-law estate and succession case",
    simpleEstateConfirmed: true, spouseExemptionConfirmed: false, transferableNrbPercent: 0, transferableRnrbPercent: 0, transferredBrAllowance: 0, brAllowanceUsed: 0,
    assets: [
      { id: "business", label: "Golden Bird holding-company shares", entity: "family-holding", legalOwner: founder, beneficiary: "C1 and C2", kind: "business100", value: groupValue, debt: 0, share: estate.founderHoldingCompanyPercent, destination: "family", descendants: false, reliefEligible: true, heldYears: 10, evidence: "Golden Bird case: qualifying trading-group interest; holding-level cash retained for evidenced working capital" },
      { id: "home", label: "Founder residence", entity: "personal", legalOwner: founder, beneficiary: "C1 and C2", kind: "home", value: estate.homeGbp, debt: 0, share: 100, destination: "family", descendants: true, reliefEligible: false, heldYears: 10, evidence: "English-law case residence passing outright to adult descendants" },
      { id: "cash", label: "Personal cash", entity: "personal", legalOwner: founder, beneficiary: "C1 and C2", kind: "cash", value: estate.personalCashGbp, debt: 0, share: 100, destination: "family", descendants: false, reliefEligible: false, heldYears: 10, evidence: "Personal funds, separate from company and settlement cash" },
    ], gifts: [], eventCosts: 25_000, openingFunding: estate.personalCashGbp, monthlyFunding: 0, reserve: 50_000,
    funding: [{ id: "insurance", label: "Insurance payable outside the estate", month: 3, amount: estate.insuranceLiquidityGbp, source: "Golden Bird case insurance held outside the free estate" }],
    trust: { simpleConfirmed: true, contribution: estate.trustSettlementGbp, payer: "trustees", anniversaryValue: estate.trustTenYearValueGbp, exitValue: estate.trustExitGbp, exitQuarters: estate.trustExitQuarters, exitAfterAnniversary: true },
  });
  const investments = investmentSchema.parse({ ...investmentDefaults,
    source: "Golden Bird investment and multi-generation spending plan", asOf: today, initial: specification.capital.seedFundingGbp,
    spend: dividend, reserve: financialScenario.protectedPortfolioReserve,
    eventYear: specification.succession.plannedHandoverYears,
    eventCost: calculateIht(statutoryEstate).totalTax + statutoryEstate.eventCosts,
    generationShares: [{ generation: 3, share: 100 }, { generation: 4, share: 0 }],
    events: [
      { id: "gb-generation-transfer", year: specification.succession.plannedHandoverYears, kind: "internal-transfer", amount: 0, fromGeneration: 3, toGeneration: 4, sharePercent: 40, source: "GB-ART8-CONTINUITY · staged case economic transfer" },
      { id: "gb-insurance-funding", year: specification.succession.plannedHandoverYears, kind: "contribution", amount: estate.insuranceLiquidityGbp, fromGeneration: 3, toGeneration: 3, sharePercent: 0, source: "Golden Bird succession insurance funding" },
    ],
    inflation: financialScenario.spendingInflation, target: financialScenario.annualPortfolioTarget,
  });
  const scale = specification.capital.seedFundingGbp / 1_000_000;
  const performance = performanceSchema.parse({ ...performanceDefaults, source: "Golden Bird monthly investment performance history", periods: performanceDefaults.periods.slice(0, 10).map(period=>({ ...period, fees: period.fees * scale, taxes: period.taxes * scale, assets: period.assets.map(a=>({ ...a, opening: a.opening * scale, flowAtStart: a.flowAtStart * scale, closing: a.closing * scale, income: a.income * scale, fees: a.fees * scale, taxes: a.taxes * scale })) })) });
  const services = servicesSchema.parse({ ...initialServices, services: initialServices.services.map(s=>({ ...s,
    annualFixed: s.id === "internal" ? 60_000 : s.id === "multi" ? 25_000 : 12_000,
    setup: s.id === "internal" ? 8_000 : s.id === "multi" ? 5_000 : 0,
    owner: "Alex Morgan", source: "Golden Bird office-provider comparison budget",
  })) });
  const modules = {
    case: caseSchema.parse({ schema: 1, ...specification.identity }), governance,
    constitutions: {schema:1,activePackId:goldenBirdConstitutionPack.id,packs:[goldenBirdConstitutionPack]},
    sources: specification.sourcePack, book, "statutory-estate": statutoryEstate,
    investments, performance, operations: makeOperations(), services,
    capital: { schema: 1, currency: "GBP", records: [], payments: [] },
    "constitution-distribution": constitutionCheckDefaults.distribution,
    "constitution-vote": constitutionCheckDefaults.vote,
  };
  const errors = consolidateBook(book).errors;
  if (errors.length) throw new Error(`Golden Bird financial fixture does not reconcile: ${errors.join("; ")}`);
  return modules;
}

/** Populate only this dedicated sample profile; never overwrite saved edits. */
export function ensureGoldenBirdCase(store: Pick<Storage, "getItem" | "setItem" | "removeItem">, profile: string) {
  if (profile !== goldenBirdProfileId) return;
  const marker = `profile:${profile}:golden-bird-populated:v1`;
  if (store.getItem(marker)) {
    if(store.getItem(constitutionRegistryKey(profile))===null){const registry=readConstitutionRegistry(store,profile);if(registry.packs.length)store.setItem(constitutionRegistryKey(profile),JSON.stringify(registry));}
    return;
  }
  const modules = Object.fromEntries(Object.entries(goldenBirdModules()).filter(([id]) => {
    const module = caseModules.find(m=>m.id === id);
    return module && store.getItem(module.key(profile)) === null;
  }));
  const original = new Map(caseModules.map(m=>[m.key(profile),store.getItem(m.key(profile))]));
  try {
    importCase(JSON.stringify({ schema: 1, exportedAt: new Date().toISOString(), modules, policy: null }), store, profile);
    store.setItem(marker, "populated");
  } catch (e) {
    for (const [key, value] of original) value === null ? store.removeItem(key) : store.setItem(key, value);
    throw e;
  }
}
