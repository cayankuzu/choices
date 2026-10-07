import { describe, expect, it } from "vitest";
import { FrameStats } from "../core/frameStats";
import { decideTier, DowngradeWatch, forcedTier, heuristicTier, QUALITY, QualityProbe, readStoredTier, writeStoredTier } from "./quality";

function memoryStorage(): Pick<Storage, "getItem" | "setItem"> & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

describe("FrameStats", () => {
  it("computes median and p95 with nearest rank over a ring", () => {
    const s = new FrameStats(8);
    for (const v of [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) s.push(v);
    // Ring of 8 keeps 30…100.
    expect(s.count).toBe(8);
    expect(s.median()).toBe(60);
    expect(s.p95()).toBe(100);
    expect(s.mean()).toBe(65);
    s.reset();
    expect(s.p95()).toBe(0);
  });
});

describe("decideTier", () => {
  it("drops one tier when p95 exceeds 1.15× the budget", () => {
    expect(decideTier("medium", 16, QUALITY.medium.budgetMs * 1.2)).toBe("low");
    expect(decideTier("high", 10, 25)).toBe("medium");
    expect(decideTier("low", 30, 60)).toBe("low");
  });

  it("rises one tier only when the median is under half the budget", () => {
    expect(decideTier("low", 12, 14)).toBe("medium");
    expect(decideTier("medium", 7, 9)).toBe("high");
    expect(decideTier("high", 4, 6)).toBe("high");
    // A vsync-locked 60 Hz medium machine stays where it is.
    expect(decideTier("medium", 16.7, 17.5)).toBe("medium");
  });
});

describe("QualityProbe", () => {
  it("discards the 2 s warm-up and decides after 3 s of samples", () => {
    const probe = new QualityProbe("medium");
    // Warm-up: terrible frames that must not count.
    for (let t = 0; t < 2000; t += 100) expect(probe.tick(100)).toBeNull();
    let result = null;
    for (let t = 0; t < 3000 && result === null; t += 16) result = probe.tick(16);
    expect(result).toBe("medium");
    expect(probe.done).toBe(true);
    expect(probe.summary?.p95Ms).toBe(16);
    expect(probe.summary?.frames).toBeGreaterThan(150);
    // Finished: later frames are ignored.
    expect(probe.tick(500)).toBeNull();
  });

  it("downgrades a slow machine and upgrades a fast one", () => {
    const slow = new QualityProbe("medium");
    let r = null;
    for (let t = 0; t < 7000 && r === null; t += 40) r = slow.tick(40);
    expect(r).toBe("low");

    const fast = new QualityProbe("low");
    r = null;
    for (let t = 0; t < 6000 && r === null; t += 8) r = fast.tick(8);
    expect(r).toBe("medium");
  });

  it("waits for a minimum frame count on very slow frames", () => {
    const probe = new QualityProbe("medium");
    for (let i = 0; i < 10; i++) probe.tick(400); // 4 s elapsed, 5 measured frames
    expect(probe.done).toBe(false);
    for (let i = 0; i < 30; i++) probe.tick(400);
    expect(probe.done).toBe(true);
    expect(probe.result).toBe("low");
  });
});

describe("DowngradeWatch", () => {
  it("steps down only at the resolution floor after 30 s over budget, never up", () => {
    const watch = new DowngradeWatch("medium", 30_000);
    let changed = null;
    // Not at the floor: nothing happens no matter how slow.
    for (let t = 0; t < 40_000; t += 50) changed = watch.tick(50, false) ?? changed;
    expect(changed).toBeNull();
    for (let t = 0; t < 29_000; t += 50) changed = watch.tick(50, true) ?? changed;
    expect(changed).toBeNull();
    for (let t = 0; t < 2000 && changed === null; t += 50) changed = watch.tick(50, true);
    expect(changed).toBe("low");
    // Low is the floor tier.
    changed = null;
    for (let t = 0; t < 60_000; t += 50) changed = watch.tick(50, true) ?? changed;
    expect(changed).toBeNull();
  });

  it("a good second resets the streak", () => {
    const watch = new DowngradeWatch("high", 3000);
    for (let t = 0; t < 2000; t += 50) watch.tick(50, true);
    for (let t = 0; t < 1000; t += 8) watch.tick(8, true);
    let changed = null;
    for (let t = 0; t < 2000; t += 50) changed = watch.tick(50, true) ?? changed;
    expect(changed).toBeNull();
  });
});

describe("tier sources", () => {
  it("?q= forces a tier; junk is ignored", () => {
    expect(forcedTier("?q=low")).toBe("low");
    expect(forcedTier("?u=u-1&q=high")).toBe("high");
    expect(forcedTier("?q=ultra")).toBeNull();
    expect(forcedTier("")).toBeNull();
  });

  it("stored tier is reused for the same GPU only", () => {
    const storage = memoryStorage();
    writeStoredTier("ANGLE (Intel UHD 620)", "low", storage);
    expect(readStoredTier("ANGLE (Intel UHD 620)", storage)).toBe("low");
    expect(readStoredTier("NVIDIA RTX 3060", storage)).toBeNull();
    expect(readStoredTier("x", null)).toBeNull();
    storage.data.set("dilemma.quality.v1", "{not json");
    expect(readStoredTier("ANGLE (Intel UHD 620)", storage)).toBeNull();
  });

  it("heuristic: software GL → low, integrated → medium, otherwise high", () => {
    expect(heuristicTier({ cores: 8, memoryGb: 16, gpu: "Google SwiftShader" })).toBe("low");
    expect(heuristicTier({ cores: 8, memoryGb: 8, gpu: "ANGLE (Intel(R) UHD Graphics 620)" })).toBe("medium");
    expect(heuristicTier({ cores: 12, memoryGb: 16, gpu: "NVIDIA GeForce RTX 3060" })).toBe("high");
    expect(heuristicTier({ cores: 2, memoryGb: 16, gpu: "NVIDIA GeForce RTX 3060" })).toBe("low");
  });
});
