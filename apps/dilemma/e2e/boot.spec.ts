import { readFileSync } from "node:fs";
import { expect, test, type ConsoleMessage } from "@playwright/test";

// Allowed console noise: [{ pattern, reason }] — every entry must say why (TEKNIK §9.4).
type AllowEntry = { pattern: string; reason: string };
const allowList = (JSON.parse(readFileSync(new URL("./console-allow.json", import.meta.url), "utf8")) as AllowEntry[]).map(
  (entry) => new RegExp(entry.pattern),
);

test("boot: title, lang, app root, boot mark, clean console @dom", async ({ page }) => {
  const noise: string[] = [];
  page.on("console", (message: ConsoleMessage) => {
    const type = message.type();
    if ((type === "error" || type === "warning") && !allowList.some((re) => re.test(message.text()))) {
      noise.push(`${type}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => noise.push(`pageerror: ${error.message}`));

  await page.goto("/");
  await expect(page).toHaveTitle("DİLEMMA");
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(page.locator("#app")).toBeAttached();

  const bootMarks = await page.evaluate(() => performance.getEntriesByName("boot", "mark").length);
  expect(bootMarks).toBe(1);
  expect(noise).toEqual([]);
});
