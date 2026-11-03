import { goldenBirdSource } from "./golden-bird-source";
import type { SourceRecord } from "./source-model";

/** One fixed reference for the fictional GBP case, not a live FX dependency. */
export const goldenBirdFx = {
  baseCurrency: "GBP",
  sourceCurrency: "INR",
  inrPerGbp: 132,
  effectiveFrom: "2026-11-01",
  effectiveTo: "2026-11-30",
  publishedAt: "2026-11-02",
  checkedAt: "2026-11-03",
  publisher: "Foreign, Commonwealth & Development Office",
  reference: "Consular rates of exchange: November 2026",
  sourceUrl: "https://www.gov.uk/csv-preview/6ae4b56f3d3bf10d23546232/consular-exchange-rates-November-2026.csv",
  basis: "Official administrative reference chosen as the fixed conversion convention for this fictional case",
} as const;

/** Preserve precision through calculations; currency presentation rounds to pence. */
export function inrToGbp(amountInInr: number): number {
  if (!Number.isFinite(amountInInr)) throw new Error("A finite INR amount is required.");
  return amountInInr / goldenBirdFx.inrPerGbp;
}

/** Original mathematical thresholds are retained by reference. */
export const parameters = goldenBirdSource.parameters;
const sterling = (amountInInr: number) => new Intl.NumberFormat("en-GB", {
  style: "currency", currency: "GBP", maximumFractionDigits: 2,
}).format(inrToGbp(amountInInr));
const seedInr = goldenBirdSource.ownership.owners.reduce((sum, owner) => sum + owner.seedSubscriptionInr, 0);

/** Fictional appointments make the model operational without asserting real-world appointments. */
const people = [
  ...goldenBirdSource.ownership.owners.map(owner => ({
    id: owner.id,
    name: owner.name,
    generation: owner.generation,
    relationship: owner.id === "F" ? "Founder; parent of C1 and C2" : `Founding family owner, Branch ${owner.id === "A1" ? "A" : "B"}`,
    role: owner.id === "F" ? "Founder and holding-company director" : owner.id === "A1" ? "Family Council chair and director" : "Family steward and director",
    shares: owner.shares,
    ownership: owner.ownership,
    voting: owner.voting,
    subscriptionGbp: inrToGbp(owner.seedSubscriptionInr),
  })),
  { id: "C1", name: "C1", generation: 4, relationship: "F's adult child", role: "Next-generation development participant", shares: 0, ownership: 0, voting: 0, subscriptionGbp: 0 },
  { id: "C2", name: "C2", generation: 4, relationship: "F's adult child", role: "Family Council member", shares: 0, ownership: 0, voting: 0, subscriptionGbp: 0 },
  { id: "independent-chair", name: "Alex Morgan", generation: 3, relationship: "Independent non-family professional", role: "Independent Holding Board chair", shares: 0, ownership: 0, voting: 0, subscriptionGbp: 0 },
  { id: "independent-director", name: "Sam Ellis", generation: 3, relationship: "Independent non-family professional", role: "Independent director and audit oversight lead", shares: 0, ownership: 0, voting: 0, subscriptionGbp: 0 },
  { id: "ceo", name: "Jordan Blake", generation: 3, relationship: "Non-family executive", role: "Operating CEO", shares: 0, ownership: 0, voting: 0, subscriptionGbp: 0 },
];

