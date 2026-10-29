# Portfolio — Type Checking Repair Plan

Status: aggregate strict type check passes; the broad regression survey was stopped for memory pressure, 28 October 2026. Product scope remains defined by [Identity](../00%20-%20Canonical/Identity.md); the previous static checkpoint is recorded in [Combined Pass Sign-Off](Donor%20-%20Combined%20Pass%20Sign-Off.md).

## Implemented boundary

- The host `type-check` now builds UI and SDK declarations in order, then checks all frontend source/tests and the Vite/i18next Node configuration. Declaration builds use `tsc -b --force`, so missing generated files cannot be masked by stale incremental metadata.
- Private workspaces use TypeScript 5.9.3 and Vite 6.4.5 consistently; the Vite override also aligns Vitest's transitive Vite. Bun runs package build orchestration. Missing test/tooling and retained native API declarations are real development dependencies, not ambient shims. Native dependencies do not enable desktop behavior in the static app.
- The chart hover handler now uses the installed chart library's event signature; the static profile installs a `scopeId` rather than an obsolete `token`; required existing adapter types/functions are exported; fake-stream event arrays are typed; dead broker links and imports were removed.
- Unused broker command wrappers whose contract module had already been retired were removed after checking their callers. Device-sync contracts and the platform-list wrapper remain because retained source consumes them.
- Existing strictness remains enabled. No blanket source/test exclusions, fake success implementations, or new type suppression were added. The policy donor's host tests are included in the permanent donor smoke command.
- The aggregate type gate is now `bun run donor:type-check` at repository root and is required by both `donor:verify` and Pages CI. The old whole-config `unknown` assertion in Vite was removed after aligning the Vite versions.

The following exact files were preserved individually (moved, or copied before rewriting a test) from `apps/portfolio/apps/frontend/src/` to the ignored local `donor/contenders/Portfolio-retired/` snapshot. Original host `LICENSE` and `NOTICE.md` accompany the snapshot. No recursive source deletion was used; original contender folders remain intact.

| Preserved path | Retirement evidence |
|---|---|
| `adapters/adapter-command-parity.test.ts`, `adapters/agent-access.test.ts` | Assert parity with the already-removed native adapter, not the static host contract. Static population and faux-stream tests cover supported adapter behavior. |
| `adapters/web/static-store.ts` | No importers; every supported demo consumer uses `adapters/static-store.ts`. |
| `features/database-recovery/native-database-gate.tsx`, its adjacent `.test.tsx`, `components/profile-startup.test.tsx` | Native database gate was not mounted; tests relied on removed native adapters and the removed connection provider. |
| `pages/layouts/navigation/connect-nav-item.tsx` | No navigation consumer; imports a removed connection feature. |
| `pages/onboarding/onboarding-page.tsx` | No route/importer; imports a removed connection hook. Other onboarding source/assets were retained. |
| `lib/connect-config.ts`, its adjacent `.test.ts` | Only retired startup tests imported this missing-server-config boundary. |
| `pages/settings/exports/cloud-backup-card.tsx`, its adjacent `.test.tsx`, `pages/settings/exports/use-cloud-backups.ts` | Local snapshot export page does not import this server backup feature; its provider and API contracts had already been removed. |
| `pages/settings/familybizness-connect/connect-settings-page.tsx` | No route/importer; its connection feature had already been removed. |
| `features/profiles/profile-shell.test.tsx` | Original server-admission tests were preserved; a new three-test host suite checks the actual fixed local profile, scoped identity and absence of network calls. No real authentication was introduced. |
| `adapters/web/market-data.test.ts` | Original HTTP provider-reset tests were copied to the snapshot. Host tests now require explicit rejection with no network call or sample-store mutation, because no live provider backend exists. |

Source inspection is required before reintroducing any archived capability; restoring a reference file is not evidence that its backend exists. Supported host modules continue to be checked normally.

## Verification during implementation

