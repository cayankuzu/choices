import { FrameStats } from "../core/frameStats";

/** K2 (TEKNIK §2.2–2.3): three tiers; content, NPC and extra counts never depend on the tier. */
export type QualityTier = "low" | "medium" | "high";

export type QualitySettings = {
  tier: QualityTier;
  /** Upper / lower bound for the render buffer's pixel ratio (ResolutionGovernor range). */
  maxPixelRatio: number;
  minPixelRatio: number;
  /** 0 = no shadow map (blob decals later). */
  shadowMapSize: 0 | 1024 | 2048;
  post: "none" | "basic" | "bloom";
  /** Sky layers drawn: 1 stars+dome, 2 +light pollution, 3 +horizon glow (meteor/nebula later). */
  skyLayers: 1 | 2 | 3;
  anisotropy: number;
  particleScale: number;
  fog: "linear" | "exp2";
  lodScale: number;
  /** Frame-time budget the tier is meant to hold (ms); governor and probe compare against it. */
  budgetMs: number;
};

export const QUALITY: Record<QualityTier, QualitySettings> = {
  low: { tier: "low", maxPixelRatio: 0.75, minPixelRatio: 0.5, shadowMapSize: 0, post: "none", skyLayers: 1, anisotropy: 1, particleScale: 0.4, fog: "linear", lodScale: 0.7, budgetMs: 1000 / 30 },
  medium: { tier: "medium", maxPixelRatio: 1, minPixelRatio: 0.65, shadowMapSize: 1024, post: "basic", skyLayers: 2, anisotropy: 2, particleScale: 0.8, fog: "exp2", lodScale: 1, budgetMs: 1000 / 60 },
  high: { tier: "high", maxPixelRatio: 1.5, minPixelRatio: 0.85, shadowMapSize: 2048, post: "bloom", skyLayers: 3, anisotropy: 4, particleScale: 1, fog: "exp2", lodScale: 1.3, budgetMs: 1000 / 60 },
};

export const QUALITY_STORAGE_KEY = "dilemma.quality.v1";
/** Pixel-ratio ceiling on a context with a major performance caveat (software rendering). */
export const CAVEAT_MAX_PIXEL_RATIO = 0.5;
/** Over-budget factor that triggers a step down (probe and in-game downgrade). */
export const OVER_BUDGET = 1.15;

export type StoredQuality = { gpu: string; tier: QualityTier; ts: number };

const ORDER: readonly QualityTier[] = ["low", "medium", "high"];

export function isQualityTier(value: unknown): value is QualityTier {
  return value === "low" || value === "medium" || value === "high";
}

export function lowerTier(tier: QualityTier): QualityTier {
  return ORDER[Math.max(0, ORDER.indexOf(tier) - 1)] ?? "low";
}

export function higherTier(tier: QualityTier): QualityTier {
  return ORDER[Math.min(ORDER.length - 1, ORDER.indexOf(tier) + 1)] ?? "high";
}