const replacementText: Record<string, string> = {
  "GB-IDENTITY": "Golden Bird is an England and Wales family holding group established for a fictional multi-generational stewardship case. The new group's subscribed assets are separate from the ancestral household and its property. Family membership, ownership and executive authority are separate mandates.",
  "GB-ART1-SUN-GOAL": `The family pursues a thirty-year Sun Goal of ${sterling(100_000_000_000)} in consolidated group assets. This is a strategic ambition, distinct from current asset value, family net worth and investment return forecasts. Expansion remains constrained by dignity, solvency, independent audit and lawful conduct.`,
  "GB-ART3-TITLE": "The ownership register records legal and beneficial interests, restrictions and encumbrances under England and Wales law. Ancestral property is kept separate from assets acquired by the group. Equity transfers follow the company's articles, shareholders' agreement and applicable law; the family policy ordinarily permits lineal descendants and legally adopted children, with a 75% Assembly exception and independent advice. Family status alone grants no company vote.",
  "GB-ART3-INSTRUMENTS": "The company's articles and shareholders' agreement provide pre-emption, a ten-year ordinary transfer lock-up and exceptional exits for death, incapacity, hardship, divorce, serious breach and deadlock, subject to applicable law. Independent annual valuations inform transfers; a disputed price uses two independent valuations and their midpoint unless the signed agreement specifies another method. The founder maintains an England and Wales will, named executors, a registered property and financial affairs lasting power of attorney, key-person cover and succession nominations. Trustees hold any trust assets under the deed; no branch acquires automatic voting or management rights during incapacity or after death.",
  "GB-ART4-BODIES": "The Family Assembly comprises F, A1, B1, C1 and C2 and meets annually. Its five-member Council is chaired by A1 and meets monthly. Registered owners F, A1 and B1 meet at least twice yearly. The five-member Holding Board comprises F, A1, B1, independent chair Alex Morgan and independent director Sam Ellis, and meets quarterly. Two of five directors are independent. Jordan Blake is the non-family operating CEO and does not chair the Board or Council. Council and Board terms last three years with the constitutional review and independence requirements retained.",
  "GB-ART7-DISTRIBUTIONS": "Ordinary dividends require profits lawfully available for distribution, funded twelve-month debt service and statutory obligations, the approved Dignity Reserve, no expected covenant breach or going-concern warning, and six months' fixed operating costs remaining after distribution. The flagship requires two audited years of compliance before dividends resume. Remaining distributable cash is allocated 50% to core reinvestment and reserves, 30% to permitted dividends and 20% to ring-fenced growth. A change requires 75% owner approval and Board solvency certification. The waterfall never treats company cash, turnover, unrealised gains or the gross asset base as distributable profit.",
  "GB-ART8-ESTATE-REVIEW": "CEO appointments have terms of up to five years and require independent review before renewal. Wills, powers of attorney, trust deeds and succession nominations are reviewed every three years and after material events. Executors administer the estate after death; attorneys act only under their registered mandate during life; trustees act under the deed. Leadership departure does not remove lawful ownership or family dignity.",
  "GB-ART12-WELFARE": "The Dignity Reserve has an approved annual cap of £50,000 for needs-tested housing, food, essential healthcare and education support. A disinterested Council panel decides confidential claims and independent appeals; aggregate reporting protects household privacy. Creditors, payroll, statutory obligations and prudent liquidity precede funding; discretionary dividends follow it. Emergency borrowing requires Board solvency approval and lawful limits.",
  "GB-APP-A-CAP-TABLE": `Golden Bird Holdings Ltd has 100,000 ordinary shares. F holds 60,000 shares and 60% of ordinary ownership and voting rights; A1 holds 25,000 and 25%; B1 holds 15,000 and 15%. Total subscribed funding is ${sterling(seedInr)}. The fictional capital specification uses 1p nominal shares; the balance of subscribed funding is share premium.`,
  "GB-APP-A-OWNERS": `The registered ordinary owners of Golden Bird Holdings Ltd are F (60%, ${sterling(60_000_000)} subscription), A1 (25%, ${sterling(25_000_000)}) and B1 (15%, ${sterling(15_000_000)}). The cap table records 100,000 ordinary shares and total funding of ${sterling(seedInr)}. Display rounding does not alter the exact 60/25/15 economic and voting rights.`,
  "GB-APP-A-INSTRUMENTS": "The implementation register contains the England and Wales company articles, shareholders' agreement, trust deeds, wills, property and financial affairs lasting powers of attorney, employment contracts, related-party records, property agreements, information policies and constitutional accessions. Each record identifies parties, governing law, custodian, effective date, amendment authority and constitutional source. Authority belongs to the competent company body, executor, attorney or trustee, rather than arising from proximity to the founder.",
  "GB-APP-B-ASSET-BASIS": `The thirty-year ${sterling(100_000_000_000)} ambition measures consolidated group assets after eliminating intercompany duplication. Revenue, family net equity, assets advised upon by the SFO and market enterprise value are separate measures. Board reports identify outside equity, debt, jointly controlled assets and the family's actual economic share.`,
  "GB-APP-F-LEGAL": "The family constitution is implemented through England and Wales company articles and a shareholders' agreement, valid wills and estate administration, registered lasting powers of attorney, and properly constituted trust deeds. Companies Act 2006 requirements and other applicable mandatory law prevail. The reserved-matter owner test is a separate contractual requirement based on eligible disinterested voting rights; it does not replace statutory resolution rules. Dividends also require profits available for distribution under section 830.",
  "GB-APP-F-TITLE": "An ancestry chart does not determine legal title. The company register, land/property evidence, will, trust deed and relevant court or estate records establish the legal and beneficial interests used by this England and Wales case. Family equality is implemented through lawful rights, voluntary support and the chosen instruments; neither branch seniority nor a family vote rewrites another person's property rights.",
  "GB-APP-A-RELATIONSHIP-MODEL": "F, A1 and B1 are the third-generation founding owners of the Golden Bird holding group, representing Branches C, A and B respectively. C1 and C2 are F's adult fourth-generation children, Council participants and estate beneficiaries. They hold no current ordinary shares. Alex Morgan and Sam Ellis are independent non-family directors; Jordan Blake is the non-family CEO. Family participation, ownership and appointment to office remain separate records.",
  "GB-APP-A-MANDATES": "The Assembly sets family participation policy and elects the Council. The Council administers family programmes and constitutional proposals. Registered owners exercise share rights. The Holding Board directs strategy, risk and executive appointments. The SFO maintains records and coordinates authorised services without replacing Board or trustee authority. The Assembly meets annually, Council monthly, owners at least twice yearly, Board quarterly and operating management monthly.",
};

