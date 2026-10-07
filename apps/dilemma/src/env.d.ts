/** Package version, with "+qa" (qa build) or "+dev" (dev server) suffix; injected by Vite `define`. */
declare const __APP_VERSION__: string;
/** True in the dev server and `--mode qa` builds, false in prod. Gates the dev handle and overlay. */
declare const __QA__: boolean;
