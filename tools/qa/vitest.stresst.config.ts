import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig } from "vitest/config";
import stresstVite from "../../apps/stresst/vite.config.ts";

// sTressT unit tests (76 cases, 9 files) run from here so the subtree keeps zero config changes.
// The fracture bench is excluded; `npm run bench:stresst` runs it alone.
const root = fileURLToPath(new URL("../../apps/stresst", import.meta.url));

export default mergeConfig(
  stresstVite,
  defineConfig({
    test: {
      name: "stresst",
      root,
      include: ["src/**/*.test.ts"],
      exclude: ["**/node_modules/**", "**/*.bench.test.ts"],
      environment: "node",
    },
  }),
);
