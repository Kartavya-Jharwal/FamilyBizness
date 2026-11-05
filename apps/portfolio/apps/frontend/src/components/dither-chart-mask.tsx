/** Installed Dither Kit paint, projected into SVG so donor markers, privacy and
 * multi-axis interactions keep their original chart architecture. */
import { useEffect, useState } from "react";
import { BAYER, CELL, MAX_ROWS, paintColumn } from "./dither-kit/dither-paint";
import type { AreaVariant } from "./dither-kit/chart-context";
import { seedOfColor } from "./dither-kit/palette";

export function DitherChartMask({ id, variant = "gradient", objectSpace = false }: { id: string; variant?: AreaVariant; objectSpace?: boolean }) {
  const [image, setImage] = useState("");
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = BAYER.length; canvas.height = MAX_ROWS;
    const context = canvas.getContext("2d"); if (!context) return;
    // Only alpha is used by the mask: existing semantic gain/loss/series colours survive.
    const seed = seedOfColor("grey");
    for (let x = 0; x < canvas.width; x++) paintColumn(context, x, 0, canvas.height, seed, { variant, intensity: 0, dim: 1, stacked: false });
    setImage(canvas.toDataURL());
  }, [variant]);
  return <><pattern id={`${id}-paint`} patternUnits={objectSpace ? "objectBoundingBox" : "userSpaceOnUse"} patternContentUnits={objectSpace ? "objectBoundingBox" : "userSpaceOnUse"} width={objectSpace ? 0.04 : BAYER.length * CELL} height={objectSpace ? 1 : MAX_ROWS * CELL}><image href={image || undefined} width={objectSpace ? 0.04 : BAYER.length * CELL} height={objectSpace ? 1 : MAX_ROWS * CELL} preserveAspectRatio="none" style={{ imageRendering: "pixelated" }}/></pattern><mask id={id} x="0" y="0" width={objectSpace ? 1 : "100%"} height={objectSpace ? 1 : "100%"} maskUnits={objectSpace ? "objectBoundingBox" : "userSpaceOnUse"} maskContentUnits={objectSpace ? "objectBoundingBox" : "userSpaceOnUse"} style={{ maskType: "alpha" }}><rect width={objectSpace ? 1 : "100%"} height={objectSpace ? 1 : "100%"} fill={`url(#${id}-paint)`}/></mask></>;
}
