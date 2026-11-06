import { preparedBookClassifications, preparedSecurityClassifications, withPreparedClassifications } from "./allocation-metadata";
import { financeBookSchema } from "./finance-book-model";
import { investmentSchema } from "./investment-model";
import { stewardshipScenario } from "./stewardship-scenario";
import { officeIpsText,officeIpsRules } from "./office-ips";
import { activatePolicy } from "./policy-engine";
import { saveWorkspace,loadWorkspace,workspaceKey } from "@/features/governance/constitution/workspace";
import { goldenBirdModules } from "./golden-bird-case";
import { familyOfficeCaseId, familyOfficeConstitution, familyOfficeSources } from "./family-office-constitution";
import { caseModules, importCase } from "./case-model";
import { governanceSchema } from "./governance-model";
import { capitalSchema, type Capital } from "./operations-capital";
import { decodeOperations, annualOfficeDiary, shiftDate, type Obligation } from "./operations-model";

export function officeSourceId(id: string): string {
  if (/DISTRIBUTION/.test(id)) return "FO-CASH";
  if (/DECISION|DISINTERESTED/.test(id)) return "FO-VOTES";
  if (/OWNERS|CAP-TABLE|TITLE|ASSET-BASIS|RELATIONSHIP/.test(id)) return "FO-OWNERS";
  if (/REPORTING/.test(id)) return "FO-COMMS";
  if (/BODIES|MANDATES|ROLE-BOUNDARY/.test(id)) return "FO-GOVERNANCE";
  if (/MERIT/.test(id)) return "FO-EMPLOYMENT";
  if (/CONTINUITY|ESTATE/.test(id)) return "FO-CONTINUITY";
  if (/INSTRUMENTS/.test(id)) return "FO-TRANSFER";
  return "FO-INSTRUMENTS";
}

