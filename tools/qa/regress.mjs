#!/usr/bin/env node
// Regression list runner (skeleton). Reads plan/R-LIST.yaml, prints the items and, for automated
// ones, looks up the matching test report. Later turns add the "fail when a report is red" gate.
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const repo = fileURLToPath(new URL("../..", import.meta.url));
const listPath = join(repo, "plan", "R-LIST.yaml");

// auto.kind -> report file this runner inspects (produced by `npm run test` / `npm run e2e`).
const REPORTS = {
  vitest: join(repo, "test-results", "vitest.json"),
  playwright: join(repo, "apps", "dilemma", "test-results", "e2e.json"),
  script: null, // ref is a command; run manually for now
};

const REQUIRED = ["id", "title", "since", "manual_min", "module"];

function load() {
  const doc = parse(readFileSync(listPath, "utf8"));
  if (!doc || !Array.isArray(doc.items)) throw new Error("R-LIST.yaml: 'items' list missing");
  for (const item of doc.items) {
    for (const key of REQUIRED) if (!(key in item)) throw new Error(`${item.id ?? "?"}: missing '${key}'`);
    if (!("auto" in item)) throw new Error(`${item.id}: missing 'auto' (use null)`);
    if (!Array.isArray(item.module)) throw new Error(`${item.id}: 'module' must be a list`);
  }
  return doc;
}

function reportFor(auto) {
  if (!auto) return "manual";
  const path = REPORTS[auto.kind];
  if (path === undefined) return `unknown kind '${auto.kind}'`;
  if (path === null) return `script: ${auto.ref}`;
  return existsSync(path) ? `${relative(repo, path)} (found)` : `${relative(repo, path)} (missing)`;
}

const doc = load();
const items = doc.items;
console.log(`R-LIST ${doc.phase ?? "?"}: ${items.length} items\n`);
console.log("id     since  manual  auto                                   module");
for (const item of items) {
  const auto = item.auto ? `${item.auto.kind}:${item.auto.ref}` : "-";
  console.log(`${item.id.padEnd(6)} ${String(item.since).padEnd(6)} ${String(item.manual_min).padStart(3)} dk  ${auto.padEnd(38)} ${item.module.join(",")}`);
  if (item.auto) console.log(`       report: ${reportFor(item.auto)}`);
}
const autoCount = items.filter((item) => item.auto).length;
const manualMin = items.reduce((sum, item) => sum + Number(item.manual_min || 0), 0);
console.log(`\nauto: ${autoCount} / manual: ${items.length - autoCount} (≈ ${manualMin} dk el testi)`);
