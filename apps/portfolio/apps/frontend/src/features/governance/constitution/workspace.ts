import { z } from "zod";
import { parseConstitution, type PolicyGate } from "./policy";
import { buildAssumptionsContract, withDelegations } from "./contract";

export const MAX_DOCUMENT_LENGTH = 60_000;
export const INITIAL_DOCUMENT = "# Constitution draft\n\nWrite or import your family's verified source text here. This draft is not an approved instrument.\n";
const NoteSchema = z.object({ key: z.string(), text: z.string().max(2000), source: z.string() });
const RecordSchema = z.object({
  schema: z.literal(1), revision: z.number().int().nonnegative(),
  content: z.string().max(MAX_DOCUMENT_LENGTH), notes: z.array(NoteSchema),
  updatedAt: z.string().nullable(),
});
export type WorkspaceRecord = z.infer<typeof RecordSchema>;
export const freshRecord = (): WorkspaceRecord => ({ schema: 1, revision: 0, content: INITIAL_DOCUMENT, notes: [], updatedAt: null });
export const workspaceKey = (profile: string) => `profile:${profile}:constitution:v1`;

export function loadWorkspace(store: Pick<Storage, "getItem">, key: string): WorkspaceRecord {
  const raw = store.getItem(key);
  if (raw === null) return freshRecord();
  const result = RecordSchema.safeParse(JSON.parse(raw));
  if (!result.success) throw new Error("The saved constitution is invalid. Export or recover the stored data before replacing it.");
  return result.data;
}

export function saveWorkspace(store: Pick<Storage, "getItem" | "setItem">, key: string, draft: WorkspaceRecord): WorkspaceRecord {
  const current = loadWorkspace(store, key);
  if (current.revision !== draft.revision) throw new Error("A newer revision exists. Reload before saving; your draft is still on screen.");
  const next = RecordSchema.parse({ ...draft, revision: draft.revision + 1, updatedAt: new Date().toISOString() });
  store.setItem(key, JSON.stringify(next));
  return next;
}

// Exact source text/section identity survives inserted lines, while edits invalidate the note.
export const clauseKey = (gate: PolicyGate) => JSON.stringify([gate.section, gate.statement]);

export function compileSnapshot(record: WorkspaceRecord) {
  RecordSchema.parse(record);
  const policy = parseConstitution(record.content, { id: "constitution", label: "Constitution draft" });
  const activeKeys = new Set(policy.gates.map(clauseKey));
  const notes = record.notes.map((note) => ({ ...note, stale: !activeKeys.has(note.key) }));
  const contract = withDelegations(buildAssumptionsContract(policy), new Set());
  return { schema: 1, revision: record.revision, updatedAt: record.updatedAt, content: record.content, policy, contract, notes };
}

export function importText(current: string, incoming: string, mode: "append" | "replace") {
  if (!incoming.trim()) throw new Error("The imported text is empty.");
  const next = mode === "replace" ? incoming : `${current.trimEnd()}\n\n${incoming}`;
  if (next.length > MAX_DOCUMENT_LENGTH) throw new Error("The combined document exceeds 60,000 characters.");
  return next;
}

export function downloadText(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
