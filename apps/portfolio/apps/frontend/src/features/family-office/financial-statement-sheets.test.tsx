import { expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { financeBookDefaults } from "./finance-book-model";
import { buildFinancialSheets } from "./financial-sheet-model";
import { FinancialStatementSheets } from "./financial-statement-sheets";

it("presents the existing intercompany eliminations and translated group statements without adding subsidiary capital twice", () => {
  const report = buildFinancialSheets(financeBookDefaults);
  const group = (sheet: string, line: string) => report.sheets.find(item => item.id === sheet)!.rows.find(row => row.id === line)!.values.at(-1)!;
  expect(group("balance", "total-assets")).toBeCloseTo(25340000);
  expect(group("balance", "total-liabilities")).toBeCloseTo(7000000);
  expect(group("balance", "net-assets")).toBeCloseTo(18340000);
  expect(group("income", "profit")).toBeCloseTo(2178000);
  expect(group("cash", "opening")).toBeCloseTo(3002000);
  expect(group("cash", "operating")).toBeCloseTo(2178000);
  expect(group("cash", "investing")).toBeCloseTo(-1000000);
  expect(group("cash", "financing")).toBeCloseTo(-400000);
  expect(group("cash", "closing")).toBeCloseTo(3780000);
  const privateAssets = report.sheets.find(item => item.id === "balance")!.rows.find(row => row.id === "private")!;
  expect(privateAssets.values.at(-2)).toBe(-6000000);
  expect(group("balance", "balance-check")).toBeCloseTo(0);
  expect(group("cash", "cash-check")).toBeCloseTo(0);
});

it("keeps actual statement lines in native tables with entity, adjustment and group headers", () => {
  render(<FinancialStatementSheets book={financeBookDefaults} />);
  const summary = screen.getByRole("table", { name: /Three-statement summary/ });
  expect(within(summary).getByRole("columnheader", { name: "Consolidation adjustments" })).toBeInTheDocument();
  expect(within(summary).getByRole("columnheader", { name: "Consolidated group" })).toBeInTheDocument();
  expect(within(summary).getByRole("rowheader", { name: "Net income for the period" })).toHaveAttribute("scope", "row");
  fireEvent.click(screen.getByRole("tab", { name: "Cash flow" }));
  const cash = screen.getByRole("table", { name: /Cash-flow statement/ });
  expect(within(cash).getByRole("rowheader", { name: "Net financing cash flow" })).toBeInTheDocument();
  expect(within(cash).getByRole("rowheader", { name: "Cash reconciliation difference" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: "Balance sheet" }));
  expect(screen.getByRole("table", { name: /Balance sheet/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: "Income statement" }));
  expect(screen.getByRole("table", { name: /Income statement/ })).toBeInTheDocument();
});
