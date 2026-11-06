import type { ProfileState, ProfileSummary } from "./api";
import { goldenBirdSource } from "@/features/family-office/golden-bird-source";
import { workspaceForProfile } from "./profile-workspace";
type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export const localProfileKeys = { registry: "familybizness:demo-profiles", selected: "familybizness:selected-demo-profile", entrySeen: "familybizness:composite-entry-seen:v1", roleBackup: "familybizness:profiles-before-role-consolidation" };
export const sourceExampleProfileId = goldenBirdSource.identity.profileId;
const avatars = ["line-silver-animated", "line-curls-animated", "line-beard-animated", "line-wave-animated", "line-freckles-animated", "line-bun-animated", "line-bob-animated"];
export const canonicalRoleId = (id: string | null): string | null => id === "office-role-3" ? "office-role-2" : id === "office-role-6" ? "office-role-4" : id;
export const localRoleProfiles: ProfileSummary[] = [[0, "Family Patriarch"], [1, "Family Board"], [2, "Managing Director"], [4, "Associate"], [5, "Legal Counsel"]].map(([i, name]) => ({ id: `office-role-${i}`, name: String(name), avatarId: avatars[Number(i)], lockEnabled: false }));
const defaults = [...localRoleProfiles, { id: sourceExampleProfileId, name: "Source example", avatarId: "default", lockEnabled: false }];
function write(store: Store, changes: Map<string, string | null>) {
    const registry = store.getItem(localProfileKeys.registry);
    if (changes.has(localProfileKeys.registry) && registry && !store.getItem(localProfileKeys.roleBackup) && /office-role-(3|6)/.test(registry)) changes.set(localProfileKeys.roleBackup, registry);
    const before = new Map([...changes.keys()].map(key => [key, store.getItem(key)]));
    try {
        for (const [key, value] of changes)
            value === null ? store.removeItem(key) : store.setItem(key, value);
    }
    catch (error) {
        for (const [key, value] of before)
            value === null ? store.removeItem(key) : store.setItem(key, value);
        throw error;
    }
}
export function readLocalProfileState(store: Store = localStorage): ProfileState {
    const raw = store.getItem(localProfileKeys.registry);
    let profiles: ProfileSummary[] = defaults.map(row => ({ ...row }));
    if (raw !== null) {
        const saved: unknown = JSON.parse(raw);
        if (!Array.isArray(saved) || !saved.length || saved.some(row => !row || typeof row.id !== "string" || typeof row.name !== "string" || typeof row.avatarId !== "string" || (row.lockEnabled !== undefined && typeof row.lockEnabled !== "boolean")) || new Set(saved.map(row => row.id)).size !== saved.length)
            throw Error("Saved profiles need recovery; existing records have been retained.");
        const retained = saved.map(row => ({ ...row, lockEnabled: row.lockEnabled === true }));
        profiles = [...defaults.map(row => {
            const previous = retained.find(item => item.id === row.id) ?? retained.find(item => canonicalRoleId(item.id) === row.id);
            return previous ? { ...previous, id: row.id, ...(["office-role-2", "office-role-4"].includes(row.id) ? { name: row.name } : {}) } : row;
        }), ...retained.filter(row => !defaults.some(item => item.id === canonicalRoleId(row.id)))];
    }
    const selected = canonicalRoleId(store.getItem(localProfileKeys.selected));
    const current = profiles.find(row => row.id === selected);
    return { profiles, session: current && !current.lockEnabled ? { profileId: workspaceForProfile(current.id), scopeId: `demo-static-${current.id}` } : null, starting: false };
}
export function selectedLocalPersona(store: Store = localStorage): string | null { return canonicalRoleId(store.getItem(localProfileKeys.selected)); }
export function hasSeenOfficeEntry(store: Store = localStorage): boolean { return store.getItem(localProfileKeys.entrySeen) !== null; }
/** The static adapter uses the same command boundary as profile entry and management. */
export function localProfileCommand(command: string, payload: Record<string, unknown> = {}, store: Store = localStorage): unknown {
    const state = readLocalProfileState(store);
    if (command === "get_profile_state" || command === "retry_profile_startup")
        return state;
    if (command === "list_profiles")
        return state.profiles;
    if (command === "profile_activity")
        return null;
    const input = payload.input && typeof payload.input === "object" ? payload.input as Record<string, unknown> : payload;
    const suppliedId = input.profileId ?? input.profile_id ?? input.id;
    const id = typeof suppliedId === "string" ? canonicalRoleId(suppliedId) : suppliedId;
    if (command === "unlock_profile") {
        const profile = state.profiles.find(row => row.id === id);
        if (!profile)
            throw Error("PROFILE_NOT_FOUND");
        if (profile.lockEnabled)
            throw Error("This saved profile requires its original authentication host. Choose an office profile to continue.");
        write(store, new Map([[localProfileKeys.registry, JSON.stringify(state.profiles)], [localProfileKeys.selected, profile.id], [localProfileKeys.entrySeen, "seen"]]));
        return readLocalProfileState(store);
    }
    if (command === "lock_profile") {
        write(store, new Map([[localProfileKeys.selected, null]]));
        return readLocalProfileState(store);
    }
    if (command === "create_profile" || command === "update_profile") {
        const name = typeof input.name === "string" ? input.name.trim() : "";
        if (!name || name.length > 60)
            throw Error("Use a profile name between 1 and 60 characters.");
        if (input.lockEnabled === true || input.password)
            throw Error("Password management is unavailable in the local office.");
        if (command === "update_profile" && !state.profiles.some(row => row.id === id))
            throw Error("PROFILE_NOT_FOUND");
        const avatarId = typeof input.avatarId === "string" && input.avatarId.trim() ? input.avatarId.trim() : undefined;
        const profiles = command === "create_profile" ? [...state.profiles, { id: `office-member-${crypto.randomUUID()}`, name, avatarId: avatarId ?? "line-freckles-animated", lockEnabled: false }] : state.profiles.map(row => row.id === id ? { ...row, name, ...(avatarId ? { avatarId } : {}) } : row);
        write(store, new Map([[localProfileKeys.registry, JSON.stringify(profiles)]]));
        return readLocalProfileState(store);
    }
    throw Error(`PROFILE_LOCAL_COMMAND_UNAVAILABLE: ${command}`);
}
