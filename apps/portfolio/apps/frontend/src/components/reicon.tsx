import type { IconFunction, IconWeight } from "reicon/createIcon";

type ReiconProps = {
  icon: IconFunction;
  className?: string;
  weight?: IconWeight;
};

/** Only bundled Reicon factories supply markup; never accepts user-provided SVG. */
export function ReiconGlyph({ icon, className = "size-5", weight = "Outline" }: ReiconProps) {
  return (
    <span
      aria-hidden="true"
      data-reicon={icon.displayName}
      className={`inline-flex shrink-0 ${className}`}
      dangerouslySetInnerHTML={{
        __html: icon.toSvg({
          size: "100%",
          weight,
          color: "currentColor",
          attrs: { "aria-hidden": "true", focusable: "false" },
        }),
      }}
    />
  );
}
