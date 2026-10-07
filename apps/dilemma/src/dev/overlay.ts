import type { GameSnapshot } from "../game/Game";
import { h, setText } from "../ui/dom";

const REFRESH_MS = 500;

export type Overlay = {
  readonly visible: boolean;
  toggle(): void;
  tick(frameMs: number): void;
  dispose(): void;
};

/** F3 readout (qa/dev only): fps, p95, draws, triangles, tier, internal resolution. Refreshes at 2 Hz. */
export function createOverlay(parent: HTMLElement, source: () => GameSnapshot, visible = false): Overlay {
  const el = h("pre", { class: "overlay", attrs: { "data-screen": "overlay", "aria-hidden": "true" } });
  el.hidden = !visible;
  parent.append(el);
  let elapsed = 0;
  const render = (): void => setText(el, format(source()));
  if (visible) render();

  return {
    get visible() {
      return !el.hidden;
    },
    toggle() {
      el.hidden = !el.hidden;
      if (!el.hidden) render();
    },
    tick(frameMs) {
      if (el.hidden) return;
      elapsed += frameMs;
      if (elapsed < REFRESH_MS) return;
      elapsed = 0;
      render();
    },
    dispose() {
      el.remove();
    },
  };
}

function format(s: GameSnapshot): string {
  const f = s.frame;
  const q = s.quality;
  const tris = f.triangles >= 1000 ? `${(f.triangles / 1000).toFixed(1)}k` : String(f.triangles);
  const paused = s.clock.paused.length > 0 ? s.clock.paused.join(",") : "-";
  const probe = q.probe === "running" ? `probe ${Math.round(q.probeProgress * 100)}%` : `probe ${q.probe}`;
  return (
    `DILEMMA ${s.version}  tier ${q.tier} (${q.source})  sky ${q.skyLayers}${q.caveat ? "  CAVEAT" : ""}\n` +
    `fps ${f.fps}  p95 ${f.p95Ms.toFixed(1)} ms  draws ${f.calls}  tris ${tris}  programs ${f.programs}\n` +
    `res ${f.pixelRatio.toFixed(2)}x ${f.width}x${f.height}  ${probe}\n` +
    `paused ${paused}  ctx ${s.contextLost ? "LOST" : "ok"}  door ${s.door ? "inside" : "-"}  pos ${s.player.x.toFixed(1)} ${s.player.z.toFixed(1)}`
  );
}
