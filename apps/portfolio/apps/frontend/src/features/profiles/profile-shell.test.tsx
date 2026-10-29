import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ProfileShell } from "./profile-shell";
import { useProfile } from "./profile-context";

const session = vi.hoisted(() => ({ install: vi.fn() }));
vi.mock("./session", () => ({ installProfileSession: session.install }));

afterEach(() => vi.unstubAllGlobals());

it("admits the static profile using a scope identity rather than a fake auth token", () => {
  expect(session.install).toHaveBeenCalledWith({
    profileId: "demo-profile",
    scopeId: "demo-static-scope",
  });
});

it("mounts the fixed local profile without contacting a profile service", () => {
  const network = vi.fn(() => { throw new Error("Static profile attempted network access"); });
  vi.stubGlobal("fetch", network);
  function ProfileProbe() {
    const value = useProfile();
    return <div>{value?.profile?.name}: {value?.profileCount}</div>;
  }
  render(<ProfileShell><ProfileProbe /></ProfileShell>);
  expect(screen.getByText("Family Office: 1")).toBeInTheDocument();
  expect(network).not.toHaveBeenCalled();
});

it("keeps profile controls local and does not imply server admission or mutation", () => {
  const network = vi.fn(() => { throw new Error("Static profile attempted network access"); });
  vi.stubGlobal("fetch", network);
  function ProfileProbe() {
    const value = useProfile();
    if (!value) throw new Error("Missing static profile context");
    value.addProfile();
    value.manageProfile();
    value.lockProfile();
    value.switchProfile();
    value.selectProfile("unavailable-profile");
    return <div>{value.profile?.id}</div>;
  }
  render(<ProfileShell><ProfileProbe /></ProfileShell>);
  expect(screen.getByText("demo-profile")).toBeInTheDocument();
  expect(network).not.toHaveBeenCalled();
});
