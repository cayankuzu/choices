/// <reference types="node" />
import { readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";

/**
 * Rapier's npm package imports its 3 MB wasm "ESM-style" (`./rapier_wasm3d`), which a bundler
 * would inline as base64 (+33%, no streaming compile). We point that import at the plain
 * wasm-bindgen glue and stream the .wasm ourselves in engine/rapierWasm.ts (T2).
 */
function rapierWasm(): Plugin {
  const GLUE = "\0dilemma-rapier-glue";
  return {
    name: "dilemma-rapier-wasm",
    enforce: "pre",
    resolveId(id, importer) {
      const fromRapier = importer?.replace(/\\/g, "/").includes("/@dimforge/rapier3d/") ?? false;
      return fromRapier && /^\.\/rapier_wasm3d(\.js)?$/.test(id) ? GLUE : null;
    },
    load(id) {
      return id === GLUE ? 'export * from "@dimforge/rapier3d/rapier_wasm3d_bg.js";' : null;
    },
  };
}

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string };

export default defineConfig(({ command, mode }) => {
  // Build modes: dev server (5181) and `--mode qa` (4181) expose the dev handle; prod (4182) is bare.
  const qa = mode === "qa" || command === "serve";
  const suffix = mode === "qa" ? "+qa" : command === "serve" ? "+dev" : "";
  return {
    // Relative asset paths: the same build runs on a website subfolder and inside the itch.io zip.
    base: "./",
    define: {
      __QA__: JSON.stringify(qa),
      __APP_VERSION__: JSON.stringify(pkg.version + suffix),
    },
    plugins: [rapierWasm()],
    optimizeDeps: {
      // The plugin above handles Rapier; keep the dev pre-bundler away from it.
      exclude: ["@dimforge/rapier3d"],
    },
    build: {
      target: "es2020",
      outDir: mode === "qa" ? "dist/qa" : "dist/prod",
      sourcemap: false,
      assetsInlineLimit: (file) => (file.endsWith(".wasm") ? false : undefined),
      chunkSizeWarningLimit: 1200,
    },
    worker: { format: "es" },
    server: { port: 5181, strictPort: true },
    preview: { strictPort: true },
  };
});
