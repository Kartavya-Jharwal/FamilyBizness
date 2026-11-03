import { type ReactNode, useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@fb/ui";
import { ProfileContext } from "./profile-context";
import type { ProfileSummary } from "./api";
import { installProfileSession } from "./session";
import { goldenBirdSource } from "@/features/family-office/golden-bird-source";

const key = "familybizness:demo-profiles";
const selectedKey = "familybizness:selected-demo-profile";
const goldenBirdProfile: ProfileSummary = { id: goldenBirdSource.identity.profileId, name: "Project Golden Bird", avatarId: "default", lockEnabled: false };
const defaults: ProfileSummary[] = [
  { id: "demo-profile", name: "Patriarch", avatarId: "default", lockEnabled: false },
  ...["Family board", "Managing director", "CEO", "Associate", "Legal counsel", "Family technician"].map((name, i) => ({ id: `demo-role-${i}`, name, avatarId: "default", lockEnabled: false })),
  goldenBirdProfile,
];
function readProfiles(): ProfileSummary[] {
  const raw = localStorage.getItem(key);
  if (!raw) return defaults;
  const rows: unknown = JSON.parse(raw);
  if (!Array.isArray(rows) || !rows.length || rows.some(p => !p || typeof p.id !== "string" || typeof p.name !== "string" || typeof p.avatarId !== "string") || new Set(rows.map(p=>p.id)).size !== rows.length) throw new Error("Saved profiles need recovery; they have not been replaced.");
  return rows.some(p => p.id === goldenBirdProfile.id) ? rows : [goldenBirdProfile, ...rows];
}
const selected = localStorage.getItem(selectedKey);
if (selected) installProfileSession({ profileId: selected, scopeId: `demo-static-${selected}` });

/** Local static admission uses the host context and immutable per-load session. */
export function ProfileShell({ children }: { children: ReactNode }) {
  const [initial] = useState(() => { try { return { profiles: readProfiles(), error: "" }; } catch (e) { return { profiles: [] as ProfileSummary[], error: String(e) }; } });
  const [profiles, setProfiles] = useState(initial.profiles);
  const profile = profiles.find(p => p.id === selected);
  const [choosing, setChoosing] = useState(!profile);
  const [editing, setEditing] = useState<"add" | "edit" | null>(null);
  const [name, setName] = useState("");
  const [businessName,setBusinessName]=useState("");
  const [template,setTemplate]=useState<"blank"|"golden-bird">("blank");
  const [saving,setSaving]=useState(false);
  const [error, setError] = useState(initial.error);
  const [sampleReady, setSampleReady] = useState(selected !== goldenBirdProfile.id);
  const [sampleError, setSampleError] = useState("");
  useEffect(() => {
    if (profile?.id !== goldenBirdProfile.id) return;
    let disposed = false;
    import("@/features/family-office/golden-bird-case").then(({ ensureGoldenBirdCase }) => {
      ensureGoldenBirdCase(localStorage, goldenBirdProfile.id);
      if (!disposed) setSampleReady(true);
    }).catch(e => { if (!disposed) setSampleError(String(e)); });
    return () => { disposed = true; };
  }, [profile?.id]);
  function selectProfile(id: string) {
    try { localStorage.setItem(key, JSON.stringify(profiles)); localStorage.setItem(selectedKey, id); window.location.reload(); } catch { setError("Profile selection could not be saved."); }
  }
  const value = { profile, profiles, profileCount: profiles.length,
    addProfile: () => { setChoosing(true); setEditing("add"); setName(""); setBusinessName(""); setTemplate("blank"); },
    manageProfile: () => { setChoosing(true); setEditing("edit"); setName(profile?.name ?? ""); },
    lockProfile: () => setChoosing(true), switchProfile: () => setChoosing(true), selectProfile };
  if (choosing) return <main style={{ fontFamily: "var(--design-font-sans)" }} className="mx-auto max-w-3xl space-y-6 p-6 text-foreground">
    <header><p className="text-sm text-muted-foreground">FamilyBizness</p><h1 className="text-3xl font-semibold">Who is visiting the family office?</h1><p>Choose a family case or create an independent one. Golden Bird is one optional assignment example. Each profile keeps its own records and constitution library in this browser.</p></header>
    {error && <p role="alert">{error}</p>}
    <Button variant="outline" onClick={value.addProfile}>Add profile</Button>
    <div className="grid gap-4 sm:grid-cols-2">{profiles.filter(p=>p.id!==goldenBirdProfile.id).map(p => <Card key={p.id}><CardHeader><CardTitle>{p.name}</CardTitle></CardHeader><CardContent><Button onClick={()=>selectProfile(p.id)}>Open {p.name}</Button></CardContent></Card>)}</div>
    <section className="space-y-3"><h2 className="text-lg font-semibold">Assignment example</h2><p className="text-sm text-muted-foreground">Golden Bird is one selectable constitution and family-business model. It does not define your other cases.</p>{profiles.filter(p=>p.id===goldenBirdProfile.id).map(p=><Card key={p.id}><CardHeader><CardTitle>{p.name}</CardTitle></CardHeader><CardContent><Button onClick={()=>selectProfile(p.id)}>Open {p.name}</Button></CardContent></Card>)}</section>
    {editing && <form className="space-y-3 rounded-md border bg-card p-4" onSubmit={async e=>{
      e.preventDefault();const clean=name.trim();if(!clean||saving)return;setSaving(true);
      try{
        if(editing==="edit"&&profile){const next=profiles.map(p=>p.id===profile.id?{...p,name:clean}:p);localStorage.setItem(key,JSON.stringify(next));setProfiles(next);}
        else{const id=crypto.randomUUID();const next=[...profiles,{id,name:clean,avatarId:"default",lockEnabled:false}];const {createFamilyCase}=await import("@/features/family-office/case-setup");await createFamilyCase(localStorage,id,clean,businessName,template,next);setProfiles(next);}
        setEditing(null);setError("");
      }catch(e){setError(e instanceof Error?e.message:"Profile could not be saved.");}finally{setSaving(false);}
    }}><label className="block">Profile name<input maxLength={60} required className="block w-full rounded-md border bg-background p-2" value={name} onChange={e=>setName(e.target.value)}/></label>
    {editing==="add"&&<><label className="block">Business name (optional)<input maxLength={200} className="block w-full rounded-md border bg-background p-2" value={businessName} onChange={e=>setBusinessName(e.target.value)}/></label><div><label htmlFor="family-case-template">Start this family case from</label><select id="family-case-template" className="mt-1 block w-full rounded-md border bg-background p-2" value={template} onChange={e=>setTemplate(e.target.value as typeof template)}><option value="blank">Blank family case</option><option value="golden-bird">Golden Bird assignment example</option></select></div><p className="text-sm text-muted-foreground">A blank case has no adopted constitutional rules. Add your family's constitution in Family business. The example copies records into this new case so later edits remain independent.</p></>}
    <Button disabled={saving} type="submit">{saving?"Creating family case...":"Save profile"}</Button></form>}
    {profile && <Button variant="outline" onClick={()=>setChoosing(false)}>Return to {profile.name}</Button>}
  </main>;
  if (!sampleReady) return <main className="mx-auto max-w-3xl space-y-4 p-6 text-foreground"><h1 className="text-2xl font-semibold">Opening Project Golden Bird</h1>{sampleError ? <><p role="alert">{sampleError}</p><Button variant="outline" onClick={()=>setChoosing(true)}>Choose another profile</Button></> : <p role="status">Preparing the family case...</p>}</main>;
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
