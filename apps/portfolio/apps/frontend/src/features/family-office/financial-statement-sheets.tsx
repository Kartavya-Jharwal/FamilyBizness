import { useState, type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@fb/ui";
import type { FinanceBook } from "./finance-book-model";
import { buildFinancialSheets } from "./financial-sheet-model";
import { VisualPanel } from "./visual-primitives";
import "./financial-statement-sheets.css";

export function FinancialRecordTable({ headings, rows, caption = "Financial source records" }: { headings: string[]; rows: (string | number)[][]; caption?: string }) {
  return <div className="fo-sheet-scroll" role="region" aria-label={caption} tabIndex={0}><table className="fo-sheet-table"><caption>{caption}</caption><thead><tr>{headings.map((heading, index) => <th scope="col" key={`${index}-${heading}`}>{heading}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((value, column) => column === 0 ? <th scope="row" key={column}>{value}</th> : <td data-numeric={typeof value === "number" || /^[-(£€$0-9]/.test(String(value)) || undefined} key={column}>{value}</td>)}</tr>)}</tbody></table></div>;
}

export function FinancialMetricsTable({ rows }: { rows: [string, string][] }) { return <FinancialRecordTable caption="Financial summary" headings={["Measure", "Reported value"]} rows={rows} />; }

function SheetNote({ children }: { children: ReactNode }) { return <p className="mt-3 text-xs text-muted-foreground">{children}</p>; }

/** Native statement tables over the saved financial book, never a parallel ledger. */
export function FinancialStatementSheets({ book }: { book: FinanceBook }) {
  const [tab, setTab] = useState("summary");
  const { sheets, columns, consolidated: c, wealth } = buildFinancialSheets(book);
  const money = (value: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: book.currency, maximumFractionDigits: 0 }).format(Math.abs(value) < .005 ? 0 : value);
  const ownerNames = book.entities.filter(entity => book.wealthOwnerIds.includes(entity.id)).map(entity => entity.name).join(", ");
  return <VisualPanel title="Financial statements"><div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground"><span>Management accounts · {book.asOf}</span><span>All amounts in {book.currency}</span></div>
    <Tabs value={tab} onValueChange={value => setTab(String(value))}><TabsList className="h-auto flex-wrap justify-start" aria-label="Financial sheets"><TabsTrigger value="summary">Summary sheets</TabsTrigger><TabsTrigger value="balance">Balance sheet</TabsTrigger><TabsTrigger value="income">Income statement</TabsTrigger><TabsTrigger value="cash">Cash flow</TabsTrigger></TabsList>
      {sheets.map(sheet => <TabsContent key={sheet.id} value={sheet.id}><div className="fo-sheet-scroll" role="region" aria-label={`${sheet.title} table`} tabIndex={0}><table className="fo-sheet-table"><caption>{sheet.title} · {book.asOf} · {book.currency}</caption><thead><tr><th scope="col">Statement line</th>{columns.map(column => <th scope="col" key={column.id}>{column.name}{column.restricted && <span className="block font-normal text-muted-foreground">Restricted</span>}</th>)}</tr></thead><tbody>{sheet.rows.map(row => <tr key={row.id} data-total={row.total || undefined}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td data-numeric="true" key={columns[index].id}>{money(value)}</td>)}</tr>)}</tbody></table></div>
        {sheet.id === "summary" && <div className="mt-5"><FinancialRecordTable caption="Family stewardship perimeter" headings={["Measure", `Value (${book.currency})`, "Perimeter"]} rows={[
          ["Gross assets under management", money(wealth.grossAum), ownerNames],
          ["Consolidated family capital", money(wealth.fairValue), "After liabilities; operating investment at DCF value"],
          ["Available liquidity", money(wealth.liquidAssets), "Cash and listed investments in the selected perimeter"],
          ["Operating-business equity", money(wealth.business), "Family ownership at DCF value"],
          ["Restricted entity cash", money(c.cash - c.unrestrictedCash), "Included in group cash; outside unrestricted cash"],
        ]}/></div>}
        <SheetNote>{sheet.id === "balance" ? "Balances use closing exchange rates. Matched intercompany assets and liabilities and subsidiary carrying investments are removed in the adjustment column." : sheet.id === "income" ? "Income and expenses use period transaction rates. Expenses are shown as deductions; matched internal income is eliminated." : sheet.id === "cash" ? "Operating, investing and financing movements come from recorded cash flows. Opening cash and exchange translation bridge to closing cash; reserves are not cash expenses." : "Group book capital and family fair-value capital have different reporting perimeters. Each source entity and the effect of consolidation stay visible."}</SheetNote>
      </TabsContent>)}
    </Tabs>
    {c.errors.length ? <p role="alert" className="mt-4 text-sm text-destructive">{c.errors.join(" ")}</p> : <p role="status" className="mt-4 text-sm text-muted-foreground">Balance, cash and equity bridges reconcile.</p>}
  </VisualPanel>;
}
