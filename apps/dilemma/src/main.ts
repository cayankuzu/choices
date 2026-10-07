import "./style.css";
import { createGame } from "./game/Game";
import { h } from "./ui/dom";
import { detectLanguage, setLanguage, t } from "./ui/i18n";
import { barrier } from "./ui/screens";

// Boot marker: read by the e2e boot spec and the qa overlay.
performance.mark("boot");
console.info(`[dilemma] boot ${__APP_VERSION__}`);

function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Boot order: WebGL2 gate → barrier placeholder (real screens in T3) → renderer → quality →
 * physics → test room → player → loop. `createGame` owns everything after the gate.
 */
async function boot(root: HTMLElement): Promise<void> {
  setLanguage(detectLanguage());
  if (typeof WebGL2RenderingContext === "undefined") {
    barrier(root, "unsupported", t("app.unsupported"));
    return;
  }
  root.append(h("canvas", { attrs: { id: "view" } }));
  const canvas = root.querySelector("canvas");
  if (!canvas) throw new Error("canvas missing");
  const game = await createGame({ root, canvas, search: location.search, storage: safeStorage() });
  if (!game) {
    // createRenderer may have swapped the element: remove whatever canvas is there.
    root.querySelector("canvas")?.remove();
    barrier(root, "unsupported", t("app.unsupported"));
    return;
  }
  game.start();
  if (__QA__) {
    const { installDevTools } = await import("./dev/index");
    installDevTools(game, root);
  }
}

const root = document.getElementById("app");
if (!root) throw new Error("#app missing");
boot(root).catch((error: unknown) => {
  console.error("[dilemma] boot failed", error);
  barrier(root, "boot-error", error instanceof Error ? error.message : String(error));
});
