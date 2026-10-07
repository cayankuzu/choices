import * as bindings from "@dimforge/rapier3d/rapier_wasm3d_bg.js";
import wasmUrl from "@dimforge/rapier3d/rapier_wasm3d_bg.wasm?url";

let ready: Promise<void> | null = null;

/**
 * Loads Rapier's WebAssembly with streaming compilation (compiles while it downloads) and hands it
 * to the JS bindings. Falls back to a plain fetch when the server does not send application/wasm.
 * Idempotent: later callers share the first load.
 */
export function initRapierWasm(): Promise<void> {
  ready ??= load();
  return ready;
}

async function load(): Promise<void> {
  const imports = { "./rapier_wasm3d_bg.js": bindings as unknown as WebAssembly.ModuleImports };
  let instance: WebAssembly.Instance;
  try {
    ({ instance } = await WebAssembly.instantiateStreaming(fetch(wasmUrl), imports));
  } catch {
    const bytes = await (await fetch(wasmUrl)).arrayBuffer();
    ({ instance } = await WebAssembly.instantiate(bytes, imports));
  }
  bindings.__wbg_set_wasm(instance.exports);
}
