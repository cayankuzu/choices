#!/usr/bin/env node
// Release bundle (skeleton; completed in F15). Planned steps (TEKNIK §9.1):
//   1. require apps/dilemma/dist/prod (prod build) and apps/dilemma/public/stresst (copy-stresst.mjs, F10)
//   2. copy to dist/dilemma-web/ (Cloudflare Pages upload; `_headers` at the root)
//   3. zip the same tree as dist/dilemma-itch.zip (index.html at the zip root; base "./")
//   4. run verify-headers.mjs against the preview URL
// Until F15 this only checks the inputs and prints the plan.
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("../..", import.meta.url));
const prodDist = join(repo, "apps", "dilemma", "dist", "prod");
const outWeb = join(repo, "dist", "dilemma-web");
const outZip = join(repo, "dist", "dilemma-itch.zip");

if (!existsSync(join(prodDist, "index.html"))) {
  console.error(`release: prod build missing at ${relative(repo, prodDist)} (run \`npm run build\`)`);
  process.exit(1);
}
console.log("release (skeleton, F15):");
console.log(`  source  ${relative(repo, prodDist)}`);
console.log(`  web     ${relative(repo, outWeb)}  (not written yet)`);
console.log(`  itch    ${relative(repo, outZip)}  (not written yet)`);
