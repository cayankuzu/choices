import { Fog, FogExp2, Group, PerspectiveCamera, Scene, Vector2, type WebGLRenderer } from "three";
import { attachVisibility, GameClock, type DecisionClock, type EngineState, type Frame, type PauseReason } from "../core/clock";
import { EventBus, type QualitySource } from "../core/events";
import { FrameStats } from "../core/frameStats";
import { Input, type Axis } from "../core/input";
import type { Overlay } from "../dev/overlay";
import { initPhysics, type Physics } from "../engine/physics";
import {
  CAVEAT_MAX_PIXEL_RATIO,
  deviceHints,
  DowngradeWatch,
  forcedTier,
  heuristicTier,
  QUALITY,
  QualityProbe,
  readGpuName,
  readStoredTier,
  writeStoredTier,
  type ProbeSummary,
  type QualityTier,
} from "../engine/quality";
import { createRenderer, fitToWindow, readRenderStats, ResolutionGovernor, watchContext, type RendererResult, type RenderStats } from "../engine/renderer";
import { PLAYER, PlayerController } from "../player/PlayerController";
import { SkyDome } from "../sky/SkyDome";
import { StarField } from "../sky/StarField";
import { t } from "../ui/i18n";
import { hint as createHint, type Hint } from "../ui/screens";
import { createTestRoom, ROOM, type TestRoom } from "../world/testRoom";

export type GameOptions = {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  search: string;
  storage: Storage | null;
  /** Procedural seed (stars). The universe root seed takes over in T5. */
  seed?: number;
};

/** JSON-safe readout for the overlay, the dev handle and e2e (never three.js/Rapier objects). */
export type GameSnapshot = {
  version: string;
  qa: boolean;
  engine: EngineState;
  quality: {
    tier: QualityTier;
    source: QualitySource;
    caveat: boolean;
    gpu: string;
    probe: "running" | "done" | "skipped";
    probeProgress: number;
    measured: ProbeSummary | null;
    skyLayers: number;
  };
  clock: { paused: PauseReason[]; isPaused: boolean; elapsedMs: number; decision: DecisionClock | null };
  player: { x: number; y: number; z: number; yaw: number; pitch: number; grounded: boolean; crouched: boolean; locked: boolean };
  frame: { fps: number; p95Ms: number; calls: number; triangles: number; programs: number; pixelRatio: number; width: number; height: number };
  contextLost: boolean;
  door: boolean;
};

type Parts = {
  opts: GameOptions;
  gl: RendererResult;
  physics: Physics;
  gpu: string;
  tier: QualityTier;
  source: QualitySource;
  probe: boolean;
};

const FOG_COLOR = 0x05070d;
const STATS_WINDOW_MS = 1000;

/**
 * Composition root of the running game: clock, input, renderer, physics, test room, player, sky,
 * quality governors. `createGame` performs the async boot; `start` begins the rAF loop.
 */
export class Game {
  readonly bus = new EventBus();
  readonly clock: GameClock;
  readonly input: Input;
  private readonly renderer: WebGLRenderer;
  private readonly physics: Physics;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(PLAYER.fov, 1, 0.05, 1200);
  private readonly sky = new Group();
  private readonly dome = new SkyDome();
  private readonly stars: StarField;
  private readonly room: TestRoom;
  private readonly player: PlayerController;
  private readonly governor: ResolutionGovernor;
  private readonly downgrade: DowngradeWatch;
  private readonly hint: Hint;
  private readonly storage: Storage | null;
  private readonly gpu: string;
  private readonly caveat: boolean;
  private readonly look: Axis = { x: 0, y: 0 };
  private readonly renderStats: RenderStats = { calls: 0, triangles: 0, programs: 0 };
  private readonly stats = new FrameStats(512);
  private statsMs = 0;
  private fps = 0;
  private p95Ms = 0;
  private tier: QualityTier;
  private qualitySource: QualitySource;
  private probe: QualityProbe | null;
  private measured: ProbeSummary | null = null;
  private engineState: EngineState = "idle";
  private contextLost = false;
  private overlay: Overlay | null = null;
  private detachVisibility: (() => void) | null = null;
  private readonly detachContext: () => void;
  private autoPause = true;
  private started = false;

