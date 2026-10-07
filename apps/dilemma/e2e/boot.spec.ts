import { readFileSync } from "node:fs";
import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";
import type { DevHandle } from "../src/dev/handle";

declare global {
  interface Window {
    __dilemma?: DevHandle;
  }
}

// Allowed console noise: [{ pattern, reason }] — every entry must say why (TEKNIK §9.4).
type AllowEntry = { pattern: string; reason: string };
const allowList = (JSON.parse(readFileSync(new URL("./console-allow.json", import.meta.url), "utf8")) as AllowEntry[]).map(
  (entry) => new RegExp(entry.pattern),
);

/** Collects console errors/warnings and page errors that are not on the allow-list. */
function watchConsole(page: Page): string[] {
  const noise: string[] = [];
  page.on("console", (message: ConsoleMessage) => {
    const type = message.type();
    if ((type === "error" || type === "warning") && !allowList.some((re) => re.test(message.text()))) {
      noise.push(`${type}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => noise.push(`pageerror: ${error.message}`));
  return noise;
}

const state = (page: Page) => page.evaluate(() => window.__dilemma!.state());

test("boot: title, lang, app root, boot mark, clean console @dom", async ({ page }) => {
  const noise = watchConsole(page);
  await page.goto("/");
  await expect(page).toHaveTitle("DİLEMMA");
  await expect(page.locator("html")).toHaveAttribute("lang", /^(tr|en)$/);
  await expect(page.locator("#app")).toBeAttached();

  const bootMarks = await page.evaluate(() => performance.getEntriesByName("boot", "mark").length);
  expect(bootMarks).toBe(1);
  await page.waitForTimeout(1500);
  expect(noise).toEqual([]);
});

test("engine: canvas after 5 s, __dilemma.state(), budgets, clock, door trigger, context loss", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "needs WebGL");
  const noise = watchConsole(page);
  await page.goto("/");
  await page.waitForFunction(() => typeof window.__dilemma !== "undefined", null, { timeout: 30_000 });
  await page.waitForTimeout(5000);
  await expect(page.locator("canvas#view")).toBeVisible();

  const first = await state(page);
  expect(first.version).toMatch(/\+qa$/);
  expect(first.qa).toBe(true);
  expect(first.engine).toBe("idle");
  expect(["low", "medium", "high"]).toContain(first.quality.tier);
  expect(first.quality.skyLayers).toBeGreaterThanOrEqual(1);
  // No click yet: pointer lock is lost, the world has not advanced (R-05 / K7 idle case).
  expect(first.clock.paused).toContain("pointerLockLost");
  expect(first.clock.isPaused).toBe(true);
  expect(first.clock.elapsedMs).toBe(0);
  // Render budgets at the spawn checkpoint (D1 ceilings, TEKNIK §2.1).
  expect(first.frame.calls).toBeGreaterThan(0);
  expect(first.frame.calls).toBeLessThanOrEqual(120);
  expect(first.frame.triangles).toBeLessThanOrEqual(150_000);
  expect(first.frame.width).toBeGreaterThan(0);
  expect(first.frame.height).toBeGreaterThan(0);
  expect(first.player.grounded).toBe(false); // no physics step yet
  expect(first.door).toBe(false);
  const marks = await page.evaluate(() => ["boot", "boot:renderer", "boot:physics", "boot:world", "boot:ready", "game:control"].map((n) => performance.getEntriesByName(n, "mark").length));
  expect(marks).toEqual([1, 1, 1, 1, 1, 1]);

  // Automation: no pointer lock available, so switch the automatic pausing off and let time run.
  await page.evaluate(() => window.__dilemma!.autoPause(false));
  await page.waitForTimeout(700);
  const running = await state(page);
  expect(running.clock.isPaused).toBe(false);
  expect(running.clock.elapsedMs).toBeGreaterThan(300);
  expect(running.player.grounded).toBe(true);
  expect(running.player.y).toBeCloseTo(0, 1);

  // goto + door trigger (sensor volume in front of the building).
  await page.evaluate(() => window.__dilemma!.goto(0, -6.9));
  await expect.poll(async () => (await state(page)).door, { timeout: 5000 }).toBe(true);
  await page.evaluate(() => window.__dilemma!.goto(0, 4));
  await expect.poll(async () => (await state(page)).door, { timeout: 5000 }).toBe(false);
  const moved = await state(page);
  expect(moved.player.x).toBeCloseTo(0, 1);
  expect(moved.player.z).toBeCloseTo(4, 1);

  // Context loss: rendering stops and resumes; programs stay compiled afterwards.
  await page.evaluate(() => window.__dilemma!.loseContext());
  await expect.poll(async () => (await state(page)).contextLost, { timeout: 5000 }).toBe(true);
  await page.evaluate(() => window.__dilemma!.restoreContext());
  await expect.poll(async () => (await state(page)).contextLost, { timeout: 10_000 }).toBe(false);
  await page.waitForTimeout(500);
  const after = await state(page);
  expect(after.frame.calls).toBeGreaterThan(0);

  expect(noise).toEqual([]);
});
