# TUR F0-T1 — Repo dönüşümü

## Yapılanlar
- **Temizlik:** port 3000'deki Next dev süreç ağacı (npm → next → start-server → worker) kapatıldı; kök `node_modules`,
  `.next`, `tsconfig.tsbuildinfo` silindi.
- **Etiket + arşiv:** `next-prototype-final` (HEAD 69b7d62). Eski prototip `git mv` ile `archive/next-prototype/`
  altına: `src/`, `public/*.svg`, `next.config.ts`, `next-env.d.ts`, `postcss.config.mjs`, `eslint.config.mjs`,
  `tsconfig.json`, `package.json`, `package-lock.json`, `README.md` (başına "referans; F4'te silinir" notu),
  eski `AGENTS.md`.
- **sTressT subtree:** `git subtree add --prefix apps/stresst <sTressT> main --squash` (kaynak temizdi; fadbb1a v0.1.3 →
  squash d9f028d, merge 68ba83b). Dosyalara dokunulmadı. SHA-256 baseline `tools/assets/stresst.baseline.json`
  (291 dosya: src 87 + public 204); `npm run stresst:verify` → "identical".
- **Kök:** `package.json` (name dilemma, 0.0.1, engines ≥22, workspaces apps/*, tools/*; toolchain sürümleri kökte),
  `.gitignore`, `vitest.config.ts` (projeler: `apps/dilemma`, `tools`), `README.md`, `AGENTS.md` (DİLEMMA kuralları),
  `.github/workflows/check.yml`, `.claude/launch.json` (dilemma-dev 5181, dilemma-qa 4181).
- **apps/dilemma:** `package.json`, `tsconfig.json` (strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes +
  verbatimModuleSyntax, ES2022, bundler), `vite.config.ts` (Rapier wasm eklentisi yeniden yazıldı; `__QA__`, `__APP_VERSION__`
  (+qa/+dev); qa → `dist/qa`, prod → `dist/prod`; 5181 strictPort), `index.html` (lang=tr, `<title>DİLEMMA</title>`, `#app`),
  `src/main.ts` (boot işareti), `src/style.css` (system-ui yığını), `src/env.d.ts`, `public/_headers`,
  `vitest.config.ts`, `e2e/playwright.config.ts` (chromium SwiftShader, firefox WebGL prefs + MOZ_WEBRENDER=0, webkit;
  webServer `preview:qa` 4181), `e2e/console-allow.json` (boş), `e2e/boot.spec.ts` (@dom: başlık, lang, #app, boot mark,
  allow-list dışı 0 konsol).
- **tools/:** `bench/budgets.mjs` (merdiven F0 230 / F4 300 / F9 340 / F12 350 KB gzip; ilk yük ≤ 10 MB; dosya sayısı F4'ten
  itibaren), `i18n/scan.mjs` + `scan.test.mjs` (7 vaka), `qa/regress.mjs` (R-LIST okur, rapor eşler — iskelet),
  `qa/vitest.stresst.config.ts` + `vitest.stresst-bench.config.ts`, `release/zip.mjs` (iskelet), `release/verify-headers.mjs`
  (COOP / COEP / wasm MIME / immutable), `assets/stresst-baseline.mjs`. Her tools/* klasörü minimal workspace.
- **plan/:** `R-LIST.yaml` (R-00…R-22 birebir, auto: null), `ASSET-ISTEK-F0.md` (IBM Plex Sans satırı, onay bekler),
  `K1-KARAR.md` (iframe kararı), `R-00-ORTAM.md`.

## Kararlar
- `npm run check` = tsc ×2 (dilemma + stresst) + oxlint + vitest (dilemma + tools) + vite build qa + prod + budgets + i18n scan.
  sTressT testleri `npm run test:stresst` ile ayrı (76 vaka / 9 dosya yeşil); bench `BENCH=1 npm run bench:stresst`
  (PowerShell: `$env:BENCH=1; npm run bench:stresst`) — BENCH yoksa 4 vaka atlanır (sTressT'in kendi kapısı).
- qa ve prod ayrı outDir (`dist/qa`, `dist/prod`): check ikisini de üretir; budgets prod'u kapı yapar, qa'yı raporlar.
- `__QA__` dev sunucusunda da true (dev/qa tutamağı), yalnız prod'da false.
- i18n taraması: yorumlar ve `locales/`, `fixtures/` hariç; satır sonu `// i18n-ok` muafiyeti (marka "DİLEMMA" gibi).
- Vitest 5'te `vitest.workspace.ts` yok; kök `vitest.config.ts` `test.projects` kullanır.
- Kök `AGENTS.md` yeniden yazıldı (Next uyarısı arşive taşındı) — repo artık Next değil.
- sTressT baseline metin dosyalarını LF'ye normalize ederek hash'ler (Windows `core.autocrlf=true` checkout'u CRLF;
  CI Linux LF) — ikili dosyalar olduğu gibi. Böylece `stresst:verify` her platformda aynı sonucu verir.

## Doğrulama (yerel)
- `npm run check`: yeşil (tsc ×2, oxlint, vitest 1 dosya / 7 test, build qa + prod, budgets 0,4 KB / 230 KB, scan ok).
- `npm run e2e --project=chromium`: 1/1 geçti (12 s, webServer build dahil).
- `npm run test:stresst`: 9 dosya / 76 vaka geçti. `npm run stresst:verify`: 291 dosya birebir.
- `npm ls three`: tek kopya (0.186.1).

## Bilinen eksikler
- **Firefox 1543 ve WebKit 2359 bu makinede başlatılamıyor** (ayrıntı `plan/R-00-ORTAM.md`); chromium geçiyor. CI matrisi
  (ubuntu, `--with-deps`) ve yerel çözüm denemesi T5c'ye.
- Blender 4.2 ve toktx yok (F4'e kadar gerekmez).
- `regress.mjs` yalnız listeler; rapor dosyaları (`test-results/vitest.json`, `apps/dilemma/test-results/e2e.json`) henüz
  üretilmiyor — T6'da reporter'lar eklenir ve `auto` alanları doldurulur.
- `zip.mjs` iskelet (F15); `copy-stresst.mjs` F10.
- CI henüz koşmadı (push yok); lockfile Windows'ta üretildi — sharp/rolldown platform paketleri için ilk CI koşusu izlenmeli.
- `public/window-test.html` T5c'de.

## Sonraki tura notlar (T2 — motor)
- `src/engine/rapierWasm.ts` için `src/types/rapier-bindings.d.ts` (sTressT deseni) gerekecek; vite eklentisi hazır.
- `src/main.ts` şu an yalnız boot işareti; T2'de renderer/quality/clock/input/PlayerController/test odası/overlay/gök.
- `e2e/boot.spec.ts` "@dom" etiketli; WebGL isteyen yeni spec'ler webkit'te `test.skip`.
- Yeni test dosyaları `apps/dilemma/src/**/*.test.ts` (vitest projesi hazır; `passWithNoTests` T2'de kaldırılabilir).
- Kalite ölçüm sahnesi 5 sn (TEKNIK §2.2), kademeler §2.3.

## Komutlar
```bash
npm install
npm run dev            # 5181
npm run preview:qa     # 4181   | npm run preview  # 4182
npm run check
npm run e2e -- --project=chromium
npm run test:stresst   | BENCH=1 npm run bench:stresst
npm run stresst:verify | npm run regress | npm run budgets | npm run i18n:scan
node tools/release/verify-headers.mjs https://<preview-host>/
```
