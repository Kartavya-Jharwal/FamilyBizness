/**
 * Serve the built dist/ folder (run `bun run build` first).
 */
import { join } from "node:path";
import { existsSync } from "node:fs";

const distDir = join(import.meta.dir, "..", "dist");
const port = Number(process.env.PORT ?? 4173);
const basePath = (process.env.BASE_PATH ?? "").replace(/\/$/, "");

if (!existsSync(distDir)) {
  console.error("dist/ missing — run: bun run build");
  process.exit(1);
}

const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function extOf(path: string) {
  const i = path.lastIndexOf(".");
  return i >= 0 ? path.slice(i) : "";
}

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    let path = decodeURIComponent(url.pathname);
    if (basePath && (path === basePath || path.startsWith(`${basePath}/`))) {
      path = path.slice(basePath.length) || "/";
    }
    if (path.endsWith("/")) path += "index.html";
    const filePath = join(distDir, path.slice(1));
    if (!existsSync(filePath)) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(Bun.file(filePath), {
      headers: {
        "Content-Type": mime[extOf(filePath)] ?? "application/octet-stream",
      },
    });
  },
});

console.log(`Preview dist/ → http://localhost:${port}`);
