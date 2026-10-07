#!/usr/bin/env node
// SHA-256 baseline of apps/stresst/{src,public}: the "birebir" (content-identical) proof for the subtree.
// Text files are hashed with LF endings (see normalized) so autocrlf checkouts match Linux CI.
//   --write   regenerate tools/assets/stresst.baseline.json
//   --verify  compare the working tree with the baseline (exit 1 on any difference)
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const repo = join(here, "..", "..");
const appRoot = join(repo, "apps", "stresst");
const baselinePath = join(here, "stresst.baseline.json");
const ROOTS = ["src", "public"];

function walk(dir, out) {
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

/** Text files are hashed with LF line endings so Windows (autocrlf) and Linux checkouts agree. */
function normalized(buf) {
  const probe = buf.subarray(0, 8000);
  if (probe.includes(0)) return buf; // binary: hash as-is
  return Buffer.from(buf.toString("utf8").replaceAll("\r\n", "\n"), "utf8");
}

function hashTree() {
  const files = {};
  for (const root of ROOTS) {
    for (const file of walk(join(appRoot, root), [])) {
      files[relative(appRoot, file).split(sep).join("/")] = createHash("sha256").update(normalized(readFileSync(file))).digest("hex");
    }
  }
  return files;
}

const files = hashTree();
const count = Object.keys(files).length;

if (process.argv.includes("--write")) {
  writeFileSync(baselinePath, `${JSON.stringify({ app: "apps/stresst", roots: ROOTS, count, files }, null, 2)}\n`);
  console.log(`stresst baseline written: ${count} files -> ${relative(repo, baselinePath)}`);
} else if (process.argv.includes("--verify")) {
  if (!existsSync(baselinePath)) {
    console.error("stresst baseline missing; run `npm run stresst:baseline`");
    process.exit(1);
  }
  const base = JSON.parse(readFileSync(baselinePath, "utf8"));
  const added = Object.keys(files).filter((f) => !(f in base.files));
  const removed = Object.keys(base.files).filter((f) => !(f in files));
  const changed = Object.keys(files).filter((f) => f in base.files && base.files[f] !== files[f]);
  for (const f of added) console.error(`  added    ${f}`);
  for (const f of removed) console.error(`  removed  ${f}`);
  for (const f of changed) console.error(`  changed  ${f}`);
  const diffs = added.length + removed.length + changed.length;
  if (diffs > 0) {
    console.error(`stresst verify: ${diffs} difference(s) against the baseline (${base.count} files)`);
    process.exit(1);
  }
  console.log(`stresst verify: identical (${count} files, SHA-256)`);
} else {
  console.log(JSON.stringify(files, null, 2));
}
