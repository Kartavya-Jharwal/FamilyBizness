/**
 * Copy static web assets into dist/ for GitHub Pages.
 * Sets BASE_PATH for project pages (repo name) when GITHUB_PAGES=1.
 */
import { cp, mkdir, readdir, readFile, writeFile, rm } from "node:fs/promises";
import { join, relative } from "node:path";

const root = join(import.meta.dir, "..");
const srcDir = join(root, "apps", "web", "src");
const publicDir = join(root, "apps", "web", "public");
const tokensSrc = join(root, "packages", "tokens", "tokens.css");
const distDir = join(root, "dist");

const basePath = (
  process.env.BASE_PATH ??
  (process.env.GITHUB_PAGES === "1" ? "/FamilyBizness" : "")
).replace(/\/$/, "");

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else files.push(p);
  }
  return files;
}

/** Prefix root-absolute href/src/action/url(...) with basePath. */
function withBase(content: string, base: string): string {
  if (!base) return content;
  return content
    .replace(/\b(href|src|action)="\/(?!\/)/g, `$1="${base}/`)
    .replace(/url\(\/(?!\/)/g, `url(${base}/`);
}

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  await mkdir(join(distDir, "tokens"), { recursive: true });
  await cp(tokensSrc, join(distDir, "tokens", "tokens.css"));

  try {
    await cp(publicDir, distDir, { recursive: true });
  } catch {
    /* public/ optional */
  }

  const files = await walk(srcDir);
  for (const file of files) {
    const rel = relative(srcDir, file).replaceAll("\\", "/");
    if (rel.endsWith("_stub.js")) continue;

    const out = join(distDir, rel);
    await mkdir(join(out, ".."), { recursive: true });

    let content = await readFile(file, "utf8");
    // strip UTF-8 BOM if PowerShell wrote one
    if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);

    if (rel.endsWith(".html") || rel.endsWith(".css")) {
      content = withBase(content, basePath);
    }
    await writeFile(out, content);
  }

  await writeFile(join(distDir, ".nojekyll"), "");
  console.log(`Built dist/ (BASE_PATH=${basePath || "/"})`);
}

main();
