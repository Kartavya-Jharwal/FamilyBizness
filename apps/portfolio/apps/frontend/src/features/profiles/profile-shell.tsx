import { type ReactNode, useMemo } from "react";
import { ProfileContext } from "./profile-context";
import type { ProfileSummary } from "./api";
import { installProfileSession } from "./session";

const DEMO_PROFILE: ProfileSummary = {
  id: "demo-profile",
  name: "Family Office",
  avatarId: "default",
  lockEnabled: false,
};

// Admit a static session once so scoped adapters that check session do not hang.
installProfileSession({
  profileId: DEMO_PROFILE.id,
  scopeId: "demo-static-scope",
});

/**
 * Static demo shell — no server profile admission. Provides a fixed demo profile.
 */
export function ProfileShell({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      profile: DEMO_PROFILE,
      profileCount: 1,
      profiles: [DEMO_PROFILE],
      addProfile: () => undefined,
      manageProfile: () => undefined,
      lockProfile: () => undefined,
      switchProfile: () => undefined,
      selectProfile: () => undefined,
    }),
    [],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
