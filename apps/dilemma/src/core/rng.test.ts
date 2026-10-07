import { describe, expect, it } from "vitest";
import { hashSeed, mulberry32, Rng } from "./rng";

const sequence = (next: () => number, n: number): number[] => Array.from({ length: n }, () => next());

describe("mulberry32", () => {
  it("is deterministic for a seed and stays in [0, 1)", () => {
    const a = sequence(mulberry32(12345), 16);
    const b = sequence(mulberry32(12345), 16);
    expect(a).toEqual(b);
    for (const v of a) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("matches the reference sequence (seed 1)", () => {
    expect(sequence(mulberry32(1), 3)).toEqual([0.6270739405881613, 0.002735721180215478, 0.5274470399599522]);
  });

  it("differs across seeds", () => {
    expect(sequence(mulberry32(1), 4)).not.toEqual(sequence(mulberry32(2), 4));
  });
});

describe("hashSeed", () => {
  it("is stable across runs (dice seed = root, universe, choice)", () => {
    expect(hashSeed("root", "u-1", "B1")).toBe(368709582);
    expect(hashSeed("root", "u-1", "B1")).toBe(hashSeed("root", "u-1", "B1"));
  });

  it("separates parts and is order sensitive", () => {
    expect(hashSeed("a", "b")).toBe(921066986);
    expect(hashSeed("ab")).toBe(1179135567);
    expect(hashSeed("a", "b")).not.toBe(hashSeed("b", "a"));
  });

  it("returns an unsigned 32-bit integer", () => {
    for (const parts of [["x"], ["root", 7, "B36"], [""], []] as const) {
      const h = hashSeed(...parts);
      expect(Number.isInteger(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(0xffffffff);
    }
  });

  it("drives the dice: the same seed always gives the same option", () => {
    const roll = (): 0 | 1 => (mulberry32(hashSeed("root", "u-3", "B2"))() < 0.5 ? 0 : 1);
    const first = roll();
    for (let i = 0; i < 10; i++) expect(roll()).toBe(first);
  });
});

describe("Rng", () => {
  it("int and pick stay in range and are reproducible", () => {
    const a = new Rng(hashSeed("stars", 1));
    const b = new Rng(hashSeed("stars", 1));
    const items = ["x", "y", "z"] as const;
    for (let i = 0; i < 50; i++) {
      const n = a.int(2, 5);
      expect(n).toBe(b.int(2, 5));
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(5);
      expect(a.pick(items)).toBe(b.pick(items));
    }
    expect(() => new Rng(1).pick([])).toThrow();
  });
});