  constructor(parts: Parts) {
    const { opts, gl, physics } = parts;
    this.renderer = gl.renderer;
    this.caveat = gl.caveat;
    this.gpu = parts.gpu;
    this.physics = physics;
    this.storage = opts.storage;
    this.tier = parts.tier;
    this.qualitySource = parts.source;
    this.probe = parts.probe ? new QualityProbe(parts.tier) : null;
    this.downgrade = new DowngradeWatch(parts.tier);

    this.clock = new GameClock(() => this.engineState);
    this.input = new Input(this.renderer.domElement);
    this.input.captureOnClick = true;

    this.stars = new StarField(opts.seed ?? 1);
    this.sky.add(this.dome.mesh, this.stars.points);
    this.scene.add(this.sky);
    this.dome.setPollution(ROOM.pollution);

    this.room = createTestRoom(this.scene, physics, (inside) => {
      console.info(`[dilemma] door ${ROOM.door.id} ${inside ? "enter" : "leave"}`);
      this.bus.emit("DOOR", { id: ROOM.door.id, inside });
    });
    this.player = new PlayerController(physics.world, this.camera, this.input);
    // Yaw 0 faces -Z: the cube, the step and the building are in view at spawn.
    this.player.teleport(ROOM.spawn[0], ROOM.spawn[1], ROOM.spawn[2], 0);
    performance.mark("boot:world");

    const q = QUALITY[this.tier];
    this.governor = new ResolutionGovernor(this.renderer, q.minPixelRatio, q.maxPixelRatio, q.budgetMs, this.fit);
    this.applyTier(this.tier, this.qualitySource);
    window.addEventListener("resize", this.fit);

    this.hint = createHint(opts.root);
    this.hint.set(t("app.clickToPlay"));
    this.hint.show(true);
    this.input.onLock((locked) => {
      if (locked) this.clock.resume("pointerLockLost");
      else if (this.autoPause) this.clock.pause("pointerLockLost");
      this.hint.show(!locked);
      this.bus.emit("POINTER_LOCK", { locked });
    });
    this.setAutoPause(true);
    this.detachContext = watchContext(this.renderer, {
      lost: () => {
        this.contextLost = true;
        console.info("[dilemma] webgl context lost");
        this.bus.emit("CONTEXT_LOST");
      },
      restored: () => {
        this.contextLost = false;
        this.renderer.shadowMap.needsUpdate = true;
        console.info("[dilemma] webgl context restored");
        this.bus.emit("CONTEXT_RESTORED");
      },
    });
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    this.renderer.shadowMap.needsUpdate = true;
    this.clock.start(this.onFrame);
    performance.mark("game:control");
  }

  setOverlay(overlay: Overlay | null): void {
    this.overlay = overlay;
  }

  /**
   * Automatic pausing (hidden tab, pointer-lock loss). Off, automation can drive the world without
   * a locked pointer; `menu`/`frozen` reasons are unaffected.
   */
  setAutoPause(on: boolean): void {
    this.autoPause = on;
    if (on) {
      this.detachVisibility ??= attachVisibility(this.clock);
      if (!this.input.locked) this.clock.pause("pointerLockLost");
    } else {
      this.detachVisibility?.();
      this.detachVisibility = null;
      this.clock.resume("pointerLockLost");
    }
  }

  goto(x: number, z: number): void {
    this.player.teleport(x, 0, z);
  }

  loseContext(): void {
    this.renderer.forceContextLoss();
  }

  restoreContext(): void {
    this.renderer.forceContextRestore();
  }

  state(): GameSnapshot {
    const feet = this.player.feet;
    const size = this.renderer.getDrawingBufferSize(SIZE_SCRATCH);
    return {
      version: __APP_VERSION__,
      qa: __QA__,
      engine: this.engineState,
      quality: {
        tier: this.tier,
        source: this.qualitySource,
        caveat: this.caveat,
        gpu: this.gpu,
        probe: this.probe ? "running" : this.measured ? "done" : "skipped",
        probeProgress: this.probe?.progress ?? (this.measured ? 1 : 0),
        measured: this.measured,
        skyLayers: this.dome.layerCount,
      },
      clock: {
        paused: [...this.clock.paused],
        isPaused: this.clock.isPaused,
        elapsedMs: Math.round(this.clock.elapsedMs),
        decision: this.clock.decision ? { ...this.clock.decision } : null,
      },
      player: {
        x: round(feet.x),
        y: round(feet.y),
        z: round(feet.z),
        yaw: round(this.player.yaw),
        pitch: round(this.player.pitch),
        grounded: this.player.isGrounded,
        crouched: this.player.isCrouched,
        locked: this.input.locked,
      },
      frame: {
        fps: this.fps,
        p95Ms: round(this.p95Ms),
        calls: this.renderStats.calls,
        triangles: this.renderStats.triangles,
        programs: this.renderStats.programs,
        pixelRatio: this.governor.pixelRatio,
        width: size.x,
        height: size.y,
      },
      contextLost: this.contextLost,
      door: this.room.inDoor,
    };
  }

  dispose(): void {
    this.clock.stop();
    this.setAutoPause(false);
    this.detachContext();
    window.removeEventListener("resize", this.fit);
    this.input.detach();
    this.hint.dispose();
    this.overlay?.dispose();
    this.room.dispose();
    this.player.dispose();
    this.scene.remove(this.sky);
    this.stars.dispose();
    this.dome.dispose();
    this.physics.dispose();
    this.renderer.dispose();
    this.bus.clear();
  }

  private readonly fit = (): void => {
    fitToWindow(this.renderer, this.camera);
    this.stars.setPixelRatio(this.renderer.getPixelRatio());
  };

