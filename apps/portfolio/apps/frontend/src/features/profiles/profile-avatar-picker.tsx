import { PROFILE_AVATARS, ProfileAvatar } from "./profile-avatar";

export function ProfileAvatarPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return <div className="space-y-3">
    <p className="text-sm text-muted-foreground">Choose a placeholder. Family portraits and marks can replace these later.</p>
    <div role="group" aria-label="Profile placeholder" className="grid w-full grid-cols-4 gap-3 pt-2 pb-4 sm:grid-cols-8">
      {PROFILE_AVATARS.map((id, index) => <button type="button" key={id} aria-label={`Profile placeholder ${index + 1}`} aria-pressed={value === id} onClick={() => onChange(id)} className="focus-visible:ring-ring flex min-w-0 justify-center rounded-full p-1 focus-visible:ring-2">
        <span className={`w-full rounded-full p-1 ${value === id ? "ring-2 ring-ring" : ""}`}><ProfileAvatar id={id} className="h-auto w-full rounded-full sm:size-14" animated={false} /></span>
      </button>)}
    </div>
  </div>;
}
