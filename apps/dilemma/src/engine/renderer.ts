import { NeutralToneMapping, PCFShadowMap, type PerspectiveCamera, WebGLRenderer } from "three";
import { FrameStats } from "../core/frameStats";
import { OVER_BUDGET } from "./quality";

export type RendererResult = {
  renderer: WebGLRenderer;
  gl: WebGL2RenderingContext;
  /** True when the context only came up without `failIfMajorPerformanceCaveat` (software GL). */
  caveat: boolean;
};

function attributes(failIfMajorPerformanceCaveat: boolean): WebGLContextAttributes {
  return {
    alpha: false,
    antialias: false,
    depth: true,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat,
  };
}

/**
 * WebGL2 only (TEKNIK §2.10). First attempt refuses a major performance caveat; the second accepts
 * one and flags it. The context is created here, not by three, so a failed attempt never logs to the
 * console and the fallback can use a fresh canvas (a failed attempt may taint the first element).
 * Returns null when there is no WebGL2 at all: the caller shows the barrier screen.
 */
export function createRenderer(canvas: HTMLCanvasElement): RendererResult | null {
  let target = canvas;
  let gl = canvas.getContext("webgl2", attributes(true));
  let caveat = false;
  if (!gl) {
    const fresh = document.createElement("canvas");
    fresh.id = canvas.id;
    fresh.className = canvas.className;
    canvas.replaceWith(fresh);
    target = fresh;
    gl = fresh.getContext("webgl2", attributes(false));
    caveat = true;
  }
  if (!gl) return null;

  const renderer = new WebGLRenderer({ canvas: target, context: gl, antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" });
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = PCFShadowMap;
  // Static scenes re-render shadows only on demand (shadowMap.needsUpdate).
  renderer.shadowMap.autoUpdate = false;
  renderer.setClearColor(0x000000, 1);
  return { renderer, gl, caveat };
}

export function fitToWindow(renderer: WebGLRenderer, camera: PerspectiveCamera): void {
  const width = window.innerWidth;
  const height = window.innerHeight;
  // `false`: keep the CSS size at 100% and only resize the drawing buffer.
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

export type ContextHandlers = { lost(): void; restored(): void };

/** Context loss/restore wiring; returns a detach function. */
export function watchContext(renderer: WebGLRenderer, handlers: ContextHandlers): () => void {
  const canvas = renderer.domElement;
  const onLost = (event: Event): void => {
    // preventDefault tells the browser we want `webglcontextrestored`.
    event.preventDefault();
    handlers.lost();
  };
  const onRestored = (): void => handlers.restored();
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  return () => {
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", onRestored);
  };
}

export type RenderStats = { calls: number; triangles: number; programs: number };

/** Draw calls / triangles of the last render and the compiled program count (must stay flat in play). */
export function readRenderStats(renderer: WebGLRenderer, out: RenderStats): RenderStats {
  out.calls = renderer.info.render.calls;
  out.triangles = renderer.info.render.triangles;
  out.programs = renderer.info.programs?.length ?? 0;
  return out;
}

const STEP = 0.05;
const WINDOW_MS = 1000;
const HYSTERESIS_MS = 2000;
/** After an unhelpful downscale (CPU-bound or throttled) the governor holds still this long. */
const HOLD_MS = 15_000;

/**
 * Dynamic resolution (TEKNIK §2.2): once per second the p95 frame time is compared with the tier's
 * budget. Over 1.15× → pixel ratio −0.05 (down to the tier floor); comfortably under budget for 2 s →
 * +0.05 (up to the tier ceiling). A downscale that did not speed frames up is undone and the
 * governor pauses, so a throttled tab does not grind itself down to the floor.
 */
export class ResolutionGovernor {
  private readonly stats = new FrameStats(512);
  private windowMs = 0;
  private sinceChangeMs = 0;
  private holdMs = 0;
  private beforeDownscale = 0;
  private ratio: number;

  constructor(
    private readonly renderer: WebGLRenderer,
    private min: number,
    private max: number,
    private targetMs: number,
    private readonly onChange: () => void,
  ) {
    this.ratio = max;
    this.apply();
  }

  get pixelRatio(): number {
    return this.ratio;
  }

  get atFloor(): boolean {
    return this.ratio <= this.min + 1e-6;
  }

  /** New tier bounds: the resolution starts from the new ceiling; the governor lowers it again if needed. */
  setBounds(min: number, max: number): void {
    this.min = min;
    this.max = max;
    this.beforeDownscale = 0;
    this.holdMs = 0;
    this.set(max);
  }

  setTarget(targetMs: number): void {
    this.targetMs = targetMs;
  }

  tick(frameMs: number): void {
    if (frameMs <= 0) return;
    this.stats.push(frameMs);
    this.windowMs += frameMs;
    this.sinceChangeMs += frameMs;
    if (this.windowMs < WINDOW_MS) return;
    const p95 = this.stats.p95();
    const window = this.windowMs;
    this.stats.reset();
    this.windowMs = 0;

    if (this.holdMs > 0) {
      this.holdMs -= window;
      return;
    }
    if (this.beforeDownscale > 0) {
      const helped = p95 < this.beforeDownscale * 0.93;
      this.beforeDownscale = 0;
      if (!helped) {
        this.set(Math.min(this.max, this.ratio + STEP));
        this.holdMs = HOLD_MS;
        return;
      }
    }
    if (p95 > this.targetMs * OVER_BUDGET && this.ratio > this.min) {
      this.beforeDownscale = p95;
      this.set(Math.max(this.min, this.ratio - STEP));
    } else if (p95 <= this.targetMs * 1.05 && this.ratio < this.max && this.sinceChangeMs >= HYSTERESIS_MS) {
      this.set(Math.min(this.max, this.ratio + STEP));
    }
  }

  private set(ratio: number): void {
    const next = Math.round(ratio * 100) / 100;
    if (next === this.ratio) return;
    this.ratio = next;
    this.sinceChangeMs = 0;
    this.apply();
  }

  private apply(): void {
    this.renderer.setPixelRatio(this.ratio);
    this.onChange();
  }
}
