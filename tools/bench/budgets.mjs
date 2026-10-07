#!/usr/bin/env node
// Build budgets for apps/dilemma (TEKNIK §2.1, §9.1). Gates on the prod build; reports the qa build too.
// - initial JS (module scripts + modulepreloads of index.html), gzip: ladder below, by phase
// - first load (everything in dist): ≤ 10 MB
// - file count: ≤ 250 from F4, ≤ 400 at F15 (report-only before F4)
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

/** JS budget ladder: gzip KB of the initial chunk, per phase. Later phases inherit the last rung. */
export const JS_LADDER_KB = { F0: 230, F4: 300, F9: 340, F12: 350 };
export const FIRST_LOAD_MB = 10;
export const FILE_COUNT_LADDER = { F4: 250, F15: 400 };
export const PHASE = process.env.DILEMMA_PHASE ?? "F0";

const phaseNumber = (p) => Number(p.replace(/^F/, ""));
/** Picks the rung that applies to `phase` (the highest key ≤ phase). */
export function rung(ladder, phase) {
  const keys = Object.keys(ladder).sort((a, b) => phaseNumber(a) - phaseNumber(b));
  let current;
  for (const key of keys) if (phaseNumber(key) <= phaseNumber(phase)) current = key;
  return current ? ladder[current] : undefined;
}

const gzipKb = (buf) => gzipSync(buf, { level: 9 }).length / 1024;
const kb = (n) => `${n.toFixed(1)} KB`;

function walk(dir, out) {
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

/** Entry files referenced by index.html: module scripts, modulepreloads and stylesheets. */
function entryRefs(html) {
  const refs = [];
  for (const m of html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g)) refs.push(m[1]);
  for (const m of html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g)) refs.push(m[1]);
  for (const m of html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)) refs.push(m[1]);
  return refs.map((r) => r.replace(/^\.\//, "").replace(/^\//, ""));
}

export function measure(distDir) {
  const html = readFileSync(join(distDir, "index.html"), "utf8");
  const files = walk(distDir, []);
  const rel = (f) => relative(distDir, f).split(sep).join("/");
  const refs = new Set(entryRefs(html));
  let initialJs = 0;
  let initialCss = 0;
  let totalJs = 0;
  let totalBytes = 0;
  for (const file of files) {
    const buf = readFileSync(file);
    totalBytes += buf.length;
    const name = rel(file);
    if (name.endsWith(".js")) {
      const g = gzipKb(buf);
      totalJs += g;
      if (refs.has(name)) initialJs += g;
    } else if (name.endsWith(".css") && refs.has(name)) initialCss += gzipKb(buf);
  }
  return { initialJs, initialCss, totalJs, totalMb: totalBytes / (1024 * 1024), fileCount: files.length };
}

function report(label, distDir, gate) {
  if (!existsSync(join(distDir, "index.html"))) {
    if (gate) throw new Error(`${label}: ${distDir} missing (run the build first)`);
    console.log(`${label}: (no build)`);
    return true;
  }
  const m = measure(distDir);
  const jsBudget = rung(JS_LADDER_KB, PHASE);
  const fileBudget = rung(FILE_COUNT_LADDER, PHASE);
  const jsOk = m.initialJs <= jsBudget;
  const loadOk = m.totalMb <= FIRST_LOAD_MB;
  const filesOk = fileBudget === undefined || m.fileCount <= fileBudget;
  console.log(`${label} (${PHASE})`);
  console.log(`  initial JS  ${kb(m.initialJs)} gzip / budget ${jsBudget} KB  ${jsOk ? "ok" : "OVER"}`);
  console.log(`  total JS    ${kb(m.totalJs)} gzip   (CSS entry ${kb(m.initialCss)} gzip)`);
  console.log(`  dist total  ${m.totalMb.toFixed(2)} MB / ${FIRST_LOAD_MB} MB  ${loadOk ? "ok" : "OVER"}`);
  console.log(`  files       ${m.fileCount}${fileBudget === undefined ? " (gate from F4: 250)" : ` / ${fileBudget}  ${filesOk ? "ok" : "OVER"}`}`);
  return jsOk && loadOk && filesOk;
}

const repo = fileURLToPath(new URL("../..", import.meta.url));
const dist = join(repo, "apps", "dilemma", "dist");
const prodOk = report("prod", join(dist, "prod"), true);
report("qa", join(dist, "qa"), false);
if (!prodOk) {
  console.error("\nbudgets: prod build is over budget");
  process.exit(1);
}
console.log("\nbudgets: ok");
