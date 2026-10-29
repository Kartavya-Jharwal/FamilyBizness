import { z } from "zod";
import { evaluatePolicy, parseConstitution, type GateEvaluation, type PolicyGate, type PolicyMetrics } from "./policy";
import { loadWorkspace, workspaceKey, type WorkspaceRecord } from "./workspace";

const ActiveSchema = z.object({ schema: z.literal(1), profileId: z.string().min(1), scope: z.literal("all-local-accounts"),
  currency: z.string().regex(/^[A-Z]{3}$/), revision: z.number().int().positive(), content: z.string().max(60_000), reviewedAt: z.string() });
export type ActiveIps = z.infer<typeof ActiveSchema>;
export const ipsKey = (profile: string) => `profile:${profile}:active-ips:v1`;
export function readActiveIps(store: Pick<Storage, "getItem">, profile: string): ActiveIps | null {
  const raw = store.getItem(ipsKey(profile));
  if (raw === null) return null;
  const result = ActiveSchema.safeParse(JSON.parse(raw));
  if (!result.success || result.data.profileId !== profile || !Number.isFinite(Date.parse(result.data.reviewedAt)) || parseConstitution(result.data.content).gates.length === 0) throw new Error("IPS needs review: active policy storage or profile scope is invalid.");
  return result.data;
}
export function activateIps(store: Pick<Storage, "getItem" | "setItem">, profile: string, draft: WorkspaceRecord, currency: string, reviewed: boolean): ActiveIps {
  const saved = loadWorkspace(store, workspaceKey(profile));
  if (!reviewed || saved.revision < 1 || saved.revision !== draft.revision || saved.content !== draft.content) throw new Error("Save and explicitly review this exact revision before activating its IPS.");
  const policy = parseConstitution(saved.content);
  if (policy.gates.length === 0) throw new Error("No candidate constraints are available to activate.");
  const active = ActiveSchema.parse({ schema: 1, profileId: profile, scope: "all-local-accounts", currency, revision: saved.revision, content: saved.content, reviewedAt: new Date().toISOString() });
  store.setItem(ipsKey(profile), JSON.stringify(active));
  return active;
}

export interface IpsPosition { accountId: string; kind: string; value: number }
export interface IpsAccount { id: string; currency: string; balance?: number | null; isArchived?: boolean; isActive?: boolean; trackingMode?: string }
export interface IpsFacts { accounts: IpsAccount[]; positions: IpsPosition[]; currency: string; asOf: string; source: "local-demo-fixtures" }
export interface IpsFinding extends GateEvaluation { clause: string; sourceLine: number; revision: number }

function supported(gate: PolicyGate) {
  return gate.recognitionStatus === "executable" && ["maximum", "minimum", "target"].includes(gate.comparator) &&
    ((gate.field === "assetExposurePercent" && ["Public equities", "Fixed income", "Cash & equivalents"].includes(gate.assetClass ?? "")) || gate.field === "illiquidPercent");
}

function assessSource(content: string, revision: number, currency: string, facts: IpsFacts): IpsFinding[] {
  const policy = parseConstitution(content);
  const ids = new Set(facts.accounts.map((account) => account.id));
  const positions = facts.positions.filter((position) => ids.has(position.accountId));
  const total = positions.reduce((sum, position) => sum + position.value, 0);
  const valid = facts.currency === currency && facts.currency === "USD" &&
    facts.accounts.every((account) => account.currency === currency && account.balance === positions.filter((position) => position.accountId === account.id).reduce((sum, position) => sum + position.value, 0)) &&
    positions.every((position) => Number.isFinite(position.value) && position.value >= 0 && ["equity", "fixed", "cash", "private"].includes(position.kind)) &&
    total > 0 && /^\d{4}-\d{2}-\d{2}$/.test(facts.asOf);
  const share = (kind: string) => positions.filter((position) => position.kind === kind).reduce((sum, position) => sum + position.value, 0) / total * 100;
  const metrics: PolicyMetrics = valid ? { baseCurrency: facts.currency, illiquidPercent: share("private"), assetExposurePercent: {
    "Public equities": share("equity"), "Fixed income": share("fixed"), "Cash & equivalents": share("cash"),
  } } : {};
  return policy.gates.map((gate) => {
    const evaluated = supported(gate) && valid ? evaluatePolicy({ ...policy, gates: [gate] }, metrics)[0] : {
      gateId: gate.id, status: "not_configured" as const, observed: null,
      message: "Needs review: this clause or its scoped currency/classification/valuation facts are unsupported.",
    };
    return { ...evaluated, clause: gate.statement, sourceLine: gate.sourceLine, revision };
  });
}

export function assessIps(active: ActiveIps, facts: IpsFacts): IpsFinding[] {
  return assessSource(active.content, active.revision, active.currency, facts);
}

/** Read-only draft feedback; this does not save, activate or authorize a mutation. */
export function previewPolicy(content: string, facts: IpsFacts): IpsFinding[] {
  return assessSource(content, 0, facts.currency, facts);
}

/** Runs on a proposed store copy before any local mutation is committed. */
export function enforceIps(active: ActiveIps | null, before: IpsFacts, after: IpsFacts) {
  if (!active) return;
  const financialFields = (facts: IpsFacts) => JSON.stringify({ currency: facts.currency, accounts: facts.accounts.map(({ id, currency, balance, isArchived, isActive, trackingMode }) => ({ id, currency, balance, isArchived, isActive, trackingMode })) });
  if (financialFields(before) === financialFields(after)) return;
  const changedMetadata = before.currency !== after.currency || after.accounts.some((account) => {
    const old = before.accounts.find((entry) => entry.id === account.id);
    return old && (old.currency !== account.currency || old.balance !== account.balance || old.isArchived !== account.isArchived || old.isActive !== account.isActive || old.trackingMode !== account.trackingMode);
  });
  if (changedMetadata) throw new Error(`IPS revision ${active.revision} needs review: currency, balance, archival, active-state or tracking changes have no supported post-change valuation. No changes were saved.`);
  const findings = assessIps(active, after);
  const rejected = findings.filter((finding) => finding.status !== "pass");
  if (rejected.length) throw new Error(`IPS revision ${active.revision} blocked this local account change. ${rejected.map((finding) => `Line ${finding.sourceLine}: ${finding.clause} — ${finding.status === "breach" ? "limit exceeded" : "needs review"}.`).join(" ")} No changes were saved.`);
}
