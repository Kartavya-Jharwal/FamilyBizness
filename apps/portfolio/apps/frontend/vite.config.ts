import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { unlink } from "node:fs/promises";
import { defineConfig } from "vitest/config";

const host = process.env.TAURI_DEV_HOST;
const apiTarget =
  process.env.VITE_API_TARGET ||
  process.env.FB_API_TARGET ||
  "http://127.0.0.1:8088";
const enableProxy = process.env.FB_ENABLE_VITE_PROXY === "true";
const devPort = Number.parseInt(process.env.VITE_DEV_PORT || "1420", 10);
const serverProxy = enableProxy
  ? {
      "/api": {
        target: apiTarget,
        changeOrigin: false,
      },
      "/docs": {
        target: apiTarget,
        changeOrigin: true,
      },
    }
  : undefined;

// Static donor shell: always web unless explicitly overridden.
const buildTarget = process.env.BUILD_TARGET || "web";

export default defineConfig({
  envDir: "../..",
  base: process.env.VITE_BASE || "/",
  plugins: [
    {
      name: "omit-legacy-onboarding-previews",
      async writeBundle() {
        // Keep reference sources intact; these unreferenced screenshots carry old logos.
        // Only known files in the generated output are omitted from distribution.
        for (const theme of ["light", "dark", "system"]) {
          for (const suffix of [".png", ".webp", "@2x.webp"]) {
            await unlink(
              path.resolve(
                __dirname,
                `../../dist/themes/theme-${theme}${suffix}`,
              ),
            ).catch((error) => {
              if (error.code !== "ENOENT") throw error;
            });
          }
        }
      },
    },
    react(),
    tailwindcss(),
    {
      name: "static-native-guard",
      // Retained native contract tests use the real API's mockIPC helpers.
      // The guard still protects both browser development and shipped builds.
      apply: (_config, { mode }) => mode !== "test",
      resolveId(id: string) {
        if (id.startsWith("@tauri-apps/")) return `\0static-native:${id}`;
      },
      load(id: string) {
        if (id.startsWith("\0static-native:")) {
          return `const unavailable = () => { throw new Error("Native feature unavailable in this static demo"); }; export const listen = unavailable, invoke = unavailable, getCurrentWindow = unavailable, open = unavailable, readFile = unavailable, cancel = unavailable, scan = unavailable, selectionFeedback = unavailable, impactFeedback = unavailable, vibrate = unavailable;`;
        }
      },
    },
  ],
  publicDir: "public",
  optimizeDeps: {
    include: ["lucide-react", "recharts"],
  },
  define: {
    __BUILD_TARGET__: JSON.stringify(buildTarget),
  },
  resolve: {
    alias: [
      {
        find: "@fb/addon-sdk",
        replacement: path.resolve(__dirname, "../../packages/addon-sdk/src"),
      },
      {
        find: "@fb/ui",
        replacement: path.resolve(__dirname, "../../packages/ui/src"),
      },
      // Exact match so `@/adapters/web/...` subpaths resolve normally.
      {
        find: /^@\/adapters$/,
        replacement: path.resolve(__dirname, "./src/adapters/web"),
      },
      {
        find: "#platform",
        replacement: path.resolve(__dirname, "./src/adapters/web/core"),
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  clearScreen: false,
  server: {
    port: Number.isFinite(devPort) ? devPort : 1420,
    strictPort: true,
    host: host ? "0.0.0.0" : false,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    proxy: serverProxy,
  },
  envPrefix: ["VITE_"],
  build: {
    target: ["chrome107", "edge107", "firefox104", "safari16"],
    outDir: "../../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
    },
    minify: "esbuild",
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
});
