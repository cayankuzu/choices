import { h, show } from "./dom";

/** Placeholder barrier (no WebGL2, boot failure). T3 replaces it with the real screens + Destek. */
export function barrier(root: HTMLElement, kind: string, text: string): HTMLElement {
  const el = h("div", { class: "barrier", attrs: { "data-screen": kind, role: "alert" } }, h("p", { text }));
  root.append(el);
  return el;
}

export type Hint = { set(text: string): void; show(visible: boolean): void; dispose(): void };

/** One-line hint over the canvas ("Click to play"); hidden while the pointer is locked. */
export function hint(root: HTMLElement): Hint {
  const el = h("div", { class: "hint", attrs: { "data-screen": "hint" } });
  el.hidden = true;
  root.append(el);
  return {
    set: (text) => {
      if (el.textContent !== text) el.textContent = text;
    },
    show: (visible) => show(el, visible),
    dispose: () => el.remove(),
  };
}
