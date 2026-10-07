# DİLEMMA — TEKNİK PLAN (TEKNIK.md) · v1.2

Resmî ad **DİLEMMA** (KANON). "Son Gün" eski çalışma adıdır; bu belgede, kodda, `package.json`'da, `<title>`'da ve itch sayfasında geçmez. Kod tanımlayıcıları ASCII `dilemma` (repo, paket, IndexedDB, localStorage önekleri, BroadcastChannel, dev tutamağı); görünen ad her dilde `DİLEMMA` (U+0130 noktalı İ; §6.2).

Kaynaklar: `docs/KANON.md` (her şeyin üstünde), `docs/ICERIK.md` (26 büyük seçim, 7 son, ekonomi, alarm), `docs/FAZLAR.md` (faz planı), `C:\Users\Cayan\Desktop\sTressT\{PERFORMANCE,ARCHITECTURE,TESTING}.md`, `sTressT/src/config/quality.ts`, `sTressT/vite.config.ts`, `sTressT/scripts/assets/*.mjs`, `sTressT/package.json`. Bu belge kod içermez; Fable 5'in yazacağı kodun sözleşmesidir. Her bölümün sonunda **Kabul** satırı vardır: faz testinde ölçülen şey odur.

**Faz numaraları:** bu belgedeki "Faz 0…5" kaba fazlardır; FAZLAR.md eşlemesi: Faz 0 = F0 · Faz 1 = F1–F3 · Faz 2 = F4–F6 · Faz 3 = F7–F8 · Faz 4 = F9 + F11 + F12 · Faz 5 = F10 + F13–F15.

**v1.2 değişiklikleri (eleştirmen bulguları):** sTressT gömme **iframe birincil** (§1.5); ölçüm sahnesi 5 sn ve uyanışa gömülü (§2.2); JS bütçe merdiveni ve dinamik import listesi (§2.1, §9.5); Blender blokaj betiği, bake bütçesi, bake `npm run check` dışında (§2.4, §9.1); VAT figüran kapısı F13 (§2.6); gök dönmez (§3.1); pencere sistemi: üçüncü taşıyıcı `opener.postMessage` snapshot handoff, iframe'de varsayılan emülatör, yetim ebeveyn kipi, `?u=` boot kuralları, `frames` deposu, donmada her kademede sahne boşaltma, `?noidb=1` (§4); `pointerLockLost` yalnız `idle` (§5.1); `est`, `signs[]`, iç ses, `schemaVersion` faz başına (§6); Kenney/Freesound fetcher'ları, `Data-Attribution` sınıfı, Mixamo/Sketchfab yasağı, SHA-256 baseline (§7); `npm run check` zip'siz, pack biçimi, dosya sayısı kapısı, qa build kipi, Playwright Firefox prefs/webkit kuralı, CI, GPU vekili + kalibrasyon, hata ekranı, `gc.test` (§9); riskler 18–20 (§10). Sayılar FAZLAR v2 ile birebirdir.

## 0. Karar özeti

| Konu | Karar |
|---|---|
| Yığın | Vite 8 + TypeScript 7 (`strict`) + three.js 0.186.x + Rapier 0.21 (WASM, ayrı dosya) + framework'süz DOM UI. sTressT ile aynı sürümler, aynı `vite.config.ts` eklentileri. |
| Repo | Tek repo `dilemma/`, npm workspaces: `apps/dilemma`, `apps/stresst` (git subtree, birebir), `tools/assets`, `tools/bake`, `tools/bench`, `tools/qa`, `tools/release`. |
| sTressT | **iframe** (`apps/stresst/dist` → `apps/dilemma/public/stresst/`), `postMessage` köprüsü; sTressT'e yalnız `src/host-bridge.ts` (≤ 40 satır) + `main.ts`'e 1 import. |
| Performans | D1 (Intel UHD 620) kararlı 30 fps, D2 (GTX 1050) 60 fps, D3 60+ fps. Üç kademe + dinamik çözünürlük + 5 sn ölçüm sahnesi. Oyun içeriği her kademede aynı. Gerçek D1 cihazı F4, F9, F13; arada GPU zamanlayıcı vekili × kalibrasyon. |
| Işık | Blender'da pişirilmiş lightmap + 4 kanallı lamba maskesi (lamba söndürme dinamik ışıksız). Sahnede en çok 1 yönlü + 2 nokta dinamik ışık. Blokaj `tools/bake/blockout.py` ile `layout.json`'dan. |
| Gök | 9.110 yıldızlık katalog (point sprite) + tek 2048×1024 KTX2 Samanyolu küresi + bölgeye bağlı ışık kirliliği + pozlama eğrisi + F13'te nebula sprite'ları. Ay yok. Gök dönmez. |
| Evren penceresi | `window.open` yalnız "Devam" tıklamasında; IndexedDB tek doğruluk kaynağı; BroadcastChannel + `opener.postMessage` snapshot handoff; render eden WebGL bağlamı daima 1; derinlik ≤ 4; engellenince ya da iframe içinde aynı sekmede dal emülatörü. |
| İçerik | JSON içerik + TS tipleri; TR/EN anahtar tabanlı; vitest içerik testleri (2 seçenek, tek hayatta kalış, erişilebilirlik, bayrak okunurluğu, süre `est`). |
| Build kipleri | dev (5181) · **qa** (4181; overlay, `__dilemma`, `?q=`, `?noidb=`, `?bench=`) · prod (4182; tutamaksız). |
| Yayın | Cloudflare Pages (ücretsiz web, `_headers`; F15'e kadar Cloudflare Access) + itch.io (aynı zip, "istediğin kadar öde"). Vercel Hobby kullanılmaz. |

---

## 1. Yığın kararı

### 1.1 Vite + TypeScript + three.js
sTressT'in kanıtlanmış yığını olduğu gibi alınır: `vite@8.3.x`, `typescript@7.0.x`, `three@0.186.1` (+ `@types/three@0.186`), `@dimforge/rapier3d@0.21.0`, `vitest@5`, `oxlint@1`. Sürümler kök `package.json`'da tek yerden sabitlenir; iki uygulama aynı three.js kopyasını kullanır (`npm ls three` tek sonuç). `tsconfig` sTressT'inki (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`, `isolatedModules`) + iki ek **yalnız `apps/dilemma` için**: `exactOptionalPropertyTypes`, `verbatimModuleSyntax` (sTressT kendi tsconfig'iyle derlenir; bayraklar ona uygulanmaz). Build hedefi `es2020`.

### 1.2 Fizik: Rapier, tek motor
Karar **(a) Rapier WASM**: sTressT Rapier 0.21'i zaten getiriyor (3,1 MB wasm, 1,2 MB gzip; `engine/rapierWasm.ts` `instantiateStreaming`, MIME yoksa `arrayBuffer` yedeği). sTressT'in `PlayerController` (kinematik kapsül r 0,3 / halfHeight 0,6, göz 1,62 m, 2 cm skin, çömelme, autostep 0,35 m; yürüme 3,4 / koşu 5,2 / çömelme 1,8 m/s; zıplama 3,6) ve `physics.advance` (sabit 1/60 s, en çok 3 adım, interpolasyon) ölçülmüş: UHD 620'de oyun mantığı + fizik ≈ 1 ms.
- Araç: Rapier `DynamicRayCastVehicleController` (4 tekerlek ışını, yay/damper) + arcade katmanı: hıza bağlı direksiyon kısıtı (120 km/s'de 0,35×), kavrama eğrisi, 0→100 km/s 6 s, azami 120 km/s, geri 25 km/s. "Hız > 80 km/s" kuralı (B25, B27) bu katmandan okunur. B planı (F7-T2 kapısı): 2B bisiklet modeli + 4 zemin ışını, Rapier yalnız çarpışma.
- Çarpma algısı: contact-force olayları. Vagon/makas sahnesi (B17) ray üzerinde kinematik gövdedir.
- Dünya tek Rapier `World`; bölge streaming collider ekler/çıkarır (§2.7). Yamaç heightfield, mimari merge edilmiş trimesh, props hull/box. Fizik ana thread'de.
(b) özel kapsül yalnız B planıdır: Rapier'in 1,2 MB'ı §2.5 ölçümünde sığmazsa ev içi prolog Rapier'siz başlar.

### 1.3 UI: framework'süz DOM
sTressT `ui/dom.ts` deseni: `h()`, `button()`, `show()`; metin yalnız değiştiğinde yazılır. 0 KB çalışma zamanı; altyazılar DOM metni (Türkçe karakter, satır kırma, ekran okuyucu bedava); HUD 10 Hz; süre çubuğu her karede `transform: scaleX`. Hata ekranı (`ui/ErrorScreen.ts`) da DOM'dur ve WebGL olmadan çalışır.

### 1.4 Neden Next.js/React değil
Mevcut `choices-main` (Next 16.2 + React 19 + R3F + drei + @react-three/rapier + zustand + Tailwind 4): react + react-dom ≈ 45 KB gzip, R3F ≈ 20 KB, drei 50–150 KB (sTressT'in tüm oyunu + three 286 KB gzip); `useFrame`/reconciler kare başı tahsis (§2.9 uygulanamaz; D1'de GC 8–20 ms); SSR gürültüsü; `output: "export"` + `?u=` yönlendirmeleriyle çakışma; `rapierWasm()` Vite eklentisi; AGENTS.md'nin uyardığı API kayması. Sonuç: `choices-main` yalnız referans (etiket `next-prototype-final`, `archive/next-prototype/`, F4'te silinir); kod devralınmaz.

