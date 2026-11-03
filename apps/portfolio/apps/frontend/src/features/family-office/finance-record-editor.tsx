import { useEffect, useState } from "react";
import { Button } from "@fb/ui";
export function RecordEditor({label,value,onApply}:{label:string;value:unknown;onApply:(value:unknown)=>void}) {
 const [draft,setDraft]=useState(()=>JSON.stringify(value,null,2)),[error,setError]=useState("");
 useEffect(()=>setDraft(JSON.stringify(value,null,2)),[value]);
 return <details className="rounded-md border p-3"><summary className="cursor-pointer font-medium">{label}</summary><p className="my-2 text-sm text-muted-foreground">Edit the complete records together, then validate and apply. Export a backup before replacing source data.</p><textarea aria-label={label} className="min-h-64 w-full rounded-md border bg-background p-3 font-mono text-xs" value={draft} onChange={e=>setDraft(e.target.value)}/><Button variant="outline" onClick={()=>{try{if(draft.length>500000)throw new Error("Input exceeds 500 KB.");onApply(JSON.parse(draft));setError("");}catch(e){setError(e instanceof Error?e.message:"Invalid records");}}}>Validate & apply records</Button>{error&&<p role="alert" className="mt-2 break-words text-sm text-destructive">{error}</p>}</details>;
}
