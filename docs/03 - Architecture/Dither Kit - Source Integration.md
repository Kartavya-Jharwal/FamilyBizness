# Dither Kit — Source Integration

## Installed source and host boundary

The actual [Dither Kit registry](https://tripwire.sh/dither-kit) was installed into the existing Wealthfolio React frontend using Bun:

```powershell
cd apps/portfolio/apps/frontend
bunx shadcn@latest add https://tripwire.sh/r/dither-kit.json
```

The project already uses Tailwind and shared shadcn components. Its `components.json` keeps the shared `@fb/ui` component alias and places Dither source under `src/components/dither-kit/`; no second app or UI framework is introduced. The 39 installed files contain the donor's composable chart shells, d3 scale logic, ordered-dither canvas engine, legend/tooltip/axes, avatar, button and gradient renderers. Bun dependency resolution is retained in the existing portfolio workspace lockfile.

Named donor colours resolve to host semantic chart roles. Avatars choose those same colours deterministically from their stable seed, replacing the donor's HSL primitive calculation. Canvas avatars repaint when the host theme changes. Typography and surface roles continue to resolve from [the canonical token owner](../../packages/tokens/tokens.css) and Wealthfolio. The chart bridge owns presentation adapters; saved finance, allocation and operations records retain their existing owners.

## Registry baseline and update support

The official `@dither-kit/cli` 0.1.1 `add` command failed before delegated installation with `spawn npx ENOENT` on this Windows environment. Inspection shows it detects a runner only from files in the immediate project root; the frontend's Bun lock lives in the parent portfolio workspace. The successful installation was the Bun/shadcn command above. A successful Dither CLI installation is not claimed.

`apps/portfolio/apps/frontend/dither-kit.json` is a separately captured baseline using the official lock schema and hashing algorithm: component version, component SHA-256 over sorted original registry targets/content, and per-file SHA-256. File paths are rebased to the actual `src/` alias so the CLI can detect local edits. [The source snapshot](../../upstream/dither-kit.snapshot.json) records that path mapping, registry URLs, repository revision, installer outcome and all 39 upstream hashes.

The following read-only commands were validated from the frontend directory:

```powershell
bunx @dither-kit/cli list --json --no-input
bunx @dither-kit/cli diff --json --no-input
bunx @dither-kit/cli update --dry-run --json --no-input
```

`list` recognises all nine registry items; `diff` reports local formatting and host adaptations. `update --dry-run` uses original component hashes to compare the current registry. Because the official CLI's per-file upstream comparison expects unre-based registry paths, use the source snapshot mapping when reviewing an upstream patch; a clean CLI upstream per-file result alone is insufficient. Review updates before overwriting the host palette, axis/label and avatar changes. The source audit command verifies that all source files and the original baselines remain present:

```powershell
node scripts/verify-dither-kit.mjs
```

## Profile image replacement

`ProfileAvatar` is the single renderer for the existing profile API/catalog. All 41 stored avatar IDs remain valid; old sprite crops, unused portrait renderers and eight unused image atlases are removed from the active source/static bundle; the 41 selection keys are retained. A recoverable local copy lives under ignored artifacts. Each empty slot renders the real Dither Kit avatar inside one circular mask. The consolidated picker selects the same stored keys without misleading old clay/sketch style categories.

To provide portraits, family logos or mascots:

1. Place the supplied file under `apps/portfolio/apps/frontend/public/avatars/family/`.
2. Set its existing ID in `src/features/profiles/profile-images.json` to a project-relative path, for example `"line-silver-animated": "avatars/family/patriarch.webp"`.
3. Keep `null` for slots that should retain procedural artwork. No missing image is requested for an empty slot.

The manifest accepts only explicit local paths in that directory, with image extensions. Stored profile IDs cannot become arbitrary URLs. Failed supplied images fall back to the same deterministic placeholder. Photo cover cropping and the circular mask are shared across sidebar, chooser and picker. The landing page's separately labelled `data-photo-slot` figures mark its family/founder/generation imagery positions.

## Provenance and license declaration

[Upstream repository](https://github.com/Boring-Software-Inc/dither-kit), inspected revision `1e7faee9aa252e499651e6736ed65f7a07d9a6bd`; registry version `0.1.0`. The upstream root and CLI package metadata declare MIT. The inspected repository has no separate LICENSE file, so no missing copyright or license text is invented. The distributed `public/open-source/dither-kit/NOTICE.txt` retains the source, declaration and adaptation credits.

Financial adaptations add true nonzero-floor percentile bands, mixed line/area composition and a canonically sized thin median glow. The actual kit painter also supplies shared alpha masks for retained donor graph fills, preserving existing reference markers, privacy, multi-axis and categorical colour semantics. The optional button/gradient are mounted in profile entry using host control classes and palette roles.