/** Reuse the existing validated GBP numerical scenario; do not combine four balance sheets. */
export function familyOfficeModules() {
  const base = goldenBirdModules();
  const neutral = JSON.stringify(base).replace(/GB-[A-Z0-9-]+/g, officeSourceId)
    .replaceAll("Golden Bird Holdings Ltd", "Family Enterprise Holdings Ltd")
    .replaceAll("Golden Bird Hospitality Ltd", "Family Enterprise Operations Ltd")
    .replaceAll("Golden Bird family office", "Family office")
    .replaceAll("Golden Bird", "Family office");
  const modules = JSON.parse(neutral) as Omit<ReturnType<typeof goldenBirdModules>, "capital"> & { capital: Capital };
  modules.case = { ...modules.case, family: "Family stewardship office", business: "Family Enterprise Holdings Ltd",
    basis: "composite-assignment", sourceAssignments: "Four source constitutions; provenance is recorded in About and repository documentation",
    description: "One fictional family office, with an operating charter selected from four constitutions. The family, owners, Board and professional team work from the same records: business continuity, orderly ownership liquidity, next-generation stewardship and estate funding.", preparedBy: "Family office" };
  modules.constitutions = { schema: 1, activePackId: familyOfficeConstitution.id, packs: [familyOfficeConstitution] };
  modules.sources = { schema: 1, sources: familyOfficeSources };
  const today = modules.case.asOf;
  const task = (id: string, title: string, owner: string, days: number, source: string, route: string, notes: string, recurrence: "One-off" | NonNullable<Obligation["schedule"]>["frequency"] = "One-off"): Obligation => ({
    id, title, owner, due: shiftDate(today, days), entity: modules.case.business, category: "Charter stewardship", status: "Open", source,
    sourceRoute: route, notes, evidence: "", scenario: false, recurrence,
    task: { project: "Family operating charter", priority: "Medium", progress: 0, startDate: today },
    ...(recurrence === "One-off" ? {} : { schedule: { frequency: recurrence, until: shiftDate(today, 1095) } }),
  });
  modules.operations = decodeOperations(JSON.stringify({ ...modules.operations, obligations: [
    ...modules.operations.obligations, ...annualOfficeDiary(today),
    task("fo-exit-pack", "Prepare the 2028-2030 sale-or-retain readiness pack", "Jordan Blake", 30, "FO-EXIT", "/office/governance", "Independent valuation, debt and tax review, employee transition, equal minority information and treatment of trust proceeds. No sale is assumed.", "Quarterly"),
    task("fo-liquidity-window", "Review the 2027 ownership liquidity window", "Sam Ellis", 45, "FO-TRANSFER", "/office/estate", "Up to 5% of issued shares every three years is a review limit, not a commitment. Record affordability, independent valuation and staged first offers."),
    task("fo-employment", "Review family management-entry evidence", "Jordan Blake", 21, "FO-EMPLOYMENT", "/office/governance", "Actual vacancy, relevant qualification, three years' external experience, independent assessment, market pay and no direct close-relative reporting."),
    task("fo-mentoring", "Review cross-branch mentoring and ownership education", "A1", 14, "FO-DEVELOPMENT", "/office/governance", "Assign an independent mentor; record financial literacy, risk, valuation and observer development. Rotate cross-business exposure every six months.", "Quarterly"),
    task("fo-disputes", "Review confidential concerns and mediation readiness", "A1", 14, "FO-DISPUTES", "/office/review", "A raised concern starts a 14-day private-discussion target. Record conflict recusal and the next escalation; this review is not evidence that a dispute exists.", "Quarterly"),
    task("fo-papers", "Circulate Board papers seven days before the meeting", "Associate / family technician", 0, "FO-COMMS", "/office", "Prepare the pack for the Board meeting on day seven. Record delivery evidence."),
    task("fo-minutes", "File Board minutes within ten days of the meeting", "Associate / family technician", 17, "FO-COMMS", "/office", "Board meeting on day seven; minutes due ten days afterwards."),
    task("fo-news-protocol", "Confirm the 48-hour material-owner-news protocol", "Alex Morgan", 7, "FO-COMMS", "/office/governance", "Confirm the reporting owner and contact route. The 48-hour clock starts on a material event, not on this scheduled review."),
    task("fo-community", "Review apprenticeship and community grant requests", "A1", 28, "FO-LEGACY", "/office/philanthropy", "Diligence and actual approved capacity precede commitments. Do not add incompatible source profit percentages or assume a tax deduction.", "Quarterly"),
  ].map(row => row.id === "gb-board" ? { ...row, due: shiftDate(today, 7) } : row) }));
  modules.governance = governanceSchema.parse({ ...modules.governance,
    source: "Four-constitution operating charter - FO-GOVERNANCE / FO-VOTES",
    rules: [...modules.governance.rules,
      { id: "exit-readiness", title: "Sale-or-retain readiness review", responsible: "ceo", accountable: "independent-chair", consulted: "Owners, trustees, valuation and legal advisers", informed: "Family Council and employees through authorised channels", source: "FO-EXIT - preparation only; owner sale authority remains separate", approvers: ["independent-chair", "independent-director"], minimumApprovals: 2, continuityRequired: true },
      { id: "family-employment", title: "Independent family employment assessment", responsible: "ceo", accountable: "independent-director", consulted: "Non-family assessor and Family Council", informed: "Applicant and hiring manager", source: "FO-EMPLOYMENT", approvers: ["independent-director"], minimumApprovals: 1, continuityRequired: false },
      { id: "community-request", title: "Community and apprenticeship commitment", responsible: "ceo", accountable: "independent-chair", consulted: "Family Council and recipient diligence adviser", informed: "Owners", source: "FO-LEGACY", approvers: ["independent-chair", "independent-director"], minimumApprovals: 2, continuityRequired: false },
    ],
    continuity: [...modules.governance.continuity,
      { id: "fo-sale-readiness", title: "Evidence independent valuation and sale-or-retain readiness", ownerId: "ceo", successorId: "independent-chair", trigger: "retirement", status: "pending", evidence: "", source: "FO-EXIT", dueDate: "2028-01-01", dependsOn: [], required: true },
      { id: "fo-retain-fallback", title: "Confirm leadership succession if the business is retained", ownerId: "independent-chair", successorId: "ceo", trigger: "retirement", status: "pending", evidence: "", source: "FO-EXIT", dueDate: "2030-12-31", dependsOn: ["fo-sale-readiness"], required: true },
    ],
  });
  modules.capital = capitalSchema.parse({ ...modules.capital, records: [
    { id: "fo-apprenticeships", title: "Next-generation and community apprenticeships", requested: 5000, recipient: "Illustrative apprenticeship provider", purpose: "Ownership education and local skills; recipient due diligence and budget approval pending." },
    { id: "fo-community-grant", title: "Community wellbeing programme", requested: 3000, recipient: "Illustrative community organisation", purpose: "Responsible business and community benefit; recipient due diligence and budget approval pending." },
  ].map(row => ({ ...row, kind: "Grant", year: Number(today.slice(0, 4)), owner: "ceo", source: "FO-LEGACY - fictional request amounts, not constitutional entitlements", diligence: "", status: "Draft", decisionId: "", ruleId: "", history: [] })) });
  Object.assign(modules,stewardshipScenario(modules));
  return modules;
}

