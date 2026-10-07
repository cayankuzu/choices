/**
 * GameClock (TEKNIK §5.1): one real-time clock, frame dt clamped to 100 ms, a set of pause reasons.
 * While the effective set is non-empty no counter advances (world dt is 0). K7: `pointerLockLost`
 * only counts while the choice engine is idle; in cutscene/options/dice/continue the pointer is
 * free by design (DOM buttons) and time keeps running. The decision clock advances only in the
 * `options` state, with or without pointer lock, and stops with hidden/frozen/menu.
 */
export type PauseReason = "hidden" | "frozen" | "menu" | "pointerLockLost";

export type EngineState = "idle" | "cutscene" | "options" | "dice" | "continue" | "opening" | "emulating" | "frozen" | "woken";

export type ClockKind = "reflex" | "normal" | "vehicle" | "heavy" | "small";

/** KANON §2 durations (ms). An accessibility `timerScale` (open decision 3) would multiply these. */
export const CLOCK_MS: Record<ClockKind, number> = { reflex: 20_000, normal: 45_000, vehicle: 60_000, heavy: 90_000, small: 30_000 };

export type DecisionClock = { choiceId: string; kind: ClockKind; durationMs: number; elapsedMs: number };

export type Frame = {
  nowMs: number;
  /** Real time since the previous frame, clamped (ms). For render stats and UI. */
  frameMs: number;
  /** World time this frame (ms): 0 while paused or right after a resume. */
  dtMs: number;
  /** `dtMs` in seconds, for physics. */
  dt: number;
  paused: boolean;
};

export const MAX_FRAME_MS = 100;

type Raf = (callback: (nowMs: number) => void) => number;
type Caf = (handle: number) => void;

export class GameClock {
  /** Game time: the sum of every unpaused frame (ms). */
  elapsedMs = 0;
  decision: DecisionClock | null = null;
  private readonly reasons = new Set<PauseReason>();
  private last = Number.NaN;
  private resync = true;
  private handle = 0;
  private readonly frame: Frame = { nowMs: 0, frameMs: 0, dtMs: 0, dt: 0, paused: true };

  constructor(private readonly engineState: () => EngineState) {}

  get paused(): ReadonlySet<PauseReason> {
    return this.reasons;
  }

  has(reason: PauseReason): boolean {
    return this.reasons.has(reason);
  }

  pause(reason: PauseReason): void {
    this.reasons.add(reason);
  }

  resume(reason: PauseReason): void {
    // The first frame after a resume carries no world time: a hidden tab's whole gap is dropped.
    if (this.reasons.delete(reason)) this.resync = true;
  }

  /** Effective pause: every reason except `pointerLockLost` outside the idle engine state (K7). */
  get isPaused(): boolean {
    const r = this.reasons;
    if (r.has("hidden") || r.has("frozen") || r.has("menu")) return true;
    return r.has("pointerLockLost") && this.engineState() === "idle";
  }

  startDecision(choiceId: string, kind: ClockKind, durationMs: number = CLOCK_MS[kind]): DecisionClock {
    this.decision = { choiceId, kind, durationMs, elapsedMs: 0 };
    return this.decision;
  }

  endDecision(): void {
    this.decision = null;
  }

  /** Advances by one frame. Returns the same Frame object every call (no per-frame allocation). */
  tick(nowMs: number): Frame {
    const f = this.frame;
    const raw = Number.isNaN(this.last) ? 0 : Math.max(0, nowMs - this.last);
    this.last = nowMs;
    f.nowMs = nowMs;
    f.frameMs = Math.min(raw, MAX_FRAME_MS);
    const paused = this.isPaused;
    f.paused = paused;
    f.dtMs = paused || this.resync ? 0 : f.frameMs;
    f.dt = f.dtMs / 1000;
    this.resync = false;
    this.elapsedMs += f.dtMs;
    const d = this.decision;
    if (d !== null && f.dtMs > 0 && this.engineState() === "options") d.elapsedMs = Math.min(d.durationMs, d.elapsedMs + f.dtMs);
    return f;
  }

  /** Drives `onFrame` from requestAnimationFrame. The next frame is requested before the callback runs. */
  start(onFrame: (frame: Frame) => void, raf: Raf = (cb) => requestAnimationFrame(cb)): void {
    const loop = (nowMs: number): void => {
      this.handle = raf(loop);
      onFrame(this.tick(nowMs));
    };
    this.resync = true;
    this.handle = raf(loop);
  }

  stop(caf: Caf = (h) => cancelAnimationFrame(h)): void {
    if (this.handle !== 0) caf(this.handle);
    this.handle = 0;
  }
}

/** Adds/removes the `hidden` reason with the page's visibility. Returns a detach function. */
export function attachVisibility(clock: GameClock, doc: Document = document): () => void {
  const sync = (): void => {
    if (doc.hidden) clock.pause("hidden");
    else clock.resume("hidden");
  };
  sync();
  doc.addEventListener("visibilitychange", sync);
  return () => {
    doc.removeEventListener("visibilitychange", sync);
    clock.resume("hidden");
  };
}