### 1.5 Repo yerleşimi ve sTressT'in gömülmesi (iframe)
```
dilemma/
  package.json            # workspaces: apps/*, tools/*; three/rapier/vite sürümleri burada sabit
  apps/dilemma/           # ana oyun (Vite). src/{core,engine,world,player,vehicle,sky,universe,choice,cutscene,content,narration,ui,audio,save,bridge,scripted,restaurant,npc,alarm,economy,dev}
  apps/stresst/           # C:\Users\Cayan\Desktop\sTressT birebir (git subtree add --prefix apps/stresst <repo> main --squash)
  tools/assets/           # sTressT scripts/assets'in kopyası; --app dilemma|stresst; pack.mjs, vat.mjs
  tools/bake/             # blockout.py (layout.json → zone.glb/col/json), bake_zone.py (Cycles lightmap + lamba maskesi)
  tools/bench/            # ?bench=1 koşusu, budgets.mjs, gpu.ts (zamanlayıcı vekili), calib.json, flash.mjs, reports/
  tools/qa/               # regress.mjs (R-LIST.yaml + rapor §3)
  tools/release/          # zip.mjs, verify-headers.mjs, copy-stresst.mjs
  tools/i18n/             # scan.mjs (kaynakta Türkçe string literal denetimi)
```
**Karar: iframe birincil.** Kod denetimi sTressT kaynağında süreç içi modülü imkânsız kılan beş gerçeği doğruladı: `Game.ts`'te `dispose()` yok (anonim `resize/visibilitychange/pagehide` dinleyicileri sızar); `AudioManager` kendi `AudioContext`'ini kurar, dışarıdan almaz; `assets.ts` yolları `import.meta.env.BASE_URL` ile çözer (≈ 200 dosya `public/` altına kopyalanmak zorunda kalırdı); DİLEMMA'nın ek tsconfig bayrakları sTressT kaynağını kırar; `style.css` global kuralları ve `index.html` Google Fonts bağlantısı modül dışında kalır. Bu yüzden:
- Build adımı `tools/release/copy-stresst.mjs`: `apps/stresst/dist` → `apps/dilemma/public/stresst/` (sTressT `base: "./"` olduğu için alt klasörde çalışır). sTressT'in ≈ 200 asset dosyası orada kalır, pack'e girmez.
- DİLEMMA `bridge/StressT.ts` (dinamik import): `<iframe src="./stresst/index.html?q=<tier>&lang=<tr|en>" allow="pointer-lock; fullscreen">`; giriş/çıkış siyah göz kırpması 100/400/200 ms (toplam ≤ 0,8 sn + yükleme); iframe açılırken `renderer.setAnimationLoop(null)` + `renderer.forceContextLoss()` + `AudioContext.suspend()` + DİLEMMA Input `detach()`; çıkışta `forceContextRestore()` + ısınma karesi (§2.8).
- `postMessage` protokolü (origin kontrolü, zarf `{v, type, payload}`): iframe → ebeveyn `stresst:ready | exit | state-hash`; ebeveyn → iframe `stresst:pause | resume | quality`. Ebeveyn donunca (§4.4) `pause`; sTressT'in kendi autoPause'u sekme gizlenince zaten çalışır.
- sTressT'e eklenen: `apps/stresst/src/host-bridge.ts` (≤ 40 satır; `window.parent === window` ise no-op; mesajları dinler; pause menüsüne "Sokağa dön" düğmesini DOM'a ekleyip `exit` yollar) + `main.ts`'e tek `import "./host-bridge"` satırı. sTressT'in IDB adı `stresst` ve `stresst.meta.v1` anahtarı DİLEMMA'nınkilerle çakışmaz; CR ↔ ₺ geçişi yok.
- Bedel: ikinci three.js kopyası ve ikinci WebGL bağlamı yalnız kapıdan girince, ayrı belgede yüklenir (DİLEMMA bağlamı o sırada serbesttir → render eden bağlam yine 1). sTressT'in Google Fonts bağlantısı sTressT'teki gibi kalır; Archivo ve JetBrains Mono OFL satırları DİLEMMA lisans ekranına eklenir.
- **"Birebir" kapısı:** `apps/stresst` içinde `git diff --stat` yalnız `src/host-bridge.ts` ve `src/main.ts` (1 satır) gösterir; sTressT'in vitest takımı (10 dosya; 76 vaka + 1 bench ayrı) değişmeden geçer; aynı profil + aynı seed ile 60 sn sonra `__stresst.state()` hash'i standalone ve iframe'de eşit.

**Kabul (Faz 0):** `npm run check` kökte iki uygulamayı derler; `apps/dilemma/dist` qa ve prod kipleriyle açılır, allow-list dışı 0 konsol hatası; `<title>` ve ana menü logosu `DİLEMMA`; iframe kararı raporda yazılı.

---

## 2. "DOOM gibi" performans sözleşmesi

### 2.1 Cihaz sınıfları ve hedefler

| | D1 — entegre | D2 — orta | D3 — modern |
|---|---|---|---|
| Örnek donanım | i5-8250U + Intel UHD 620 (kabul edilen eşdeğerler: UHD 630, Iris Plus 640/655, AMD Vega 8), 8 GB paylaşımlı, 1366×768, Chrome | i5 + GTX 1050 / RX 560 / Iris Xe, 16 GB, 1920×1080 | RTX 2060+, Apple M1+, 1440p–4K |
| Kare hedefi | 30 fps kararlı; %1 düşük ≥ 24; p95 ≤ 36 ms | 60 fps; %1 düşük ≥ 45; p95 ≤ 19 ms | 60 fps; p95 ≤ 17 ms |
| İç çözünürlük | 0,75× (1024×576), taban 0,5× | 1,0×, taban 0,65× | DPR'ye kadar, üst 1,5×, taban 0,85× |
| Görünür üçgen | ≤ 150 k | ≤ 350 k | ≤ 600 k |
| Draw call | ≤ 120 | ≤ 250 | ≤ 400 |
| Doku belleği (GPU) | ≤ 160 MB | ≤ 300 MB | ≤ 500 MB |
| Toplam GPU belleği | ≤ 350 MB | ≤ 600 MB | ≤ 1 GB |
| JS heap (aktif sekme) | ≤ 250 MB | ≤ 350 MB | ≤ 400 MB |
| JS heap (dondurulmuş sekme) | ≤ 80 MB | ≤ 80 MB | ≤ 80 MB |
| İlk yük | ≤ 1,5 MB başlığa / ≤ 10 MB oyuna | aynı | aynı |
| İlk etkileşim | Başlık ≤ 3 s (20 Mbps); "Başla" → kontrol ≤ 8 s soğuk, ≤ 3 s sıcak | ≤ 2 / ≤ 5 / ≤ 2 s | aynı |

D1 kare bütçesi (33,3 ms): oyun mantığı 2 ms, fizik 2 ms, sahne gezintisi + draw gönderimi 6 ms, GPU 18 ms (gök 0,6; mimari 8; props + figüran 4; post 2; UI 0,5), pay 5 ms. GC hedefi 0 ms (§2.9).

**JS bütçe merdiveni (gzip, başlangıç parçası):** F0 ≤ 230 KB · F4 ≤ 300 KB · F9 ≤ 340 KB · F12 ≤ 350 KB. Yol bazlı dinamik import zorunlu: `vehicle/*` (F7), `restaurant/*` (F9), `bridge/StressT` (F10), `scripted/Edge*` (F8), `locales/<lang>.json`, `content/choices/*.json` bölgeye göre; `choice-engine`, `universe`, `ErrorScreen` başlangıçta kalır. Her faz raporu "başlangıç parçası / toplam JS" iki sayı verir. İlk yük dökümü (≤ 10 MB): JS 350 KB + CSS/HTML 15 KB + yazı tipi 80 KB + Rapier 1,2 MB + Basis transcoder 0,5 MB + gök 1,8 MB + ev bölgesi 2,5 MB + ilk ses paketi 1,2 MB + UI dokuları 0,2 MB ≈ 7,9 MB. Başlık yalnız JS + CSS + yazı tipi + bir 1280×720 WebP (120 KB) ile açılır.

