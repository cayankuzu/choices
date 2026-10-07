# DİLEMMA — çalışma kuralları (Claude / ajanlar için)

Bu repo **DİLEMMA** oyunudur (Vite 8 + TypeScript 7 + three.js 0.186 + Rapier 0.21, framework'süz DOM UI).
Eski Next.js prototipi `archive/next-prototype/` altında yalnız referanstır (etiket `next-prototype-final`;
F4'te silinir); oradan kod devralınmaz ve kökten çalıştırılmaz.

## Belgeler ve öncelik
`docs/KANON.md` > `docs/ICERIK.md` > `docs/TEKNIK.md` > `docs/FAZLAR.md`. Çelişkide bu sıra.
Faz planı ve kabul listeleri `docs/FAZLAR.md`; tur notları `plan/TUR-F<faz>-T<n>.md`; regresyon listesi `plan/R-LIST.yaml`.

## Yerleşim
- `apps/dilemma` — oyun (dev 5181 · qa 4181 · prod 4182). `src/` modülleri küçük ve tek sorumlu.
- `apps/stresst` — sTressT git subtree, **birebir** (`npm run stresst:verify`); F10'a kadar dosyalarına dokunulmaz.
- `tools/*` — bench (bütçe), i18n (kaynak taraması), qa (regresyon), release (zip/başlık), assets (baseline).

## Kod kuralları
- TypeScript `strict`; `apps/dilemma` ayrıca `exactOptionalPropertyTypes` + `verbatimModuleSyntax`.
- UI metinleri anahtar tabanlı TR + EN (`locales/tr.json`, `locales/en.json`). Kaynak kodda Türkçe karakterli
  string literal **yasak** (`tools/i18n/scan.mjs` hata verir); yorumlar hariç, yorumlar kısa ve İngilizce.
- three.js / Rapier nesneleri snapshot'a girmez; her şey `dispose` edilir.
- Yeni kod için `node_modules/vite/`, `node_modules/vitest/` ve `node_modules/@playwright/test/` sürümlerinin
  kendi belgelerine bak; eğitim verisindeki eski API'lere güvenme.

## Doğrulama
Kökte `npm run check` yeşil olmadan "bitti" denmez. Playwright spec'leri gerçekten koşar (`npm run e2e`).
Her tur sonunda tek yerel commit (push yok); `node_modules`, `dist`, `.claude` asla eklenmez.
