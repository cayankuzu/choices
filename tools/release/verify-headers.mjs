#!/usr/bin/env node
// Checks a deployed origin for the headers in apps/dilemma/public/_headers (TEKNIK §9.2):
//   COOP same-origin-allow-popups (never same-origin), no COEP require-corp, wasm MIME, immutable assets.
// Usage: node tools/release/verify-headers.mjs https://<preview-host>/
// Note: `vite preview` does not apply `_headers`; this is for Cloudflare Pages previews.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const origin = process.argv[2];
if (!origin) {
  console.error("usage: verify-headers.mjs <url>");
  process.exit(2);
}
const base = new URL(origin);
const repo = fileURLToPath(new URL("../..", import.meta.url));
const assetsDir = join(repo, "apps", "dilemma", "dist", "prod", "assets");
const localAssets = existsSync(assetsDir) ? readdirSync(assetsDir) : [];
const wasm = localAssets.find((f) => f.endsWith(".wasm"));
const js = localAssets.find((f) => f.endsWith(".js"));

const failures = [];
const check = (label, ok, detail) => {
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures.push(label);
};

async function head(path) {
  const res = await fetch(new URL(path, base), { method: "HEAD", redirect: "follow" });
  return res.headers;
}

const page = await head("/");
const coop = page.get("cross-origin-opener-policy") ?? "";
check("COOP same-origin-allow-popups", coop === "same-origin-allow-popups", coop || "missing");
check("no COEP require-corp", (page.get("cross-origin-embedder-policy") ?? "") !== "require-corp");
check("index no-cache", /no-cache/.test(page.get("cache-control") ?? ""), page.get("cache-control") ?? "missing");

if (wasm) {
  const h = await head(`/assets/${wasm}`);
  check("wasm MIME application/wasm", (h.get("content-type") ?? "").startsWith("application/wasm"), h.get("content-type") ?? "missing");
} else console.log("skip wasm MIME (no .wasm in dist/prod/assets yet)");

if (js) {
  const h = await head(`/assets/${js}`);
  check("assets immutable", /immutable/.test(h.get("cache-control") ?? ""), h.get("cache-control") ?? "missing");
} else console.log("skip assets cache (no build)");

if (failures.length > 0) {
  console.error(`\nverify-headers: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log("\nverify-headers: ok");
