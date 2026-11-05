/**
 * Rolling reel geometry adapted from Pavel Troshkin's supplied Rolling Counter.
 * https://reactivecss.com · https://github.com/troshkinpavel/reactivecss
 * https://x.com/troshkin_pavel
 * Original interaction reference: @reactivecss/core@0.9.1 (user-supplied example).
 * React owns form interaction here; no second reactive runtime or global theme.
 */
import { Input as InputPrimitive } from "@base-ui/react/input";
import * as React from "react";
import { cn } from "../../lib/utils";
import "./rolling-number-input.css";

type NumberProps = React.ComponentPropsWithoutRef<"input"> & {
  "data-slot"?: string;
  "data-rolling-compact"?: boolean;
  "data-number-value"?: string | number;
  "data-number-decimal-separator"?: string;
};
export function nextNumberStep(value: number, direction: number, step: number, min = -Infinity, max = Infinity) {
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  const base = Number.isFinite(min) ? min : 0;
  const ratio = (value - base) / increment;
  const ticks = direction > 0 ? Math.floor(ratio + 1e-9) + direction : Math.ceil(ratio - 1e-9) + direction;
  const next = base + ticks * increment;
  const precision = Math.min(12, Math.max(0, -Math.floor(Math.log10(increment))) + 2);
  return Math.min(max, Math.max(min, Number(next.toFixed(precision))));
}
function finite(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const result = Number(value); return Number.isFinite(result) ? result : undefined;
}
function parsedValue(input: HTMLInputElement, rawValue?: string | number, separator = ".") {
  if (rawValue !== undefined && finite(rawValue) !== undefined) return Number(rawValue);
  const raw = input.value.replace(new RegExp(`[^0-9eE+\\-${separator === "." ? "\\." : separator}]`, "g"), "");
  return finite(separator === "." ? raw : raw.replace(separator, "."));
}
function inputLabel(input: HTMLInputElement) {
  const label = (input.labels?.[0] ?? input.closest("label"))?.cloneNode(true) as HTMLElement | undefined;
  label?.querySelectorAll("button, input, [aria-hidden=true]").forEach(element => element.remove());
  return label?.textContent?.trim();
}
function setInputValue(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
function Digit({ digit, direction }: { digit: number; direction: number }) {
  const [wheel, setWheel] = React.useState({ digit, position: digit });
  if (wheel.digit !== digit) {
    let delta = digit - wheel.digit;
    if (direction > 0 && delta < 0) delta += 10;
    if (direction < 0 && delta > 0) delta -= 10;
    setWheel({ digit, position: wheel.position + delta });
  }
  return <span className="rolling-reel" style={{ "--rolling-target": wheel.position } as React.CSSProperties}><span className="rolling-strip">{[0,1,2,3,4,5,6,7,8,9,0].map((value, n) => <i key={n}>{value}</i>)}</span></span>;
}
function Reels({ value, numeric }: { value: string; numeric?: number; separator: string }) {
  const previous = React.useRef(numeric);
  const direction = numeric === undefined || previous.current === undefined ? 0 : Math.sign(numeric - previous.current);
  React.useEffect(() => { previous.current = numeric; }, [numeric]);
  if (numeric === undefined || /e/i.test(value)) return <span>{value}</span>;
  let remaining = value.replace(/\D/g, "").length;
  // Each wheel stays a small integer. Whole-value CSS arithmetic loses cents
  // above float32 precision even though the native input's double is exact.
  return <span className="rolling-reels">{[...value].map((character, index) => {
    if (!/\d/.test(character)) return <span className="rolling-punctuation" key={`separator-${index}`}>{character}</span>;
    const power = --remaining;
    return <Digit digit={Number(character)} direction={direction} key={`digit-${power}`}/>;
  })}</span>;
}
export const RollingNumberInput = React.forwardRef<HTMLInputElement, NumberProps>(function RollingNumberInput({
  className, type = "number", value, defaultValue, disabled, readOnly, min, max, step, onChange, onInput, onFocus, onBlur, onKeyDown,
  "data-number-value": numericValue, "data-number-decimal-separator": decimalSeparator = ".", ...props
}, forwardedRef) {
  const rootRef = React.useRef<HTMLSpanElement | null>(null);
  const [narrow, setNarrow] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [display, setDisplay] = React.useState(String(value ?? defaultValue ?? ""));
  const [focused, setFocused] = React.useState(false), [dragging, setDragging] = React.useState(false);
  const [label, setLabel] = React.useState(props["aria-label"] ?? props.name ?? "value");
  React.useLayoutEffect(() => {
    const root = rootRef.current; if (!root || typeof ResizeObserver === "undefined") return;
    const measure = () => setNarrow(root.clientWidth > 0 && root.clientWidth < Number(getComputedStyle(document.documentElement).getPropertyValue("--design-number-stacked-width")));
    const observer = new ResizeObserver(measure); observer.observe(root); measure(); return () => observer.disconnect();
  }, []);
  const repeat = React.useRef<ReturnType<typeof setTimeout> | null>(null), held = React.useRef(false), repeated = React.useRef(false);
  const drag = React.useRef<{ y: number; value: number; pointerId: number } | null>(null);
  const controlsDisabled = !!disabled || !!readOnly;
  const actual = finite(numericValue) ?? (type === "number" ? finite(display) : finite(display.replace(decimalSeparator, ".").replace(/[^0-9.eE+-]/g, "")));
  const lower = finite(min), upper = finite(max), increment = finite(step) ?? 1;
  const write = (next: number) => {
    const input = inputRef.current; if (!input || controlsDisabled) return;
    if (document.activeElement !== input) input.focus({ preventScroll: true });
    setFocused(false);
    const text = String(next).replace(".", decimalSeparator);
    setInputValue(input, text); setDisplay(input.value);

  };
  const stepRef = React.useRef<(direction: number) => void>(() => {});
  stepRef.current = direction => { const input = inputRef.current; if (!input || controlsDisabled) return;
    const current = parsedValue(input, undefined, decimalSeparator) ?? 0;
    write(step === "any" ? Math.min(upper ?? Infinity, Math.max(lower ?? -Infinity, Number((current + direction * increment).toFixed(12)))) : nextNumberStep(current, direction, increment, lower, upper));
  };
  const stop = React.useCallback(() => { held.current = false; if (repeat.current) clearTimeout(repeat.current); repeat.current = null; }, []);
  React.useEffect(() => { window.addEventListener("pointerup", stop); window.addEventListener("pointercancel", stop); const blur = () => { stop(); drag.current = null; setDragging(false); }; window.addEventListener("blur", blur); return () => { stop(); window.removeEventListener("pointerup", stop); window.removeEventListener("pointercancel", stop); window.removeEventListener("blur", blur); }; }, [stop]);
  React.useLayoutEffect(() => { const input = inputRef.current; if (input) setDisplay(current => current === input.value ? current : input.value); });
  React.useEffect(() => { const input = inputRef.current; if (input) { const enclosing = input.closest("label"); const ownsAssociation = !!enclosing && !enclosing.htmlFor && !!input.id; if (ownsAssociation && enclosing) enclosing.htmlFor = input.id; setDisplay(input.value); const labelledBy = props["aria-labelledby"] ?? input.getAttribute("aria-labelledby"); const labelledText = labelledBy?.split(/\s+/).map(id => document.getElementById(id)?.textContent?.trim()).filter(Boolean).join(" "); const text = props["aria-label"] ?? labelledText ?? inputLabel(input) ?? props.name ?? "value"; setLabel(text); return () => { if (ownsAssociation && enclosing?.htmlFor === input.id) enclosing.removeAttribute("for"); }; } }, [value, defaultValue, props["aria-label"], props["aria-labelledby"], props.name]);
  React.useEffect(() => { if (controlsDisabled) { stop(); drag.current = null; setDragging(false); } }, [controlsDisabled, stop]);
  const beginHold = (event: React.PointerEvent<HTMLButtonElement>, direction: number) => {
    if (event.button !== 0 || controlsDisabled) return; event.preventDefault(); stop(); repeated.current = false; held.current = true;
    repeat.current = setTimeout(function tick() { if (!held.current) return; repeated.current = true; stepRef.current(direction); repeat.current = setTimeout(tick, 80); }, 400);
  };
  const cancelDrag = () => { drag.current = null; setDragging(false); };
  return <span ref={rootRef} className={cn("rolling-number-field", narrow && !props["data-rolling-compact"] && "is-narrow", focused && "is-editing", dragging && "is-dragging", controlsDisabled && "is-disabled")} data-rolling-number="true" data-rolling-compact={props["data-rolling-compact"] || undefined}>
    <button type="button" className="rolling-step rolling-minus" aria-label={`Decrease ${label}`} disabled={controlsDisabled || (actual !== undefined && lower !== undefined && actual <= lower)} onPointerDown={event => beginHold(event, -1)} onPointerLeave={stop} onPointerCancel={stop} onKeyDown={() => { repeated.current = false; }} onClick={() => { stop(); if (!repeated.current) stepRef.current(-1); repeated.current = false; }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg></button>
    <span className="rolling-number-window">
      <InputPrimitive {...props} ref={element => { const input = element instanceof HTMLInputElement ? element : null; inputRef.current = input; if (typeof forwardedRef === "function") forwardedRef(input); else if (forwardedRef) forwardedRef.current = input; }} type={type} aria-label={props["aria-label"] ?? (props["aria-labelledby"] ? undefined : label)} data-slot={props["data-slot"] ?? "input"} data-rolling-value="true" value={value} defaultValue={defaultValue} min={min} max={max} step={step} disabled={disabled} readOnly={readOnly} inputMode={props.inputMode ?? "decimal"} className={cn("rolling-native-input", className)} onKeyDown={event => { if (event.key !== "ArrowUp" && event.key !== "ArrowDown") setFocused(true); onKeyDown?.(event); if (!event.defaultPrevented && !(props["data-rolling-compact"] && type === "text") && !controlsDisabled && !event.ctrlKey && !event.metaKey && !event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) { event.preventDefault(); stepRef.current(event.key === "ArrowUp" ? 1 : -1); } }} onInput={event => { setDisplay(event.currentTarget.value); onInput?.(event); }} onChange={event => { setDisplay(event.currentTarget.value); onChange?.(event); }} onFocus={event => { setFocused(true); onFocus?.(event); }} onBlur={event => { setFocused(false); setDisplay(event.currentTarget.value); onBlur?.(event); }}/>
      <span className="rolling-number-display" aria-hidden="true" data-numeric-value={actual} onPointerDown={event => {
        if (controlsDisabled || event.button !== 0) return;
        drag.current = { y: event.clientY, value: actual ?? 0, pointerId: event.pointerId };
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }} onPointerMove={event => {
        if (!drag.current || event.pointerId !== drag.current.pointerId || controlsDisabled) return;
        const delta = drag.current.y - event.clientY; if (Math.abs(delta) < 4) return;
        event.preventDefault(); setDragging(true);
        const notch = Number(getComputedStyle(document.documentElement).getPropertyValue("--design-number-drag-notch")) || 10;
        const steps = Math.round(delta / notch); const base = drag.current.value;
        const precision = Math.min(12, Math.max(0, -Math.floor(Math.log10(increment))) + 2);
        write(Math.min(upper ?? Infinity, Math.max(lower ?? -Infinity, Number((base + steps * increment).toFixed(precision)))));
      }} onPointerUp={event => { const moved = dragging; cancelDrag(); if (!moved) inputRef.current?.focus(); if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={cancelDrag} onLostPointerCapture={cancelDrag} onDoubleClick={() => inputRef.current?.focus()} title="Type to edit, or drag up and down">
        {display ? <Reels value={display} numeric={actual} separator={decimalSeparator}/> : <span className="rolling-placeholder">{props.placeholder}</span>}
      </span>
    </span>
    <button type="button" className="rolling-step rolling-plus" aria-label={`Increase ${label}`} disabled={controlsDisabled || (actual !== undefined && upper !== undefined && actual >= upper)} onPointerDown={event => beginHold(event, 1)} onPointerLeave={stop} onPointerCancel={stop} onKeyDown={() => { repeated.current = false; }} onClick={() => { stop(); if (!repeated.current) stepRef.current(1); repeated.current = false; }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
  </span>;
});
