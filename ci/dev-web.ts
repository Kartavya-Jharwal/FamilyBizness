/**
 * Dev server for apps/web — serves src + tokens with live files.
 */
import { join } from "node:path";
import { existsSync } from "node:fs";

const root = join(import.meta.dir, "..");
const srcDir = join(root, "apps", "web", "src");
const publicDir = join(root, "apps", "web", "public");
const tokensFile = join(root, "packages", "tokens", "tokens.css");
const port = Number(process.env.PORT ?? 3000);

const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
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
    if (path === "/") path = "/index.html";

    if (path === "/tokens/tokens.css") {
      return new Response(Bun.file(tokensFile), {
        headers: { "Content-Type": "text/css; charset=utf-8" },
      });
    }

    const fromSrc = join(srcDir, path.slice(1));
    const fromPub = join(publicDir, path.slice(1));
    const filePath = existsSync(fromSrc)
      ? fromSrc
      : existsSync(fromPub)
        ? fromPub
        : null;

    if (!filePath) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(Bun.file(filePath), {
      headers: {
        "Content-Type": mime[extOf(filePath)] ?? "application/octet-stream",
      },
    });
  },
});

console.log(`FamilyBizness web → http://localhost:${port}`);
