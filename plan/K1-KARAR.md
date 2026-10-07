# K1 — sTressT gömme kararı: iframe birincil

Kaynak: TEKNIK §1.5 (v1.2), KANON §11. Kayıt tarihi: F0-T1.

## Karar
sTressT, DİLEMMA içinde **iframe** olarak çalışır; süreç içi modül yolu terk edilmiştir.

- `apps/stresst` git subtree'dir (`git subtree add --prefix apps/stresst <sTressT> main --squash`, squash commit
  `d9f028d`, kaynak commit `fadbb1a` v0.1.3) ve **birebirdir**: SHA-256 baseline `tools/assets/stresst.baseline.json`
  (`npm run stresst:verify`).
- Build adımı (F10) `tools/release/copy-stresst.mjs`: `apps/stresst/dist` → `apps/dilemma/public/stresst/`
  (sTressT `base: "./"` olduğu için alt klasörde çalışır). ≈ 200 asset dosyası orada kalır, pack'e girmez.
- DİLEMMA tarafı `bridge/StressT.ts` (dinamik import, F10):
  `<iframe src="./stresst/index.html?q=<tier>&lang=<tr|en>" allow="pointer-lock; fullscreen">`;
  giriş/çıkış siyah göz kırpması 100/400/200 ms; iframe açılırken `setAnimationLoop(null)` +
  `forceContextLoss()` + `AudioContext.suspend()` + Input `detach()`; çıkışta `forceContextRestore()` + ısınma karesi.
  Böylece render eden WebGL bağlamı daima 1'dir.
- `postMessage` protokolü (origin kontrolü, zarf `{v, type, payload}`): iframe → ebeveyn
  `stresst:ready | exit | state-hash`; ebeveyn → iframe `stresst:pause | resume | quality`.
- sTressT'e eklenecek tek değişiklik (**F10'da, F0'da değil**): `apps/stresst/src/host-bridge.ts` (≤ 40 satır;
  `window.parent === window` ise no-op) + `main.ts`'e tek `import "./host-bridge"`. Pause menüsüne "Sokağa dön".
- "Birebir" kapısı: `apps/stresst` içinde fark yalnız bu iki dosya; vitest takımı (9 dosya, 76 vaka + 1 bench ayrı)
  değişmeden geçer; aynı profil + aynı seed ile 60 sn sonra `__stresst.state()` hash'i standalone ve iframe'de eşit.
- CR ↔ ₺ geçişi yok; sTressT IDB adı `stresst` ve `stresst.meta.v1` DİLEMMA'nın `dilemma@<pathHash8>` / `dilemma.*`
  anahtarlarıyla çakışmaz.

## Gerekçe (süreç içi modülün imkânsızlığı)
1. `Game.ts`'te `dispose()` yok; anonim `resize/visibilitychange/pagehide` dinleyicileri sızar.
2. `AudioManager` kendi `AudioContext`'ini kurar, dışarıdan almaz.
3. `assets.ts` yolları `import.meta.env.BASE_URL` ile çözer (≈ 200 dosya `public/` altına kopyalanmak zorunda kalırdı).
4. DİLEMMA'nın ek tsconfig bayrakları (`exactOptionalPropertyTypes`, `verbatimModuleSyntax`) sTressT kaynağını kırar;
   sTressT kendi `tsconfig.json`'ıyla derlenir.
5. `style.css` global kuralları ve `index.html` Google Fonts bağlantısı modül dışında kalır.

## Bedel
İkinci three.js kopyası ve ikinci WebGL bağlamı yalnız kapıdan girince, ayrı belgede yüklenir; DİLEMMA bağlamı o
sırada serbesttir. Archivo ve JetBrains Mono (OFL) satırları DİLEMMA lisans ekranına eklenir.

## F0'daki durum
Subtree eklendi, baseline alındı, kök `vitest` yapılandırması sTressT testlerini ayrı çalıştırır
(`npm run test:stresst`, bench `npm run bench:stresst`). sTressT kaynağına dokunulmadı (host-bridge yok).
