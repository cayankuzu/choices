/** Logical actions; keyboard and mouse map onto these. */
export type Action = "forward" | "back" | "left" | "right" | "jump" | "run" | "crouch" | "interact" | "trigger" | "pause" | "overlay" | "qa";

const KEY_MAP: Record<string, Action> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  Space: "jump",
  ShiftLeft: "run",
  ShiftRight: "run",
  // Not Ctrl: Ctrl+W closes the browser tab and cannot be blocked.
  KeyC: "crouch",
  KeyE: "interact",
  // Dev/qa: fires the test choice card (T4).
  KeyT: "trigger",
  // Only reaches the page while the pointer is free (a locked pointer is released by Esc instead).
  Escape: "pause",
  F3: "overlay",
  F9: "qa",
};

/** Keys whose browser default (page scroll, find bar, dev panels) must never fire while playing. */
const PREVENT_DEFAULT = new Set(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "F3", "F9"]);

/** Mouse deltas above this on a single event are lock/unlock glitches, not movement. */
const MAX_DELTA = 400;

export type Axis = { x: number; y: number };

export class Input {
  /** When true, a click on the canvas requests pointer lock (the click is the user gesture). */
  captureOnClick = false;
  private readonly down = new Set<Action>();
  private readonly pressedEdges = new Set<Action>();
  private readonly releasedEdges = new Set<Action>();
  private lookX = 0;
  private lookY = 0;
  private readonly lockListeners = new Set<(locked: boolean) => void>();

  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    window.addEventListener("mousemove", this.onMouseMove);
    canvas.addEventListener("mousedown", this.onMouseDown);
    canvas.addEventListener("contextmenu", this.onContextMenu);
    document.addEventListener("pointerlockchange", this.onLockChange);
  }

  get locked(): boolean {
    return document.pointerLockElement === this.canvas;
  }

  /** Must be called from a user gesture. Resolves false if the browser refused. */
  async lock(): Promise<boolean> {
    if (this.locked) return true;
    try {
      // Older engines return nothing (lock follows asynchronously); bound the wait so a request
      // that never settles cannot stall the caller.
      let settled = false;
      const request = Promise.resolve(this.canvas.requestPointerLock()).then(() => {
        settled = true;
      });
      await Promise.race([request, new Promise<void>((resolve) => setTimeout(resolve, 2000))]);
      return settled || this.locked;
    } catch {
      // Browsers refuse a re-lock shortly after the user pressed Escape.
      return false;
    }
  }

  unlock(): void {
    if (this.locked) document.exitPointerLock();
  }

  onLock(listener: (locked: boolean) => void): () => void {
    this.lockListeners.add(listener);
    return () => this.lockListeners.delete(listener);
  }

  isDown(action: Action): boolean {
    return this.down.has(action);
  }

  pressed(action: Action): boolean {
    return this.pressedEdges.has(action);
  }

  released(action: Action): boolean {
    return this.releasedEdges.has(action);
  }

  /** Movement axes in [-1, 1] written into `out`: x = strafe right, y = forward. */
  moveAxis(out: Axis): Axis {
    const x = (this.down.has("right") ? 1 : 0) - (this.down.has("left") ? 1 : 0);
    const y = (this.down.has("forward") ? 1 : 0) - (this.down.has("back") ? 1 : 0);
    const len = Math.hypot(x, y) || 1;
    out.x = x / len;
    out.y = y / len;
    return out;
  }

  /** Mouse look accumulated since the last call (pixels), written into `out`. */
  consumeLook(out: Axis): Axis {
    out.x = this.lookX;
    out.y = this.lookY;
    this.lookX = 0;
    this.lookY = 0;
    return out;
  }

  /** Drives an action exactly like a key (automation, tests). */
  setAction(action: Action, isDown: boolean): void {
    if (isDown && !this.down.has(action)) {
      this.down.add(action);
      this.pressedEdges.add(action);
    } else if (!isDown && this.down.has(action)) {
      this.down.delete(action);
      this.releasedEdges.add(action);
    }
  }

  /** Clears per-frame edges; call once at the end of every frame. */
  endFrame(): void {
    this.pressedEdges.clear();
    this.releasedEdges.clear();
  }

  /** Drops all held input (menu opened, window blurred) so nothing stays "stuck" down. */
  releaseAll(): void {
    for (const action of this.down) this.releasedEdges.add(action);
    this.down.clear();
    this.lookX = 0;
    this.lookY = 0;
  }

  /** Removes every listener (the sTressT iframe takes the page over, or the game is disposed). */
  detach(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    window.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener("contextmenu", this.onContextMenu);
    document.removeEventListener("pointerlockchange", this.onLockChange);
    this.lockListeners.clear();
    this.releaseAll();
  }

  private isTyping(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement | null;
    return !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (this.isTyping(event)) return;
    const action = KEY_MAP[event.code];
    if (PREVENT_DEFAULT.has(event.code)) event.preventDefault();
    if (!action || event.repeat) return;
    this.setAction(action, true);
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    const action = KEY_MAP[event.code];
    if (action) this.setAction(action, false);
  };

  private readonly onMouseDown = (): void => {
    if (this.captureOnClick && !this.locked) void this.lock();
  };

  private readonly onContextMenu = (event: Event): void => event.preventDefault();

  private readonly onMouseMove = (event: MouseEvent): void => {
    if (!this.locked) return;
    if (Math.abs(event.movementX) > MAX_DELTA || Math.abs(event.movementY) > MAX_DELTA) return;
    this.lookX += event.movementX;
    this.lookY += event.movementY;
  };

  private readonly onBlur = (): void => this.releaseAll();

  private readonly onLockChange = (): void => {
    const locked = this.locked;
    if (!locked) this.releaseAll();
    for (const listener of this.lockListeners) listener(locked);
  };
}
