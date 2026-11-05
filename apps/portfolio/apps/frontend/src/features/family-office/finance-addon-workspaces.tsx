import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle, Page, PageHeader, PageContent } from "@fb/ui";
import { toast } from "sonner";
import { readPreparedOfficePortfolio } from "@/adapters/prepared-office-portfolio";
import { useBalancePrivacy } from "@/hooks/use-balance-privacy";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "@/components/office-charts";

const sources = <p className="text-sm text-muted-foreground">UI references: <a className="underline" href="https://github.com/wealthfolio/wealthfolio-addons/tree/main" target="_blank" rel="noreferrer">Wealthfolio add-ons</a> · <a className="underline" href="https://github.com/waldonso2/wealthfolio-importer-addon" target="_blank" rel="noreferrer">Broker Importer</a></p>;
const preview = (action: string) => toast.info(`${action}: not implemented for now. This is a UI preview; no files are read and no connection is made.`);
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>; }

export default function FinanceAddonWorkspaces({ embedded = false }: { embedded?: boolean }) {
  const { pathname } = useLocation();
  const [revision, refresh] = useState(0);
  const { isBalanceHidden } = useBalancePrivacy();
  useEffect(() => { const update = () => refresh(n => n + 1); window.addEventListener("familybizness:record-updated", update); return () => window.removeEventListener("familybizness:record-updated", update); }, []);
  let office: ReturnType<typeof readPreparedOfficePortfolio> = null;
  let error = "";
  try { office = readPreparedOfficePortfolio(); } catch { error = "Saved financial records need review. No substitute balances are shown."; }
  void revision;
  const money = (value: number) => isBalanceHidden ? "Hidden" : new Intl.NumberFormat("en-GB", { style: "currency", currency: office?.currency ?? "GBP", maximumFractionDigits: 0 }).format(value);
  const connections = pathname.endsWith("connections"), fees = pathname.endsWith("fees");
  const title = connections ? "Connections & imports" : fees ? "Investment fees" : "Trading analytics";
  const [period, setPeriod] = useState("All");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const history = office?.history ?? [];
  const visibleHistory = period === "Latest 3" ? history.slice(-3) : history;
  const content = <div className="space-y-6">
    <nav className="flex flex-wrap gap-4 text-sm underline"><Link to="/office/finance">Capital & liquidity</Link><Link to="/goals">Family goals</Link><Link to="/spending/budget">Budget & expenditure</Link><Link to="/office/policy">Investment policy statement</Link></nav>
    {error && <p role="alert">{error}</p>}
    {connections ? <>
      <p className="rounded-lg border bg-muted p-4 text-sm">Planned connections · all actions below are demonstrations. Existing manual activity import remains available separately.</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[
        ["Trade Republic", "CSV transactions and PDF trade / dividend statements"], ["Scalable Capital", "CSV exports and PDF trade / dividend statements"], ["DKB", "PDF trade and dividend statements"], ["QuickBooks", "Accounting balances, invoices and expenditure"], ["Xero & accounting software", "Financial statements and bookkeeping exports"], ["Document data lake", "Family documents, legal records and document storage"],
      ].map(([name, detail]) => <Panel key={name} title={name}><p className="mb-4 text-sm text-muted-foreground">{detail}</p><Button variant="outline" onClick={() => preview(`Connect ${name}`)}>Connect · preview</Button></Panel>)}</div>
      <Panel title="Import, review & export"><p className="mb-4 text-sm text-muted-foreground">Choose a source → map accounts → review duplicates → import. PDF reading, legal-document extraction and file export are planned.</p><div className="flex flex-wrap gap-3">{["Import CSV / spreadsheet", "Read PDFs & legal files", "Connect document storage", "Export files"].map(action => <Button key={action} variant="outline" onClick={() => preview(action)}>{action}</Button>)}<Link className="rounded-md border px-4 py-2 text-sm underline" to="/import">Existing activity import</Link></div></Panel>
    </> : fees ? <>
      <Panel title="Cost of stewardship"><p className="text-sm">Fee tracker shell inspired by Wealthfolio: trading, transfer, management and other costs. No fee records have been connected to this preview.</p><dl className="mt-4 grid gap-4 sm:grid-cols-3">{["Total fees", "Monthly average", "Impact on returns"].map(label => <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="text-xl font-semibold">Not connected</dd></div>)}</dl></Panel>
      <div className="grid gap-4 md:grid-cols-2"><Panel title="Fees by account"><p className="mb-4 text-sm text-muted-foreground">Existing account perimeter; fee amounts await a source.</p>{office?.accounts.map(account => <div className="flex flex-wrap justify-between gap-2 border-b py-3 text-sm" key={account.id}><span>{account.name}</span><span>Awaiting fee records</span></div>)}<Button className="mt-4" onClick={() => preview("Connect fee records")}>Connect fee records</Button></Panel><Panel title="Fee categories">{["Trading", "Transfer", "Management", "Other"].map(label => <div className="flex justify-between border-b py-3 text-sm" key={label}><span>{label}</span><span>—</span></div>)}<p className="mt-4 text-sm text-muted-foreground">Fee history and category charts appear once records are connected.</p></Panel></div>
    </> : <>
      <p className="rounded-lg border bg-muted p-4 text-sm">Swingfolio-inspired analytics within finance. The capital curve reads the existing saved book. Trade statistics remain a mock until matched trades are connected.</p>
      <div className="grid gap-4 sm:grid-cols-3">{["Win rate", "Profit factor", "Realised trading P/L"].map(label => <Panel key={label} title={label}><p>Awaiting matched trades</p></Panel>)}</div>
      <Panel title="Family capital curve"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Saved family-capital history · includes flows; not a trading return</p><label className="text-sm">Period <select className="rounded border bg-background p-2" value={period} onChange={e => setPeriod(e.target.value)}><option>All</option><option>Latest 3</option></select></label></div>{isBalanceHidden ? <p>Balances hidden</p> : visibleHistory.length ? <ResponsiveContainer height={260}><AreaChart data={visibleHistory}><XAxis dataKey="asOf" tickFormatter={value=>String(value).slice(2,7)}/><YAxis tickFormatter={value=>`${Number(value)/1e6}m`}/><Tooltip formatter={value=>money(Number(value))}/><Area dataKey="netWealth" name="Family capital"/></AreaChart></ResponsiveContainer> : <p>No saved capital history available.</p>}</Panel>
      <Panel title="Position watchlist"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th scope="col" className="p-2">Position</th><th scope="col" className="p-2">Account / sleeve</th><th scope="col" className="p-2">Current value</th><th scope="col" className="p-2">Trade basis</th></tr></thead><tbody>{office?.positions.map(p => <tr className="border-t" key={p.id}><td className="p-2">{p.name}</td><td className="p-2">{p.entity}</td><td className="p-2">{money(p.value)}</td><td className="p-2">Not connected</td></tr>)}</tbody></table></div></Panel>
      <Panel title="Trade journal & calendar"><p className="mb-4 text-sm text-muted-foreground">Illustrative month · synthetic P/L only, excluded from all saved balances. Select a day to inspect the mock journal.</p><div className="grid grid-cols-7 gap-1 sm:gap-2">{Array.from({length: 28}, (_, i) => { const day = i + 1, weekend = i % 7 > 4, gain = i % 3 !== 0; return <button key={day} className={`min-h-16 min-w-0 rounded-md border p-1 text-left text-[10px] sm:p-2 sm:text-xs ${selectedDay === day ? "ring-2 ring-primary" : ""} ${weekend ? "bg-muted text-muted-foreground" : gain ? "bg-primary/10 text-foreground" : "bg-destructive/10 text-foreground"}`} onClick={() => setSelectedDay(day)} aria-label={`Demo day ${day}`}><span className="block font-semibold">{day}</span><span className="block">{weekend ? "—" : isBalanceHidden ? "Hidden" : `${gain ? "+" : "−"}${money(day * 12)}`}</span></button>; })}</div><p className="my-4 text-sm" aria-live="polite">{selectedDay ? `Demo day ${selectedDay}: ${((selectedDay - 1) % 7 > 4) ? "no trading activity" : "illustrative closed trade; no imported transaction"}.` : "Select a day for details."}</p><Button onClick={() => preview("Select trading activities")}>Select trading activities</Button></Panel>
    </>}{sources}
  </div>;
  return embedded ? <section aria-label={title}><h2 className="mb-4 text-2xl font-semibold">{title}</h2>{content}</section> : <Page><PageHeader heading={title} text="Finance workspace"/><PageContent>{content}</PageContent></Page>;
}