const interpretationText: Record<string, string> = {
  "GB-IDENTITY": "Keep the holding group separate from ancestral property; distinguish family membership, ownership and company office.",
  "GB-ART1-SUN-GOAL": "Show the thirty-year group-asset ambition separately from current wealth and forecasts.",
  "GB-ART2-INVESTMENT": "Use evidence-based research, pilot, commitment, scale and exit gates with named reviewers and explicit downside cases.",
  "GB-ART3-TITLE": "Maintain separate legal and beneficial ownership, encumbrances and permitted transfer approvals.",
  "GB-ART3-INSTRUMENTS": "Link transfer and continuity actions to the articles, shareholders' agreement, will, LPA and trust deed.",
  "GB-ART4-BODIES": "Use the appointed five-person Council and Board rosters, with two independent directors and a separate non-family CEO.",
  "GB-ART5-DECISIONS": "Evaluate the 75% eligible disinterested ownership vote and two-thirds Board recommendation separately, with quorum and legal approvals.",
  "GB-ART6-MERIT": "Record qualifications, external experience and independent assessment; keep executive, Board-chair and Council-chair mandates separate.",
  "GB-ART7-DISTRIBUTIONS": "Apply the legal profit cap and funded cash gates before allocating the remaining cash 50% core, 30% dividends and 20% growth.",
  "GB-ART8-ESTATE-REVIEW": "Review will, LPA and trust instruments every three years and after material events; preserve distinct executor, attorney and trustee roles.",
  "GB-ART12-WELFARE": "Protect the £50,000 annual Dignity Reserve behind creditor and statutory obligations and ahead of discretionary dividends.",
  "GB-ART13-ETHICS": "Review lawful conduct, conflicts, bribery, political funding and truthful promotion at investment and operating decisions.",
  "GB-ART13-GUARANTEES": "Require disinterested approval, independent advice, written consent, a recorded cap and expiry for each guarantee.",
  "GB-ART15-AMENDMENT": "Apply the ordinary or protected-change route, including reflection and affected-owner consent where required.",
  "GB-APP-A-CAP-TABLE": "Use the 100,000-share 60/25/15 cap table, GBP subscription funding and chosen 1p nominal capitalization.",
  "GB-APP-A-OWNERS": "Keep economic and voting rights at 60/25/15 independently of display rounding of GBP subscriptions.",
  "GB-APP-A-DISINTERESTED": "Exclude conflicted owners from the denominator; retain separate Board, quorum and affected-owner-consent tests.",
  "GB-APP-A-ROLE-BOUNDARY": "Keep Assembly membership, share rights, trustee or beneficiary status and executive mandates separate.",
  "GB-APP-A-INSTRUMENTS": "Use the adopted company, succession and trust instrument register with named custodians and amendment authorities.",
  "GB-APP-A-IMPLEMENTATION": "Maintain legal-entity and ownership records, delegated limits, reporting and conflict policies, with periodic reviews.",
  "GB-APP-F-LEGAL": "Apply the English company, estate, LPA and trust instruments; keep contractual family thresholds separate from statutory procedures.",
  "GB-APP-F-TITLE": "Use the relevant ownership or fiduciary instrument rather than an ancestry chart to establish authority over an asset.",
  "GB-APP-F-STRESS": "Rehearse incapacity, minority exit, subsidiary liquidity failure, related-party decisions and protected-rights amendments annually.",
  "GB-APP-A-RELATIONSHIP-MODEL": "Use F, A1 and B1 as G3 owners; C1 and C2 as adult G4 family members and beneficiaries; keep professional appointments separate.",
  "GB-APP-A-MANDATES": "Use distinct Assembly, Council, registered-owner, Board, executive, SFO and trustee mandates.",
  "GB-APP-A-RACI": "Retain one accountable body for each decision stage and its named operational representative.",
};

