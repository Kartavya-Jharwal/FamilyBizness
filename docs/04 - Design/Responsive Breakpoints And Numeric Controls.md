# Responsive Breakpoints And Numeric Controls

## Existing host owners

The active responsive navigation owner is `apps/portfolio/apps/frontend/src/hooks/use-platform.ts`: mobile below **768px**, compact tables below **1024px**. The shared UI `packages/ui/src/hooks/use-mobile.tsx` uses the same 768px boundary. Those determine navigation and stacked-screen behaviour; counter styling does not invent a second page breakpoint system.

| Width / context | Layout contract |
|---|---|
| 320–639px phone | One primary content column; charts retain labelled axes; tables and calendar scroll inside their own frames. Numeric fields occupy their available column and keep an editable native input. |
| 640–767px wide phone | Existing `sm` grids may use two columns where the field labels/values fit; bottom navigation remains active. |
| 768–1023px tablet | Host wide navigation; compact financial tables; two-column inputs where appropriate. Cal member/date rail remains hidden to reserve width for timed days. |
| 1024–1279px small desktop | Cal rail appears; financial/taxonomy tables retain local overflow; avoid assuming a sidebar plus all charts can fit three columns. |
| 1280px and above | Multi-panel financial views may use three/four columns; hero history remains a full-width surface, with accounts/holdings below it rather than a second dashboard. |
| Numeric control narrower than canonical stacked-width | Full-width number window above equal-width minus/plus targets, preventing a large GBP number being clipped between controls. |
| Virtualized table or donor lever editor | Explicit compact numeric control stays one row; real field receives focus, typed selection and native form/ref behaviour. |

The parent overview's content-container breakpoint is separate from viewport navigation: accounts and holdings can split only when the actual available content frame permits it. A sidebar reduces that frame, so a desktop viewport alone is insufficient evidence for another column.

## Adapted counter contract

`RollingNumberInput` adapts the user-supplied [Reactive CSS](https://reactivecss.com) Rolling Counter by [Pavel Troshkin](https://github.com/troshkinpavel/reactivecss), retaining the citation in source and distributed `open-source/reactive-css/NOTICE.txt`. Its CSS registered-number transition, modulo/carry reels, edge fade and transient blur are adapted; the original page-wide theme/tutorial/font and a second event runtime are omitted. React continues to own existing form state.

The shared host `Input` routes number, decimal and numeric entry to this control. Nineteen prior native numeric inputs are migrated to the same component. Money/quantity adapters supply their parsed values and decimal separator; the existing NumericFormat handlers own parsing. Data-grid and donor lever editors retain compact variants. The input is a real, editable element with the original name/ref/required/min/max/step/disabled and event callbacks. It is the submitted value, not a decorative hidden duplicate.

Values are not capped at 999. Signed, large and decimal amounts render as as many digit windows as needed. Each wheel uses its own small registered number, avoiding the browser float32 CSS arithmetic loss that the supplied whole-count formula exhibits for large GBP amounts. Scientific notation uses readable input text. Focus/click allows normal typing; minus/plus, ArrowUp/ArrowDown, hold-to-repeat and vertical drag update the same field. Holds cancel on leave/up/cancel/window blur/unmount. Native constraints and the owning financial model continue to decide validity. Disabled/read-only fields stop all custom interactions. Reduced motion removes wheel interpolation; a CSS math support fallback retains readable native input text.

All control dimensions, type and surface roles resolve from [canonical tokens](../../packages/tokens/tokens.css) and the active Wealthfolio theme. Circle/avatar masks remain distinct from finite card/control corner radii.

## Verification scope

Focused component tests cover large negative decimals, forwarded native ref/FormData, step/bounds/required/disabled, keyboard arrows, hold cancellation, drag and typing fallback, de-DE money parsing and donor lever commit-on-blur. Isolated actual React SSR markup and counter CSS renders passed at390px,768px,1440px plus160px embedded fields: no viewport/value clipping and zero wheel blur at rest. Exact large-value wheel positions were checked. The responsive class in this isolated render reflects the actual ResizeObserver threshold; the parent packaged render must also inspect interaction in both pointer modes and light/dark. Financial tables scroll locally; chart labels must remain readable without overlap. The parent release record owns packaged page evidence.