- Aggregate `bun run --cwd apps/portfolio type-check`: **passes, zero diagnostics**, including the new governance source. Evidence: [repair log](../../apps/portfolio/artifacts/Typecheck-Repair.log). Root subsequently ran the combined IPS gate: **strict type check, 83 smoke tests, production build and provenance audit passed**, recorded in [IPS verification](../../apps/portfolio/artifacts/IPS-Verify.log).
- Focused profile and money-flow tests: **31 passed**. The broader run exposed an extra keyboard tab stop from the resolved chart library's default accessibility layer; the chart already implements accessible roving node focus, so its duplicate built-in layer is now disabled. The existing arrow-key test passes. Evidence: [targeted test log](../../apps/portfolio/artifacts/Typecheck-Targeted-Tests.log).
- Retained native contract tests: **7 passed** using the official API's `mockIPC` helpers. The static native guard remains active in browser development and production; only test mode uses the installed native API mocks. Evidence: [native contract test log](../../apps/portfolio/artifacts/Typecheck-Native-Contract-Tests.log).
- The broad retained suite has approximately 460 files. Its eight-worker attempt was **cancelled, not passed**, after at least 286 completed file summaries, to free memory for the final build and visual checks (about 1 GB free on the 16 GB machine). Evidence remains in [partial broad test log](../../apps/portfolio/artifacts/Typecheck-Full-Tests.log). Four files reported failures: one FX-form test exceeded 5 seconds under load; one ticker-avatar test deleted URL mocks before React unmounted; three settings tests expected deliberately removed provider/agent links; six provider-reset tests expected an HTTP backend. The initial slower survey is separately preserved in [initial survey log](../../apps/portfolio/artifacts/Typecheck-Initial-Survey.log).
- Focused follow-up: **28 tests across all four files passed** with one worker. The avatar test now cleans up before deleting mocks, settings assertions reflect the static host, and the two unsupported provider-reset commands explicitly reject instead of returning a fictitious successful result. Their original HTTP tests remain in the local reference snapshot. The FX test passed unchanged without increasing its timeout. Results are recorded in [final focused tests](../../apps/portfolio/artifacts/Typecheck-Final-Focused-Tests.log). These targeted checks do not turn the interrupted broad run into a full-suite pass.

Dependency installation exposed inconsistent cached nested Vite files. Old dependency directories were preserved under `.dependency-cache-before-type-repair/` (their `node_modules` contents remain ignored); a fresh frozen hoisted install and one Vite override resolve the actual locked toolchain. The lockfile includes newly resolved compatible dependency versions, so build and rendering checks are required alongside typing.

## Why the build passes while type checking fails

The production command is `vite build`; the frontend type-check command is separately `tsc --noEmit`. Vite resolves the UI and SDK directly to their source, replaces native imports with its static guard, and bundles the reachable application. TypeScript includes the entire frontend `src` tree, including inherited tests and disabled features, and also follows project references that expect generated UI/SDK declarations. A successful static build and 39 focused smoke tests therefore do not demonstrate a clean full-source type check.

The defect is an unfinished conversion boundary: runtime, package builds, test scope, and compiler scope do not yet describe the same supported application. Some diagnostics are infrastructure cascades; others are real stale imports and incompatible contracts. Calling all of them harmless inherited errors would be inaccurate.

## Evidence and diagnostic groups

The saved [compiler log](../../apps/portfolio/artifacts/Donor-Typecheck.log) records 2,436 diagnostic lines: 1,590 `TS6305` declaration-output failures, 617 implicit-parameter/binding failures (`TS7006`/`TS7031`), 106 missing-module failures, and 123 other errors. These are historical counts, not a current acceptance baseline. The saved log predates fixes already present in `adapters/index.ts` (web export), `static-demo.test.ts` (Vitest import), and `main.tsx` (`./App` casing). Do not reintroduce those defects or count them as outstanding repairs.

A fresh `bun run type-check` from `apps/portfolio` on 28 October reproduced **2,433 diagnostics** and the underlying scripts exited with code 1: 1,590 `TS6305`, 431 `TS7006`, 186 `TS7031`, 104 `TS2307`, and 122 other diagnostics. The casing error is gone and missing-module failures dropped by two, consistent with those three corrections. Counts were captured in the audit tool output; the historical log was not overwritten. The first sandboxed direct Node compiler attempt stalled and was cancelled; the existing Bun command completed outside the sandbox. That audit-only run did not change application source or compiler configuration; the repairs above followed it.

