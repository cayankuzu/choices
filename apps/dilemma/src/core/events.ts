import type { QualityTier } from "../engine/quality";

/** Cross-system notifications. Payloads are plain data (never three.js or Rapier objects). */
export type GameEvents = {
  /** Player entered (inside=true) or left a door trigger volume. */
  DOOR: { id: string; inside: boolean };
  POINTER_LOCK: { locked: boolean };
  CONTEXT_LOST: void;
  CONTEXT_RESTORED: void;
  QUALITY_CHANGED: { tier: QualityTier; reason: QualitySource };
};

export type QualitySource = "forced" | "stored" | "heuristic" | "caveat" | "measured" | "downgrade";

type Handler<T> = (payload: T) => void;

export class EventBus<E extends Record<string, unknown> = GameEvents> {
  private readonly handlers = new Map<keyof E, Set<Handler<never>>>();

  on<K extends keyof E>(type: K, handler: Handler<E[K]>): () => void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set();
      this.handlers.set(type, set);
    }
    set.add(handler as Handler<never>);
    return () => set.delete(handler as Handler<never>);
  }

  emit<K extends keyof E>(type: K, ...payload: E[K] extends void ? [] : [E[K]]): void {
    const set = this.handlers.get(type);
    if (!set) return;
    for (const handler of set) (handler as Handler<E[K] | undefined>)(payload[0]);
  }

  clear(): void {
    this.handlers.clear();
  }
}
