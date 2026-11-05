export type Rgb = [number, number, number]

export type DitherColor =
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "orange"
  | "red"
  | "grey"
  | "olive"
  | "ochre"

export type Seed = { fill: Rgb; line: Rgb; star: Rgb }

// Host adaptation: named Dither colours resolve through the active Wealthfolio
// chart roles. No donor palette competes with packages/tokens/tokens.css.
const roles: Record<DitherColor, string> = { green: "--chart-1", olive: "--chart-2", ochre: "--chart-3", blue: "--chart-5", purple: "--chart-6", pink: "--chart-7", orange: "--chart-4", red: "--destructive", grey: "--chart-8" }
const cache = new Map<string, Rgb>()
function hostRgb(role: string): Rgb {
  if (typeof document === "undefined") return [0, 0, 0]
  const color = getComputedStyle(document.documentElement).getPropertyValue(role).trim()
  const hit = cache.get(color); if (hit) return hit
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1
  const context = canvas.getContext("2d")
  if (!context) return [0, 0, 0]
  context.fillStyle = color; context.fillRect(0, 0, 1, 1)
  const pixel = context.getImageData(0, 0, 1, 1).data
  const value: Rgb = [pixel[0], pixel[1], pixel[2]]; cache.set(color, value); return value
}
export const PALETTE = Object.fromEntries(Object.keys(roles).map(name => [name, Object.defineProperties({}, {
  fill: { get: () => hostRgb(roles[name as DitherColor]) },
  line: { get: () => hostRgb(roles[name as DitherColor]) },
  star: { get: () => hostRgb("--foreground") },
})])) as Record<DitherColor, Seed>

export const rgb = ([r, g, b]: Rgb, k = 1, a = 1) =>
  `rgba(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)},${a})`

export const seedOfColor = (color: DitherColor): Seed => PALETTE[color]

export const isDitherColor = (value: unknown): value is DitherColor =>
  typeof value === "string" && value in PALETTE
