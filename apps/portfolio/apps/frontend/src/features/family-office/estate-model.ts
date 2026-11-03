import { z } from "zod";
const amount = z.number().finite().min(0).max(1e12);
export const estateSchema = z.object({ schemaVersion: z.literal(1), currency: z.enum(["GBP", "USD", "EUR"]), ownerId: z.string().min(1), businessValue: amount, otherAssets: amount, liabilities: amount, exemptAmount: amount, assumedTaxRate: z.number().min(0).max(100), costs: amount, cashAvailable: amount, insurance: amount, reservedSpending: amount, monthsToEvent: z.number().int().min(0).max(600), monthlySaving: amount, structure: z.string().min(1).max(2000), beneficiaries: z.string().min(1).max(2000), source: z.string().min(1).max(2000) });
export type Estate = z.infer<typeof estateSchema>;
export const estateKey = (profile: string) => `familybizness:estate:${profile}:1`;
export function initialEstate(): Estate { return { schemaVersion: 1, currency: "GBP", ownerId: "founder", businessValue: 10000000, otherAssets: 1000000, liabilities: 250000, exemptAmount: 0, assumedTaxRate: 30, costs: 100000, cashAvailable: 500000, insurance: 250000, reservedSpending: 200000, monthsToEvent: 24, monthlySaving: 10000, structure: "Direct personal shareholding → proposed family holding company or trust, subject to review. No restructuring is assumed in the calculation.", beneficiaries: "Next-generation leader and family steward; allocation and legal instruments pending.", source: "Synthetic stress scenario. 30% is a user-editable effective tax stress assumption, not a UK statutory rate. No relief is assumed." }; }
export function calculateEstate(input: Estate, ownership: number) {
  estateSchema.parse(input);
  if (!Number.isFinite(ownership) || ownership < 0 || ownership > 100) throw new Error("Valid ownership percentage required.");
  const businessInterest = input.businessValue * ownership / 100;
  const netEstate = Math.max(0, businessInterest + input.otherAssets - input.liabilities);
  const taxableProxy = Math.max(0, netEstate - input.exemptAmount);
  const assumedTax = taxableProxy * input.assumedTaxRate / 100;
  const eventNeed = assumedTax + input.costs;
  const available = Math.max(0, input.cashAvailable + input.insurance + input.monthlySaving * input.monthsToEvent - input.reservedSpending);
  return { businessInterest, netEstate, taxableProxy, assumedTax, eventNeed, available, shortfall: Math.max(0, eventNeed - available), surplus: Math.max(0, available - eventNeed), coverage: eventNeed > 0 ? available / eventNeed : null, additionalMonthlySaving: input.monthsToEvent > 0 ? Math.max(0, eventNeed - available) / input.monthsToEvent : null };
}