  private applyTier(tier: QualityTier, source: QualitySource): void {
    const q = QUALITY[tier];
    this.tier = tier;
    this.qualitySource = source;
    this.downgrade.tier = tier;
    const dpr = window.devicePixelRatio || 1;
    const max = this.caveat ? Math.min(CAVEAT_MAX_PIXEL_RATIO, dpr) : Math.min(dpr, q.maxPixelRatio);
    const min = Math.min(max, q.minPixelRatio);
    this.governor.setBounds(min, max);
    this.governor.setTarget(q.budgetMs);
    this.renderer.shadowMap.enabled = q.shadowMapSize > 0;
    this.room.setShadowMapSize(q.shadowMapSize);
    this.renderer.shadowMap.needsUpdate = true;
    this.dome.setLayers(q.skyLayers);
    this.scene.fog = q.fog === "linear" ? new Fog(FOG_COLOR, 20, 90) : new FogExp2(FOG_COLOR, 0.012);
    this.bus.emit("QUALITY_CHANGED", { tier, reason: source });
  }

  /** @frame */
  private readonly onFrame = (f: Frame): void => {
    const look = this.input.consumeLook(this.look);
    if (!f.paused) this.player.look(look.x, look.y);
    this.player.captureInput();
    this.physics.advance(f.dt, this.beforeStep, this.afterStep);
    this.player.updateCamera(this.physics.alpha(), f.frameMs / 1000);
    this.sky.position.copy(this.camera.position);
    this.stars.update(f.nowMs / 1000);

    if (this.input.pressed("overlay")) this.overlay?.toggle();
    if (this.input.pressed("qa")) console.info("[dilemma] state", JSON.stringify(this.state()));

    this.governor.tick(f.frameMs);
    this.watchQuality(f.frameMs);
    if (!this.contextLost) this.renderer.render(this.scene, this.camera);
    readRenderStats(this.renderer, this.renderStats);
    this.sampleFrame(f.frameMs);
    this.overlay?.tick(f.frameMs);
    this.input.endFrame();
  };

  private readonly beforeStep = (dt: number): void => this.player.fixedUpdate(dt);

  private readonly afterStep = (): void => this.room.afterStep(this.player.collider);

  /** @frame */
  private watchQuality(frameMs: number): void {
    if (this.probe) {
      const tier = this.probe.tick(frameMs);
      if (tier === null) return;
      this.measured = this.probe.summary;
      this.probe = null;
      writeStoredTier(this.gpu, tier, this.storage);
      performance.mark("quality:measured");
      if (tier !== this.tier) this.applyTier(tier, "measured");
      else this.qualitySource = "measured";
      return;
    }
    const down = this.downgrade.tick(frameMs, this.governor.atFloor);
    if (down !== null) this.applyTier(down, "downgrade");
  }

  /** @frame */
  private sampleFrame(frameMs: number): void {
    if (frameMs <= 0) return;
    this.stats.push(frameMs);
    this.statsMs += frameMs;
    if (this.statsMs < STATS_WINDOW_MS) return;
    this.fps = Math.round((this.stats.count * 1000) / this.stats.totalMs);
    this.p95Ms = this.stats.p95();
    this.stats.reset();
    this.statsMs = 0;
  }
}

const SIZE_SCRATCH = new Vector2();

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Boot order (TEKNIK §2.5, FAZLAR F0): Rapier wasm starts streaming → WebGL2 renderer (caveat
 * attempt) → quality decision (`?q=` > caveat > stored for this GPU > heuristic; the 5 s probe only
 * when none of those applies and the page is not a child universe) → physics → test room → player.
 * Returns null without WebGL2 (the caller shows the barrier screen).
 */
export async function createGame(opts: GameOptions): Promise<Game | null> {
  const physicsPromise = initPhysics();
  const gl = createRenderer(opts.canvas);
  if (!gl) {
    // Rapier keeps loading in the background; nothing to free yet.
    physicsPromise.then((p) => p.dispose()).catch(() => undefined);
    return null;
  }
  performance.mark("boot:renderer");

  const gpu = readGpuName(gl.gl);
  const params = new URLSearchParams(opts.search);
  const forced = forcedTier(opts.search);
  const stored = readStoredTier(gpu, opts.storage);
  let tier: QualityTier;
  let source: QualitySource;
  if (forced) [tier, source] = [forced, "forced"];
  else if (gl.caveat) [tier, source] = ["low", "caveat"];
  else if (stored) [tier, source] = [stored, "stored"];
  else [tier, source] = [heuristicTier(deviceHints(gpu)), "heuristic"];
  const probe = source === "heuristic" && !params.has("u");

  const physics = await physicsPromise;
  performance.mark("boot:physics");
  const game = new Game({ opts, gl, physics, gpu, tier, source, probe });
  performance.mark("boot:ready");
  return game;
}
