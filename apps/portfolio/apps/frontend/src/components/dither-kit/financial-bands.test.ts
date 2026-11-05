import { expect, it } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { AreaChart } from "./area-chart";
import { Area, Line } from "./area";
import { computeBands } from "./scales";
it("retains the percentile floor and ceiling alongside the median", () => {
  const result = computeBands([{ range: [100, 300], median: 180 }, { range: [80, 420], median: 220 }], ["range", "median"], "default");
  expect(result.bands.range).toEqual([[100, 300], [80, 420]]);
  expect(result.bands.median).toEqual([[0, 180], [0, 220]]);
  expect(result.max).toBe(420);
});
it("keeps negative cash flows and signed uncertainty bounds", () => {
  const result = computeBands([{ cash: -40, range: [-60, 20] }], ["cash", "range"], "default");
  expect(result.bands.cash).toEqual([[0, -40]]);
  expect(result.bands.range).toEqual([[-60, 20]]);
  expect(result.min).toBe(-60);
  expect(result.max).toBe(20);
});

it("composes the median line inside the percentile area root", () => {
  expect(() => renderToString(createElement(AreaChart, { data: [{ range: [100, 300], median: 180 }], config: { range: { label: "P10–P90", color: "green" }, median: { label: "Median", color: "blue" } }, children: [createElement(Area, { key: "range", dataKey: "range" }), createElement(Line, { key: "median", dataKey: "median" })] }))).not.toThrow();
});
