import { type ReactNode, useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@fb/ui";
import { ProfileContext } from "./profile-context";
import type { ProfileSummary } from "./api";
import { installProfileSession } from "./session";
import { isOfficePersona, workspaceForProfile } from "./profile-workspace";
import { goldenBirdSource } from "@/features/family-office/golden-bird-source";

const key = "familybizness:demo-profiles";
const selectedKey = "familybizness:selected-demo-profile";
const goldenBirdProfile: ProfileSummary = { id: goldenBirdSource.identity.profileId, name: "Project Golden Bird", avatarId: "default", lockEnabled: false };
const defaults: ProfileSummary[] = [
  ...["Patriarch", "Family board", "Managing director", "CEO", "Associate", "Legal counsel", "Family technician"].map((name, i) => ({ id: `office-role-${i}`, name, avatarId: "default", lockEnabled: false })),
  goldenBirdProfile,
];
function readProfiles(): ProfileSummary[] {
  const raw = localStorage.getItem(key);
  if (!raw) return defaults;
  const rows: unknown = JSON.parse(raw);
  if (!Array.isArray(rows) || !rows.length || rows.some(p => !p || typeof p.id !== "string" || typeof p.name !== "string" || typeof p.avatarId !== "string") || new Set(rows.map(p=>p.id)).size !== rows.length) throw new Error("Saved profiles need recovery; they have not been replaced.");
  return [...defaults.map(p=>rows.find(row=>row.id===p.id)??p), ...rows.filter(row=>!defaults.some(p=>p.id===row.id))];
}
const selected = localStorage.getItem(selectedKey);
if (selected) installProfileSession({ profileId: workspaceForProfile(selected), scopeId: `demo-static-${selected}` });

/** Local static admission uses the host context and immutable per-load session. */
export function ProfileShell({ children }: { children: ReactNode }) {
  const [initial] = useState(() => { try { return { profiles: readProfiles(), error: "" }; } catch (e) { return { profiles: [] as ProfileSummary[], error: String(e) }; } });
  const [profiles, setProfiles] = useState(initial.profiles);
  const profile = profiles.find(p => p.id === selected);
  const [choosing, setChoosing] = useState(!profile || (!!selected && !isOfficePersona(selected) && !localStorage.getItem("familybizness:composite-entry-seen:v1")));
  const [editing, setEditing] = useState<"add" | "edit" | null>(null);
  const [name, setName] = useState("");
  const [saving,setSaving]=useState(false);
  const [error, setError] = useState(initial.error);
  const [sampleReady, setSampleReady] = useState(!selected || (!isOfficePersona(selected) && selected !== goldenBirdProfile.id));
  const [sampleError, setSampleError] = useState("");
  useEffect(() => {
    if (!profile) return;
    if (isOfficePersona(profile.id)) {
      let disposed = false;
      import("@/features/family-office/family-office-case").then(({ensureFamilyOfficeCase})=>{ensureFamilyOfficeCase(localStorage);if(!disposed)setSampleReady(true);}).catch(e=>{if(!disposed)setSampleError(String(e));});
      return ()=>{disposed=true;};
    }
    if (profile.id !== goldenBirdProfile.id) return;
    let disposed = false;
    import("@/features/family-office/golden-bird-case").then(({ ensureGoldenBirdCase }) => {
      ensureGoldenBirdCase(localStorage, goldenBirdProfile.id);
      if (!disposed) setSampleReady(true);
    }).catch(e => { if (!disposed) setSampleError(String(e)); });
    return () => { disposed = true; };
  }, [profile?.id]);
  function selectProfile(id: string) {
    try { localStorage.setItem(key, JSON.stringify(profiles)); localStorage.setItem(selectedKey, id); localStorage.setItem("familybizness:composite-entry-seen:v1","seen"); if(isOfficePersona(id))window.location.hash="/office/case"; window.location.reload(); } catch { setError("Profile selection could not be saved."); }
  }
  const value = { profile, profiles, profileCount: profiles.length,
    addProfile: () => { setChoosing(true); setEditing("add"); setName(""); },
    manageProfile: () => { setChoosing(true); setEditing("edit"); setName(profile?.name ?? ""); },
    lockProfile: () => setChoosing(true), switchProfile: () => setChoosing(true), selectProfile };
  if (choosing) return <main style={{ fontFamily: "var(--design-font-sans)" }} className="mx-auto max-w-3xl space-y-6 p-6 text-foreground">
    <header><p className="text-sm text-muted-foreground">FamilyBizness</p><h1 className="text-3xl font-semibold">Who is visiting the family office?</h1><p>One prepared office for the family, owners, Board and professional team. Choose your profile to continue. The operating charter brings together selected provisions from four constitutions.</p></header>
    {error && <p role="alert">{error}</p>}
    <Button variant="outline" onClick={value.addProfile}>Add profile</Button>
    <div className="grid gap-4 sm:grid-cols-2">{profiles.filter(p=>isOfficePersona(p.id)).map(p => <Card key={p.id}><CardHeader><CardTitle>{p.name}</CardTitle></CardHeader><CardContent><Button onClick={()=>selectProfile(p.id)}>Open {p.name}</Button></CardContent></Card>)}</div>
    <details className="rounded-md border p-4"><summary className="cursor-pointer text-sm font-medium">Earlier saved workspaces and source example</summary><p className="my-3 text-sm text-muted-foreground">Retained records are available here. The prepared family office above is the main workspace.</p><div className="grid gap-3 sm:grid-cols-2">{profiles.filter(p=>!isOfficePersona(p.id)).map(p=><Card key={p.id}><CardHeader><CardTitle>{p.name}</CardTitle></CardHeader><CardContent><Button variant="outline" onClick={()=>selectProfile(p.id)}>Open {p.name}</Button></CardContent></Card>)}</div></details>
    {editing && <form className="space-y-3 rounded-md border bg-card p-4" onSubmit={async e=>{
      e.preventDefault();const clean=name.trim();if(!clean||saving)return;setSaving(true);
      try{
        if(editing==="edit"&&profile){const next=profiles.map(p=>p.id===profile.id?{...p,name:clean}:p);localStorage.setItem(key,JSON.stringify(next));setProfiles(next);}
        else{const id=`office-member-${crypto.randomUUID()}`;const next=[...profiles,{id,name:clean,avatarId:"default",lockEnabled:false}];localStorage.setItem(key,JSON.stringify(next));setProfiles(next);}
        setEditing(null);setError("");
      }catch(e){setError(e instanceof Error?e.message:"Profile could not be saved.");}finally{setSaving(false);}
    }}><label className="block">Profile name<input maxLength={60} required className="block w-full rounded-md border bg-background p-2" value={name} onChange={e=>setName(e.target.value)}/></label>
    {editing==="add"&&<p className="text-sm text-muted-foreground">This adds a visitor profile to the prepared family office. Everyone uses the same charter, calendar and planning records.</p>}
    <Button disabled={saving} type="submit">{saving?"Saving profile...":"Save profile"}</Button></form>}
    {profile && <Button variant="outline" onClick={()=>setChoosing(false)}>Return to {profile.name}</Button>}
  </main>;
  if (!sampleReady) return <main className="mx-auto max-w-3xl space-y-4 p-6 text-foreground"><h1 className="text-2xl font-semibold">Opening the family office</h1>{sampleError ? <><p role="alert">{sampleError}</p><Button variant="outline" onClick={()=>setChoosing(true)}>Choose another profile</Button></> : <p role="status">Preparing the family case...</p>}</main>;
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
