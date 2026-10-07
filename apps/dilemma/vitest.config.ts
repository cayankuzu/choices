import { defineConfig } from "vitest/config";

// Unit tests for apps/dilemma (pure modules; no three/Rapier objects in tests).
export default defineConfig({
  test: {
    name: "dilemma",
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
