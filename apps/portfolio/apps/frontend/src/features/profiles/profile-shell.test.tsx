import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
vi.mock("./session",()=>({installProfileSession:vi.fn()}));
import { ProfileShell } from "./profile-shell";
afterEach(()=>{cleanup();localStorage.clear();});
it("offers populated roles on a cold visit without mounting financial children",()=>{
 render(<ProfileShell><p>Financial workspace</p></ProfileShell>);
 expect(screen.getByRole("button",{name:"Open Patriarch"})).toBeInTheDocument();
 expect(screen.getByRole("button",{name:"Open Family technician"})).toBeInTheDocument();
 expect(screen.queryByText("Financial workspace")).not.toBeInTheDocument();
});
it("adds a persistent local profile through host setup",async()=>{
 render(<ProfileShell><p>Workspace</p></ProfileShell>);
 fireEvent.click(screen.getByRole("button",{name:"Add profile"}));
 fireEvent.change(screen.getByLabelText("Profile name"),{target:{value:"Board visitor"}});
 fireEvent.click(screen.getByRole("button",{name:"Save profile"}));
 expect(await screen.findByRole("button",{name:"Open Board visitor"})).toBeInTheDocument();
 expect(JSON.parse(localStorage.getItem("familybizness:demo-profiles")!)).toHaveLength(9);
});
