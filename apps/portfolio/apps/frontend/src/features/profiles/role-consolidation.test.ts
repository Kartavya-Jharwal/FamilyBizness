import { beforeEach, expect, it } from "vitest";
import { canonicalRoleId, localRoleProfiles, localProfileCommand, localProfileKeys, readLocalProfileState, selectedLocalPersona } from "./local-engine";
beforeEach(() => localStorage.clear());
it("offers five roles and admits old CEO/technician selections into their merged role", () => {
 expect(localRoleProfiles.map(p => p.name)).toEqual(["Patriarch", "Family board", "Managing director / CEO", "Associate / family technician", "Legal counsel"]);
 for (const [oldId, newId] of [["office-role-3", "office-role-2"], ["office-role-6", "office-role-4"]]) {
  localStorage.setItem(localProfileKeys.selected, oldId);
  expect(selectedLocalPersona()).toBe(newId);
  expect(readLocalProfileState().session?.scopeId).toBe(`demo-static-${newId}`);
  localProfileCommand("unlock_profile", { profileId: oldId });
  expect(localStorage.getItem(localProfileKeys.selected)).toBe(newId);
 }
 expect(canonicalRoleId("office-member-saved")).toBe("office-member-saved");
});
it("retains custom visitors and archives the old registry before a merged write", () => {
 const custom = { id: "office-member-saved", name: "Visiting adviser", avatarId: "default", lockEnabled: false };
 const legacy = [...localRoleProfiles, { id: "office-role-3", name: "CEO", avatarId: "default", lockEnabled: false }, { id: "office-role-6", name: "Family technician", avatarId: "default", lockEnabled: false }, custom];
 localStorage.setItem(localProfileKeys.registry, JSON.stringify(legacy));
 const state = readLocalProfileState();
 expect(state.profiles.some(p => p.id === "office-role-3" || p.id === "office-role-6")).toBe(false);
 expect(state.profiles).toContainEqual(custom);
 localProfileCommand("unlock_profile", { profileId: "office-role-6" });
 expect(JSON.parse(localStorage.getItem(localProfileKeys.roleBackup)!)).toEqual(legacy);
});
