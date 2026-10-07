# DİLEMMA

Birinci şahıs, hep gece, iki seçenek. Masaüstü web tarayıcısı için (klavye + fare). Tasarım ve teknik sözleşme
`docs/` altındadır (`KANON.md` > `ICERIK.md` > `TEKNIK.md` > `FAZLAR.md`).

## Repo
- `apps/dilemma` — oyun (Vite 8, TypeScript 7, three.js 0.186, Rapier 0.21)
- `apps/stresst` — sTressT (git subtree, birebir; iframe ile gömülür — `plan/K1-KARAR.md`)
- `tools/*` — bütçe, i18n taraması, regresyon, sürüm, asset baseline
- `archive/next-prototype` — eski Next.js prototipi (yalnız referans; etiket `next-prototype-final`)

## Komutlar (kökte, Node ≥ 22)
```bash
npm install
npm run dev          # http://localhost:5181
npm run preview:qa   # qa build + http://localhost:4181 (overlay, __dilemma)
npm run preview      # prod build + http://localhost:4182
npm run check        # tsc ×2 + oxlint + vitest + vite build qa/prod + bütçe + i18n taraması
npm run e2e          # Playwright (chromium/firefox/webkit; qa build'i kendisi başlatır)
npm run test:stresst # sTressT vitest takımı (bench: npm run bench:stresst)
npm run stresst:verify
npm run regress
```