/** `?q=low|medium|high` forces a tier (qa/dev and prod alike; it is never persisted). */
export function forcedTier(search: string): QualityTier | null {
  const q = new URLSearchParams(search).get("q");
  return isQualityTier(q) ? q : null;
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

/** The stored measurement, if it belongs to the same GPU string. */
export function readStoredTier(gpu: string, storage: StorageLike | null): QualityTier | null {
  try {
    const raw = storage?.getItem(QUALITY_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<StoredQuality>;
    return value.gpu === gpu && isQualityTier(value.tier) ? value.tier : null;
  } catch {
    return null;
  }
}

export function writeStoredTier(gpu: string, tier: QualityTier, storage: StorageLike | null): void {
  try {
    const record: StoredQuality = { gpu, tier, ts: Date.now() };
    storage?.setItem(QUALITY_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Private mode or quota: the next boot simply measures again.
  }
}

/** Unmasked renderer string from an existing context (Firefox hides it: the probe decides there). */
export function readGpuName(gl: WebGLRenderingContext | WebGL2RenderingContext): string {
  try {
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name: unknown = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    return typeof name === "string" ? name : "";
  } catch {
    return "";
  }
}

const SOFTWARE_OR_WEAK_GPU = /swiftshader|llvmpipe|softpipe|basic render|mali-4|mali-t6|adreno \(tm\) [2-4]\d\d|powervr sgx/i;
const INTEGRATED_GPU = /intel|mali|adreno|powervr|apple gpu/i;

export type DeviceHints = { cores: number; memoryGb: number; gpu: string };

export function deviceHints(gpu: string, nav: Navigator = navigator): DeviceHints {
  const memory = (nav as Navigator & { deviceMemory?: number }).deviceMemory;
  return { cores: nav.hardwareConcurrency || 2, memoryGb: memory ?? 4, gpu };
}

/** Cheap first guess (sTressT heuristic); the 5 s probe refines it on the first boot. */
export function heuristicTier(hints: DeviceHints): QualityTier {
  if (hints.cores <= 2 || hints.memoryGb <= 2 || SOFTWARE_OR_WEAK_GPU.test(hints.gpu)) return "low";
  if (hints.cores <= 4 || INTEGRATED_GPU.test(hints.gpu)) return "medium";
  return "high";
}

/** Probe rule: p95 over 1.15× budget → one tier down; median under 0.5× budget → one tier up. */
export function decideTier(current: QualityTier, medianMs: number, p95Ms: number): QualityTier {
  const budget = QUALITY[current].budgetMs;
  if (p95Ms > budget * OVER_BUDGET) return lowerTier(current);
  if (medianMs < budget * 0.5) return higherTier(current);
  return current;
}

export type ProbeSummary = { medianMs: number; p95Ms: number; frames: number };

/**
 * The 5 s measurement scene: the first `warmupMs` (shader warm-up) are discarded, the following
 * `measureMs` are sampled. Very slow machines keep sampling until a minimum frame count is in.
 */
export class QualityProbe {
  result: QualityTier | null = null;
  summary: ProbeSummary | null = null;
  private elapsedMs = 0;
  private readonly stats = new FrameStats(1024);
  private static readonly MIN_FRAMES = 30;

  constructor(
    readonly startTier: QualityTier,
    private readonly warmupMs = 2000,
    private readonly measureMs = 3000,
  ) {}

  get done(): boolean {
    return this.result !== null;
  }

  /** 0..1 of the planned duration (UI progress; may stay below 1 while waiting for frames). */
  get progress(): number {
    return Math.min(1, this.elapsedMs / (this.warmupMs + this.measureMs));
  }

  /** Feed one frame time (ms). Returns the chosen tier once, when the measurement completes. */
  tick(frameMs: number): QualityTier | null {
    if (this.result !== null || frameMs <= 0) return null;
    this.elapsedMs += frameMs;
    if (this.elapsedMs <= this.warmupMs) return null;
    this.stats.push(frameMs);
    const planned = this.warmupMs + this.measureMs;
    const enough = this.stats.count >= QualityProbe.MIN_FRAMES || this.elapsedMs >= planned * 4;
    if (this.elapsedMs < planned || !enough) return null;
    this.summary = { medianMs: this.stats.median(), p95Ms: this.stats.p95(), frames: this.stats.count };
    this.result = decideTier(this.startTier, this.summary.medianMs, this.summary.p95Ms);
    return this.result;
  }
}

/**
 * In-game automatic tier change is downward only: with the resolution already at its floor, 30 s of
 * p95 over 1.15× budget drops one tier (the UI shows a toast).
 */
export class DowngradeWatch {
  private readonly stats = new FrameStats(1024);
  private windowMs = 0;
  private badMs = 0;

  constructor(
    public tier: QualityTier,
    private readonly holdMs = 30_000,
  ) {}

  tick(frameMs: number, atFloor: boolean): QualityTier | null {
    if (!atFloor || frameMs <= 0) {
      if (this.badMs !== 0 || this.windowMs !== 0) this.resetWindow(true);
      return null;
    }
    this.stats.push(frameMs);
    this.windowMs += frameMs;
    if (this.windowMs < 1000) return null;
    const bad = this.stats.p95() > QUALITY[this.tier].budgetMs * OVER_BUDGET;
    this.badMs = bad ? this.badMs + this.windowMs : 0;
    this.resetWindow(false);
    if (this.badMs >= this.holdMs && this.tier !== "low") {
      this.tier = lowerTier(this.tier);
      this.badMs = 0;
      return this.tier;
    }
    return null;
  }

  private resetWindow(clearBad: boolean): void {
    this.stats.reset();
    this.windowMs = 0;
    if (clearBad) this.badMs = 0;
  }
}
