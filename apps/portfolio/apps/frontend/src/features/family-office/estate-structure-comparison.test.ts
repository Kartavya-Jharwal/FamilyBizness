import { expect, it } from "vitest";
import { initialIht } from "./estate-iht-model";
import { compareEstateStructures } from "./estate-structure-comparison";

const options = { cashSettlement: 100_000, sevenYearSurvivalConfirmed: true, holdingReliefEligible: true };
it("preserves economic value for a holding wrapper and does not invent a tax advantage", () => {
  const source = initialIht(), before = JSON.stringify(source);
  const result = compareEstateStructures(source, options);
  expect(result.holding.netEstate).toBe(result.direct.netEstate);
  expect(result.holding.estateTax).toBe(result.direct.estateTax);
  expect(JSON.stringify(source)).toBe(before);
});
it("settles only accessible cash and reduces free-estate liquidity by the same amount", () => {
  const source={...initialIht(),gifts:[]};
  const result=compareEstateStructures(source,options);
  expect(result.trust?.estate.netEstate).toBe(result.direct.netEstate-options.cashSettlement);
  expect(result.trust?.input.openingFunding).toBe(source.openingFunding-options.cashSettlement);
  expect(result.trust?.input.assets[0]).toEqual(source.assets[0]);
});
it("withholds unsupported trust alternatives and changes relief only when explicitly selected", () => {
  expect(compareEstateStructures(initialIht(),{...options,sevenYearSurvivalConfirmed:false}).trust).toBeNull();
  expect(compareEstateStructures({...initialIht(),gifts:[]},{...options,cashSettlement:1_000_000}).trustError).toContain("insufficient");
  const noRelief=compareEstateStructures(initialIht(),{...options,holdingReliefEligible:false});
  expect(noRelief.holding.estateTax).toBeGreaterThan(noRelief.direct.estateTax);
});

it("requires cumulative review before comparing a trust when gifts are recorded",()=>{const source=initialIht();expect(source.gifts.length).toBeGreaterThan(0);const result=compareEstateStructures(source,options);expect(result.trust).toBeNull();expect(result.trustError).toContain("other recorded gifts");});