| Cause | Local evidence | Repair direction |
|---|---|---|
| Mixed source and declaration resolution | Frontend `tsconfig.json` maps `@fb/ui` and `@fb/addon-sdk` to source but references both composite packages. Their configs emit declarations into `dist/src`; package exports point there. Frontend `tsc --noEmit` does not build those dependencies. | Establish one deliberate package-resolution strategy before repairing cascade errors. Prefer explicit package declaration builds followed by frontend checking; verify every subpath export. |
| Incomplete platform reduction | Adapter parity and agent-access tests import missing `./tauri` modules; native database recovery imports missing native adapter files. Vite's native guard is not a TypeScript declaration contract. | Inventory consumers and classify supported web behavior versus reference-only desktop behavior. Port relevant tests to web contracts. Archive or remove retired runtime code only after checking imports and preserving donor references. |
| Removed features still referenced | `adapters/shared/connect.ts` imports missing `features/familybizness-connect/types`; saved log also identifies obsolete agent-access API exports and account connection references. | Trace each import from active routes and shared exports. Preserve required shared types in a neutral host contract; retire unreachable features explicitly. Do not add fake successful APIs merely to satisfy the compiler. |
| Missing test/tool dependencies | Locale tests import `i18next.config.ts`, which requires `i18next-cli`; inherited interaction tests require `@testing-library/user-event`. | Keep useful tests and declare their exact development dependencies. Retire tests only when their associated capability is deliberately retired. Keep Node tooling and browser/test environments explicit. |
| Duplicate demo implementations | `adapters/web/static-store.ts` contains obsolete valuation fields and lacks required history fields; the active sample store is `adapters/static-store.ts`. | Confirm import graph, consolidate on the active store, and retain regression tests for account scope, deletion, income and reset. Do not paper over mismatches with optional fields or casts. |
| Contract drift | Saved log identifies `AddonAsset` field disagreements, missing adapter exports, unknown values and unused error directives. | Resolve dependencies first, then fix remaining contracts at their owner and update consumers/tests together. Preserve unsupported and missing-data semantics. |
| Toolchain drift | UI/SDK package scripts still invoke `pnpm`; SDK declares a TypeScript 6 alias while host declares TypeScript 5.8. | Choose and lock a compatible compiler/toolchain for the private workspace, use Bun consistently in orchestration, and verify from a clean dependency install. Do not upgrade unrelated runtime packages as part of this repair. |

Relevant source: [frontend config](../../apps/portfolio/apps/frontend/tsconfig.json), [Vite config](../../apps/portfolio/apps/frontend/vite.config.ts), [frontend scripts](../../apps/portfolio/apps/frontend/package.json), [UI config](../../apps/portfolio/packages/ui/tsconfig.json), [SDK config](../../apps/portfolio/packages/addon-sdk/tsconfig.json), [CI workflow](../../.github/workflows/pages.yml).

## Ordered implementation

1. **Capture a reproducible baseline.** Record compiler/runtime versions and lockfile state. Run the existing frontend command, save raw output outside `docs/`, and group diagnostics by cause and file. Preserve the previous log as historical evidence until the new baseline is captured. Establish which files are shipped, supported tests/tooling, or donor reference only.
2. **Repair package boundaries first.** Build UI and SDK declarations in dependency order using their existing `build:types` entry points, fix package-level errors, then check the frontend. Align package exports, TypeScript paths and Vite aliases, including SDK subpaths. Either retain project references with an orchestrated declaration build or deliberately adopt source checking throughout; do not leave the current mixture. Recount diagnostics before treating implicit-any errors individually.
3. **Complete the web boundary.** Resolve stale native/connection imports and shared contracts. Replace active native affordances with typed unsupported states where appropriate. Preserve original donor code locally with an inventory before pruning specific unreachable host files. Broad source deletion needs its own reviewed file list; this plan does not retry the previously rejected deletion.
4. **Repair supported data and UI contracts.** Consolidate sample stores, fix remaining valuation/history/addon types, and update affected tests. Keep current financial semantics: missing returns are not zero; scripted AI remains scripted; demo mutations remain local.
5. **Make checking comprehensive.** Separate browser, test and Node-tooling compiler environments if needed, but have one aggregate command check every supported source/test/config project. Keep a documented inventory of intentionally retired donor reference code outside the host application. No blanket `exclude: ["src/features", "**/*.test.*"]`, `@ts-nocheck`, ambient-any module shims, weakened strictness or successful no-op APIs to obtain a green check.
6. **Enforce the repaired gate.** Add the aggregate host type-check to CI and `donor:verify` only once it passes, before the deploy artifact is accepted. New donors must meet this gate at their integration boundary; they must not add a second package manager, sample ledger or compiler escape hatch.

## Acceptance

From repository root, existing commands that must remain green:

```powershell
bun run --cwd apps/portfolio type-check
bun run donor:verify
```

During package repair, declaration checks/builds are available separately:

```powershell
bun run --cwd apps/portfolio/packages/ui build:types
bun run --cwd apps/portfolio/packages/addon-sdk build:types
```

The final aggregate command must orchestrate prerequisites itself and succeed on a fresh install without pre-existing `dist` declarations or ignored donor clones. Run the full retained frontend test suite as well as the focused donor suite; investigate failures rather than silently narrowing the suite. Require zero TypeScript diagnostics across all supported projects, passing existing smoke/provenance checks, and a production build. If UI behavior changes during repair, repeat desktop/mobile rendering checks for contrast and chart labels.

Completion means checked source and shipped behavior agree. A passing build alone, a smaller diagnostic count, or a check that omits still-supported features is not completion.
