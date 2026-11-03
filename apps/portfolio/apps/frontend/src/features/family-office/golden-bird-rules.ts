import { z } from "zod";
import { goldenBirdSource } from "./golden-bird-source";
import { constitutionTraceCurrent, constitutionParametersSchema, type ConstitutionParameters } from "./constitution-pack-model";

/** Compatibility name for saved Golden Bird cases; active-pack trace applies to every case. */
export const goldenBirdTraceCurrent = constitutionTraceCurrent;
const sampleParameters = constitutionParametersSchema.parse({...goldenBirdSource.parameters, requireOutsideLargestBranch:true});

const money = z.number().finite().nonnegative().max(1e12);
export const distributionInputSchema = z.object({
  unrestrictedCash: money,
  unfundedDebtAndStatutory: money,
  monthlyFixedCosts: money,
  operatingReserveAlreadyFunded: money,
  approvedDignityReserve: money,
  dignityReserveAlreadyFunded: money,
  feesAndCosts: money,
  distributableProfitCapacity: money,
  reserveApproved: z.boolean(),
  solvent: z.boolean(),
  covenantClear: z.boolean(),
  flagship: z.boolean(),
  auditedComplianceYears: z.number().int().nonnegative().max(100),
});
export type DistributionInput = z.infer<typeof distributionInputSchema>;

export function evaluateDistribution(input: DistributionInput, parameters: ConstitutionParameters = sampleParameters) {
  const p = distributionInputSchema.parse(input);
  const rules = constitutionParametersSchema.parse(parameters);
  const operatingTarget = p.monthlyFixedCosts * rules.distributionFixedCostReserveMonths;
  const operatingTopUp = Math.max(0, operatingTarget - p.operatingReserveAlreadyFunded);
  const dignityTopUp = Math.max(0, p.approvedDignityReserve - p.dignityReserveAlreadyFunded);
  const committedCash = p.unfundedDebtAndStatutory + operatingTopUp + dignityTopUp + p.feesAndCosts;
  const headroom = p.unrestrictedCash - committedCash;
  const blockers: string[] = [];
  if (!p.reserveApproved) blockers.push("Approve the Dignity Reserve budget before distribution.");
  if (!p.solvent) blockers.push("Solvency and going-concern checks must pass.");
  if (!p.covenantClear) blockers.push("Resolve covenant warnings before distribution.");
  if (headroom < 0) blockers.push("Cash is insufficient to fund obligations, reserves and costs.");
  if (p.flagship && p.auditedComplianceYears < rules.flagshipAuditedComplianceYears) {
    blockers.push(`The flagship needs ${rules.flagshipAuditedComplianceYears} audited compliance years.`);
  }
  if (Math.max(0, headroom) * rules.distributableCashAllocationPercent.permittedDividends / 100 > p.distributableProfitCapacity) {
    blockers.push("The dividend budget exceeds profits lawfully available for distribution.");
  }
  const distributableCash = blockers.length ? 0 : Math.max(0, headroom);
  const allocations = Object.fromEntries(Object.entries(rules.distributableCashAllocationPercent)
    .map(([key, value]) => [key, distributableCash * value / 100])) as Record<keyof typeof rules.distributableCashAllocationPercent, number>;
  return { sourceId: rules.sourceIds.distribution, operatingTarget, operatingTopUp, dignityTopUp,
    committedCash, headroom, distributableCash, allocations, blockers };
}

export const voteInputSchema = z.object({
  owners: z.array(z.object({ id: z.string().min(1), rights: z.number().finite().nonnegative().max(100),
    eligible: z.boolean(), present: z.boolean(), supports: z.boolean() })).min(1).max(40),
  boardMembers: z.number().int().positive().max(40),
  boardRecommending: z.number().int().nonnegative().max(40),
  outsideLargestBranchPresent: z.boolean(),
  legalApprovalsConfirmed: z.boolean(),
}).superRefine((v, c) => {
  if (new Set(v.owners.map(o => o.id)).size !== v.owners.length) c.addIssue({ code: "custom", message: "Owner IDs must be unique." });
  if (Math.abs(v.owners.reduce((n, o) => n + o.rights, 0) - 100) > 1e-6) c.addIssue({ code: "custom", message: "Issued voting rights must total 100%." });
  if (v.boardRecommending > v.boardMembers) c.addIssue({ code: "custom", message: "Board recommendations exceed board membership." });
});
export type VoteInput = z.infer<typeof voteInputSchema>;

export function evaluateReservedDecision(input: VoteInput, parameters: ConstitutionParameters = sampleParameters) {
  const p = voteInputSchema.parse(input);
  const rules = constitutionParametersSchema.parse(parameters);
  const eligible = p.owners.filter(o => o.eligible);
  const eligibleRights = eligible.reduce((n, o) => n + o.rights, 0);
  const supportingRights = eligible.filter(o => o.present && o.supports).reduce((n, o) => n + o.rights, 0);
  const presentVoters = eligible.filter(o => o.present).length;
  const requiredVoters = Math.ceil(eligible.length * rules.quorumEligibleVoterPercent / 100);
  const ownerPercent = eligibleRights ? supportingRights / eligibleRights * 100 : 0;
  const boardRequired = Math.ceil(p.boardMembers * rules.reservedBoardFraction.numerator / rules.reservedBoardFraction.denominator);
  const checks = {
    quorum: eligible.length > 0 && presentVoters >= requiredVoters && (!rules.requireOutsideLargestBranch || p.outsideLargestBranchPresent),
    owners: eligibleRights > 0 && ownerPercent + 1e-9 >= rules.reservedOwnerPercent,
    board: p.boardRecommending >= boardRequired,
    legalApprovals: p.legalApprovalsConfirmed,
  };
  return { sourceId: rules.sourceIds.reservedVoting, eligibleRights, supportingRights, ownerPercent,
    presentVoters, requiredVoters, boardRequired, checks, passed: Object.values(checks).every(Boolean) };
}
