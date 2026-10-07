import { describe, expect, it } from "vitest";
import { CLOCK_MS, GameClock, MAX_FRAME_MS, type EngineState } from "./clock";

/** Ticks the clock in fixed steps up to `untilMs` (inclusive); returns the last frame. */
function run(clock: GameClock, fromMs: number, untilMs: number, stepMs: number) {
  let frame = clock.tick(fromMs);
  for (let now = fromMs + stepMs; now <= untilMs + 1e-9; now += stepMs) frame = clock.tick(now);
  return frame;
}

function make(initial: EngineState = "idle") {
  let state = initial;
  const clock = new GameClock(() => state);
  return { clock, setState: (s: EngineState) => (state = s) };
}

describe("GameClock", () => {
  it("accumulates game time while nothing pauses it, dt clamped to 100 ms", () => {
    const { clock } = make();
    clock.tick(0);
    expect(clock.tick(16).dtMs).toBe(16);
    expect(clock.tick(516).dtMs).toBe(MAX_FRAME_MS);
    expect(clock.elapsedMs).toBe(16 + MAX_FRAME_MS);
  });

  it("paused set non-empty → no counter advances (menu, frozen)", () => {
    const { clock } = make();
    clock.tick(0);
    clock.pause("menu");
    const frame = run(clock, 10, 1000, 10);
    expect(frame.paused).toBe(true);
    expect(frame.dtMs).toBe(0);
    expect(clock.elapsedMs).toBe(0);
    clock.resume("menu");
    clock.pause("frozen");
    run(clock, 1010, 2000, 10);
    expect(clock.elapsedMs).toBe(0);
  });

  it("pointerLockLost pauses only while the choice engine is idle (K7)", () => {
    const { clock, setState } = make("idle");
    clock.pause("pointerLockLost");
    clock.tick(0);
    run(clock, 10, 500, 10);
    expect(clock.elapsedMs).toBe(0);
    setState("cutscene");
    run(clock, 510, 1000, 10);
    expect(clock.elapsedMs).toBe(500);
    expect(clock.isPaused).toBe(false);
  });

  it("options state without pointer lock: decision clock reads 1000 after 1000 ms", () => {
    const { clock, setState } = make("options");
    clock.pause("pointerLockLost");
    const decision = clock.startDecision("T1", "normal");
    expect(decision.durationMs).toBe(CLOCK_MS.normal);
    clock.tick(0);
    run(clock, 50, 1000, 50);
    expect(clock.decision?.elapsedMs).toBe(1000);
    expect(clock.elapsedMs).toBe(1000);
    setState("dice");
    run(clock, 1050, 2000, 50);
    // Only the options state advances the decision clock; the world keeps running.
    expect(clock.decision?.elapsedMs).toBe(1000);
    expect(clock.elapsedMs).toBe(2000);
  });

  it("decision clock saturates at its duration", () => {
    const { clock } = make("options");
    clock.startDecision("T2", "reflex");
    clock.tick(0);
    run(clock, 100, 25_000, 100);
    expect(clock.decision?.elapsedMs).toBe(CLOCK_MS.reflex);
  });

  it("hidden → stops, including the decision clock; the gap after resume is dropped", () => {
    const { clock } = make("options");
    clock.startDecision("T1", "normal");
    clock.tick(0);
    run(clock, 16, 160, 16);
    const before = clock.decision?.elapsedMs ?? -1;
    expect(before).toBe(160);
    clock.pause("hidden");
    clock.tick(176);
    // The tab is hidden for 10 s: no frames arrive, then one frame on return.
    clock.resume("hidden");
    const first = clock.tick(10_176);
    expect(first.dtMs).toBe(0);
    expect(clock.decision?.elapsedMs).toBe(160);
    expect(clock.elapsedMs).toBe(160);
    expect(clock.tick(10_192).dtMs).toBe(16);
  });

  it("start/stop drive the frame callback through the injected rAF", () => {
    const { clock } = make();
    const callbacks: Array<(now: number) => void> = [];
    const seen: number[] = [];
    clock.start(
      (frame) => seen.push(frame.dtMs),
      (cb) => callbacks.push(cb),
    );
    callbacks.shift()?.(0);
    callbacks.shift()?.(16);
    callbacks.shift()?.(40);
    expect(seen).toEqual([0, 16, 24]);
    // Each rAF request returns the queue length; after the shifts that is always 1.
    let cancelled = -1;
    clock.stop((h) => (cancelled = h));
    expect(cancelled).toBe(1);
    expect(callbacks).toHaveLength(1);
  });
});
