import { z } from "zod";

export const SourceSchema = z.object({
  id: z.string().trim().min(1).max(80), assignment: z.string().trim().min(1).max(200),
  section: z.string().trim().min(1).max(200), excerpt: z.string().trim().min(1).max(12000),
  interpretation: z.string().trim().min(1).max(4000),
  target: z.enum(["governance", "constitution", "estate", "finance", "simulation", "operations"]),
  parameter: z.string().trim().min(1).max(200),
  basis: z.enum(["source-principle", "operational-interpretation", "modelling-assumption"]),
  status: z.enum(["draft", "reviewed"]), reviewer: z.string().max(200),
}).superRefine((v, ctx) => { if (v.status === "reviewed" && !v.reviewer.trim()) ctx.addIssue({ code: "custom", message: "Name a reviewer before recording review", path: ["reviewer"] }); });
export const SourcePackSchema = z.object({ schema: z.literal(1), sources: z.array(SourceSchema).max(200) }).superRefine((v,ctx) => {
  if (new Set(v.sources.map(s => s.id)).size !== v.sources.length) ctx.addIssue({code:"custom",message:"Source IDs must be unique",path:["sources"]});
});
export type SourceRecord = z.infer<typeof SourceSchema>;
export const sourceKey = (profile: string) => `profile:${profile}:office-source-register:v1`;
export function parseSourcePack(text: string) { return SourcePackSchema.parse(JSON.parse(text)); }
export function loadSources(store: Pick<Storage,"getItem">, profile: string) {
  const raw = store.getItem(sourceKey(profile));
  return raw === null ? { schema: 1 as const, sources: [] as SourceRecord[] } : parseSourcePack(raw);
}
export function sourceMarkdown(sources: SourceRecord[]) {
  return "# Constitution To Tool Trace\n\nReview records are local prototype evidence, not legal approval. Bindings document intended use; activation and numerical inputs are reviewed in their owning modules.\n\n" + sources.map(s => `## ${s.id}\n\nSource: ${s.assignment}, ${s.section}\n\nBasis: ${s.basis}; status: ${s.status}; reviewer: ${s.reviewer || "pending"}\n\nExcerpt:\n${s.excerpt}\n\nInterpretation: ${s.interpretation}\n\nTarget: ${s.target} / ${s.parameter}\n`).join("\n");
}
