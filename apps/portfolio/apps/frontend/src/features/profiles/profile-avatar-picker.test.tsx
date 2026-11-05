import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PROFILE_AVATARS } from "./avatar-catalog";
import { ProfileAvatarPicker } from "./profile-avatar-picker";
vi.mock("@/components/dither-kit/avatar", () => ({ DitherAvatar: ({ name }: { name: string }) => <span data-seed={name} /> }));

describe("ProfileAvatarPicker", () => {
  it("selects a preserved avatar key from one consolidated placeholder picker", () => {
    const onChange = vi.fn(), selected = "line-curls-animated";
    render(<ProfileAvatarPicker value={selected} onChange={onChange} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(PROFILE_AVATARS.length);
    expect(buttons[PROFILE_AVATARS.indexOf(selected)].getAttribute("aria-pressed")).toBe("true");
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(buttons[PROFILE_AVATARS.indexOf("clay-artist-animated")]);
    expect(onChange).toHaveBeenCalledWith("clay-artist-animated");
  });
});
