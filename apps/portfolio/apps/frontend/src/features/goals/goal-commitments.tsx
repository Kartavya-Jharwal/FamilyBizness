import { useGoals } from "./hooks/use-goals";
import { goalCommitments } from "./goal-ledger";
import { useBalancePrivacy } from "@/hooks/use-balance-privacy";
export function GoalCommitments() {
 const {goals,isLoading} = useGoals(); const totals=goalCommitments(goals); const {isBalanceHidden}=useBalancePrivacy();
 return <section aria-label="Family goal commitments" className="flex flex-col gap-4 rounded-lg border p-4"><h2 className="text-lg font-semibold">Family goal commitments</h2><p className="text-sm text-muted-foreground">Saved family goals inform the funding plan. Reserved capital is separate from actual expenditure.</p>{isLoading ? <p>Loading goals…</p> : <dl className="grid gap-4 sm:grid-cols-3">{[["Target commitments",totals.target],["Funded capital",totals.funded],["Remaining to fund",totals.remaining]].map(([label,value])=><div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-semibold">{isBalanceHidden?"Hidden":Number(value).toLocaleString("en-GB",{maximumFractionDigits:0})}</dd></div>)}</dl>}</section>;
}