### 2.2 Otomatik kalite algılama
1. Boot'ta sTressT `detectQuality()` sezgiseli (çekirdek, `deviceMemory`, GPU adı; `?q=` zorlaması) ilk kademeyi seçer.
2. **5 sn ölçüm sahnesi**: ilk 2 sn (shader ısınması) atılır, 3 sn'nin (≈ 180 kare) medyanı ve p95'i alınır. F0'da Başla'dan sonra test odasında; **F1'den itibaren uyanış ara sahnesine gömülüdür** (giriş zaten kapalı; artan 1,5 s siyahtan açılışa eklenir) — böylece "Başla → kontrol ≤ 8 s" korunur. p95 > bütçenin 1,15 katı → bir kademe düş; medyan < 0,5 katı ve kademe < Yüksek → bir kademe çık. Sonuç `localStorage["dilemma.quality.v1"] = {tier, gpuHash, measuredAt}`; aynı GPU'da yeniden ölçülmez; `?u=` ile açılan çocuk sayfa ölçmez.
3. Oyun içinde `ResolutionGovernor` (0,05 adım / 0,5 sn / 2 sn histerezis; düşüş kare süresini iyileştirmediyse geri alınır) ve yalnız **düşüş yönlü** otomatik kademe değişimi: tabanda 30 sn p95 > 1,15× → kademe düşer, toast ile bildirilir.

### 2.3 Kalite kademeleri (içerik, NPC ve figüran sayısı her kademede aynı)

| | Düşük | Dengeli | Yüksek |
|---|---|---|---|
| Pixel ratio üst / taban | 0,75 / 0,5 | 1,0 / 0,65 | 1,5 / 0,85 |
| Gölge | yok (blob decal) | 1 yönlü, 1024, `ShadowScheduler` | 2048 + far spotu 512 |
| Post-process | yok | vinyet + tane + FXAA tek geçiş | yarım çözünürlük bloom (3 mip) + vinyet + tane; MSAA 4× |
| Figüran gövdesi | 900 üçgen, gölgesiz | 1.500, gölgesiz | 1.500, gölgeli |
| Gök katmanları | yıldız 3.000 + Samanyolu 1024 | yıldız 9.110 + doku 2048 + kirlilik | hepsi + meteor + ufuk parıltısı + nebula |
| Parçacık çarpanı | 0,4 | 0,8 | 1,0 |
| Anizotropi | 1 | 2 | 4 (destek varsa 8) |
| Sis | lineer, 90 m | exp2 | exp2 + yükseklik sisi |
| LOD mesafe çarpanı | 0,7 | 1,0 | 1,3 |
| Prop albedo üst boyutu | 512 | 512 | 1024 |
| Dinamik nokta ışık | 1 | 2 | 2 |

