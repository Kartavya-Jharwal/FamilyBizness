import { useState } from "react";
import { Button } from "@fb/ui";
import { calculateIht, calculateSimpleTrust, ihtSchema, type IhtInput } from "./estate-iht-model";
import { DataTable, NumberField, Section } from "./finance-ui";

export type StructureComparisonInput = {
  cashSettlement: number;
  sevenYearSurvivalConfirmed: boolean;
  holdingReliefEligible: boolean;
};

/** Independent alternatives over the same opening estate; uses existing tax owners. */
export function compareEstateStructures(raw: IhtInput, options: StructureComparisonInput) {
  const input = ihtSchema.parse(raw);
  const direct = calculateIht(input);
  const holdingInput = structuredClone(input);
  holdingInput.assets = holdingInput.assets.map(a => ["business100", "business50", "aim"].includes(a.kind)
    ? { ...a, reliefEligible: options.holdingReliefEligible } : a);
  const holding = calculateIht(holdingInput);
  let trust: { estate: ReturnType<typeof calculateIht>; charges: NonNullable<ReturnType<typeof calculateSimpleTrust>>; input: IhtInput } | null = null;
  let trustError = "";
  try {
    if (!options.sevenYearSurvivalConfirmed) throw new Error("Confirm the separate cash settlement's seven-year survival and simple-trust conditions to compare this alternative.");
    if (input.gifts.length) throw new Error("This simple trust alternative requires a case without other recorded gifts; linked gift/chargeable-transfer histories need a separate cumulative review.");
    if (!Number.isFinite(options.cashSettlement) || options.cashSettlement <= 0) throw new Error("Enter a positive cash settlement.");
    const alternative = structuredClone(input);
    const charges = calculateSimpleTrust({ ...input.trust, simpleConfirmed: true, contribution: options.cashSettlement });
    if (!charges) throw new Error("The simple-trust conditions are not confirmed.");
    let cashNeeded = charges.estateReduction;
    alternative.assets = alternative.assets.map(a => {
      if (a.kind !== "cash" || a.destination !== "family" || a.debt !== 0 || a.share === 0) return a;
      const removed = Math.min(a.value * a.share / 100, cashNeeded);
      cashNeeded -= removed;
      return { ...a, value: a.value - removed / (a.share / 100) };
    });
    if (cashNeeded > .01) throw new Error("The estate has insufficient unencumbered personal cash for this settlement and any settlor-paid entry tax.");
    if (charges.estateReduction > input.openingFunding) throw new Error("Accessible opening cash must cover the settled cash and any settlor-paid entry tax; review the funding assumptions.");
    alternative.openingFunding -= charges.estateReduction;
    alternative.trust = { ...input.trust, simpleConfirmed: true, contribution: options.cashSettlement };
    trust = { estate: calculateIht(alternative), charges, input: alternative };
  } catch (e) { trustError = e instanceof Error ? e.message : String(e); }
  return { direct, holding, trust, trustError };
}

export function EstateStructureComparison({ input }: { input: IhtInput }) {
  const cash = input.assets.filter(a => a.kind === "cash" && a.destination === "family" && a.debt === 0)
    .reduce((n, a) => n + a.value * a.share / 100, 0);
  const [settlement, setSettlement] = useState(Math.min(cash, 100_000));
  const [confirmed, setConfirmed] = useState(false);
  const [holdingEligible, setHoldingEligible] = useState(input.assets.some(a => a.reliefEligible));
  const [comparison, setComparison] = useState<ReturnType<typeof compareEstateStructures> | null>(null);
  const [inputSnapshot, setInputSnapshot] = useState("");
  const [error, setError] = useState("");
  const money = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
  const gap = (result: ReturnType<typeof calculateIht>) => money(Math.max(...result.liquiditySchedule.map(r => r.shortfall)));
  return <Section title="Direct, holding-company and trust alternatives">
    <p className="text-sm">Compare the same opening economic interests and event date. Company ownership does not itself create a tax exemption: the holding route uses the eligibility choice below. The trust alternative moves only unencumbered personal cash into a separate simple settlement, with entry, anniversary and exit charges shown at their respective dates.</p>
    <div className="grid gap-4 md:grid-cols-2"><NumberField label="Personal cash settled in the trust alternative (£)" value={settlement} min={0} onChange={n => { setSettlement(n); setComparison(null); }} /><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={holdingEligible} onChange={e => { setHoldingEligible(e.target.checked); setComparison(null); }} />Holding-company interests meet the selected Business Relief eligibility assumptions</label></div>
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e => { setConfirmed(e.target.checked); setComparison(null); }} />For this alternative, the cash settlement was made more than seven years before the estate event, with no retained benefit, prior chargeable transfers or related settlements. The simple-trust lifecycle assumptions below apply.</label>
    <Button variant="outline" onClick={() => { try { setComparison(compareEstateStructures(input, { cashSettlement: settlement, sevenYearSurvivalConfirmed: confirmed, holdingReliefEligible: holdingEligible })); setInputSnapshot(JSON.stringify(input)); setError(""); } catch (e) { setComparison(null); setError(String(e)); } }}>Compare estate structures</Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {comparison && inputSnapshot !== JSON.stringify(input) && <p role="status" className="rounded-md border p-3 text-sm">Estate inputs changed. Run the structure comparison again.</p>}
    {comparison && inputSnapshot === JSON.stringify(input) && <>
      <DataTable headings={["Alternative", "Free-estate value", "Estate IHT", "Lifetime trust entry", "Ten-year trust charge", "Trust exit charge", "Peak estate funding gap"]} rows={[
        ["Current direct economic interests", money(comparison.direct.netEstate), money(comparison.direct.estateTax), "—", "—", "—", gap(comparison.direct)],
        ["Holding-company interests", money(comparison.holding.netEstate), money(comparison.holding.estateTax), "—", "—", "—", gap(comparison.holding)],
        ...(comparison.trust ? [["Separate cash-trust alternative", money(comparison.trust.estate.netEstate), money(comparison.trust.estate.estateTax), money(comparison.trust.charges.entryTax), money(comparison.trust.charges.periodicTax), money(comparison.trust.charges.exitTax), gap(comparison.trust.estate)]] : []),
      ]} />
      {comparison.trustError && <p className="rounded-md border p-3 text-sm">{comparison.trustError}</p>}
      <DataTable headings={["Route", "Economic interest and control"]} rows={[
        ["Direct", "The existing holder retains the recorded economic/voting interests; the will governs estate transmission."],
        ["Holding company", "Members hold company shares; directors control company assets within their mandate. Recorded shareholder percentages remain unchanged."],
        ["Cash trust", "Trustees control settled cash under the deed; beneficiary interests are discretionary. Company voting rights are unchanged because this alternative settles cash only."],
      ]} />
      <p className="text-xs text-muted-foreground">No incorporation cost, capital-gains tax, stamp duty, growth advantage or automatic relief is inferred. Charges at different dates are not added into an undiscounted tax-saving claim. Rerun after changing the estate or trust inputs.</p>
    </>}
  </Section>;
}
