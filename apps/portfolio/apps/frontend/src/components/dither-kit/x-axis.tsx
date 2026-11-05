import { useChartPart } from "./chart-context"

export function XAxis({
  dataKey,
  tickFormatter,
  tickMargin = 8,
  maxTicks = 8,
}: {
  dataKey?: string
  tickFormatter?: (value: unknown, index: number) => string
  tickMargin?: number
  maxTicks?: number
}) {
  const ctx = useChartPart("XAxis")
  if (!ctx.ready) return null

  const gap = Number(getComputedStyle(document.documentElement).getPropertyValue("--design-chart-tick-gap"))
  const visibleTicks = Math.max(1, Math.min(maxTicks, Math.floor(ctx.plot.width / gap)))
  const step = Math.max(1, Math.ceil(ctx.dataLength / visibleTicks))
  const y = ctx.plot.height + tickMargin

  return (
    <g className="fill-current text-(length:--design-chart-label-size) text-muted-foreground">
      {ctx.data.map((row, i) => {
        if (i % step !== 0) return null
        const raw = dataKey ? row[dataKey] : i
        const fullLabel = tickFormatter ? tickFormatter(raw, i) : String(raw ?? "")
        const label = fullLabel.length > 14 ? `${fullLabel.slice(0, 13)}…` : fullLabel
        return (
          <text
            // biome-ignore lint/suspicious/noArrayIndexKey: index is the stable x position
            key={i}
            x={ctx.xCenter(i) ?? 0}
            y={y}
            textAnchor={i === 0 ? "start" : i === ctx.dataLength - 1 ? "end" : "middle"}
            dominantBaseline="hanging"
            fill="currentColor"
          >
            <title>{fullLabel}</title>{label}
          </text>
        )
      })}
    </g>
  )
}
