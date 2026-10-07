import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig } from "vitest/config";
import stresstVite from "../../apps/stresst/vite.config.ts";

// sTressT fracture bench only (kept out of `npm run check`; see TEKNIK §6.3).
const root = fileURLToPath(new URL("../../apps/stresst", import.meta.url));

export default mergeConfig(
  stresstVite,
  defineConfig({
    test: {
      name: "stresst-bench",
      root,
      include: ["src/**/*.bench.test.ts"],
      environment: "node",
    },
  }),
);
