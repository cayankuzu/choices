import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Root test run = apps/dilemma + tools. apps/stresst runs separately (`npm run test:stresst`,
// bench via `npm run bench:stresst`) so the subtree stays untouched and its bench stays out of check.
export default defineConfig({
  test: {
    projects: [
      "apps/dilemma",
      {
        test: {
          name: "tools",
          root: fileURLToPath(new URL("./tools", import.meta.url)),
          include: ["**/*.test.mjs"],
          environment: "node",
        },
      },
    ],
  },
});
