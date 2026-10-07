type Child = Node | string | null | undefined | false;

type Props = {
  class?: string;
  text?: string;
  attrs?: Record<string, string>;
  onClick?: (event: MouseEvent) => void;
};

/**
 * Tiny element factory (sTressT pattern). Text always goes through textContent, never innerHTML,
 * so no dynamic string can inject markup.
 */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props.class) el.className = props.class;
  if (props.text !== undefined) el.textContent = props.text;
  if (props.attrs) for (const [k, v] of Object.entries(props.attrs)) el.setAttribute(k, v);
  const onClick = props.onClick;
  if (onClick) el.addEventListener("click", (event) => onClick(event as MouseEvent));
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child);
  }
  return el;
}

export function button(label: string, onClick: () => void, variant: "primary" | "ghost" | "danger" = "ghost"): HTMLButtonElement {
  return h("button", { class: `btn btn-${variant}`, text: label, attrs: { type: "button" }, onClick: () => onClick() });
}

export function show(el: HTMLElement, visible: boolean): void {
  el.hidden = !visible;
}

/** Writes text only when it changed (no layout work on identical frames). */
export function setText(el: HTMLElement, text: string): void {
  if (el.textContent !== text) el.textContent = text;
}