export const clauses: SourceRecord[] = goldenBirdSource.clauses.map(source => ({
  ...source,
  assignment: "Golden Bird Family Constitution - England and Wales fictional case",
  section: source.section,
  excerpt: replacementText[source.id] ?? source.excerpt,
  interpretation: interpretationText[source.id] ?? source.interpretation,
  basis: replacementText[source.id] ? "operational-interpretation" : source.basis,
  status: "reviewed",
  reviewer: "Golden Bird fictional case specification",
}));

export const sourcePack = { schema: 1 as const, sources: clauses };

export const goldenBirdEnglishCase = {
  id: "golden-bird-english-case",
  identity: {
    profileId: goldenBirdSource.identity.profileId,
    title: "Golden Bird fictional English-law case",
    family: "Golden Bird family",
    business: "Golden Bird Holdings Ltd",
    description: "A fictional England and Wales family holding group with hospitality operations, a shared stewardship office and a multi-generational succession plan.",
    basis: "hypothetical" as const,
    sourceAssignments: "Assignment 1 - Project Golden Bird Family Constitution; English-law case adaptation",
    currency: "GBP" as const,
    asOf: "2026-11-03",
    preparedBy: "Golden Bird fictional case specification",
    jurisdiction: "England and Wales",
    governingLaw: "English law",
  },
  currency: "GBP" as const,
  fx: goldenBirdFx,
  people,
  owners: people.filter(person => person.shares > 0),
  capital: {
    totalShares: goldenBirdSource.ownership.totalShares,
    nominalPerShareGbp: 0.01,
    nominalCapitalGbp: goldenBirdSource.ownership.totalShares * 0.01,
    seedFundingGbp: inrToGbp(seedInr),
    sharePremiumGbp: inrToGbp(seedInr) - goldenBirdSource.ownership.totalShares * 0.01,
    sourceSubscriptionPriceConvertedGbp: inrToGbp(goldenBirdSource.ownership.subscriptionPriceInr),
    sourceFaceValueConvertedGbp: inrToGbp(goldenBirdSource.ownership.faceValueInr),
    sourcePremiumPerShareConvertedGbp: inrToGbp(goldenBirdSource.ownership.premiumPerShareInr),
    thirtyYearGroupAssetAmbitionGbp: inrToGbp(100_000_000_000),
    ambitionYears: 30,
    sourceId: "GB-APP-A-OWNERS",
  },
  parameters: { ...parameters, dignityReserveAmount: 50_000 },
  board: {
    members: ["F", "A1", "B1", "independent-chair", "independent-director"],
    independentMembers: ["independent-chair", "independent-director"],
    chair: "independent-chair",
    quorumMembers: 3,
    reservedRecommendationMembers: 4,
    sourceId: "GB-ART4-BODIES",
  },
  council: { members: ["F", "A1", "B1", "C1", "C2"], chair: "A1", quorumMembers: 3, sourceId: "GB-ART4-BODIES" },
  succession: {
    incumbentCeo: "ceo",
    interimCeo: "independent-director",
    alternate: "independent-chair",
    founderId: "F",
    beneficiaries: ["C1", "C2"],
    plannedHandoverYears: 7,
    confirmationWithinDays: parameters.interimConfirmationDays,
    sourceId: "GB-ART8-CONTINUITY",
  },
  legalAssumptions: {
    privateCompanyJurisdiction: "England and Wales",
    founderLongTermUkResident: true,
    corporateInstrumentStatus: "Adopted for the fictional case",
    propertyAndFinancialAffairsLpa: "Registered for the fictional case; personal financial mandate is separate from company directorship",
    wills: "F has a valid England and Wales will with named professional executors and equal residual provision for C1 and C2",
    trust: "Golden Bird Family Settlement is an England and Wales discretionary trust for C1, C2 and their descendants, with an independent trustee and a separate cash settlement",
    hufTreatment: "No HUF or coparcenary structure; original family-property context is translated to separately evidenced personal and trust property",
    shareTransferMechanism: "Company articles and shareholders' agreement govern pre-emption and permitted transmission; executors, attorneys and trustees act only under their competent instrument",
    distributionLegalTest: "Companies Act 2006 section 830 profits available for distribution, in addition to the constitutional cash gates",
    reservedMatterTest: "75% of eligible disinterested owner voting rights plus a two-thirds Board recommendation; separate from statutory resolution requirements",
  },
  operatingAssumptions: {
    unrestrictedCashGbp: 350_000,
    twelveMonthDebtServiceGbp: 36_000,
    twelveMonthStatutoryObligationsGbp: 24_000,
    monthlyFixedOperatingCostsGbp: 12_000,
    dignityReserveGbp: 50_000,
    accumulatedRealisedDistributableProfitsGbp: 180_000,
    auditedFlagshipComplianceYears: 2,
    covenantBreachExpected: false,
    goingConcernWarning: false,
    sourceId: "GB-ART7-DISTRIBUTIONS",
  },
  estateAssumptions: {
    ownerId: "F",
    deathScenarioDate: "2026-11-03",
    homeGbp: 800_000,
    personalCashGbp: 200_000,
    founderHoldingCompanyPercent: 60,
    trustSettlementGbp: 300_000,
    trustTenYearValueGbp: 450_000,
    trustExitGbp: 50_000,
    trustExitQuarters: 20,
    insuranceLiquidityGbp: 250_000,
    sourceId: "GB-ART3-INSTRUMENTS",
  },
  instrumentRegister: [
    { id: "articles", title: "Golden Bird Holdings Ltd articles of association", authority: "Registered members; statutory process", custodian: "Company secretary", sourceId: "GB-APP-A-INSTRUMENTS" },
    { id: "shareholders-agreement", title: "Shareholders' agreement and pre-emption schedule", authority: "Contracting shareholders", custodian: "Company secretary", sourceId: "GB-ART3-INSTRUMENTS" },
    { id: "founder-will", title: "F's will and estate executor appointment", authority: "F during capacity; executors after death", custodian: "Independent legal counsel", sourceId: "GB-ART8-ESTATE-REVIEW" },
    { id: "founder-lpa", title: "F's registered property and financial affairs lasting power of attorney", authority: "Named attorneys within the registered mandate", custodian: "Independent legal counsel", sourceId: "GB-ART8-ESTATE-REVIEW" },
    { id: "family-settlement", title: "Golden Bird Family Settlement deed", authority: "Trustees under the deed", custodian: "Independent trustee", sourceId: "GB-ART3-INSTRUMENTS" },
  ],
  parameterMap: [
    { sourceId: "GB-ART5-DECISIONS", tool: "Governance decisions", parameters: "Eligible disinterested voting denominator; 75% owner consent; two-thirds Board recommendation" },
    { sourceId: "GB-ART7-DISTRIBUTIONS", tool: "Distribution and liquidity review", parameters: "Twelve-month obligations; six-month operating reserve; Dignity Reserve; 50/30/20 cash waterfall; statutory distributable-profit cap" },
    { sourceId: "GB-ART8-CONTINUITY", tool: "Succession readiness", parameters: "Seven-day interim confirmation; seven-year teaching handover; independent candidate assessment" },
    { sourceId: "GB-ART8-ESTATE-REVIEW", tool: "Estate instrument register", parameters: "Three-year will/LPA/trust review and event-triggered review" },
    { sourceId: "GB-ART14-REPORTING", tool: "Calendar and board reports", parameters: "Monthly operations; quarterly Board; semiannual owner reports; annual Assembly" },
    { sourceId: "GB-ART15-AMENDMENT", tool: "Constitution change review", parameters: "Ordinary and protected voting thresholds; six-month protected-rights reflection; affected-owner consent" },
    { sourceId: "GB-APP-B-EXPOSURES", tool: "Portfolio scenarios", parameters: "Liquidity, currency, concentration, guarantees and correlated downside review" },
  ],
  legalReferences: [
    { title: "Companies Act 2006, section 830", url: "https://www.legislation.gov.uk/ukpga/2006/46/section/830" },
    { title: "Companies Act 2006, section 283", url: "https://www.legislation.gov.uk/ukpga/2006/46/section/283" },
    { title: "GOV.UK trusts and taxes", url: "https://www.gov.uk/trusts-taxes" },
    { title: "GOV.UK types of trust", url: "https://www.gov.uk/trusts-taxes/types-of-trust" },
    { title: "GOV.UK property and financial affairs attorneys", url: "https://www.gov.uk/manage-lasting-power-attorney/property-financial-affairs" },
  ],
  clauses,
  sourcePack,
};
