import { useState } from "react";
import { DitherAvatar } from "@/components/dither-kit/avatar";
import { cn } from "@fb/ui/lib/utils";
import { DEFAULT_PROFILE_AVATAR, PROFILE_AVATARS } from "./avatar-catalog";
import imageManifest from "./profile-images.json";
import "./profile-avatar.css";

export { DEFAULT_PROFILE_AVATAR, PROFILE_AVATARS, PROFILE_AVATAR_GROUPS } from "./avatar-catalog";

/** Only explicitly supplied, project-local artwork can replace a placeholder.
 * Stored avatar IDs remain selection keys, never arbitrary image URLs. */
export function profileImageSource(id: string): string | null {
  const path = (imageManifest.images as Record<string, string | null>)[id];
  if (!path || !/^avatars\/family\/[a-zA-Z0-9][a-zA-Z0-9_/-]*\.(png|jpe?g|webp|avif|svg)$/.test(path) || path.includes("..")) return null;
  return `${import.meta.env.BASE_URL}${path}`;
}

export function ProfileAvatar({ id, className, animated = true }: {
  id: string;
  className?: string;
  animated?: boolean;
}) {
  const key = PROFILE_AVATARS.includes(id) ? id : DEFAULT_PROFILE_AVATAR;
  const source = profileImageSource(key);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const showImage = source && source !== failedSource;
  return <span
    aria-hidden="true"
    data-profile-avatar={key}
    data-artwork={showImage ? "supplied-image" : "dither-placeholder"}
    className={cn("profile-image-mask relative mx-auto block aspect-square w-20 max-w-full overflow-hidden", className, !animated && "profile-avatar-static")}
  >
    {showImage ? <img className="size-full object-cover" src={source} alt="" onError={() => setFailedSource(source)} /> : <DitherAvatar name={key} animate={animated} bloom="off" className="profile-dither-placeholder size-full" />}
  </span>;
}
