/** mulberry32: tiny deterministic PRNG. Same seed, same sequence, on every engine and reload. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Stable 32-bit seed from ids and numbers (FNV-1a per part, separator mix between parts, so
 * hashSeed("a", "b") differs from hashSeed("ab")). Dice: hashSeed(rootSeed, universeId, choiceId).
 */
export function hashSeed(...parts: ReadonlyArray<string | number>): number {
  let h = 2166136261;
  for (const part of parts) {
    const s = String(part);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= 0x1f;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Convenience wrapper around mulberry32 for procedural content (stars, variants). */
export class Rng {
  private readonly step: () => number;

  constructor(seed: number) {
    this.step = mulberry32(seed);
  }

  /** Uniform in [0, 1). */
  next(): number {
    return this.step();
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.step();
  }

  int(min: number, maxInclusive: number): number {
    return Math.floor(this.range(min, maxInclusive + 1));
  }

  pick<T>(items: readonly T[]): T {
    const item = items[Math.floor(this.step() * items.length)];
    if (item === undefined) throw new Error("Rng.pick on empty array");
    return item;
  }
}