"Çok düşük" kademesi (yalnız F13 kapısı kırmızıysa): 0,4×, sis 60 m, LOD 0,5, gök 1024, lightmap 1024. Figüran sayısı ICERIK §5.3 alarm tablosundan gelir (A0'da 8–14) ve kademeden bağımsızdır.

### 2.4 Işık: pişmiş + az dinamik
- **Blokaj:** dört dış bölge ve sonrakiler Blender arayüzünde elle modellenmez. Claude `content/zones/<zone>.layout.json` yazar (kutu/yol/lamba/çapa/kapı hücresi listesi); `tools/bake/blockout.py <zone>` headless Blender ile `zone.glb` + `zone.col.glb` + `zone.json` üretir. Çayan Blender'da yalnız isterse süsler; süslemeler aynı betikle yeniden dışa aktarılır.
- **Bake:** `blender -b zone.blend -P tools/bake/bake_zone.py`: Cycles CPU, 128 örnek + OIDN denoise, 2048×2048 lightmap (RGBM8, KTX2 UASTC) + **lamba maskesi** (en çok 4 lamba grubu, tek 1024×1024 RGBA, grup başına kanal). Bütçe: chunk başına ≤ 10 dk; aşarsa 1024² ve F4-T4 B planı (vertex AO + lamba maskesi vertex renginde; "lamba söndür" korunur). Shader: `light = lightmap + dot(lampMask, uLampOn)`. Lambayı vurmak = `uLampOn[g] = 0` (0,3 sn) + emissive söner + bölge kirliliği −0,08 → dinamik ışıksız, 0 ek draw call. **Bake ve asset işleme `npm run check` dışındadır** (`npm run bake`, `npm run assets`).
- Dinamik: 1 yönlü "yıldız ışığı" (0,15; gölge yalnız Dengeli+), en çok 2 nokta ışık (far çifti tek spot; namlu parlaması 80 ms). Mimari `MeshLambertMaterial`, yalnız kahraman props'larda `MeshStandardMaterial`.
- F4 bake hattı hazır olana kadar (F1–F3): chunk başına en çok 4 gölgesiz nokta ışık + hemisfer; F4 kapanışında lightmap (ya da B planı) zorunlu.

### 2.5 Yük sırası ve ölçüm
`index.html` → CSS + yazı tipi → `main.js` (başlık DOM'u) → Rapier wasm (arka planda) → gök dokusu → ilk bölge paketi → ses paketi 1. "Başla"ya kadar ilerleme yüzdesi (`boot.*` ad alanı; yasak kelime kapsamı dışında). `performance.mark` `boot:title`, `boot:ready`, `game:control`. Ölçüm DevTools 20 Mbps/40 ms profiliyle.

### 2.6 Instancing, LOD, karakterler, sıkıştırma
- Tekrarlayan props chunk başına `InstancedMesh`; tekil props materyal başına `BatchedMesh`; mimari materyal başına tek mesh.
- LOD: `process.mjs` her prop için 3 çıktı (oran 1 / 0,4 / 0,15; meshopt simplify); geçiş 0–25 / 25–70 / 70 m+; 70 m ötesinde 0,3 m'den küçük props çizilmez.
- Karakterler: isimli kadro `SkinnedMesh` (≤ 6.000 üçgen, ≤ 40 kemik, 2 materyal, LOD1 2.000), bölge başına en çok 4 isimli NPC. Animasyon kaynağı **Quaternius Universal Animation Library (CC0)** → Universal Base Characters rig'i. **Figüranlar F4–F12'de 3 kemikli basit `SkinnedMesh`** (4 model × 3 doku, ≤ 14 draw call); **VAT** (vertex animation texture 256×64 RGBA16F, `InstancedMesh`, 3 kıyafet = 3 draw call, kemik yok) **F13 kapısıdır** (`tools/assets/vat.mjs` + `npc/ExtrasVat.ts`); kesme planı 6 VAT'ı F13'te düşürebilir.
- Geometri: `quantize()` + `meshopt()`; decoder 20 KB. Draco yok.
- Doku: KTX2/Basis. Albedo ETC1S (512² + mip = 171 KB GPU); normal, lightmap, gök UASTC. `KTX2Loader` 2 worker. D1 bellek matematiği ≈ 74 MB (bütçe 160).

### 2.7 Bölge streaming ve paketleme
10 bölge; her bölge 1–3 chunk (≈ 40×40 m). **Paket biçimi (F4'ten itibaren, `tools/assets/pack.mjs`):** bölge başına `zone.pack` (GLB'ler + LOD'lar + KTX2'ler ardışık, 16 bayt hizalı) + `zone.index.json` (ad → ofset/uzunluk); `Assets` paketten `ArrayBuffer.slice` ile yükler. Sesler bölge başına `sfx.pack` + indeks; `decodeAudioData` dilimden. `zone.json` (instance listeleri, collider proxy'leri, markers, `signs[]`, `pollution`, komşu geçiş süreleri) ayrı küçük dosya.

Komşuluk grafı; yüklü küme = bulunulan bölge + komşular (uzak hal LOD2, lightmap'siz). İki sıçrak ötesi 20 sn histerezisle boşaltılır. KTX2 ve meshopt worker'da; GPU yükleme kare başına ≤ 2 mesh + 1 doku, collider ≤ 8. Araçla 120 km/s'de sınıra 100 m kala yükleme. Aynı anda ≤ 2 tam bölge + 3 uzak hal.

### 2.8 Culling ve shader
Frustum nesne başına; mesafe kesimi props'ta; hücre/kapı kuralı (iç mekânlar hücredir; kapı kapalıyken dış chunk'lar `visible=false`). GPU occlusion sorgusu yok. Shader ön-derleme: `renderer.compileAsync(zoneScene, camera)` + ısınma karesi (2×2 render hedefine her materyalden 1 gerçek çizim). Oyun sırasında derleme 0 ms; `programs` sayacı sabit kalmalı.

### 2.9 GC baskısı
Kare döngüsünde `new`, closure, `map/filter/spread` yasak; scratch havuzları modül düzeyinde; parçacık, ses ve altyazı satırı sabit boy havuz; Rapier `Ray`/`QueryFilter` yeniden kullanılır. Denetim: `gc.test.ts` (vitest; `/** @frame */` ile işaretli fonksiyon gövdelerini `typescript` API'siyle tarar; `NewExpression`, `ArrowFunction`, `.map/.filter/...spread` → kırmızı). Çalışma zamanı: `?bench=1` koşusunda 60 sn heap büyümesi ≤ 2 MB/sn; 30 dk soak ±%10.

### 2.10 WebGL2 zorunluluğu ve tarayıcı farkları
- `WebGLRenderer({ powerPreference: "high-performance", failIfMajorPerformanceCaveat: true })`; yoksa caveat'siz ikinci deneme; o da yoksa DOM engel ekranı. Caveat'li bağlamda Düşük 0,5× + uyarı.
- Mobil (`pointer: coarse`, `any-pointer: fine` yok) → engel ekranı.
- Safari: `window.open` yalnız tıklamanın senkron parçasında; `deviceMemory` yok; `requestIdleCallback` polyfill; BC7 yok. Firefox: `performance.memory` yok; GPU adı gizli → ölçüm sahnesi belirler.
- `webglcontextlost` yakalanır, `webglcontextrestored`'da doku/geometri yeniden yüklenir; 5 s içinde gelmezse "Yenile".
- **Hata ekranı** (`ui/ErrorScreen.ts`, F0): tetikler `window.onerror`, `unhandledrejection`, chunk/paket fetch 3 denemede başarısız, IDB put reddi (`QuotaExceededError`), snapshot > 64 KB; düğmeler "Yenile" / "Son evrene dön" (`meta.run.lastActiveUniverse`) / "Hatayı kopyala" (sürüm + commit + son 20 konsol satırı); Destek şeridi görünür.

**Kabul (her faz):** `?bench=1` koşusu (60 sn kamera rayı, 8 kontrol noktası) `tools/bench/reports/<tarih>-<gpu>.json` üretir: p95, draw, üçgen, GPU bellek tahmini, heap ve GPU zamanlayıcı ms (§9.5). F4, F9, F13'te gerçek D1 cihazında p95 ≤ 36 ms; aradaki fazlarda vekil × katsayı ≤ 18 ms GPU ("tahmin" etiketli).

---

## 3. Hep gece gökyüzü

### 3.1 Katmanlar
| Katman | Yapı | Kaynak / lisans | Boyut | D1 maliyeti |
|---|---|---|---|---|
| Yıldızlar | `Points` + özel shader; ra/dec → birim vektör, kadir, B–V rengi (16 girişli LUT), parıltı fazı | Yale Bright Star Catalogue 5 (9.110 yıldız; CDS V/50) — `Data-Attribution` sınıfı, atıf "Hoffleit & Warren 1991, CDS V/50" | 73 KB | 1 draw, ≤ 0,1 ms |
| Samanyolu | İçe dönük küre, 2048×1024 equirect KTX2 UASTC, `depthWrite=false`, en son çizilir | ESO/S. Brunier panoraması, CC BY 4.0 (atıf lisans ekranında) | ≈ 1,8 MB / 3,6 MB GPU | 1 draw, 0,2–0,4 ms |
| Işık kirliliği | Aynı küre shader'ında: `glow = uPollution * pow(1 - max(dir.y, 0), 3) * sodyumRengi`; kadir sınırı `mix(3.5, 6.5, 1 - uPollution)` | shader | 0 | +0,05 ms |
| Ufuk silueti | 2048×256 alfa şerit, bölgeye göre varyant | kendi | 60 KB | 0 |
| Meteor | 1 sprite, 90–240 sn'de bir, ömür 0,6 s; Yüksek'te iz | kendi | 2 KB | 1 draw |
| Nebula/galaksi (F13) | 4 sprite 512² RGBA (1 Andromeda-benzeri, 3 bulutsu); yalnız `pollution ≤ 0,25` ve `eyeAdapt > 0,5`; Dengeli + Yüksek | kendi ya da ESO CC BY 4.0 | ≈ 0,5 MB | ≤ 0,1 ms |
| Dikiş çizgisi (yalnız Dünya Kenarı) | `uSeam` uniform: ufka 10° yakın tek ince çizgi | shader | 0 | 0 |
| Toplam | | | ≈ 2,5 MB | ≤ 0,6 ms |

Ay yok. **Gök sabittir: yıldızlar kaymaz** (ICERIK §4.2-10 SOMA ipucu). "Gök yaşar" = `eyeAdapt` (§3.3) + meteor + ışık kirliliği + nebula belirmesi.

### 3.2 Bölgeye göre ışık kirliliği
`zone.json` `pollution` (0–1): Meydan 0,9, Mahalle Caddesi 0,8, Eski Çarşı 0,75, Okul Yolu 0,6, Ferman'ın evi 0,55, Atölye Sokağı 0,5, Yamaç 0,25, Dünya Kenarı 0,15, Uçurum 0,1. En yakın iki bölge merkezi arasında interpolasyon + 2 sn zaman sabiti; sönen lamba grubu −0,08.

### 3.3 Karanlığa alışma = pozlama eğrisi
`eyeAdapt` (0–1): kamera konumunda lightmap'ten örneklenmiş ortam parlaklığı eşik 0,12'nin altındaysa 20 sn sabitiyle 1'e, üstündeyse 2 sn'de 0'a. `toneMappingExposure = mix(1.0, 1.7, eyeAdapt)`, kadir sınırı +1,0, Samanyolu ×(1 + 0,6). Uzun far `eyeAdapt`'ı 2 s'de sıfırlar. Ek maliyet 0.

**Kabul (Faz 1):** ev önünde 20 sn hareketsiz beklendiğinde gök görünür biçimde açılır; Meydan'da kadir > 3,5 yıldızlar görünmez; gök toplamı D1'de ≤ 0,6 ms (ya da açık/kapalı fark ölçümü). **F13:** Yamaç'ta 60 sn beklenince en az 1 nebula seçilebilir.

---

## 4. Pencere (evren) sistemi

### 4.1 Tetik: yalnız kullanıcı jesti
Büyük seçim → ara sahne → iki seçenek + süre çubuğu → tıklama veya zar → zar ekranı (2 s) → **"Devam"**. `window.open` yalnız bu düğmenin `click` handler'ının **senkron** gövdesinde (snapshot yazımı tıklamadan önce bitmiştir). Evren modu ayarı: "yeni sekme / yeni pencere / hep aynı sekme"; **`window !== window.top` (itch iframe) ise varsayılan "hep aynı sekme" (emülatör)** — oyuncu "yeni sekme"yi seçerse §4.3 handoff yolu kullanılır. URL `/?u=<universeId>#n=<nonce>`. **Destek** bağlantısı evren değildir: `window.open(url, "_blank", "noopener,noreferrer")`, hiçbir saati durdurmaz.

### 4.2 Veri modeli (IndexedDB)
Depo adı `dilemma@<pathHash8>` (`location.pathname` FNV-1a ilk 8 hanesi); `localStorage` anahtarları `dilemma.*`.
```
universes:  { id, runId, parentId|null, depth(0..4), choiceId, optionIndex(0|1), status: "active"|"frozen"|"ended"|"closed", passedNextBig, endingId|null, createdAt, updatedAt }
snapshots:  { universeId, v, state: GameState }     // structured clone; Three/Rapier nesnesi YOK; ≤ 64 KB
frames:     { universeId, jpeg: Blob }               // donma görüntüsü, ≤ 150 KB; snapshot'tan ayrı
choices:    { universeId, choiceId, locked: [bool, bool], childIds: [id|null, id|null], resolvedBy: "click"|"dice"|null }
meta:       { key: "run", runId, rootUniverseId, rootSeed, language, lastActiveUniverse, createdAt }
```
`GameState`: bayraklar, envanter (₺ tam sayı), konum/bakış, bölge, alarm + gevşeme sayacı, gizli sayaçlar (kalan ms), ziyaret edilen düğümler, RNG imleçleri, `eyeAdapt`, evren meta. `universeId = "u-" + 8 hane base32`. **`schemaVersion` her faz kapanışında artar** (F0 = 1 … F12 = 13); `migrate(v)` + `validateState`; her ONAY'da o fazın gerçek bir kaydı `src/save/fixtures/save-F<n>.json` olarak dondurulur ve `universe.test` tüm fixture'ları açar. Eski kayıt açılamazsa tek ekran "Eski kayıt sıfırlandı", konsol 0 hata. **Autosave** (F1): `pagehide`, `visibilitychange:hidden`, bölge değişimi, kart çözümü ve 30 s'de bir (değişiklik varsa). IDB açılamazsa (`?noidb=1` test bayrağı ya da gerçek ret) sTressT `storage.ts` bellek deposu + uyarı; evrenler o oturumda emülatörde. Gizli pencere artık tetik değildir (Chrome/Edge/Firefox 115+ gizli modda IDB bellek içi çalışır).

### 4.3 Protokol — üç taşıyıcı
1. **IndexedDB** tek doğruluk kaynağıdır; mesajlar hızlandırıcıdır.
2. **BroadcastChannel(`dilemma:<runId>`)**: aynı kökende ve aynı depolama bölümünde çalışır.
3. **`opener.postMessage` snapshot handoff**: tarayıcı depolama bölümlemesi (Chrome 115+, Firefox Total Cookie Protection, Safari) üçüncü taraf iframe'deki ebeveyn ile üst düzey çocuk sayfasına farklı bölüm anahtarı verir; IDB ve BroadcastChannel paylaşılmaz. Bu yüzden çocuk açılışta IDB'de snapshot bulamazsa `opener`'a `NEED_SNAPSHOT` yollar; ebeveyn ≤ 64 KB snapshot'ı `postMessage` ile verir; çocuk kendi bölümünün IDB'sine yazar. Kilit, `ENDED`, `CLOSING` mesajları da `postMessage` ile ebeveyne döner. Çocuk 4 s içinde snapshot alamazsa kendini kapatır ve ebeveyn emülatöre düşer.

Zarf `{ v: 1, nonce, from, to, type, payload }`; alıcı `event.origin === location.origin` ve nonce eşleşmesi olmadan işlemez.

| Yön | Tip | Anlam |
|---|---|---|
| çocuk → ebeveyn | `NEED_SNAPSHOT` | IDB'de snapshot yok |
| ebeveyn → çocuk | `SNAPSHOT {state}` | handoff |
| çocuk → ebeveyn | `READY` | **snapshot okundu** (sıcak önbellek ≤ 1,5 s, soğuk ≤ 4 s) |
| çocuk → ebeveyn | `PASSED_BIG_CHOICE {choiceId}` | kilit kuralı |
| çocuk → ebeveyn | `ENDED {endingId}` / `CLOSING` | son ekranı / `pagehide` |
| ebeveyn → çocuk | `PING` (500 ms) / çocuk → `PONG` | kalp atışı |
| ebeveyn → çocuk | `PARENT_CLOSING` | çocuk tek başına sürer |

Kapanma tespiti: `childWindow.closed` 500 ms'de bir + 3 kaçırılan PONG. **Yetim ebeveyn kipi:** tarayıcı (Chrome Bellek Tasarrufu, Edge uyku sekmeleri) donmuş ebeveyn sekmesini atıp yeniden yüklerse sayfa `universes[self].status === "frozen"` görür; `childWindow` referansı yoktur; yalnız BroadcastChannel/postMessage PING yollar; 1,5 s PONG yoksa ya da `universes[child].status ∈ {closed, ended}` ise `frames` deposundaki görüntüyle donma ekranını gösterir ve seçim ekranından uyanır. `?u=` ile açılan çocuk: başlık yok, ölçüm yok, kalite `localStorage`'dan; tam ekran "Devam etmek için tıkla" (kullanıcı aktivasyonu → pointer lock + `AudioContext.resume()`); içerikteki gecikmeler (ör. B2'nin 2,5 sn'si) bu tıklamadan sonra başlar.

### 4.4 Ebeveynde donma ve uyanma
"Devam" tıklamasında: (1) son kare çizilir, `canvas.toDataURL("image/jpeg", 0.7)` alınır ve `frames`'e yazılır; (2) tam ekran `.frozen` overlay: görüntü + `grayscale(0.6) brightness(0.7)` + "Bu evren donduruldu" + "Pencereyi öne getir" + "Bu evrene dön"; (3) `setAnimationLoop(null)`, `AudioContext.suspend()`, pointer lock bırakılır, `GameClock` `frozen`; (4) **her kademede** bölge sahnesi + Rapier `World` + dokular dispose edilir (uyanış yalnız DOM gösterir); D1'de ek olarak `forceContextLoss()`; D2/D3'te bağlam tutulur, sahne boşaltılır. Dondurulmuş sekme heap ≤ 80 MB. Uyanma: seçim ekranı DOM'dur (seçilen işaretli; `locked[opt]` üstü çizili "Bu yol yaşandı"; ikisi kilitliyse "Bu evrende iki yol da yaşandı" + "Evreni kapat"; süre çubuğu yok); "Bu evrene dön" bölgeyi yeniden kurar (D1'de `forceContextRestore()` + ısınma karesi) — hedef ≤ 2 s.

"Pencereyi öne getir" → `child.focus()`: tarayıcılar sekme için bunu sık sık yok sayar; `window-test.html` 9. madde tarayıcı başına kaydeder; çalışmayan tarayıcıda düğme metni "Sekme: DİLEMMA — Olasılık n" + "Öne getiremiyorum; sekmeyi elle seçin". Pencere modunda `focus()` kalır. Çocuğun DÖKÜM "Bu pencereyi kapat" düğmesi gerçek pencerede `window.close()`, emülatörde `history.back()`.

**Render eden WebGL bağlamı daima 1:** donmuş pencerelerde `renderer.info.render.calls === 0`; D1'de canlı bağlam 1 (`forceContextLoss` çağrıldı); D2/D3'te canlı bağlam ≤ 5 (derinlik 4 = 5 sekme), hepsi boş sahneyle. Torun açılınca çocuk da aynı yolla donar. Derinlik ≤ 4; derinlik 4'teki büyük seçim §4.6 emülatörüne düşer.

### 4.5 Kilit kuralı
Çocuk kendi ilk büyük seçimini çözdüğünde `universes[child].passedNextBig = true` yazar ve `PASSED_BIG_CHOICE` yayınlar (BroadcastChannel + postMessage); ebeveyn `choices[parent, choiceId].locked[optionIndex] = true` yazar. Çocuk ilk büyük seçimden önce kapanırsa kilit yok (snapshot silinir). Kilit evren sonunda da (`ENDED`) konur.

### 4.6 Popup engeli → dal emülatörü
`const w = window.open(...)`; `!w || w.closed` → engellendi (iframe'de zaten varsayılan). Aynı sekmede: ebeveyn snapshot'ı `frozen` olarak IDB'de; `history.pushState({u: childId}, "", "?u=" + childId)`; çocuk evren yerinde kurulur. Geri: tarayıcı geri tuşu ya da DÖKÜM düğmesi → `popstate` → ebeveyn snapshot'ı okunur → seçim ekranından uyanır. Emülatör birinci sınıf yoldur; her fazda test edilir. F5 sonrası aynı evrenden devam.

### 4.7 Başlıklar ve itch.io
Her HTML yanıtı `Cross-Origin-Opener-Policy: same-origin-allow-popups` (Cloudflare `_headers`). Asla `same-origin`, asla `Cross-Origin-Embedder-Policy: require-corp`. itch.io'da başlık kontrolü yok; "SharedArrayBuffer support" kutusu **işaretlenmez**. itch oyunu `html-classic.itch.zone` kökenli bir **üçüncü taraf iframe**'dir; `window.open` ile açılan çocuk aynı kökenin üst düzey sayfasıdır → depolama bölümü farklı: IDB ve BroadcastChannel paylaşılmaz (§4.3 handoff bunun içindir); varsayılan mod emülatördür.

**Faz 0 testi (itch):** `window-test.html` taslak projeye yüklenir; 9 madde: (1) tıklamayla `window.open` yeni sekme açıyor mu, (2) `opener` korunuyor mu, (3) BroadcastChannel ≤ 1 s, (4) iframe içinde pointer lock + tam ekran, (5) emülatör yolu, (6) `location.origin` paylaşımlı mı, (7) iframe'de IDB'ye yaz → popup'ta oku (beklenen: **okunamaz**), (8) iframe → popup `opener.postMessage` gidiş-dönüş ≤ 1 s (beklenen: geçer), (9) `child.focus()` sekmeyi öne getiriyor mu (tarayıcı başına). Chrome, Firefox ve Playwright webkit'te kayda geçer; gerçek Safari F14.

**Kabul (Faz 0):** Chrome/Firefox (+ webkit DOM spec'leri) ve itch taslağında: aç → çocuk READY (sıcak ≤ 1,5 s) → kapat → ebeveyn seçim ekranında ≤ 2 s; `window.open = () => null` ile emülatör aynı sonucu verir; sekme arka plandayken süre durur; 4 derinlikte 5. pencere açılmaz; `?noidb=1` ile bellek deposu uyarısı ve oturum sürer; ebeveyn reload → yetim kipi → uyanır; itch maddeleri 1, 3 (ya da 8), 5 ve 8 yeşil (7 beklenen kırmızı).

---

## 5. Seçim süresi ve zar

### 5.1 GameClock ve decisionClock
Tek `GameClock`: gerçek zamanla ilerler, kare dt'si 100 ms'ye kıstırılır, `paused` nedenleri küme: `hidden`, `frozen`, `menu`, `pointerLockLost`. **`pointerLockLost` yalnız choice engine `idle` durumundayken geçerlidir**; `cutscene | options | dice | continue` durumlarında yok sayılır (seçenekler DOM düğmesi olduğu için kilit zorunlu bırakılır; süre akmaya devam etmelidir). Küme boş değilse hiçbir sayaç ilerlemez: seçim süresi, koli 180 s, A4 180 s, gevşeme 180 s. Ara sahnenin 0,25× dünya zamanı sayaçları etkilemez. Esc davranışı (kart açıkken yalnız Ayarlar katmanı — süre durmaz — ya da duraklatma) Çayan kararıdır; varsayılan ilki.
```ts
decisionClock: { choiceId, kind: "reflex"|"normal"|"vehicle"|"heavy"|"small", durationMs: 20000|45000|60000|90000|30000, elapsedMs }
```
İsteğe bağlı erişilebilirlik çarpanı `timerScale` (×1 / ×1,5 / ×2; Çayan kararı) yalnız `durationMs`'i çarpar; zar ve kilit mantığına dokunmaz.

### 5.2 Deterministik zar
`core/rng.ts` (mulberry32 + `hashSeed(...parts)`): `seed = hashSeed(rootSeed, universeId, choiceId)`. Süre dolunca `opt = rng() < 0.5 ? 0 : 1`; yeniden yükleme sonucu değiştirmez. Küçük seçimlerde zar yoktur: `onTimeout: { pick: 0|1 }`. Son sunum varyantı (S5, S6: 3) `hashSeed(rootSeed, universeId, endingId)`; S7'nin 2 varyantı koşuldur (`hasGun`), zar değil. Kozmetik rastgelelik tohumsuz.

### 5.3 Sinematik ara sahne (veri odaklı)
```ts
type Cutscene = {
  id: string; timeScale: 0.25; audio: { lowpassHz: 800; duckDb: -6; rampMs: 300 };
  rail: { key: Array<{ t: number; pos: Vec3 | { anchor: string; offset: Vec3 }; lookAt: Vec3 | { anchor: string }; fov?: number; ease: "linear"|"smooth" }> };
  choiceAt: number; choiceId: string;
  after: { 0: { rail?: Rail; event: string }; 1: { rail?: Rail; event: string } };
};
```
Çapalar `zone.json` markers'tan; Catmull-Rom; oyuncu girişi kapalı; dünya 0,25× (4 karede 1 fizik adımı); ses lowpass 20 kHz → 800 Hz 300 ms, ortam −6 dB. Seçenek metinleri yalnız eylem fiili.

**Kabul (Faz 1):** B1 ara sahnesi veriden oynar; aynı `?u=` üç yeniden yüklemede zar aynı; sekme gizliyken 10 sn geçince `elapsedMs` ve koli sayacı değişmez; seçenek ekranında pointer lock yokken 1.000 ms sonra `elapsedMs = 1.000`.

---

## 6. Veri odaklı içerik

### 6.1 Dosyalar ve tipler
`apps/dilemma/src/content/`: `choices/*.json` (26 büyük + küçükler; K-K1 dahil), `events/*.json`, `dialogues/*.json` (`hursit`, `garip`, `edhem-sidki`, `sokak`, **`ferman`** = iç ses), `endings.json` (7), `zones/*.json` (`blockout.py` üretir), `support.json`, `dokum-rules.json`. Tipler `content/types.ts`; `content/validate.ts` yalnız testte (ajv dev).

```ts
type Choice = { id: string; kind: "big"|"small"; timer: ClockKind; zone: string; cutscene?: string; when?: FlagExpr;
  options: [Option, Option]; onTimeout: "dice" | { pick: 0|1 }; est: { minS: number; maxS: number } };
type Option = { id: string; text: I18nKey; effects: Array<{ set: string; value: boolean|number } | { alarm: -1|1|2|3 } | { money: number } | { give: string } | { take: string }>; next: NodeId };
type Ending = { id: string; survives: boolean; inventoryLines: I18nKey[]; variants: 1|2|3; variantBy: "dice"|"hasGun" };
type Sign = { id: string; textKey: I18nKey; mesh: string };          // zones/*.json signs[]
type InnerVoiceLine = { id: string; textKey: I18nKey; trigger: { object?: string; zone?: string }; once: boolean };
```
`est` her kart/düğümde (ara sahne + süre + devam sahnesi); `zones/*.json` komşu geçiş süreleri (m / 3,4 m/s); `walk.test` bunları toplar. `support.json`: dil başına URL listesi + yedek metin + `bannedTerms`. DÖKÜM: DOM metni, daktilo 18 kr/sn, damga sesi; "Hızlandır" Destek satırını atlamaz.

### 6.2 i18n
Anahtar tabanlı (`locales/tr.json`, `locales/en.json`), sTressT `ui/i18n.ts` deseni. Dil: `navigator.language` `tr` → TR, değilse EN. Türkçe büyük harf yalnız `lang="tr"` öğelerde; `toLocaleUpperCase("tr")`. Marka `DİLEMMA` çevrilmez, `<span lang="tr">`. Yazı tipi IBM Plex Sans (OFL 1.1) 2 ağırlık ≈ 80 KB woff2. Altyazı: en çok 2 satır × 42 karakter, en az 1,2 s, 17 karakter/sn (`subtitles.test`: her anahtar TR/EN ≤ 84 karakter ve uzunluk/17 ≤ gösterim süresi). **Dünya içi yazılar:** `signs[]` ile iki dilde; EN'de nişangâh ≥ 0,7 s tabelada kalınca altyazı şeridinde çeviri 1,2 s (TR'de çıkmaz); alternatif (dil başına doku çifti) Çayan kararı. **Kaynak denetimi:** `tools/i18n/scan.mjs` `npm run check` içinde — `src/**/*.ts` içinde `[çğıöşüÇĞİÖŞÜ]` içeren string literal → hata (`locales/`, `fixtures/` hariç). Sekme başlığı şablonu `DİLEMMA — {possibility}` (`B\d+` deseni yasak). Yasak UI kelimeleri ("sınır, hata, yükleniyor, limit, error, loading, simülasyon, kod, render") yalnız `content.*` ve `subtitle.*` ad alanlarında denetlenir; `app.*`, `error.*`, `boot.*` muaftır.

### 6.3 Otomatik testler (vitest, `npm test`)
İçerik testleri (F1'de hepsi var olur):
| Test | Kural |
|---|---|
| `choices.test.ts` | Her `big` tam 2 seçenek; `timer` geçerli; `small` pencere açmaz; `kind: big` + `opensWindow: false` kart yok; büyük sayısı `manifest.expectedBig` (F12'de 26) |
| `graph.test.ts` | `start`'tan erişilemeyen düğüm yok; her yol bir `Ending`'de biter; S4'e B3-B yolundan ulaşılır; Yamaç'ta B36 ya da S6'ya bağlanmayan düğüm yok |
| `endings.test.ts` | `survives: true` tam 1 (S1, yalnız B36-A); S5/S6 `variants: 3`; S7 `variants: 2` (`hasGun`); her son ≥ 6 DÖKÜM satırı |
| `flags.test.ts` | Yazılan her bayrak okunur, okunan her bayrak yazılır; `deliveredBy ∈ {ferman, zeynel}`; `garipSentenceSaid` kenar tetiğinden de yazılır |
| `economy.test.ts` | ICERIK §6.2 9 satırı; ₺ ≥ 0; eşikler 20/60 |
| `i18n.test.ts` | Her anahtar tr/en'de; `signs[].textKey` iki dilde; `bannedTerms` tüm locales + endings + iç ses; başlık şablonunda `B\d+` yok |
| `anchors.test.ts` | Her ara sahne çapası ilgili `zone.json`'da |
| `licenses.test.ts` | `assetIndex.json`'da yalnız izinli lisanslar (§7.3); CC BY satırlarında `attribution` dolu |
| `budget.test.ts` | Bölge başına üçgen/doku bellek tahmini §2.1 bütçelerinin altında |
| `walk.test.ts` | Headless yürüyüş 200 tohum, `est` + komşu süreleri, dolaşma katsayısı 1,6: tek oynayış 45–100 dk (%90), tüm içerik 4–6 saat, her son ≤ 40 düğüm; F3'ten itibaren raporda "tahmin / Çayan'ın gerçek süresi", sapma > %25 ise `est` güncellenir |

Sistem testleri (fazlara göre eklenir): `rng`, `clock`, `universe` (fixture'lar), `snapshot`, `choice-engine`, `subtitles`, `innervoice`, `timer`, `dialogue`, `aim`, `alarm`, `streaming`, `postal`, `pack`, `vehicle`, `barrier`, `sequence`, `bridge`, `dokum`, `audio-budget`, `quality`, `gc`, `vat`, `settings`, `remap`, `release`. sTressT'in `fracture.bench.test.ts` kök çalışmasından dışlanır (`npm run bench:stresst` ile ayrı).

**Kabul (Faz 1'den itibaren her faz):** 10 içerik test dosyası + o fazın sistem testleri yeşil; içerik eklenince test eklenmeden faz kapanmaz.

---

## 7. Asset hattı

### 7.1 Yeniden kullanım ve fetcher'lar
`sTressT/scripts/assets/{fetch,process,sounds,inspect}.mjs` → `tools/assets/`; `--app dilemma|stresst` yolları çözer (sTressT kopyası değişmez). Kaynaklar ve fetcher'lar: `polyhaven` (API, CC0), `polypizza` (GLB, lisans elle), **`kenney`** (paket ZIP → `fflate` ile seçilen dosyalar; manifest `pack: "city-kit-suburban", files: [...]`; ASSET-ISTEK satırı paket başına + kullanılacak dosya sayısı), ambientCG (CC0), ESO (CC BY 4.0), **`freesound`** (`FREESOUND_API_KEY` `.env.local`'de; API sorgusunda `license:"Creative Commons 0"` zorunlu; lisans yanıt JSON'undan `licenses.json`'a; anahtar yoksa açık hata + Kenney'e düş), `cds` (BSC5 veri seti). Animasyon: **Quaternius Universal Animation Library (CC0)** → Universal Base Characters rig'i. **Yasak:** Mixamo (Adobe lisansı yeniden dağıtıma kapalı), Sketchfab "standart lisans", NC/ND/SA.

### 7.2 Yeni adımlar (`process.mjs` eklentileri; yalnız manifestte ilgili alan varsa çalışır)
- `lods: [1, 0.4, 0.15]` → üç GLB; `quantize()` + `meshopt()`.
- KTX2: `toktx` zorunlu CLI (R-00 ortam kontrolü); manifest `tex: { size, mode: "etc1s"|"uastc" }`. F1–F3 WebP kabul; **F4 kapanışında KTX2 zorunlu**.
- `vat: { clips: ["idle","walk","retreat"], fps: 24 }` → `vat.mjs` (F13).
- `pack.mjs` (F4): bölge ve ses paketleri (§2.7).
- Ortak palet (`recolor`, `roughness`, `scale`); çıktı doğrulama (üçgen bütçesi, > 2048 doku, pahalı `KHR_materials_*` → hata).

### 7.3 Lisans defteri
`writeLicenses()` korunur: `ASSET_LICENSES.md` + `public/licenses.json` (oyun içi Lisanslar ekranı). İzin listesi: `CC0 1.0`, `CC-BY 3.0`, `CC-BY 4.0`, `OFL 1.1`, `Apache-2.0`, `MIT`, `Public Domain`, **`Data-Attribution`** (yalnız veri setleri; atıf dizesi zorunlu; BSC5 için "Hoffleit & Warren 1991, CDS V/50"). Diğer her şey → `process.mjs` çıkış kodu 1. Lisans ekranı satırları: ESO/S. Brunier CC BY 4.0, `boxing_glove` CC-BY 3.0, IBM Plex / Archivo / JetBrains Mono OFL, BSC5 atfı, Kenney/Poly Haven/Quaternius/ambientCG CC0 teşekkürü, three/Rapier/meshopt MIT/Apache.

### 7.4 İndirmeden önce onay listesi
Her faz için `plan/ASSET-ISTEK-F<n>.md`; `fetch.mjs` yalnız `approved: true` girişleri indirir. Tablo: `id | kaynak | URL | lisans | yazar | boyut (MB) | neden gerekli | alternatif`; Kenney satırları paket düzeyinde. Çayan satırları onaylar ("onay" + id'ler).

**Kabul (F0-T1 + Faz 1):** F0-T1'de mevcut `sTressT/public/assets` için SHA-256 listesi `tools/assets/stresst.baseline.json` alınır; F1'de `npm run assets -- --app dilemma` tek komutla `public/assets` ve `licenses.json` üretir; `--app stresst` çıktısı baseline ile eşit (eşitsizlikte kabul: üçgen ±0, doku boyutu ±0, dosya boyutu ±%1).

---

## 8. Ses

### 8.1 Graf ve bus'lar
WebAudio; `AudioContext` ilk jestte ("Başla" ya da çocukta "Devam etmek için tıkla"); `visibilitychange: visible` ve pointer lock'ta `resume()`; donma/menüde `suspend()` (`GameClock.paused` ile bağlı). `master` → `DynamicsCompressor` (−12 dB, 3:1) → `destination`. Bus'lar `sfx`, `ambience`, `vehicle`, `drone`, `ui`; master'da ara sahne lowpass. Yankı: sentezlenmiş IR'li `Convolver`; gönderim dış 0,04, ev 0,28, restoran 0,35. Konumsal `PannerNode` `equalpower`, `refDistance 2`, `maxDistance 60`, `rolloff 1.2`. 16 eşzamanlı ses; öncelik = düzey + olay ağırlığı − mesafe.

### 8.2 Dosya bütçesi (mono MP3 96 kbps)
| Grup | İçerik | Boyut |
|---|---|---|
| Ortam döngüleri | 8 bölge × 30 s | 2,9 MB |
| SFX | 180 klip (adım 5 yüzey × 5, kapı, kepenk, cam, metal, silah 6, kedi, çeşme, damga; **kuş klipleri yalnız `yamac`/`ucurum` paketlerinde**) | 2,6 MB |
| Araç | 12 klip | 0,6 MB |
| Drone | 6 × 60 s (ara sahne, Garip'in tepesi; sonlarda yok) | 4,3 MB |
| UI | 20 klip | 0,1 MB |
| Toplam | bölge başına `sfx.pack`; ilk yük ≤ 1,2 MB | ≤ 10,5 MB |

### 8.3 Sessizlik tasarımı
Serbest dolaşımda müzik yok; drone yalnız ara sahnede; sonlarda müzik yok. Katman sayısı bölgeye göre: Meydan 5, Yamaç 2 (rüzgâr + uzak köpek + kuş), Uçurum 1, Dünya Kenarı 1 + 20 sn'de bir uzak araç. Alarm katmanları A1–A5 (ICERIK §5.3). `eyeAdapt` ortam bus'ını −3 dB'ye kadar indirir.

**Kabul (Faz 1):** 16 ses sınırı overlay'de; yankı ev 0,28 / dış 0,04; donmuş ebeveynde `AudioContext.state === "suspended"`. **F13:** `audio-budget.test` ≤ 10,5 MB; kuş klipleri yalnız Yamaç/Uçurum paketlerinde.

---

## 9. Build, dağıtım, test

### 9.1 Komutlar
- `npm run check` (kökte, her turda) = `tsc --noEmit` ×2 + `oxlint` + `vitest run` (sTressT bench hariç) + `vite build` ×2 (dilemma qa + prod) + `node tools/bench/budgets.mjs` (JS merdiveni, ilk yük, ses, dosya sayısı) + `node tools/i18n/scan.mjs`. **Zip, asset işleme ve bake dışarıda.**
- `npm run assets -- --app dilemma|stresst`, `npm run bake -- <zone>`, `npm run bench:stresst`.
- `npm run release` = check + `copy-stresst.mjs` + `zip.mjs` → `dist/dilemma-web/` ve `dist/dilemma-itch.zip` (`index.html` kökte, `base: "./"`) + `verify-headers.mjs`.
- Build kipleri: `npm run dev` (5181) · `npm run preview:qa` (`vite build --mode qa`, 4181; `__QA__=true`: overlay, `window.__dilemma`, `?q=`, `?noidb=`, `?bench=`, F9 QA menüsü; sıkıştırma prod ile aynı; sürüm `x.y.z+qa`) · `npm run preview` (prod, 4182; `window.__dilemma === undefined`). `__APP_VERSION__` menüde.
- Dosya sayısı kapısı (`budgets.mjs`): F4'ten itibaren ≤ 250, F15 ≤ 400 (itch'in resmî dosya/boyut sınırı F15-T1'de dokümandan teyit edilir ve R-146'ya yazılır). sTressT'in ≈ 200 dosyası `/stresst/` altında ayrı sayılır.

### 9.2 Barındırma karşılaştırması
| | Ticari kullanım | Bant genişliği | Başlık (`_headers`) | Dosya sınırı | Karar |
|---|---|---|---|---|---|
| Vercel Hobby | Yasak | 100 GB/ay | var | — | Kullanılmaz |
| Netlify Free | Açıkça yasak değil | 100 GB/ay | var | — | Yedek |
| Cloudflare Pages Free | Serbest | Sınırsız (statik) | var | 25 MB/dosya, 20.000 dosya | **Web sürümü** |
| GitHub Pages | Ticaret sitesi yasak | 100 GB/ay | yok (COOP ayarlanamaz) | 1 GB | Kullanılmaz |
| itch.io | Serbest, "istediğin kadar öde" | Ücretsiz | yok (SAB kutusu kapalı) | zip; sınır F15-T1 teyit | **Ödeme sürümü** |

`_headers`: COOP + `/assets/*` ve `/stresst/assets/*` `Cache-Control: public, max-age=31536000, immutable` + `index.html` `no-cache` + `.wasm` `application/wasm` (`curl -I`). F15'e kadar önizleme URL'si **Cloudflare Access** e-posta kuralıyla kapalı (ücretsiz 50 kullanıcı). Bant matematiği: 30 MB/oyuncu; 10.000 oyuncu/ay = 300 GB → Cloudflare'de sorun yok. Kurtarma: önceki sürüm dizini saklanır; F15'te tatbikat (5 dk içinde geri alma).

### 9.3 Tarayıcı matrisi
Chrome/Edge 120+ (Windows 10/11, Linux), Firefox 120+ (Windows, Linux), Safari 17+ (macOS 14+; F14'te ödünç Mac ya da webkit). Desteklenmeyenler engel ekranı (`app.unsupported`). Her faz kapanışında Chrome/Firefox/Edge el testi + Playwright; gerçek Safari yalnız F14.

### 9.4 Playwright e2e (`apps/dilemma/e2e/`)
Projeler: chromium (`--use-angle=swiftshader --ignore-gpu-blocklist`), firefox (`firefoxUserPrefs: {"webgl.force-enabled": true, "webgl.disabled": false}`, `MOZ_WEBRENDER=0`), webkit (WebGL isteyen spec'ler `test.skip`; DOM spec'leri zorunlu). CI: `.github/workflows/check.yml` (ubuntu-latest, Node 22, `npm run check`, üç tarayıcı, tarayıcı önbelleği); rapor §2'ye CI bağlantısı. Dev tutamağı `window.__dilemma` (dev/qa; prod'da yok): `goto`, `trigger`, `advance`, `state`, `autoPause`, `noOpen`, `noIdb`, `loseContext`, `crash`. `e2e/console-allow.json`: izinli uyarı regex listesi (her satırda neden); `boot.spec` iddiası "listede olmayan hata/uyarı 0".

| Test | Adımlar / iddia |
|---|---|
| `boot.spec` | allow-list dışı 0 hata; WebGL2 var (webkit skip); başlık ≤ 10 s (SwiftShader); `document.title === "DİLEMMA"`; prod'da `__dilemma` yok; kontrol noktalarında draw ≤ 120, üçgen ≤ 150 k, `programs` sabit |
| `window.spec` | `trigger("B1")` → seçenek → zar → Devam → çocuk sayfa; istem tıklanır; `child.__dilemma.state()` ebeveyn snapshot'ına `universeId/parentId/depth` dışında deep-equal; ebeveyn `.frozen`; `render.calls === 0`; çocuğu kapat → ebeveyn ≤ 2 s; ebeveyni reload → yetim kipi → uyanır |
| `lock.spec` | çocukta ikinci büyük seçim → kapat → ebeveynde kilitli |
| `emulator.spec` | `window.open = () => null` → `pushState` akışı; `goBack()` → uyanış; iframe bağlamında varsayılan |
| `clock.spec` | `page.clock.install()`; gizli → 10 s → `elapsedMs` sabit; görünür → 45 s → zar; seçenek ekranında kilit yokken süre akar |
| `dice.spec` | aynı `?u=` üç reload → aynı seçenek |
| `i18n.spec` | EN'de görünür DOM metin düğümlerinde Türkçe karakter yok (`span[lang=tr]` hariç); TR'de "İ" doğru; altyazı boyutu |
| `webgl-missing.spec` | `getContext` stub null → engel ekranı |
| `support.spec` | Destek → `noopener` yeni sayfa; evren sayısı değişmez; `decisionClock` durmaz; her sonda `#support` görünür; ağ engelli → 3 s yedek |
| `error.spec` | `addInitScript` throw → hata ekranı ≤ 1 s; IDB put reddi → uyarı |
| `autosave.spec` | kapat → aç → Devam → konum ±1 m, bayraklar deep-equal, kart süresi korunur |
| `stresst.spec` | kapı → iframe menüsü ≤ 3 s → "Sokağa dön" → aynı konum; `document.title` geri |
| `soak.spec` | 10 dk hızlandırılmış dolaşım; `usedJSHeapSize` ±%10 (chromium) |

### 9.5 Performans kapıları
CI'da (GPU yok) zorunlu: JS merdiveni (§2.1), ilk yük ≤ 10 MB, bölge bütçeleri, dosya sayısı, SwiftShader'da draw/üçgen sayı kapıları, `programs` sabit, `gc.test`. Zaman kapıları yerel: `?bench=1` Çayan'ın makinesinde; GPU süresi `EXT_disjoint_timer_query_webgl2` ile geçiş başına ms (Chrome/Edge); **D1 tahmini = GPU ms × kalibrasyon katsayısı** (`tools/bench/calib.json`, F4'te gerçek cihazla bir kez; raporda sabit). Gerçek D1 cihazı F4, F9, F13 kapanışlarında zorunlu; bulunamazsa `ONAY F13 — sınır kabul` ve F15 öncesi zorunlu. `tools/bench/flash.mjs`: kaydedilen kare dizisinde ortalama parlaklık farkı > %10 geçiş sayımı — 1 sn'de ≤ 3 (B28, S7, silah).

**Kabul (Faz 0):** `npm run check` ve CI yeşil; `window.spec` + `emulator.spec` chromium ve firefox'ta, DOM spec'leri webkit'te; Cloudflare Pages önizlemesinde `curl -I` COOP ve wasm MIME.

---

## 10. Riskler ve B planları

| # | Risk | Olasılık | B planı |
|---|---|---|---|
| 1 | Popup engeli (Safari, itch iframe, kurumsal) | Yüksek | Emülatör birinci sınıf; iframe'de varsayılan; Ayarlar "hep aynı sekme" |
| 2 | Barındırıcı COOP `same-origin` ekler | Düşük | IDB + BroadcastChannel; `_headers` testi CI'da |
| 3 | D1'de 30 fps tutmaz | Orta | Taban 0,5× + gölge yok + figüran 900; "Çok düşük" kademesi; figüran sayısı düşmez |
| 4 | 8 GB paylaşımlı bellekte GPU şişmesi | Orta | KTX2 zorunlu (F4); ≤ 2 tam bölge; donmada sahne boşaltma |
| 5 | Rapier 1,2 MB ilk yükü aşar | Düşük | Başlık arkasında stream; ev içi prolog özel kapsülle |
| 6 | Blender bake hattı ağır | Orta | `blockout.py` headless; bütçe ≤ 10 dk/chunk; vertex AO + maske vertex renginde |
| 7 | İçerik şişmesi | Yüksek | ICERIK §8.2 kesme sırası; `walk.test` 6 saat |
| 8 | `host-bridge.ts` ile "birebir" bozulur | Düşük | iframe zaten dist'i çalıştırır; kapı iki dosya + 76 vaka + state-hash |
| 9 | Uyanışta WebGL bağlamı geri gelmez | Düşük | 5 s içinde `restored` yoksa "Yenile"; durum IDB'de |
| 10 | IDB kapalı | Orta | Bellek deposu + uyarı; emülatör. Gizli mod artık tetik değildir; test `?noidb=1` ile |
| 11 | Safari'de `window.open` async sonrası engellenir | Yüksek (Safari) | "Devam" handler'ı senkron; webkit testi |
| 12 | Evren kayıtları büyür | Düşük | ≤ 64 evren; budama; snapshot ≤ 64 KB; `frames` ≤ 150 KB |
| 13 | three.js sürüm kayması | Orta | Kökte tek sürüm; `npm ls three` tek sonuç |
| 14 | Destek bağlantıları eksik | Orta | `support.json` her dilde ≥ 1 + yedek; `i18n.test` |
| 15 | `toktx` kurulumu | Orta | R-00 ortam kontrolü; yoksa F0 kapanmaz |
| 16 | itch paylaşımlı kökende depo/kanal çakışması | Orta | `dilemma@<pathHash8>`, `dilemma:<runId>`, `dilemma.*` |
| 17 | VAT hattı gecikir | Orta | F4–F12 basit SkinnedMesh; VAT F13 kapısı; kesme 6 |
| 18 | **Depolama bölümlemesi** (itch iframe ↔ popup) | Yüksek (itch) | `opener.postMessage` handoff; iframe'de varsayılan emülatör; `window-test.html` 7–8 |
| 19 | **Tarayıcı donmuş ebeveyn sekmesini atar** (Bellek Tasarrufu / uyku sekmeleri) | Orta | Yetim ebeveyn kipi; `frames` deposu; her kademede sahne boşaltma, heap ≤ 80 MB |
| 20 | Blender/toktx/fontTools ortamı eksik ya da bake bütçesi aşılır | Orta | R-00; `blockout.py`; bake `check` dışında; 1024² ve B planı |

---

### Fazlarla eşleme (bu belgenin kabul satırları)
F0: §1.5, §4.7, §9.1, §9.5 kabulleri + R-00 ortam. F1: §2 (bench), §3, §5, §6, §7 (baseline), §8 kabulleri. F4: §2.4 lightmap (ya da B planı), §7.2 KTX2, §2.7 pack, ilk gerçek D1 + kalibrasyon. F7–F8: araç kapısı, bariyer. F9: ikinci gerçek D1. F10: §1.5 iframe kapısı. F13: §2.6 VAT, §3.1 nebula, §8 ses bütçesi, üçüncü gerçek D1. F14: §9.3 matris, risk 14, flaş ölçütü. F15: §9.1 release, §9.2 canlı başlıklar, kurtarma tatbikatı.
