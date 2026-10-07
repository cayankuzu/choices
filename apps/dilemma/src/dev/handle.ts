import type { GameSnapshot } from "../game/Game";

/** `window.__dilemma` (dev/qa only; undefined in prod). T4/T5 add trigger, advance, noOpen, noIdb, crash. */
export type DevHandle = {
  version: string;
  /** Teleports the player's feet to (x, 0, z). */
  goto(x: number, z: number): void;
  /** JSON-safe snapshot: no three.js or Rapier objects. */
  state(): GameSnapshot;
  /** false: neither a hidden tab nor pointer-lock loss pauses the clock (automation). */
  autoPause(on: boolean): void;
  loseContext(): void;
  restoreContext(): void;
};

type DevWindow = Window & { __dilemma?: DevHandle };

export function installHandle(handle: DevHandle): () => void {
  const w = window as DevWindow;
  w.__dilemma = handle;
  return () => {
    delete w.__dilemma;
  };
}
