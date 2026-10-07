import { describe, expect, it } from "vitest";
import { findTurkishLiterals } from "./scan.mjs";

const texts = (src) => findTurkishLiterals(src).map((h) => h.text);

describe("i18n scan", () => {
  it("flags double- and single-quoted literals with Turkish characters", () => {
    expect(texts('const a = "Başla";')).toEqual(["Başla"]);
    expect(texts("const b = 'Ayarlar — dil: Türkçe';")).toEqual(["Ayarlar — dil: Türkçe"]);
  });

  it("reports line and column", () => {
    const [hit] = findTurkishLiterals('const x = 1;\nconst y = "Çay";');
    expect(hit).toEqual({ line: 2, col: 11, text: "Çay" });
  });

  it("ignores comments", () => {
    expect(texts("// Başla\nconst a = t('menu.start'); /* Ayarlar\n Çay */")).toEqual([]);
  });

  it("flags template literals and strings nested in ${}", () => {
    expect(texts("const s = `Sürüm ${v}`;")).toEqual(["Sürüm "]);
    expect(texts('const s = `${ok ? "Çay" : "tea"} ready`;')).toEqual(["Çay"]);
    expect(texts("const s = `${fn({ a: 1 })} ok`;")).toEqual([]);
  });

  it("keeps the escaped quote inside the literal", () => {
    expect(texts('const s = "a\\"ş";')).toEqual(['a\\"ş']);
  });

  it("exempts lines marked // i18n-ok", () => {
    expect(texts('const brand = "DİLEMMA"; // i18n-ok')).toEqual([]);
  });

  it("passes ASCII-only sources and Turkish characters outside strings", () => {
    expect(texts('const k = "menu.start";\nconst re = /[çğ]/;')).toEqual([]);
  });
});