/** Shared office personas use one existing case store. Earlier unrelated workspaces are untouched. */
export function ensureFamilyOfficeCase(store: Pick<Storage, "getItem" | "setItem" | "removeItem">) {
  const marker = `profile:${familyOfficeCaseId}:visual-stewardship:v1`;
  if (store.getItem(marker)) { ensureAllocationClassifications(store); return; }
  const all=familyOfficeModules();
  const before=new Map(caseModules.map(m=>[m.key(familyOfficeCaseId),store.getItem(m.key(familyOfficeCaseId))]));
  const policyKey=`profile:${familyOfficeCaseId}:office-effective-policy:v1`, donorKey=workspaceKey(familyOfficeCaseId);
  before.set(policyKey,store.getItem(policyKey));before.set(donorKey,store.getItem(donorKey));
  try {
    // Retain an automatic recovery pack before upgrading the prepared office.
    const prior=Object.fromEntries([...before].filter(([,value])=>value!==null));
    if(Object.keys(prior).length)store.setItem(`profile:${familyOfficeCaseId}:before-visual-upgrade`,JSON.stringify(prior));
    importCase(JSON.stringify({schema:1,exportedAt:new Date().toISOString(),modules:all,policy:null}),store,familyOfficeCaseId);
    saveWorkspace(store,donorKey,{...loadWorkspace(store,donorKey),content:officeIpsText});
    activatePolicy(store,familyOfficeCaseId,{currency:"GBP",rules:officeIpsRules()},"Family Board");
    ensureAllocationClassifications(store);
    store.setItem(marker,"ready");
  } catch(error){for(const [key,value]of before)value===null?store.removeItem(key):store.setItem(key,value);throw error;}
}

/** Upgrade metadata only; no balance, weight, amount or user classification is replaced. */
function ensureAllocationClassifications(store: Pick<Storage,"getItem"|"setItem"|"removeItem">){
 const marker=`profile:${familyOfficeCaseId}:allocation-classifications:v1`;
 if(store.getItem(marker))return;
 const bookKey=caseModules.find(row=>row.id==="book")!.key(familyOfficeCaseId),investmentKey=caseModules.find(row=>row.id==="investments")!.key(familyOfficeCaseId),rawBook=store.getItem(bookKey),rawInvestment=store.getItem(investmentKey);
 if(!rawBook||!rawInvestment)return;
 const book=financeBookSchema.parse(JSON.parse(rawBook)),investment=investmentSchema.parse(JSON.parse(rawInvestment));
 const nextBook=financeBookSchema.parse({...book,balances:withPreparedClassifications(book.balances,preparedBookClassifications)}),nextInvestment=investmentSchema.parse({...investment,securities:withPreparedClassifications(investment.securities,preparedSecurityClassifications)});
 try{store.setItem(bookKey,JSON.stringify(nextBook));store.setItem(investmentKey,JSON.stringify(nextInvestment));store.setItem(marker,"ready");}catch(error){store.setItem(bookKey,rawBook);store.setItem(investmentKey,rawInvestment);store.removeItem(marker);throw error;}
}
