import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

// e2e runs against the qa build (TEKNIK §9.4). WebGL specs call test.skip on webkit; DOM specs carry "@dom".
const PORT = 4181;
const BASE_URL = `http://localhost:${PORT}`;
const APP_DIR = fileURLToPath(new URL("..", import.meta.url));

// launchOptions.env replaces the inherited environment, so copy the defined entries over.
const inheritedEnv = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
);

export default defineConfig({
  testDir: ".",
  testMatch: /.*\.spec\.ts$/,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "../playwright-report" }]],
  outputDir: "../test-results/e2e",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { args: ["--use-angle=swiftshader", "--ignore-gpu-blocklist"] },
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: {
          firefoxUserPrefs: { "webgl.force-enabled": true, "webgl.disabled": false },
          env: { ...inheritedEnv, MOZ_WEBRENDER: "0" },
        },
      },
    },
    // WebKit only in CI or on request: on Windows, Smart App Control blocks Playwright's unsigned
    // JavaScriptCore.dll on every launch and floods the user with security notifications.
    ...(process.env.CI || process.env.PW_WEBKIT === "1" ? [{ name: "webkit", use: { ...devices["Desktop Safari"] } }] : []),
  ],
  webServer: {
    command: "npm run preview:qa",
    cwd: APP_DIR,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
