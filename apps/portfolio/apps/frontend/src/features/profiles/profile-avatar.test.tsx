import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DEFAULT_PROFILE_AVATAR, PROFILE_AVATARS, ProfileAvatar, profileImageSource } from "./profile-avatar";
import imageManifest from "./profile-images.json";

describe("profile imagery", () => {
  it("preserves every donor backend avatar ID while replacing cropped atlases", () => {
    // Persisted ID compatibility fixture: renaming a key would orphan saved profiles.
    const ids = ["default", "sketch-storyteller-animated", "sketch-thinker-animated", "sketch-wanderer-animated", "sketch-producer-animated", "sketch-glasses-animated", "sketch-curls-animated", "sketch-beanie-animated", "sketch-scarf-animated", "line-curls-animated", "line-wave-animated", "line-bob-animated", "line-silver-animated", "line-bun-animated", "line-beard-animated", "line-wisps-animated", "line-freckles-animated", "pixel-wizard-animated", "pixel-inventor-animated", "pixel-courier-animated", "pixel-musician-animated", "pixel-explorer-animated", "pixel-fox-animated", "pixel-ghost-animated", "pixel-sprite-animated", "clay-artist-animated", "clay-traveler-animated", "clay-maker-animated", "clay-sailor-animated", "clay-pebble-animated", "clay-fluff-animated", "clay-bot-animated", "clay-sun-animated", "abstract-architect-animated", "abstract-dancer-animated", "abstract-explorer-animated", "abstract-dreamer-animated", "abstract-lantern", "abstract-comet", "abstract-duet", "abstract-mobile"];
    expect(DEFAULT_PROFILE_AVATAR).toBe("default");
    expect([...ids].sort()).toEqual([...PROFILE_AVATARS].sort());
    expect(Object.keys(imageManifest.images).sort()).toEqual([...ids].sort());
    for (const id of ids) {
      const markup = renderToStaticMarkup(<ProfileAvatar id={id} animated={false} />);
      expect(markup).toContain('data-artwork="dither-placeholder"');
      expect(markup).toContain("<canvas");
      expect(markup).not.toContain("background-image");
      expect(markup).not.toContain("<img");
    }
  });
  it("never interprets an unrecognised stored ID as a URL or path", () => {
    for (const id of ["../../missing", "https://example.test/picture.png", "data:image/svg+xml,anything"]) {
      expect(profileImageSource(id)).toBeNull();
      expect(renderToStaticMarkup(<ProfileAvatar id={id} />)).toBe(renderToStaticMarkup(<ProfileAvatar id={DEFAULT_PROFILE_AVATAR} />));
    }
  });
});
