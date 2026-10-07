# TUR F0-T2 — Motor

## Yapılanlar (apps/dilemma/src)
- **core/** `clock.ts` (GameClock: rAF sürücüsü, dt ≤ 100 ms, `paused` kümesi `hidden | frozen | menu | pointerLockLost`;
  K7: `pointerLockLost` yalnız motor `idle` iken etkili — motor durumu callback ile sorulur; `decisionClock` yalnız
  `options` durumunda akar, kilit varlığından bağımsız, `hidden/frozen/menu` ile durur; `resume` sonrası ilk kare dt 0
  → gizli sekme boşluğu tamamen düşer; `attachVisibility`), `rng.ts` (`mulberry32`, `hashSeed(...parts)` → uint32,
  `Rng`), `events.ts` (tipli `EventBus`; DOOR, POINTER_LOCK, CONTEXT_LOST/RESTORED, QUALITY_CHANGED), `input.ts`
  (WASD/ok tuşları, Shift koşu, C çömelme, Space, E, T, Esc, F3, F9; fare bakışı yalnız kilitliyken; `lock()` yalnız
  jestte — `captureOnClick` ile canvas mousedown; `onLock` kilit kaybı olayı; `detach()`), `frameStats.ts`
  (sabit kapasiteli halka + p95/medyan; tahsissiz).
- **engine/** `renderer.ts` (WebGL2 bağlamını üç yerine biz açarız: önce `failIfMajorPerformanceCaveat:true`,
  başarısızsa **yeni canvas** ile `false` + `caveat` bayrağı; ikisi de yoksa `null` → engel; `ResolutionGovernor`
  1 sn pencerede p95'e göre ±0,05 (kademe tabanı/tavanı, 2 sn histerezis, "yardım etmedi" geri alma + 15 sn bekleme);
  `watchContext` lost/restored; `readRenderStats` calls/triangles/programs), `rapierWasm.ts` (sTressT deseni,
  idempotent), `physics.ts` (sabit 1/60, ≤ 3 adım, alpha; `GROUPS.world/player/sensor`; `addStaticBox`),
  `quality.ts` (K2: `QUALITY` tablosu TEKNIK §2.3 — pixel ratio 0,75/0,5 · 1/0,65 · 1,5/0,85, gölge 0/1024/2048,
  post, gök katmanı 1/2/3, sis, LOD, `budgetMs` 33,3/16,7/16,7; `forcedTier(?q=)`, `readStoredTier/writeStoredTier`
  `dilemma.quality.v1` `{gpu, tier, ts}`; `heuristicTier`; `QualityProbe` 2 sn ısınma + 3 sn ölçüm (çok yavaş
  makinede ≥ 30 kare bekler); `decideTier` p95 > 1,15× → düş, medyan < 0,5× → çık; `DowngradeWatch` tabanda 30 sn
  p95 > 1,15× → yalnız düşüş).
- **player/PlayerController.ts** sTressT kapsülü sadeleştirildi: r 0,3 / halfHeight 0,6, göz 1,65, yürüme 3,4,
  koşu 5,2, çömelme 1,8 (C; kalkış için üst boşluk kontrolü), zıplama 3,6, basamak 0,35, duvar kayması, coyote +
  jump buffer, kamera ara değerleme; **head bob yok**, itme yok (dinamik prop yok). FOV 75 (kamera `Game`de).
- **world/testRoom.ts** 24×24 m zemin + 4 duvar (3 m), 1 m küp (3, −4), 0,35 m basamak (−3, −4), 4×3×3 bina (0, −9),
  kapı işareti (düz turuncu plane) ve **kapı tetikleyici** (Rapier sensör, `KINEMATIC_FIXED` aktif çarpışma tipi;
  `intersectionPair` kenar algısı → konsol `[dilemma] door test-door enter/leave` + `DOOR` olayı + overlay/state).
  Malzemeler düz renk Lambert; hemisfer + 1 yönlü ışık (gölge kademeye göre; `shadowMap.autoUpdate=false`).
- **sky/** `StarField.ts` 3.000 seed'li yıldız (`hashSeed("stars", seed)`; küre kapağı y > −0,15; kadir → boyut/parlaklık,
  8 girişli B–V tonu; yalnız parıltı fazı, **kayma yok**; additive, depthWrite kapalı), `SkyDome.ts` siyah-lacivert
  gradyan kubbe (r 950), `uPollution` sodyum parıltısı (katman ≥ 2), ufuk parıltısı (katman 3); gök grubu kamerayı izler.
- **game/Game.ts** kompozisyon kökü + kare döngüsü (`@frame` işaretli; kare içinde tahsis yok): input → fizik →
  kamera → gök → F3/F9 → governor → kalite izleme → render → stats. `state()` JSON-güvenli anlık görüntü (three/Rapier
  nesnesi yok). `applyTier` gölge/sis/gök katmanı/governor sınırlarını değiştirir. `setAutoPause(false)`: ne gizli
  sekme ne kilit kaybı duraklatır (otomasyon). `createGame` boot sırası: Rapier wasm arka planda → renderer →
  kalite kararı (`?q=` > caveat → low 0,5× > aynı GPU kaydı > sezgisel; ölçüm yalnız sezgisel kaynakta ve `?u=` yokken)
  → fizik → oda → oyuncu. `performance.mark`: `boot`, `boot:renderer`, `boot:physics`, `boot:world`, `boot:ready`,
  `game:control`, `quality:measured`.
- **main.ts** WebGL2 kapısı → engel yer tutucusu (`ui/screens.ts` `barrier`, `data-screen`) → `createGame` → `start` →
  `__QA__` ise `dev/index` **dinamik import** (prod paketinde `__dilemma` metni 0 kez geçer; doğrulandı).
- **dev/** `overlay.ts` (F3; 2 Hz; fps, p95, draws, tris, programs, kademe+kaynak, iç çözünürlük, probe durumu,
  paused kümesi, ctx, door, konum; `?overlay=1` ile açık başlar), `handle.ts` (`window.__dilemma`: `version`, `goto(x,z)`,
  `state()`, `autoPause(bool)`, `loseContext()`, `restoreContext()`), `index.ts`.
- **ui/** `dom.ts` (`h/button/show/setText`), `i18n.ts` + `locales/tr.json`, `en.json` (yalnız `app.*` 5 anahtar; T3
  genişletir), `screens.ts`. `style.css`: `#view`, `.overlay`, `.hint`, `.barrier`.
- **Testler:** `core/rng.test.ts` (referans dizi, hashSeed sabitleri, zar tekrarı), `core/clock.test.ts` (paused ≠ ∅ →
  birikmez; K7; options + kilit yok → 1.000 ms'de 1.000; doyma; hidden → durur ve boşluk düşer; rAF sürücüsü),
  `engine/quality.test.ts` (FrameStats, decideTier, QualityProbe ısınma/karar/az kare, DowngradeWatch, ?q=, depo, sezgisel).
  `e2e/boot.spec.ts`: @dom testi korundu + "engine" testi (webkit skip): 5 sn sonra canvas, `state()` alanları,
  draw ≤ 120 / üçgen ≤ 150 k, kilit yokken `elapsedMs = 0`, 6 boot işareti, `autoPause(false)` → süre akar + yere basar,
  `goto` → kapı tetikleyici girdi/çıktı, `loseContext/restoreContext` → `contextLost` true → false, konsol temiz.

## Kararlar
- Bağlam oluşturma üç yerine bizde: three'nin başarısız bağlamda `console.error` basması allow-list'e girmesin;
  ilk deneme başarısızsa aynı canvas'a ikinci `getContext` güvenilmez → yeni canvas (`Input` bu yüzden
  `renderer.domElement` alır).
- `autoPause(false)` tanımı genişletildi: gizli sekme **ve** kilit kaybı duraklatmaz (Playwright'ta pointer lock yok;
  R-05/R-06 otomasyonu ancak böyle mümkün). `menu/frozen` etkilenmez.
- Kalite ölçümü kilit yokken de koşar (render devam eder); ölçüm sonucu yalnız sezgisel kaynakta yazılır; `?q=`
  hiç kaydedilmez; caveat'li bağlamda ölçüm yok, low + 0,5× tavan.
- Governor yukarı adımı "p95 ≤ 1,05× bütçe ve 2 sn" (vsync'li 60 Hz makinede 16,7 ms bütçeye geri çıkabilsin).
- Gök katmanı F0 eşlemesi: low = yıldız + gradyan, medium = + kirlilik parıltısı, high = + ufuk parıltısı
  (Samanyolu dokusu/meteor/nebula F1/F13). Test odası kirliliği 0,55 (Ferman'ın evi).
- Esc kararı (K7 varsayılanı) saatte: `menu` nedeni yalnız pause menüsü açıldığında eklenecek (T3); kart açıkken Esc
  Ayarlar katmanı → `menu` eklenmez → süre durmaz.
- Spawn (0, 0, 4), yaw 0 (−Z'ye bakar: küp, basamak, bina görüş alanında).

## Doğrulama (yerel, Intel UHD 0xA78B, Node 26.7)
- `npm run check`: yeşil (tsc ×2, oxlint 0, vitest 4 dosya / 33 test, build qa + prod, budgets prod **174,9 KB** gzip /
  230 KB, dist 3,69 MB, i18n scan ok).
- `npm run e2e -- --project=chromium`: 2/2 (≈ 12 s; SwiftShader). Firefox/WebKit yerelde kapalı (R-00 notu, T0 notu).
- Tarayıcı panelinde qa build: ilk açılış `heuristic → measured medium` (medyan 16,7 / p95 16,8 ms, 181 kare,
  `quality:measured` @ 5,19 s), ikinci açılış `stored` (ölçüm yok); `?q=low` → low/forced, gök 1, 0,75×; F3 açıp
  kapanıyor; `autoPause(false)` + W → ilerler, yere basar; draws 11, tris 1,1 k, programs 5 (medium) / 4 (low);
  `game:control` 187 ms (sıcak).
- Pointer lock tarayıcı panelinde `WrongDocumentError` (gömülü panel kısıtı) — gerçek Chrome/Edge/Firefox'ta Çayan testi.

## Bilinen eksikler
- Engel/ipucu ekranları yer tutucu (T3: `ErrorScreen`, pause menüsü, başlık, ayarlar, gerçek i18n).
- Seçim motoru yok: `engineState` sabit `idle`; `decisionClock` yalnız birim testinde çalışıyor (T4).
- `frozen` nedeni ve `?u=` çocuk sayfa kuralı yalnız okunuyor (T5).
- Bağlam kaybında 5 sn "Yenile" uyarısı ve doku yeniden yükleme T3/T5 (şimdilik render durur, restored'da sürer).
- `DowngradeWatch` toast'u T3 (olay `QUALITY_CHANGED{reason:"downgrade"}` hazır). `programs` sabitliği kapısı T6'da
  spec'e eklenir (sis türü değişince three yeniden derler; kademe değişimi dışında sabit).
- D1 kalibrasyonu/`?bench=1` yok (F4).
- 1 m küpe zıplayıp çıkılabiliyor olabilir (apex 0,66 + autostep 0,35); 3 m binaya çıkılmıyor. R-06 Çayan testinde.

## Sonraki tura notlar (T3 — UI/i18n/ErrorScreen/pause/ses)
- `ui/i18n.ts` ve `locales/*.json` iskeleti var; sTressT `ui/i18n.ts` desenine genişlet (`toLocaleUpperCase("tr")`,
  `<span lang="tr">DİLEMMA</span>`). Mevcut anahtarlar `app.unsupported`, `app.contextLost`, `app.clickToPlay`,
  `app.caveat`, `app.measuring`.
- Pause menüsü: `clock.pause("menu")` / `resume("menu")`; "Sıkıştım" → `game.goto(spawn)`; Esc yalnız kilit yokken
  gelir (`input.pressed("pause")`), kilitliyken Esc = kilit kaybı → `POINTER_LOCK{locked:false}` olayı.
- `Game.bus` olayları: `POINTER_LOCK`, `QUALITY_CHANGED`, `CONTEXT_LOST/RESTORED`, `DOOR`.
- `createRenderer` null → `barrier(...)`; `boot().catch` → T3'te `ErrorScreen`. `data-screen` öznitelikleri e2e için.
- Ses grafı: `GameClock.paused` ↔ `AudioContext suspend/resume` için `clock.isPaused`'u kare başında oku.
- `hint` (Oynamak için tıkla) T3'te başlık/pause menüsüne dönüşür; `Game` içinden kaldırılabilir.

## Komutlar
```bash
npm run check
npm run e2e -- --project=chromium
npm run preview:qa        # 4181 → http://localhost:4181/?overlay=1  |  ?q=low|medium|high
npm run dev               # 5181
# konsol (qa/dev): __dilemma.state()  __dilemma.goto(0,-6.9)  __dilemma.autoPause(false)  __dilemma.loseContext()
```
