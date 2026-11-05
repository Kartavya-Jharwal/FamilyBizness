import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "@fb/ui";
import { selectedProfileId } from "@/features/profiles/session";
import { loadWorkspace, workspaceKey } from "@/features/governance/constitution/workspace";
import { adoptOfficeIps } from "./ips-adoption";
export function IpsAdoptionPanel({onAdopt}:{onAdopt:()=>void}) {
 const id=selectedProfileId()??"static-demo";
 const [text,setText]=useState(()=>loadWorkspace(localStorage,workspaceKey(id)).content),[reviewer,setReviewer]=useState(""),[message,setMessage]=useState("");
 return <Card><CardHeader><CardTitle>Review and date the investment mandate</CardTitle></CardHeader><CardContent className="space-y-4"><label className="block text-sm">Investment policy statement<Textarea aria-label="Investment policy statement" className="mt-2 min-h-64 leading-7" value={text} onChange={e=>setText(e.target.value)}/></label><label className="block text-sm">Reviewed by<Input className="mt-2" value={reviewer} onChange={e=>setReviewer(e.target.value)}/></label><Button onClick={()=>{try{const policy=adoptOfficeIps(localStorage,id,text,reviewer);setMessage(`Policy revision ${policy.revision} active. ${policy.rules.length} hard limits compiled.`);onAdopt();window.dispatchEvent(new CustomEvent("familybizness:record-updated",{detail:{key:`profile:${id}:office-effective-policy:v1`}}));}catch(e){setMessage(String(e));}}}>Review & activate IPS</Button>{message&&<p role="status" className="text-sm">{message}</p>}</CardContent></Card>;
}
