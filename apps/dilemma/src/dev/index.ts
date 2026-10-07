import type { Game } from "../game/Game";
import { installHandle } from "./handle";
import { createOverlay } from "./overlay";

/** Wires the F3 overlay and `window.__dilemma`. Loaded with a dynamic import under `__QA__` only. */
export function installDevTools(game: Game, root: HTMLElement): () => void {
  const overlay = createOverlay(root, () => game.state(), new URLSearchParams(location.search).has("overlay"));
  game.setOverlay(overlay);
  const uninstall = installHandle({
    version: __APP_VERSION__,
    goto: (x, z) => game.goto(x, z),
    state: () => game.state(),
    autoPause: (on) => game.setAutoPause(on),
    loseContext: () => game.loseContext(),
    restoreContext: () => game.restoreContext(),
  });
  return () => {
    uninstall();
    game.setOverlay(null);
    overlay.dispose();
  };
}
