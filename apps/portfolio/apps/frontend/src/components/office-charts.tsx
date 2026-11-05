/** Recharts-shaped composition bridge into the installed, locally owned Dither Kit.
 * Keeps existing donor data/formatters and financial model owners unchanged. */
import { Children, Fragment, isValidElement, useEffect, useState, type ReactNode, type CSSProperties } from "react";
import * as D from "./dither-kit";
import type { ChartConfig } from "./dither-kit/chart-context";
import type { DitherColor } from "./dither-kit/palette";

type Loose = { children?: ReactNode; [key: string]: unknown };
type Series = Loose & { dataKey: string; name?: string; fill?: string; stroke?: string; stackId?: string };
type Axis = Loose & { dataKey?: string; tickFormatter?: (value: unknown) => string };
type Tip = Loose & { labelFormatter?: (value: unknown) => ReactNode; formatter?: (value: number | number[], name: string) => ReactNode };
export function Area(_props: Series) { return null; }
export function Line(_props: Series) { return null; }
export function Bar(_props: Series) { return null; }
export function Cell(_props: Loose) { return null; }
export function Pie(_props: Loose & { data?: object[]; dataKey: string; nameKey?: string }) { return null; }
export function XAxis(_props: Axis) { return null; }
export function YAxis(_props: Axis) { return null; }
export function CartesianGrid(_props: Loose) { return null; }
export function Tooltip(_props: Tip) { return null; }
export function Legend(_props: Loose & { formatter?: (value: string) => ReactNode }) { return null; }
export function ResponsiveContainer({ children, width = "100%", height = "100%" }: Loose & { width?: string | number; height?: string | number }) {
  return <div className="min-w-0" style={{ width, height }}>{children}</div>;
}
const colors: DitherColor[] = ["green", "olive", "ochre", "orange", "blue", "purple", "pink", "grey"];
const roleColors: Record<number, DitherColor> = { 1: "green", 2: "olive", 3: "ochre", 4: "orange", 5: "blue", 6: "purple", 7: "pink", 8: "grey" };
function colorOf(value: unknown, i: number) { const role = typeof value === "string" ? value.match(/--chart-(\d+)/) : null; return role ? roleColors[Number(role[1])] ?? colors[i % colors.length] : colors[i % colors.length]; }
function parts(children: ReactNode): React.ReactElement<Loose>[] {
  return Children.toArray(children).flatMap(child => isValidElement<Loose>(child) ? child.type === Fragment ? parts(child.props.children) : [child] : []);
}
function useThemeRevision() {
  const [revision, setRevision] = useState(0);
  useEffect(() => { const observer = new MutationObserver(() => setRevision(n => n + 1)); observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] }); return () => observer.disconnect(); }, []);
  return revision;
}
const dimension = (name: string) => typeof document === "undefined" ? 0 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
const pixels = (name: string) => dimension(name) * parseFloat(getComputedStyle(document.documentElement).fontSize);
function readable(value: ReactNode): string { return Array.isArray(value) ? value.map(readable).join(" ") : typeof value === "string" || typeof value === "number" ? String(value) : ""; }
function DataTable({ data, config, labelKey }: { data: Record<string, unknown>[]; config: ChartConfig; labelKey?: string }) {
  return <table className="sr-only"><caption>Chart data</caption><thead><tr><th>Observation</th>{Object.entries(config).map(([key, entry]) => <th key={key}>{entry.label}</th>)}</tr></thead><tbody>{data.map((row, i) => <tr key={i}><th>{String(labelKey ? row[labelKey] : i + 1)}</th>{Object.keys(config).map(key => <td key={key}>{Array.isArray(row[key]) ? (row[key] as number[]).join(" to ") : String(row[key] ?? "")}</td>)}</tr>)}</tbody></table>;
}
function Cartesian({ data = [], children, kind }: Loose & { data?: object[]; kind: "area" | "line" | "bar" }) {
  const nodes = parts(children), series = nodes.filter(n => [Area, Line, Bar].includes(n.type as typeof Area));
  const x = nodes.find(n => n.type === XAxis)?.props as Axis | undefined, y = nodes.find(n => n.type === YAxis)?.props as Axis | undefined;
  const category = x?.dataKey ? x : y, valueAxis = x?.dataKey ? y : x;
  const config: ChartConfig = Object.fromEntries(series.map((s, i) => [String(s.props.dataKey), { label: String(s.props.name ?? s.props.dataKey), color: colorOf(s.props.stroke ?? s.props.fill, i) }]));
  const root = kind === "bar" ? D.BarChart : kind === "line" ? D.LineChart : D.AreaChart;
  const Root = root, legend = nodes.some(n => n.type === Legend), tip = nodes.find(n => n.type === Tooltip)?.props as Tip | undefined;
  const revision = useThemeRevision(), rows = data as Record<string, unknown>[];
  const left = Math.max(pixels("--space-7"), Number(valueAxis?.width) || 0), edge = dimension("--design-chart-edge-space");
  return <div className="office-dither-chart flex h-full min-w-0 flex-col" data-dither-chart={kind} role="figure" aria-label={Object.values(config).map(s => s.label).join(", ")}>
    <div className="min-h-0 flex-1"><Root key={revision} data={data} config={config} animate={false} bloom="off" margins={{ left, right: edge, top: edge, bottom: pixels("--space-7") }} stackType={series.some(s => s.props.stackId) ? "stacked" : "default"}>
      {nodes.some(n => n.type === CartesianGrid) && <D.Grid />}
      {category && <D.XAxis dataKey={category.dataKey} tickFormatter={category.tickFormatter} maxTicks={Math.min(rows.length || 1, 5)} />}
      {valueAxis && <D.YAxis tickFormatter={valueAxis.tickFormatter} />}
      {tip && <D.Tooltip labelKey={category?.dataKey} valueFormatter={(v, key) => tip.formatter ? readable(tip.formatter(v, config[key]?.label ?? key)) : Array.isArray(v) ? v.map(n => n.toLocaleString("en-GB")).join(" – ") : v.toLocaleString("en-GB")} />}
      {series.map(s => { const Part = s.type === Line ? D.Line : s.type === Bar ? D.Bar : D.Area; return <Part key={String(s.props.dataKey)} dataKey={String(s.props.dataKey)} variant={s.type === Bar ? "hatched" : "gradient"} />; })}
    </Root></div>
    {legend && <D.BlockLegend config={config} className="mt-2 shrink-0" />}
    <DataTable data={rows} config={config} labelKey={category?.dataKey} />
  </div>;
}
export function AreaChart(props: Loose & { data?: object[] }) { return <Cartesian {...props} kind="area" />; }
export function LineChart(props: Loose & { data?: object[] }) { return <Cartesian {...props} kind="line" />; }
export function BarChart(props: Loose & { data?: object[] }) { return <Cartesian {...props} kind="bar" />; }
export function PieChart({ children }: Loose) {
  const nodes = parts(children), pie = nodes.find(n => n.type === Pie)?.props;
  const data = (pie?.data ?? []) as Record<string, unknown>[], nameKey = String(pie?.nameKey ?? "name"), dataKey = String(pie?.dataKey ?? "value");
  const cells = parts(pie?.children), config: ChartConfig = Object.fromEntries(data.map((row, i) => [String(row[nameKey]), { label: String(row[nameKey]), color: colorOf(cells[i]?.props.fill, i) }]));
  const revision = useThemeRevision(), tip = nodes.find(n => n.type === Tooltip)?.props as Tip | undefined;
  return <div className="office-dither-chart h-full min-w-0" data-dither-chart="pie" role="figure" aria-label="Capital allocation"><D.PieChart key={revision} data={data} config={config} dataKey={dataKey} nameKey={nameKey} innerRadius={pie?.innerRadius ? .62 : 0} animate={false} bloom="off"><D.Pie variant="hatched" />{tip && <D.Tooltip valueFormatter={(v, key) => tip.formatter ? readable(tip.formatter(v, key)) : String(v)} />}</D.PieChart><table className="sr-only"><caption>Allocation data</caption><tbody>{data.map((row, i) => <tr key={i}><th>{String(row[nameKey])}</th><td>{String(row[dataKey])}</td></tr>)}</tbody></table></div>;
}
export type OfficeChartStyle = CSSProperties;
