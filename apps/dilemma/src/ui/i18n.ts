import en from "../locales/en.json";
import tr from "../locales/tr.json";

/** Key-based TR/EN (TEKNIK §6.2). Skeleton for T2; T3 adds the settings UI and `lang` handling. */
export type Language = "tr" | "en";

const DICTS: Record<Language, Record<string, string>> = { tr, en };
let current: Language = "tr";

export function detectLanguage(nav: Pick<Navigator, "language"> = navigator): Language {
  return /^tr\b/i.test(nav.language) ? "tr" : "en";
}

export function setLanguage(language: Language): void {
  current = language;
  document.documentElement.lang = language;
}

export function getLanguage(): Language {
  return current;
}

/** Missing keys fall back to EN, then to the key itself (visible in tests, never silent). */
export function t(key: string): string {
  return DICTS[current][key] ?? DICTS.en[key] ?? key;
}
