import { fireEvent, render, screen, cleanup, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
vi.mock("./session",()=>({installProfileSession:vi.fn()}));
import { ProfileShell } from "./profile-shell";
afterEach(()=>{cleanup();localStorage.clear();});
it("offers populated roles on a cold visit without mounting financial children",()=>{
 render(<ProfileShell><p>Financial workspace</p></ProfileShell>);
 expect(screen.getByRole("button",{name:"Open Family Patriarch"})).toBeInTheDocument();
 expect(screen.getByRole("button",{name:"Open Associate"})).toBeInTheDocument();
 expect(screen.queryByText("Financial workspace")).not.toBeInTheDocument();
});
it("adds a persistent local profile through host setup",async()=>{
 render(<ProfileShell><p>Workspace</p></ProfileShell>);
 fireEvent.click(screen.getByText("Profile setup and recovery"));
 fireEvent.click(screen.getByRole("button",{name:"Add profile"}));
 fireEvent.change(screen.getByLabelText("Profile name"),{target:{value:"Board visitor"}});
 fireEvent.click(screen.getByRole("button",{name:"Save profile"}));
 await waitFor(()=>expect(JSON.parse(localStorage.getItem("familybizness:demo-profiles")!).some((row:{name:string})=>row.name==="Board visitor")).toBe(true));
 const setup=screen.getByText("Profile setup and recovery");
 if(!setup.closest("details")!.open)fireEvent.click(setup);
 fireEvent.click(screen.getByText("Earlier saved workspaces"));
 expect(await screen.findByRole("button",{name:"Open Board visitor"})).toBeInTheDocument();
 expect(JSON.parse(localStorage.getItem("familybizness:demo-profiles")!)).toHaveLength(7);
});
