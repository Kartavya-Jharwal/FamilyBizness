import { type ReactNode, useEffect, useState } from "react";
import { DitherButton, DitherGradient } from "@/components/dither-kit";
import { Button, buttonVariants, cardSurfaceClassName } from "@fb/ui";
import { ProfileContext } from "./profile-context";
import { profileCommand, type ProfileState, type ProfileSummary } from "./api";
import { installProfileSession } from "./session";
import { isOfficePersona } from "./profile-workspace";
import { ProfileAvatar } from "./profile-avatar";
import { hasSeenOfficeEntry, localRoleProfiles, readLocalProfileState, selectedLocalPersona, sourceExampleProfileId } from "./local-engine";

const selected = selectedLocalPersona();
try { const session = readLocalProfileState().session; if (session) installProfileSession(session); } catch { /* Recovery stays inside profile entry. */ }

/** Profile entry and management use the host's local command engine. */
export function ProfileShell({ children }: { children: ReactNode }) {
  const [initial] = useState(() => { try { return { state: readLocalProfileState(), error: "" }; } catch (error) { return { state: { profiles: [], session: null, starting: false } as ProfileState, error: String(error) }; } });
  const [profiles, setProfiles] = useState(initial.state.profiles);
  const profile = profiles.find(row => row.id === selected);
  const [choosing, setChoosing] = useState(new URLSearchParams(window.location.search).has("choose-profile") || !profile || !initial.state.session || (!!selected && !isOfficePersona(selected) && !hasSeenOfficeEntry()));
  const [editing, setEditing] = useState<"add" | "edit" | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(initial.error);
  const [ready, setReady] = useState(!selected || (!isOfficePersona(selected) && selected !== sourceExampleProfileId));
  const [openingError, setOpeningError] = useState("");
  useEffect(() => {
    if (!profile || choosing) return;
    let disposed = false;
    const populate = isOfficePersona(profile.id)
      ? import("@/features/family-office/family-office-case").then(({ ensureFamilyOfficeCase }) => ensureFamilyOfficeCase(localStorage))
      : profile.id === sourceExampleProfileId
        ? import("@/features/family-office/golden-bird-case").then(({ ensureGoldenBirdCase }) => ensureGoldenBirdCase(localStorage, profile.id))
        : Promise.resolve();
    populate.then(() => { if (!disposed) setReady(true); }).catch(error => { if (!disposed) setOpeningError(String(error)); });
    return () => { disposed = true; };
  }, [profile?.id, choosing]);

  async function selectProfile(id: string) {
    if (saving) return;
    setSaving(true); setError("");
    try {
      await profileCommand<ProfileState>("unlock_profile", { profileId: id });
      const entryUrl = new URL(window.location.href); entryUrl.searchParams.delete("choose-profile"); window.history.replaceState(null, "", entryUrl);
      if (isOfficePersona(id)) window.location.hash = "/office/case";
      window.location.reload();
    } catch (error) { setError(error instanceof Error ? error.message : "Profile could not be opened."); setSaving(false); }
  }
  async function lockProfile() {
    try { await profileCommand<ProfileState>("lock_profile"); window.location.reload(); }
    catch (error) { setError(String(error)); setChoosing(true); }
  }
  const value = { profile, profiles, profileCount: profiles.length,
    addProfile: () => { setChoosing(true); setEditing("add"); setName(""); },
    manageProfile: () => { setChoosing(true); setEditing("edit"); setName(profile?.name ?? ""); },
    lockProfile: () => { void lockProfile(); }, switchProfile: () => setChoosing(true), selectProfile: (id: string) => { void selectProfile(id); } };
  const avatar = (row: ProfileSummary) => row.avatarId === "default" ? localRoleProfiles.find(role => role.id === row.id)?.avatarId ?? row.avatarId : row.avatarId;
  const tile = (row: ProfileSummary) => <article key={row.id} className={`${cardSurfaceClassName} flex flex-col items-center gap-3 p-5 text-center`}>
    <ProfileAvatar id={avatar(row)} className="size-20" animated={false}/>
    <h2 className="text-base font-semibold">{row.name}</h2>
    <DitherButton aria-label={`Open ${row.name}`} color="green" variant="dotted" bloom="off" className={buttonVariants({ variant: "outline", className: "mt-auto" })} disabled={saving || row.lockEnabled} onClick={() => void selectProfile(row.id)}>Open profile</DitherButton>
    {row.lockEnabled && <p className="text-xs text-muted-foreground">Open this protected profile in its original host.</p>}
  </article>;
  if (choosing) return <main className="relative isolate mx-auto max-w-4xl space-y-6 p-6 text-foreground">
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 overflow-hidden" aria-hidden="true"><DitherGradient from="green" direction="down" opacity={0.1} className="size-full" /></div>
    <header className="space-y-2"><p className="text-sm text-muted-foreground">FamilyBizness</p><h1 className="text-3xl font-semibold">Who is visiting the family office?</h1><p className="text-sm text-muted-foreground">Choose your profile to open the shared family office.</p></header>
    {error && <p role="alert" className="rounded-md border p-3 text-sm text-destructive">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{profiles.filter(row => isOfficePersona(row.id)).map(tile)}</div>
    <details className="rounded-lg border p-4" open={editing !== null || undefined}>
      <summary className="cursor-pointer text-sm font-medium">Profile setup and recovery</summary>
      <div className="mt-4 space-y-4">
        <div className="flex flex-wrap gap-3"><Button variant="outline" onClick={value.addProfile}>Add profile</Button>{profile && <Button variant="outline" onClick={value.manageProfile}>Edit profile</Button>}<Button variant="outline" onClick={async () => { try { const state = await profileCommand<ProfileState>("get_profile_state"); setProfiles(state.profiles); setError(""); } catch (error) { setError(String(error)); } }}>Reload saved profiles</Button></div>
        {editing && <form className="space-y-3 rounded-md border bg-card p-4" onSubmit={async event => {
          event.preventDefault(); if (!name.trim() || saving) return; setSaving(true);
          try { const state = await profileCommand<ProfileState>(editing === "edit" ? "update_profile" : "create_profile", { name, ...(editing === "edit" && profile ? { profileId: profile.id } : {}) }); setProfiles(state.profiles); setEditing(null); setError(""); }
          catch (error) { setError(error instanceof Error ? error.message : "Profile could not be saved."); } finally { setSaving(false); }
        }}><label className="block text-sm">Profile name<input maxLength={60} required className="mt-1 block w-full rounded-md border bg-background p-2" value={name} onChange={event => setName(event.target.value)}/></label><div className="flex gap-3"><Button disabled={saving} type="submit">{saving ? "Saving profile..." : "Save profile"}</Button><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button></div></form>}
        <details><summary className="cursor-pointer text-sm text-muted-foreground">Earlier saved workspaces</summary><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{profiles.filter(row => !isOfficePersona(row.id)).map(tile)}</div></details>
      </div>
    </details>
  </main>;
  if (!ready) return <main className="mx-auto max-w-3xl space-y-4 p-6 text-foreground"><h1 className="text-2xl font-semibold">Opening the family office</h1>{openingError ? <><p role="alert">{openingError}</p><Button variant="outline" onClick={() => setChoosing(true)}>Choose another profile</Button></> : <p role="status">Preparing your workspace...</p>}</main>;
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
