#!/usr/bin/env node
// Turkish-character string literals in apps/dilemma/src/**/*.ts are an error: UI text belongs in
// locales/*.json (TEKNIK §6.2). Comments are ignored; `locales/` and `fixtures/` are skipped;
// a line ending with `// i18n-ok` is exempt.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const TURKISH = /[çğıöşüÇĞİÖŞÜ]/;
const EXEMPT_MARK = /\/\/\s*i18n-ok\s*$/;
const SKIP_DIRS = new Set(["locales", "fixtures", "node_modules"]);

/** Finds string/template literals containing Turkish characters. Returns [{ line, col, text }]. */
export function findTurkishLiterals(source) {
  const hits = [];
  const lines = source.split("\n");
  // Stack frames: "code" (with brace depth for `${ }`) or "template".
  const stack = [{ kind: "code", depth: 0 }];
  let i = 0;
  let line = 1;
  let col = 1;

  const advance = (n = 1) => {
    for (let k = 0; k < n; k++) {
      if (source[i] === "\n") {
        line++;
        col = 1;
      } else col++;
      i++;
    }
  };
  const record = (start, startLine, startCol, text) => {
    if (TURKISH.test(text) && !EXEMPT_MARK.test(lines[startLine - 1] ?? "")) hits.push({ line: startLine, col: startCol, text, start });
  };

  while (i < source.length) {
    const top = stack[stack.length - 1];
    const ch = source[i];
    const next = source[i + 1];

    if (top.kind === "template") {
      if (ch === "\\") {
        advance(2);
        top.text += source.slice(i - 2, i);
        continue;
      }
      if (ch === "`") {
        record(top.start, top.line, top.col, top.text);
        stack.pop();
        advance();
        continue;
      }
      if (ch === "$" && next === "{") {
        stack.push({ kind: "code", depth: 0, template: top });
        advance(2);
        continue;
      }
      top.text += ch;
      advance();
      continue;
    }

    // code
    if (ch === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") advance();
      continue;
    }
    if (ch === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      advance((end === -1 ? source.length : end + 2) - i);
      continue;
    }
    if (ch === '"' || ch === "'") {
      const startLine = line;
      const startCol = col;
      const start = i;
      advance();
      let text = "";
      while (i < source.length && source[i] !== ch && source[i] !== "\n") {
        if (source[i] === "\\") {
          text += source.slice(i, i + 2);
          advance(2);
        } else {
          text += source[i];
          advance();
        }
      }
      advance();
      record(start, startLine, startCol, text);
      continue;
    }
    if (ch === "`") {
      stack.push({ kind: "template", text: "", start: i, line, col });
      advance();
      continue;
    }
    if (ch === "{") top.depth++;
    if (ch === "}") {
      if (top.depth === 0 && top.template) {
        stack.pop();
        advance();
        continue;
      }
      top.depth--;
    }
    advance();
  }
  return hits.map(({ line: l, col: c, text }) => ({ line: l, col: c, text }));
}

function walk(dir, out) {
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(path, out);
    } else if (/\.(ts|mts|js|mjs)$/.test(name)) out.push(path);
  }
  return out;
}

export function scanDir(root) {
  const problems = [];
  for (const file of walk(root, [])) {
    for (const hit of findTurkishLiterals(readFileSync(file, "utf8"))) {
      problems.push({ file: relative(root, file).split(sep).join("/"), ...hit });
    }
  }
  return problems;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const repo = fileURLToPath(new URL("../..", import.meta.url));
  const root = process.argv[2] ? join(process.cwd(), process.argv[2]) : join(repo, "apps", "dilemma", "src");
  const problems = scanDir(root);
  for (const p of problems) console.error(`${p.file}:${p.line}:${p.col}: Turkish characters in string literal: ${JSON.stringify(p.text)}`);
  if (problems.length > 0) {
    console.error(`\ni18n scan: ${problems.length} literal(s) — move the text to locales/*.json (or mark the line // i18n-ok).`);
    process.exit(1);
  }
  console.log(`i18n scan: ok (${relative(repo, root).split(sep).join("/")})`);
}
