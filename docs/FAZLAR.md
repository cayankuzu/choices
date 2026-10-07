# DİLEMMA — FAZ PLANI (FAZLAR.md); v2 nihai

## Nasıl kullanılır (Çayan için)
1. Çayan her faz için Claude'a yalnız şunu yazar: **"Faz N'yi yap"** (N=0…15). Claude önce `docs/KANON.md`'yi, sonra bu dosyanın ilgili faz bölümünü ve TEKNIK/ICERIK'in bağlı kabul satırlarını okur.
2. Claude fazı turlar hâlinde (T1, T2…) üretir; her tur `npm run check` yeşil+çalışan build+kısa ara rapor ile biter.
3. Fazın son turu **regresyon turu**dur: kümülatif R listesi (R-00'dan, atlanmadan), Playwright üç tarayıcı, bench, `plan/RAPOR-F<N>.md`.
4. Claude raporu sohbete aynen yapıştırır; §7'si Çayan'ın adım adım test senaryosudur ("Build: qa, 4181" ile başlar).
5. Çayan senaryoyu tarayıcıda koşar, `plan/TEST-FORM-F<N>.md`'yi doldurur ve tek cümle yazar: **`ONAY F<N>`**.
6. Sorun varsa: **`RET F<N> [sürüm+commit]: <adım> — <görülen>`**. Claude düzeltme turu açar, yalnız kırmızı adımlar+5 adımlık duman listesi yeniden test edilir.
7. Onay gelmeden sonraki faz başlamaz. Onayla birlikte istek: `ONAY F<N> — not: <istek>` (sonraki faza "taşınan iş" olur).
8. Asset indirme yalnız `plan/ASSET-ISTEK-F<N>.md` satırlarına Çayan "onay <id'ler>" yazınca çalışır.
9. Açık kararlar (KANON §12) o fazın T1'inden önce yazılı verilir; verilmezse Claude varsayılanı uygular ve raporda belirtir.
10. Çelişkide öncelik: KANON > ICERIK > TEKNIK > bu plan; son mesaj kazanır.

## İçindekiler
0. Özet (faz tablosu, anatomi, ritüel, onay kuralları, kritik kararlar, riskler); 1–16. Fazlar F0–F15 (adları §0.1 tablosunda); 17. Kesme planı; 18. Rapor şablonu ve onay; 19. Eleştiri bulgularının işlenmesi; 20. Tutarlılık tablosu

---

## 0. ÖZET

### 0.1 Faz tablosu
Sıra ICERIK §3.0 bağımlılık grafiğini izler (Y1→Y2→Y3→{Y4→Y5; Y6; Y7; Y8}→Y9). TEKNIK/ICERIK'in kaba faz numaraları: Faz 0=F0; Faz 1=F1–F3; Faz 2=F4–F6; Faz 3=F7–F8; Faz 4=F9+F11+F12; Faz 5=F10+F13–F15.

| F | Ad | Yol | Yeni büyük seçim | Kümülatif | Claude turu | Çayan testi |
|---|---|---|---|---|---|---|
| F0 | Temel (iskelet+pencere sistemi) | Y1 çekirdeği | 0 (5 test kartı) | 0 | 8 | 60 dk |
| F1 | Ev Yolu | Y1 | B1, B2 (+B2′) | 2 | 7 | 40 |
| F2 | Paket Yolu | Y2a | B3, B4, B19 | 5 | 4 | 30 |
| F3 | Komşu Yolu | Y2b | B5, B7, B9 (+K-K1) | 8 | 5 | 45 |
| F4 | Mahalle İskeleti | Y3a | 0 (sistemler+S7) | 8 | 9 | 60 |
| F5 | Meydan İkilemleri | Y3b | B10, B11, B14, B15 | 12 | 4 | 40 |
| F6 | Çarşı ve Pazar İkilemleri | Y3c | B12, B17, B18 | 15 | 4 | 40 |
| F7 | Araba ve Fren Koridorları | Y4 | B25, B26 | 17 | 6 | 45 |
| F8 | Bariyer ve Evrenin Kodları | Y5 | B27, B28 | 19 | 4 | 30 |
| F9 | Restoran (müşteri) | Y6 | B29, B30, B31, B33 | 23 | 6 | 60 |
| F10 | sTressT Gömme (iframe, birebir) | Y7 | 0 | 23 | 4 | 45 |
| F11 | Tepe, Garip ve Final | Y8 | B34, B35, B36 (+B36′) | 26 | 5 | 45 |
| F12 | Sonlar, Döküm, Menü | Y9 | 0 (7 son tamam) | 26 | 4 | 60 |
| F13 | Cila I: ses, gök, VAT, performans | — | 0 | 26 | 7 | 60 |
| F14 | Cila II: erişilebilirlik, güvenlik, lisans, matris | — | 0 | 26 | 3 | 45 |
| F15 | Yayın | — | 0 | 26 | 3 | 60 |

Toplam **83 tur**+faz başına ≈ 1 düzeltme turu ≈ **99 tur**; Çayan ilk tur ≈ **12,5 saat**+RET başına≤15 dk. Bir tur=Fable 5'in tek oturumu (plan→kod→`npm run check`→build→ara rapor), yarım iş günü.

Neden böyle: F0 içeriksizdir (pencere sistemi en riskli parça); Y2 ikiye (sayaç ≠ diyalog/alarm), Y3 üçe bölündü (iskelet kartsız performans kapısından geçmeli; Meydan=para/yardım, Çarşı-Pazar=çocuk/vagon/ihbar); sTressT (F10) finale bağımlı değildir ve **kesme sırasında en son kesilen yoldur**; S7 F4'te (alarm A5'siz test edilemez), S2 ve DÖKÜM F1'de.

**Eski Next.js kodu:** F0-T1'de `HEAD` `next-prototype-final` etiketlenir; kaynak ve yapılandırma dosyaları `archive/next-prototype/`'a taşınır (workspaces dışı); F1–F4'te ölçü/metin referansı; **F4-T8'de silinir**, etiket kalır.

### 0.2 Bir fazın anatomisi (her fazda aynı 10 alan)
**Hedef**; **İçerik** (dosya adlarıyla); **Sistemler** (sayılarla); **Asset listesi** (kategori/adet/kaynak/lisans/onay; "kendi üretim" onay istemez); **Yapım adımları** (turlar); **Otomatik testler**; **Tam regresyon** (kümülatif R-00…R-n; yalnız büyür); **Kullanıcı test senaryosu** ("ne görmeli/ne duymalı"; sonunda iki öznel kutu: "güldün mü — nerede", "tekinsiz hissettin mi — nerede"; kayıt, kabul ölçütü değil); **Bitti tanımı**; **Onay kapısı**.

### 0.3 Kapanış ritüeli, R-LIST, build kipleri
Son turda sırayla: (1) `npm run check` kökte (`tsc` ×2, `oxlint`, `vitest run`, `vite build` ×2, `budgets.mjs`, `scan.mjs`; **zip, asset işleme ve bake dışarıda**: `npm run release | assets | bake`); (2) Playwright chromium+firefox+webkit; (3) `?bench=1`→`tools/bench/reports/<tarih>-<gpu>.json`; (4) R listesi `tools/qa/regress.mjs` ile: `plan/R-LIST.yaml` her maddeyi `{id, since, auto: '<spec>#<test>' | null, manual_min, module[]}` tutar; otomatik maddeler test raporlarından, elle maddeler `reports/manual-F<n>.yaml`'dan ("görülen" zorunlu) okunur; rapor §3 üretilir, elle yazılmaz. Kabul: faz başına elle madde≤25, toplam `manual_min`≤90; aşılırsa önce otomasyon turu. (5) Kırmızılar düzeltilir, tekrar; (6) §18 raporu; (7) Çayan testi; (8) onay/ret. Düzeltme turu kapsamı: tüm `auto`+kırmızı maddeler+`git diff` ile dokunulan modüllerin R'leri.

**Build kipleri:** `npm run dev` (5181); `npm run preview:qa`=`vite build --mode qa` (4181; `__QA__`: overlay, `window.__dilemma`, `?q=`, `?noidb=`, `?bench=`, F9 QA menüsü — bölgeye git, kartı tetikle, sonu oynat, A kur; sıkıştırma prod ile aynı); `npm run preview` (prod, 4182; tutamak yok). Çayan senaryoları **qa** build'de (0. adım: `x.y.z+qa`); F15 prod. sTressT ayrı: 5180.

**Formlar:** her faz için `plan/TEST-FORM-F<n>.md` (başlık: sürüm, tarayıcı, GPU; tablo adım/beklenen/PASS-FAIL/görülen) ve senaryonun ilk 5 adımı **duman listesi**dir. Her tur tek commit; her onay `git tag onay-F<n>`.

### 0.4 Onay ve ret kuralları
- `ONAY F<n>` tek cümle. Ret: `RET F<n> [<sürüm+commit>]: <adım> — <görülen>; …`.
- Chrome'da kırmızı=RET. Firefox/Edge'de kırmızı=RET; yalnız Çayan `ONAY F<n> — sınır kabul: <adım>, <tarayıcı>` yazarsa madde raporun §6 "Bilinen sınırlar" tablosuna (madde/tarayıcı/sürüm/kapanış fazı) girer ve en geç F14 R-142'de kapanmak zorundadır; kapanmazsa F14 RET.
- Dış hesap ön koşulları (Cloudflare, itch) gelmezse faz "onay bekliyor" durumunda kalır, RET sayılmaz.
- RET sonrası Çayan yalnız kırmızı adımlar+duman listesi; tam senaryo yalnız 2. RET'te.

### 0.5 Kritik kararlar (eleştirmen bulgularından; ayrıntı TEKNIK v1.2)
- **K1 sTressT=iframe birincil.** `apps/stresst/dist`→`apps/dilemma/public/stresst/`; `postMessage` köprüsü; sTressT'e yalnız `src/host-bridge.ts` (≤ 40 satır, standalone'da no-op)+`main.ts`'e 1 import; iframe açıkken DİLEMMA bağlamı serbest. Karar F0-T1'de kesin.
- **K2 Ölçüm sahnesi 5 sn** (2 sn ısınma+3 sn); F1'den itibaren uyanış ara sahnesine gömülü; oyun içinde yalnız düşüş yönlü otomatik kademe.
- **K3 Üç taşıyıcı:** IDB (doğruluk), BroadcastChannel, `opener.postMessage` **snapshot handoff**. `window !== window.top`→varsayılan emülatör. Yetim ebeveyn kipi. `?u=` boot: başlık/ölçüm yok, "Devam etmek için tıkla", READY=snapshot okundu (sıcak≤1,5 s, soğuk≤4 s).
- **K4 Donmada her kademede** sahne+Rapier+dokular dispose; D1'de ek `forceContextLoss`; dondurulmuş sekme heap≤80 MB; görüntü IDB `frames` deposunda; "Bu evrene dön"≤2 s.
- **K5 D1 ölçümü:** gerçek cihaz (UHD 620/630, Iris Plus 640/655, Vega 8) F4, F9, F13'te; arada GPU zamanlayıcı ms × `calib.json` katsayısı, raporda "tahmin". Cihaz yoksa `ONAY F13 — sınır kabul`, F15 öncesi zorunlu.
- **K6 VAT figüranlar F13'te** (öncesinde 3 kemikli `SkinnedMesh`,≤14 draw call).
- **K7 Saat:** `pointerLockLost` yalnız choice engine `idle` iken duraklatır. Esc davranışı Çayan kararı (varsayılan: yalnız Ayarlar katmanı, süre durmaz).
- **K8 Hata ekranı F0'da**; yasak UI kelimeleri yalnız `content.*`/`subtitle.*`.
- **K9 JS merdiveni** (gzip, başlangıç parçası): F0≤230 KB; F4≤300; F9≤340; F12≤350; `vehicle/*`, `restaurant/*`, `bridge/StressT`, `scripted/Edge*`, locale ve kart JSON'ları dinamik import.
- **K10 Paketleme** F4'ten itibaren (`pack.mjs`: `zone.pack`+indeks, `sfx.pack`); dosya sayısı ara≤250, nihai≤400.

### 0.6 Plan riskleri
P1 popup engeli→emülatör; P2 CC0 karakter tabanı→Quaternius, karar F2-T1; P3 Blender bake→`blockout.py`, chunk≤10 dk, B planı F4-T4; P4 araç hissi→F7-T2 kapısı; P5 "birebir"→iki dosya kapısı; P6 içerik şişmesi→kesme planı; P7 gerçek D1→K5; P8 test süresi→≤60 dk, duman listesi; P9 eski Next kodu→`archive/`; P10 depolama bölümlemesi→K3; P11 donmuş sekme atılır→yetim kipi.

---

## 1. FAZ 0 — TEMEL

**Hedef:** Hiç içerik olmadan çalışan, üç tarayıcıda ve itch taslağında kanıtlanmış iskelet: Vite+TS+three+Rapier, kalite algılama, gök iskeleti, girdi, kapsül hareket, TR/EN altyapısı, veri odaklı seçim motoru, hata ekranı ve **pencere sistemi** (popup+handoff+emülatör+zar+süre+ara sahne iskeleti). Kabul cümlesi: "Çayan Chrome/Firefox/Edge'de 5 derinlik açıp kapatıyor, ebeveyn doğru kareden uyanıyor, itch taslağında emülatör+handoff çalışıyor."

**İçerik:** Gerçek kart yok. `src/content/_dev/T1…T5.json` (yalnız dev/qa): T1 normal 45, T2 refleks 20, T3 araç 60, T4 ağır 90, T5 küçük 30 `onTimeout: {pick: 1}`. Test odası 24×24 m, 3 kutu (1 m, 0,35 m basamak, 4×3×3 bina), 1 kapı tetikleyici. Gök iskeleti: 3.000 prosedürel yıldız.

**Sistemler:**
- Repo: kök `package.json` (`"name": "dilemma"`, workspaces `apps/*`, `tools/*`; sürümler kökte), `apps/dilemma` (dev 5181, qa 4181, prod 4182), `apps/stresst` subtree (dosyaları değişmez; kök `vitest.workspace.ts` sTressT bench testini dışlar), `tools/bench/budgets.mjs` (faz merdiveni), `tools/qa/regress.mjs`, `tools/i18n/scan.mjs` (kaynakta Türkçe karakterli string literal→hata), `tools/release/{zip,verify-headers}.mjs`, `.github/workflows/check.yml` (ubuntu-latest, Node 22; Firefox WebGL prefs; WebGL isteyen spec'ler webkit'te `test.skip`). `tsconfig` ek bayrakları yalnız `apps/dilemma`. **R-00 ortam kontrolü**: Blender 4.2 LTS, `toktx`, fontTools, Node 22, Playwright tarayıcıları.
- `core/`: `clock.ts` (GameClock dt≤100 ms; `paused` nedenleri `hidden | frozen | menu | pointerLockLost`; K7; `decisionClock`), `rng.ts` (mulberry32+`hashSeed`), `events.ts`, `input.ts`.
- `engine/`: `renderer.ts` (caveat denemesi, ResolutionGovernor, context lost/restored), `rapierWasm.ts`+`physics.ts` (1/60,≤3 adım), `quality.ts` (K2).
- `player/PlayerController.ts` (sTressT kapsülü; TEKNIK §1.2), `sky/StarField`+`SkyDome` iskeleti.
- `ui/`: `dom.ts`, `i18n.ts`, `locales/tr|en.json`, başlık (`<title>DİLEMMA</title>`, Başla, Ayarlar iskeleti: dil, kalite, evren modu), engel ekranları, **`ErrorScreen.ts`** (tetik: `onerror`, `unhandledrejection`, chunk 3 denemede başarısız, IDB put reddi, snapshot > 64 KB; "Yenile"/"Son evrene dön"/"Hatayı kopyala"; Destek görünür), HUD iskeleti (çubuk her kare, metin 10 Hz), altyazı kuyruğu (2 × 42,≥1,2 s, 17 kr/sn), **pause menüsü** (Devam et/Ayarlar/Sıkıştım/Ana menü/Destek), `e2e/console-allow.json`.
- `choice/engine.ts` (`idle→cutscene→options→dice→continue→opening | emulating→frozen→woken`), zar `hashSeed(rootSeed, universeId, choiceId)`, zar ekranı 2 s→"Devam" (`window.open` yalnız tıklamanın senkron gövdesinde); `cutscene/` veri odaklı (TEKNIK §5.3).
- `universe/`: TEKNIK §4 tamamı — IDB `dilemma@<pathHash8>` (5 depo; `schemaVersion` 1+`migrate`+`validateState`), protokol zarfı ve 9 mesaj tipi, üç taşıyıcı (K3), donma/uyanma (K4; `focus()` çalışmayan tarayıcıda "Öne getiremiyorum; sekmeyi elle seçin"), kilit kuralı, derinlik≤4, emülatör (`pushState`/`popstate`; F5 aynı evren), yetim kipi, `?noidb=1`+`__dilemma.noIdb(true)`,≤64 evren budama, snapshot≤64 KB, sekme başlığı "DİLEMMA — Olasılık n", autosave iskeleti (`pagehide`, `hidden`, 30 s debounce).
- `audio/`: `AudioContext` ilk jestte; bus'lar `sfx, ambience, vehicle, drone, ui`; `GameClock.paused` ↔ `suspend/resume`; sentez yer tutucular.
- `dev/`: `window.__dilemma` (dev/qa): `goto`, `trigger`, `advance`, `state`, `autoPause`, `noOpen`, `noIdb`, `loseContext`, `crash`; overlay; `performance.mark` boot işaretleri.
- Yayın iskeleti: `public/_headers` (TEKNIK §9.2), `public/window-test.html` (9 madde: TEKNIK §4.7).

**Asset listesi:** IBM Plex Sans 2 ağırlık (OFL 1.1; ASSET-ISTEK-F0.md 1 satır); başlık görseli 1280×720 WebP≤120 KB (kendi); Rapier/three/meshopt (npm); 8 sentez ses (kendi).

**Yapım adımları:** T1 repo dönüşümü+etiket+subtree+R-00 ortam raporu+sTressT SHA-256 baseline (`tools/assets/stresst.baseline.json`)+K1 kararının kaydı; T2 motor (renderer, quality 5 s, Rapier, GameClock, input, PlayerController, test odası, overlay, gök iskeleti); T3 UI/i18n/ErrorScreen/pause menüsü/ses grafı; T4 seçim motoru+ara sahne+zar+5 test kartı; **T5a** IDB+protokol+gerçek pencere donma/uyanma (`window.spec` chromium); **T5b** kilit+derinlik+emülatör+`?noidb`+yetim kipi+autosave iskeleti (`lock`, `emulator`, `clock`, `dice` spec); **T5c** handoff+`_headers`+`window-test.html`+CI+Firefox/webkit matrisi+`error.spec`; T6 qa build kipi+regresyon turu (R-00…R-22), bench, rapor.

**Otomatik testler:** vitest `rng`, `clock` (paused ≠ ∅→sabit; state=options+kilit yok→1.000 ms sonra 1.000), `universe` (şema v1, migrate, budama, `open` reddi→MemoryStore, autosave debounce), `snapshot` (deep-equal;≤64 KB), `choice-engine`, `i18n` iskelet. Playwright: `boot`, `window` (istem tıklanır; çocuk state'i ebeveyn snapshot'ına eşit; ebeveyni reload→yetim kipi→uyanır), `lock`, `emulator`, `clock`, `dice`, `webgl-missing`, `error` (throw→ekran≤1 s; IDB put reddi→uyarı), `i18n` — chromium+firefox; webkit DOM spec'leri.

**Tam regresyon (F0 ile başlar):**
- R-00 Ortam: Blender 4.2 LTS, `toktx`, fontTools, Node 22, Playwright tarayıcıları; sürümler raporda.
- R-01 `npm run check` kökte yeşil; CI yeşil işaret.
- R-02 qa/prod açılış: `console-allow.json` dışı 0 hata/uyarı; `document.title === "DİLEMMA"`; prod'da `__dilemma` yok.
- R-03 Engel ekranları: WebGL2 yok/mobil/caveat.
- R-04 Kalite: `?q=` zorlar; 5 s ölçüm `dilemma.quality.v1`; aynı GPU yeniden ölçmez; oyun içi yalnız düşüş.
- R-05 Pointer lock: tıkla/Esc/yeniden; seçenek ekranında kilit yokken süre akar (K7).
- R-06 Hareket: WASD/Shift/C/Space; duvar; 0,35 m basamak; 3 m kutuya tırmanılmaz.
- R-07 Sekme gizli 10 s→hiçbir sayaç ilerlemez; görünür→sürer.
- R-08 Seçim akışı: ara sahne (0,25×, lowpass)→2 seçenek→çubuk→tıkla/dolum→zar 2 s→Devam; T5 zar atmaz, pencere açmaz; Esc kararı uygulandı.
- R-09 Zar: aynı `?u=` üç yenilemede aynı.
- R-10 Pencere: Devam→yeni sekme; çocukta "Devam etmek için tıkla"; READY sıcak≤1,5 s/soğuk≤4 s; ebeveyn `.frozen`; kapanınca≤2 s uyanış; `focus()` davranışı tarayıcı başına raporda.
- R-11 Kilit: çocukta ikinci büyük seçim→kapat→üstü çizili; çözmeden kapat→kilit yok.
- R-12 Emülatör: `noOpen(true)`→`?u=` değişir→geri→uyanır; F5 aynı evren; iframe'de varsayılan emülatör.
- R-13 Derinlik 4; render eden bağlam daima 1 (donmuşta `render.calls === 0`); D1'de canlı bağlam 1; dondurulmuş sekme heap≤80 MB.
- R-14 `?noidb=1`→bellek deposu uyarısı; oturum sürer; evrenler emülatörde.
- R-15 i18n: TR↔EN anında; `<html lang>`; `DİLEMMA` iki dilde; `İ` doğru.
- R-16 Ses: ilk jestte `running`; donmuşta `suspended`; görünürde `resume`.
- R-17 Donma: her kademede sahne/Rapier/doku dispose; D1 `forceContextLoss`; uyanış DOM; "Bu evrene dön"≤2 s; yetim kipi uyanır.
- R-18 Bütçe: başlangıç JS≤230 KB gzip; `npm ls three` tek; sTressT 76 vaka+bench ayrı.
- R-19 ErrorScreen: 5 tetikte≤1 s; üç düğme; Destek görünür.
- R-20 Handoff: çocuk snapshot'ı yoksa `NEED_SNAPSHOT`→≤ 1 s; `window-test.html` 9 madde kayıtlı.
- R-21 Pause menüsü 5 düğme; "Sıkıştım" spawn'a ışınlar.
- R-22 Snapshot deep-equal≤64 KB; çocuk state ebeveyn snapshot'ına eşit.

**Kullanıcı test senaryosu (Chrome, Firefox, Edge; ≈ 15 dk/tarayıcı+15 dk itch):**
0. Build: qa (`npm run preview:qa`→4181); sağ altta `0.0.x+qa`.
1. Siyah arka plan, ortada `DİLEMMA`, Başla, sürüm; konsol temiz (allow-list dışı).
2. Başla→**5 sn** ölçüm sahnesi→kontrol; F3 overlay (fps, draw, tri, kademe).
3. Tıkla→kilit; WASD/Shift/C/Space; basamak çıkılır, 3 m kutu çıkılmaz; Esc→pause menüsü 5 düğme; "Sıkıştım"→spawn.
4. `T`→T1: kamera devralır, dünya yavaşlar, ses boğuk, 5. sn iki fiil+çubuk; fare serbestken çubuk dolmaya devam eder. Tıkla→zar 2 s→Devam.
5. Devam→yeni sekme (`?u=u-…`), "Devam etmek için tıkla"→oyun sürer. Eski sekme gri-donuk+"Bu evren donduruldu". Başlık "DİLEMMA — Olasılık 2".
6. Yeni sekmede `T`→T2 (20 sn) dolumunu bekle→zar kendi atar→Devam→üçüncü sekme; ikinci de dondu.
7. T3→dördüncü; T4→beşinci (derinlik 4); orada T1: Devam'da **yeni sekme açılmaz**, URL değişir.
8. Sekmeleri sondan başa kapat: önceki≤2 sn'de seçim ekranında; T2'yi çözen çocuğun seçeneği ebeveynde **üstü çizili**.
9. Donmuş ebeveyni F5 ile yenile→"donduruldu" ekranı geri gelir; çocuğu kapat→uyanır (yetim kipi).
10. Çubuk dolarken başka sekmeye geç, 20 sn, dön→çubuk kaldığı yerde.
11. T1'i dolumda bırak, sonucu not et; F5 ×3→aynı.
12. Ayarlar→EN→başlık/düğmeler İngilizce; logo aynı; TR'ye dön.
13. `http://localhost:4181/?noidb=1`→"Kayıt deposu kapalı" uyarısı→T1→Devam→aynı sekmede sürer.
14. Konsolda `__dilemma.crash()`→hata ekranı≤1 s, "Son evrene dön" çalışır.
15. itch taslağına `window-test.html` yükle (SAB kutusu **kapalı**); 9 madde yeşil/kırmızı kaydedilir, ekran görüntüsü.
Öznel kutular: güldün mü/tekinsiz hissettin mi (F0'da beklenmez).

**Bitti tanımı:** (a) Claude: R-00…R-22 yeşil; Playwright chromium+firefox tam, webkit DOM spec'leri; senaryo 15 adımı üç tarayıcıda; itch maddeleri 1, 3, 5, 8 yeşil (2, 4, 6, 9 kırmızıysa bilinen sınır; 7 beklenen kırmızı); TEKNIK §1.5, §4.7, §9.1, §9.5 Faz 0 kabulleri. (b) Çayan ön koşulları: Cloudflare Pages hesabı (önizleme Cloudflare Access ile kapalı; `curl -I` COOP+wasm MIME), itch taslağı.

**Onay kapısı:** "**ONAY F0**".

---

## 2. FAZ 1 — EV YOLU (Y1)

**Hedef:** İlk gerçek dilim: içerik uyarısı→uyanış (ölçüm gömülü)→ev→B1 Çekmece→B2 Elde→S2 ya da gövde; DÖKÜM; 6 küçük ev seçimi; kırılabilirler; silah; gerçek gök; Destek; Devam/autosave; iç ses.

**İçerik:** `choices/B1.json` (45 sn, ara sahne 5, "Al/Bırak"), `B2.json` (90, 8, "Çevir/Cebine koy", `when: hasGun`, B1-A+2,5 sn; B2′ aynı kart), `K-E1…K-E6`; `endings.json` 7 kayıt (S2 `implemented`; `survives` yalnız S1), `support.json` (TR/EN≥1 kaynak+yedek+`bannedTerms`), `dialogues/ferman.json` iç ses **6 satır** (KANON §8 örnekleri), içerik uyarısı asgari metin (TR/EN 3 cümle+Destek+Devam; `warningSeen`); uyanış ara sahnesi 5 s (ölçüm gömülü; siyahtan açılış 1,5 s); `zones/ev.json` tek chunk (`pollution 0.55`); SOMA: duruk saat, radyo, takvim çivisi, telefon kablosu ucu, çamaşırlar; `signs[]` şeması.

**Sistemler:** `world/triggers.ts`; `player/Carry.ts` (Rapier dinamik, HELD grubu); `world/Breakable.ts` (6 nesne, 12 parça havuzu, ödül yok); `weapon/` (ICERIK §5.1 eylemleri; 6 mermi, "Tık."/"Boşmuş."; iz `InstancedMesh`≤40; namlu ışığı 80 ms; **kendine 2 sn→B2′**); `sky/` (BSC5 9.110 yıldız; Samanyolu 2048×1024; `uPollution`; `eyeAdapt` eşik 0,12/20 s/2 s; gök dönmez); `save/settings.ts`; `save/autosave.ts` (`pagehide`, `hidden`, bölge değişimi, kart çözümü, 30 s)+başlıkta **Devam**; `narration/InnerVoice.ts` (≥ 20 s aralık, büyük seçim sonrası 30 s sus,≤5 kelime); `ui/Dokum.ts`; Destek şeridi (`noopener`, 3 s yedek); S2 oynatıcı; asset hattı `tools/assets/*.mjs --app dilemma` (TEKNIK §7: lods/quantize/meshopt; `kenney` ve `freesound` fetcher'ları; `Data-Attribution`; `licenses.json`); `schemaVersion` 2+`fixtures/save-F1.json`.

**Asset listesi (ASSET-ISTEK-F1.md; Kenney satırları paket başına):** yer evi iç kiti ≈ 12 parça (Kenney/Poly Haven CC0); mobilya 10; küçük nesne 18; toplu tabanca 1 (Kenney Weapon Pack CC0 ya da Poly Pizza CC-BY 4.0); radyo 1; araba dış gövde 1 (Kenney Car Kit); Yale BSC5 (Data-Attribution: "Hoffleit & Warren 1991, CDS V/50"); ESO/S. Brunier Samanyolu (CC BY 4.0); ≈ 36 ses klibi (Kenney+Freesound CC0).

**Yapım adımları:** T1 ASSET-ISTEK-F1+`tools/assets` taşıma+greybox ev+uyanış+tetikleyiciler; T2 asset işleme+ev chunk'ı+Carry+Breakable; **T2b** `weapon/` tamamı (B2′ tetiği qa overlay'e düşer); T3 B1/B2/B2′ veriden+K-E1…6+S2+DÖKÜM+Destek+içerik uyarısı; T4 gök+settings+ilk ses paketi+ölçüm uyanışa gömülü; T4b autosave+Devam+InnerVoice+`subtitles.test`+`scan.mjs`+şema v2; T5 regresyon (R-00…R-38), bench ev (vekil), rapor.

**Otomatik testler:** 10 içerik test dosyası var olur (TEKNIK §6.3; `expectedBig`=2; `bannedTerms` tüm `locales/*.json`; `walk` iskelet `est` verisiyle), `subtitles.test` (TR/EN≤84 karakter, uzunluk/17≤gösterim süresi), `universe.test` fixture F1, `innervoice.test` (aralık, uzunluk, yasak kelimeler). Playwright `i18n.spec` tam (EN'de DOM'da Türkçe karakter yok, marka hariç), `support.spec`, `boot.spec` uyarı; `autosave.spec` (kapat→aç→Devam→konum ±1 m, bayraklar eşit, kart süresi korunur).

**Tam regresyon:** R-00…R-22, yeni:
- R-23 İçerik uyarısı ilk açılışta; Destek düğmesi; `warningSeen`.
- R-24 Uyanış 5 s (ölçüm gömülü; `dilemma.quality.v1` yazılır); giriş kapalı.
- R-25 B1/B2 JSON'dan; B2 yalnız B1-A+2,5 sn, 90 sn, köşede Destek; B1-B çekmece 3 cm; B2-B cep sarkar.
- R-26 S2→DÖKÜM 6–9 satır, 18 kr/sn, damga, Destek gizlenemez, "Bu pencereyi kapat" ebeveyni uyandırır, "Baştan" yeni run.
- R-27 K-E1…K-E6 30 sn kendi cevabı; pencere yok; iki anahtar; aynada oda boş.
- R-28 Silah: tüm eylemler; 6 mermi, "Tık."; göm 40 sn; kendine 2 sn→B2′; ödül yok.
- R-29 6 kırılabilir; yalnız bayrak; Döküm≤1 satır.
- R-30 Gök: 9.110 yıldız+Samanyolu; 20 s'de açılır; yıldızlar kaymaz.
- R-31 Perde açılınca gök içeriden; musluk 3→12 sn; B2'de susar.
- R-32 Ayarlar kalıcı.
- R-33 `npm run assets -- --app dilemma` tek komut; `licenses.json`; ESO+BSC5 atıfları; izinsiz lisans build'i durdurur; `--app stresst` çıktısı baseline ile eşit (üçgen ±0, doku ±0, dosya ±%1).
- R-34 10 içerik testi+`subtitles`+`innervoice` yeşil; `scan.mjs` 0 bulgu.
- R-35 Bench ev: D2 60 fps; GPU vekili raporda ("tahmin").
- R-36 Autosave/Devam: kapat→aç→Devam→konum ±1 m, bayraklar deep-equal, kart süresi korunur.
- R-37 İç ses 6 satır nesne tetikli;≤2 satır/dk; büyük seçim sonrası 30 s sus.
- R-38 Şema v2; F0 kaydı açılır ya da "Eski kayıt sıfırlandı"+0 hata.

**Kullanıcı test senaryosu (≈ 40 dk, Chrome; Firefox/Edge 1–6, 9):**
0. qa build; önceki fazın kaydı silinmeden.
1. İçerik uyarısı→Başla→siyahtan açılış→uyanış 5 s→kontrol. Saniye ibresi titriyor; "Titriyor." iç sesi.
2. Perde E→küçük kart 30 sn→Aç→Samanyolu. Bir sonraki küçük kartta 30 sn bekle→Ferman kendi cevabı.
3. Radyo→"…sabah…" kesilir; "Aynı kadın."
4. Çekmece→**B1** (5 sn ara sahne, 45 sn)→Al→zar→Devam→yeni sekme→tıkla.
5. 2,5 sn sonra **B2**: kamera çöker, musluk susar, renk çekilir, Destek köşede→Cebine koy→üçüncü sekme.
6. Silah: F, sağ tık, sol tık→tabak kırılır; 6 atış→"Tık."+"Boşmuş."; kendine 2 sn→**B2′**.
7. Sekmeyi kapat, aç, Devam→aynı yerde, silah aynı durumda.
8. Kase→iki anahtar; ceket→"Düğme yok."
9. İkinci sekmede "Bu evrene dön"→B2 ekranı→Çevir→**S2**→DÖKÜM (daktilo, Destek; Hızlandır Destek'i atlamıyor).
10. Destek→yeni sekme `noopener`; evren sayısı aynı.
11. Bahçede 20 sn hareketsiz→gök açılır; eve girince 2 s'de kapanır.
12. EN→DÖKÜM aynı satır sayısı; dünyada Türkçe UI kalıntısı yok.
Öznel kutular.

**Bitti tanımı:** R-00…R-38; ICERIK Y1 Kabul; TEKNIK Faz 1 kabulleri (§2 bench, §3 gök, §5, §6, §7 baseline, §8).

**Onay kapısı:** "**ONAY F1**".

---

## 3. FAZ 2 — PAKET YOLU (Y2a)

**Hedef:** Koli, 180 sn sayaç ve gerekçesi, B3, B4, B19; Zeynel ve Esvet; kapı önü izi.

**İçerik:** `B3.json` (45/6, "Al/Bırak"), `B4.json` (45/6, "Çal/Eşiğe bırak"; koli elde, sayaç < 180), `B19.json` (45/6, "Paketi uzat/Yürü"); `events/paket-sayac.json` (5 durum+270 s izi); `dialogues/sokak.json`: Zeynel "Yan kapıymış. Üstünde acil yazıyor."/"Şikâyet için numara arkada."; Esvet "O… o bana da lazım." (ilaç adı yok). B4-A: Hurşit kapıyı açar, elinde boş ilaç kutusu, koliden yenisini çıkarır, bir tane alır, "Geç kaldı sandım.", "Çay demledim, boşa gitmesin." (eşikte durur; giriş F3). B3-B: Zeynel 90 sn sonra teslim eder; **Hurşit'in zili B9'u doğrudan açar** (F3'te); `deliveredBy ∈ {ferman, zeynel}`. 270. sn kapı önü izi: kapı aralık, Kıymet tencere bırakıp gider, Paşa miyavlar, zil kapağı bantlı; Döküm "Koli: elde kaldı."/"Yan ev: radyo yok." İç ses 3 ("Ağır.", "Yan kapı.", "Gitti."). Bölge `zones/mahalle.json` chunk 1 (`pollution 0.8`).

**Sistemler:** `events/PackageTimer.ts` (ev içi 1×, kart açıkken 0,25×, frozen/hidden durur, teslimde ya da **baston çekince** kalıcı durur; 120/150/180 s etkileri; 40 m kuralı; 270 s `hursitDoorMarked`); taşıma kuralları; B4-B: **10 m veya 40 sn, hangisi önce**; `npc/Npc.ts` iskeleti; motosiklet `PannerNode`; chunk 2 streaming+hücre kuralı; şema v3.

**Asset listesi (ASSET-ISTEK-F2.md):** Hurşit (Quaternius Universal Base Characters+Universal Animation Library CC0; 3 animasyon); Zeynel+motosiklet; Esvet; koli+etiket dokusu "HURŞİT —, yan kapı" (`signs[]`); sokak kiti 6 parça; ilaç kutusu; 8 ses klibi.

**Yapım adımları:** T1 ASSET-ISTEK-F2 (P2 karakter kararı)+PackageTimer+taşıma+chunk 2 greybox; T2 NPC iskeleti+B3/B4/B19+ara sahneler+40 m+Zeynel/Esvet satırları; T3 270 s izi+boş ilaç kutusu sahnesi+sesler+EN+şema v3; T4 regresyon (R-00…R-47), bench mahalle-1, rapor.

**Otomatik testler:** `timer.test` 7 senaryo (ev içi 180; kart 0,25×; frozen sabit; teslim kalıcı; yok edilince 180; eşiğe bırak+bekle 40 s→durur; 270 s `hursitDoorMarked`), `flags.test` (B19 `hursitVisited=false`; `deliveredBy`), `graph.test` (B3-B yolu Hurşit'i yaşatır ve B9'a ulaşır — F3'te yeşil), `walk.test` Y1+Y2a, `i18n` Esvet `bannedTerms`. Playwright `clock.spec`: sayaç gizli sekmede durur.

**Tam regresyon:** R-00…R-38, yeni:
- R-39 Sayaç 7 senaryo; overlay'de kalan ms.
- R-40 Koli elde: "Elin dolu."; yere bırak/al.
- R-41 B3-B: 90 sn Zeynel teslim, iki satır; Hurşit yaşar; B4/B19 çıkmaz; zil B9'u açar (F3).
- R-42 B19 ön koşullar; Esvet ilaç adı yok; A→180 s radyo susar (40 m).
- R-43 120 s eğilme, 150 s kısılma, 180 s yarım cümle, 270 s kapı önü izi+Döküm satırları.
- R-44 B4-A: boş kutu, "Geç kaldı sandım.", sayaç durur; B4-B: 10 m veya 40 sn, baston çekince durur.
- R-45 Chunk 2 streaming; kapı kapalıyken dış chunk görünmez; `programs` sabit.
- R-46 Şema v3; F1 fixture açılır.
- R-47 İç ses 3 yeni satır.

**Kullanıcı test senaryosu (≈ 30 dk):**
0. qa build; eski kayıtla aç→devam ya da "Eski kayıt sıfırlandı".
1. Anahtarları al, kapıyı aç→paspasta koli; etiket; motosiklet sağdan sola; Zeynel'in iki satırı uzaklaşmadan önce.
2. **B3**→Bırak→yeni sekmede 90 sn: Zeynel döner, yan kapıya teslim eder. Hurşit'in ziline bas→(F3'e kadar) kapı açılır, Hurşit eşikte.
3. Ebeveyn→Al→koli elde; F→"Elin dolu."
4. Zil→**B4**→Çal→boş ilaç kutusu, bir tane alır, "Geç kaldı sandım."+çay cümlesi; overlay sayaç durdu.
5. Ebeveyn→Eşiğe bırak→kapının önünde bekle→40 sn'de baston koliyi çeker, sayaç durur. Yeni evrende 10 m uzaklaş→aynı sahne daha erken.
6. Yeni run: koliyle sokağa→Esvet→**B19**→Uzat→120/150/180 sn etkileri; 270 sn'de kapı önü izi (aralık kapı, tencere, Paşa, bantlı zil).
7. Kart açıkken sayaç 4× yavaş (overlay).
Öznel kutular.

**Bitti tanımı:** R-00…R-47; ICERIK Y2 Kabul sayaç maddesi; bench mahalle-1 vekil≤36 ms.

**Onay kapısı:** "**ONAY F2**".

---

## 4. FAZ 3 — KOMŞU YOLU (Y2b)

**Hedef:** Hurşit'in evi ve sohbeti, B9, B5, K-K1, B7, Paşa, alarm çekirdeği; Y2 tamamlanır.

**İçerik:** `B9.json` (45/5, "Gir/Git"; `when: hursitHasBox && hursitAlive`; Zeynel teslim ettiyse Hurşit varyantı "Kurye getirdi. Çay demledim, boşa gitmesin."), `B5.json` (45/6, "İndir/Ateş et"), `B7.json` (45/6, "Al/Elini çek"), **`K-K1.json`** (`kind: small`, 30 sn, "Kaç/Kal", `onTimeout: {pick: 1}`; iki yol 6 sn sonra Kıymet'in perdesi önünde; iç ses "koşuyorum/duruyorum"); `dialogues/hursit.json` (K-H1…K-H6;≤6 dk); davet kartı ("…ve bir misafiri"; "Ihlamur."); B9-B 180 sn sonra tabaklı bardak; ölü ev varyantı; SOMA: buzdolabı notu **"İlaç — son kutu"** (iki kat, aynı kalem), çevrilmemiş takvim; iç ses 3 ("İki çift.", "Gülmüyor.", "Ihlamur."). Hurşit iç hücresi.

**Sistemler:** `dialogue/DialogueTree.ts`; `weapon/Aim.ts` (hedef sınıfları; derin NPC≥2 sn→kart; "Veremem."); `alarm/Alarm.ts` çekirdek (`events/alarm.json`: **B5-B +3→A4+180 sn**; `boxTimerExpired` alarm etkisi 0 — yalnız Kıymet'in perdesi o gece kapanmaz; tanık sayımı; Kıymet perdesi; A1–A3 180 s gevşeme; A5 F4'te — F3'te "beklemede"); `npc/Cat.ts`; ölü ev kipi; yan ev anahtarı; göm satırı; şema v4.

**Asset listesi (ASSET-ISTEK-F3.md):** Hurşit 3 animasyon+Kıymet büstü; Paşa (Quaternius Animals ya da Poly Pizza CC-BY 4.0); ev içi 12 nesne; davet kartı (kendi); 11 ses.

**Yapım adımları:** T1 Hurşit hücresi+DialogueTree+B9 (iki varyant)+K-H1…6; T2 Aim+B5+K-K1+ölü ev+B7+Paşa; T3 Alarm çekirdeği+tanık+Kıymet+A4 sayacı+gevşeme+SOMA; T4 B9-B bardak+göm+sesler+EN+şema v4; T5 regresyon (R-00…R-56), bench, rapor.

**Otomatik testler:** `dialogue.test` (çıkmaz yok; her K-H `pick`;≤6 dk), `aim.test` (1,9 s yok/2,0 s var; çocuk sınıfı kilit yok), `alarm.test` (kaynak toplamları; 180 s gevşeme; A4–A5 kilitli; `hasGun=false, boxTimerExpired=true, 600 s olaysız→A sabit`), `choices.test` (`kind: big`+`opensWindow: false` kart yok), `graph.test` (B5-B sonrası B9 yok, B7 var; S4'e B3-B yolundan ulaşılır), `walk.test` Y2.

**Tam regresyon:** R-00…R-47, yeni:
- R-48 B9 iki varyant; Git→180 sn sonra tabaklı bardak; B3-B yolundan zil→B9.
- R-49 Sohbet≤6 dk; K-H 30 sn; K-H4 yeniden istenebilir.
- R-50 B5≥2 sn; B5-B→A4+180 sn; K-K1 küçük kart 30 sn, pencere yok, iki yol aynı karede biter; B7 açılır, B9 kapanır.
- R-51 Ölü ev: radyo susmuş, kapı aralık, kart masada; "Ihlamur."
- R-52 Paşa: otur/yürü/kaç; tekme isabet etmez.
- R-53 Alarm çekirdeği: tanık sayımı; perde; A1–A3 180 s iner; sayaç dolması A'yı değiştirmez.
- R-54 "H. — yan ev" anahtarı.
- R-55 Göm: Hurşit yaşıyorsa cümle; ölüyse sessiz.
- R-56 Buzdolabı notu "İlaç — son kutu"; şema v4.

**Kullanıcı test senaryosu (≈ 45 dk):**
0. qa build.
1. Koliyle B4 Çal→**B9**→Gir→terlik rafı, ütü buharı, TV; Hurşit çay koyar; buzdolabında "İlaç — son kutu".
2. K-H1…K-H6; K-H4 kart→"Ihlamur."≤6 dk.
3. Yeni run: B3 Bırak→Zeynel teslim→zile bas→**B9** "Kurye getirdi…" çıkmalı.
4. Yeni sekmede Git→180 sn→tabaklı bardak.
5. Silahla, koli teslimde: Hurşit'e 1,9 sn→yok; 2 sn→**B5**. İndir→"Çay soğuyor."
6. Ateş et→Hurşit düşer (kan yok)→**K-K1** küçük kart (30 sn çubuğu)→Kaç→6 sn sonra Kıymet'in perdesi önü; overlay A=4, 180 sn.
7. Koliyi alıp 10 dk sokakta silahsız gez→sayaç dolar→alarm değişmez.
8. Mutfak (kapı aralık)→iki temiz bardak→**B7**.
9. Küreği al, göm (40 sn)→Hurşit yaşıyorsa "Ne dikiyorsun orada?"
10. EN'de K-H turu.
Öznel kutular.

**Bitti tanımı:** R-00…R-56; ICERIK Y2 Kabul tamamı; 8 büyük seçim veriden; EN eş (`scan`, `subtitles`, `i18n.spec`).

**Onay kapısı:** "**ONAY F3**".

---

## 5. FAZ 4 — MAHALLE İSKELETİ (Y3a)

**Hedef:** Dört dış bölge serbest dolaşıma açılır: streaming, pişmiş ışık+lamba maskesi, KTX2, paketleme, figüranlar, alarm 0–5 tam, bekçi, Postal 9, SOMA/tekinsizlik, bölgeye bağlı gök, **S7** (iki varyant). Kart yok; **ilk gerçek D1 ölçümü ve kalibrasyon**.

**İçerik:** `zones/mahalle.json` (2 chunk), `meydan.json`, `carsi.json` (2), `pazar.json`; komşu girişler uzak hal; `events/alarm.json` tam; S7 `variants: 2` (`hasGun`: "Silahı yere bırakın." ×2; silahsız: "Araçtan uzaklaşın." ya da "Ellerinizi görelim."; tanık, poşet, iki far, röle tıkı, elma aynı); SOMA mahalle 8+**kuş yok kuralı**; tekinsizlik 6; `signs[]` ≈ 10 yazı iki dilde (EN çeviri şeridi≥0,7 s nişangâh); iç ses 8; `content/zones/<zone>.layout.json` ×4 (Claude yazar).

**Sistemler:** `world/ZoneStreamer.ts` (TEKNIK §2.7); **`tools/bake/blockout.py <zone>`** (layout.json→`zone.glb`+`zone.col.glb`+`zone.json` headless; Çayan Blender'da yalnız isterse süsler); **`tools/bake/bake_zone.py`** (Cycles CPU 128 örnek+OIDN; 2048² lightmap+1024² lamba maskesi; chunk≤10 dk, aşarsa 1024² ve T4 B planı; `npm run bake` ayrı); lamba maskesi shader'ı; lamba vur→0,3 s, kirlilik −0,08; KTX2 hattı (`toktx`); **`tools/assets/pack.mjs`** (K10); instancing/batching/LOD; `npc/Extras.ts` (8–14/bölge; 3 kemikli `SkinnedMesh` 4 model × 3 doku≤14 draw call); `npc/Watchman.ts`; alarm tam (A4 sayacı dışarıda durur); Postal 9 (tekme, fırlat, lambayı vur, kasaları devir, çeşmeye kafa, konteyner, sandalye+otur, havaya ateş, afişi yırt); `sky/Pollution.ts`; `ui/SignSubtitle.ts` (EN); S7 oynatıcı; gök kademeleri; GPU vekili `tools/bench/gpu.ts`+`calib.json`; `budgets.mjs` dosya≤250, JS≤300 KB; şema v5.

**Asset listesi (ASSET-ISTEK-F4.md; Kenney paketleri paket başına):** sokak kiti ≈ 22 (Kenney City Kit Suburban+Poly Haven); Meydan 7 kalem; Çarşı 9 kalem (ray, kol, tabelalar kendi); Pazar 5 kalem; figüran 4 × 3+bekçi; yarasa sprite, horoz/köpek uzak sesleri, ufuk şeridi; ≈ 45 ses; `toktx` kurulum.

**Yapım adımları:** T1 ASSET-ISTEK-F4+`layout.json` ×4+`blockout.py`+ZoneStreamer greybox; T2 asset işleme+instancing/LOD+KTX2+`pack.mjs`; T3 `bake_zone.py`+lamba maskesi+lamba vur; **T4 karar kapısı P3** (bake 2 turda oturmazsa vertex AO); T5a figüranlar+bekçi; T5b alarm tam+Postal 9; T6 SOMA/tekinsizlik+`signs[]`+Pollution+gök kademeleri+S7+iç ses 8; T7 performans turu: bench 4 bölge, GPU vekili, **gerçek D1 ölçümü+`calib.json`**, `archive/next-prototype` silinir; T8 regresyon (R-00…R-71), rapor.

**Otomatik testler:** `budget.test` (4 bölge üçgen/doku≤D1), `anchors.test`, `alarm.test` tam (A5→S7 yalnız mahalle bölgelerinde), `streaming.test`, `licenses.test` (100+ asset), `postal.test` (`give: money`/CR yok), `endings.test` (S7 iki varyant≥6 satır), `pack.test` (indeks ofsetleri; 16 bayt hizalama), `i18n.test` (`signs[].textKey` iki dilde), `audio-budget.test` (kuş klipleri yalnız `yamac`/`ucurum` paketlerinde). Playwright `boot.spec`: Meydan 8 kontrol noktasında draw≤120, tri≤150 k, `programs` sabit.

**Tam regresyon:** R-00…R-56, yeni:
- R-57 Streaming: takılma yok;≤2 tam+3 uzak; 20 s boşaltma; bellek düşer.
- R-58 Lamba vur→0,3 s; emissive; gök açılır; 3 lamba→A+1.
- R-59 KTX2 tüm bölge dokuları; D1 doku≤160 MB (tahmin).
- R-60 Figüran 8–14 A0; A2 çocuk/yaşlı çekilir; A3 2–3; A4 boş; kademe sayıyı değiştirmez.
- R-61 Alarm 0–5 tam; A1–A3 180 s iner; A4 180 s; A5→S7.
- R-62 Bekçi: A3 6 m iki satır; A4 düdük+takip; doğrultma→avuç; ateş→A5; dokunmaz.
- R-63 Postal 9: ₺/CR yok; Döküm≤1 satır; Paşa'ya tekme isabet etmez; konteynerde tanık 0.
- R-64 SOMA 8+tekinsizlik 6; horoz bir kez; mahalle bölgelerinde kuş sesi yok.
- R-65 Kirlilik: Meydan'da kadir > 3,5 yok; geçiş 2 s; sönen grup −0,08.
- R-66 Sandalye taşı/otur 60 s→gök; çeşmeye kafa 5 s boğuk.
- R-67 S7 iki varyant: `hasGun=false`'ta hoparlör metni farklı, silah sesi karışımı yok; Döküm+Destek.
- R-68 Bench Meydan: gerçek D1 p95≤36 ms, %1 düşük≥24; draw≤120; tri≤150 k; GPU≤350 MB; heap≤250 MB; `calib.json` yazıldı.
- R-69 `programs` bölge yüklendikten sonra sabit.
- R-70 Pack: dosya sayısı≤250; JS≤300 KB; `blockout.py` ve `bake_zone.py` `npm run check` dışında; bake chunk≤10 dk raporda.
- R-71 EN'de 8 SOMA yazısı altyazı şeridiyle okunur (TR'de şerit çıkmaz); iç ses 8; şema v5.

**Kullanıcı test senaryosu (≈ 60 dk; Chrome tam, Firefox/Edge 1–4, 9):**
0. qa build.
1. Ev→Cadde→Meydan: çeşme, kahveci, durak "İLK SEFER: —"; overlay fps/draw/tri; `?q=low`.
2. Sandalyeyi karanlık köşeye taşı, otur→60 sn'de gök; merkezde kadir > 3,5 yok.
3. Lambaya ateş→söner, gök açılır; 3 lamba→A=1.
4. Vitrine elma→cam→A=2→çocuk/yaşlı çekilir, kepenkler, yönsüz düdük.
5. Havaya 3 atış→A=3→bekçi "Eve git."; doğrult→avuç; konteynere gir→tanık 0.
6. Pasajda geç adım; afişi yırt→eski baskı; fırın ışıklı, kimsesiz; mahallede kuş sesi yok.
7. Pazar: kasaları tekmele; "Sabah açarız."
8. 180 sn olaysız→A iner. Bekçiye ateş→A=5→**S7** (silahlı varyant).
8b. Yeni run silahsız: 3 vitrin camı+2 kepenk (3'er vuruş)→A=4→180 sn→**S7 silahsız**: hoparlör "Ellerinizi görelim."
9. Koşarak dört bölge turu: takılma, kayıp doku, siyah kare yok.
10. EN: tabelaya 1 sn bak→çeviri şeridi.
11. Gerçek D1 cihazında (ödünç) adım 1 ve 9; overlay p95≤36.
Öznel kutular.

**Bitti tanımı:** R-00…R-71; TEKNIK §2.4 lightmap (ya da T4 B planı) ve §7.2 KTX2; bench 4 bölge; D1 gerçek rapor+`calib.json`; `archive/next-prototype` silindi; ICERIK Y3 Kabul alarm/Postal maddeleri.

**Onay kapısı:** "**ONAY F4**".

---

## 6. FAZ 5 — MEYDAN İKİLEMLERİ (Y3b)

**Hedef:** B10, B11, B14, B15; Yadigâr, Sıdkı, Muzaffer, eczacı; ₺ 140.

**İçerik:** `B10.json` (45/5), `B11.json` (45/5), `B14.json` (45/5; A≤2), `B15.json` (45/6; eczane içi; A≤2); K-M1…K-M4 (K-M4 "Nöbet mi?"→"Hep."); kahveci "Kaşık yok. Parmağınla."; Sıdkı "Tam."; Muzaffer "Bakma."/"Sağ ol."; eczacı "Tarih kısmına bugünü yazın."; cüzdan 85₺+kimlik+mum amblemli kart; form "…BAĞIŞ…"+"Karar tarihi: __/__/__" (`signs[]`); eczane hücresi; iç ses 4 ("Seksen beş.", "Uyar.", "Tarih.", "Bakmıyor.").

**Sistemler:** `economy/Wallet.ts` (140, HUD yok, E ile say; negatif imkânsız); Sıdkı 180 sn arama→`sidkiAtRestaurant`; düğme eşyası (20 sn dikiş sahnesi); form eşyası (`formSigned`); eczane hücresi; A3 bağı; kahveci oturma; yarı-derin doğrultma "Yaklaşma."; şema v6.

**Asset listesi (ASSET-ISTEK-F5.md):** Yadigâr, Sıdkı, Muzaffer, eczacı (Quaternius+animasyon kütüphanesi); cüzdan/kimlik/kart/banknot/düğme/kesik şişe/form/kalem 8; eczane iç 6; 9 ses.

**Yapım adımları:** T1 Wallet+K-M1→B10+düğme+K-M3; T2 B11+Sıdkı+cüzdan UI; T3 eczane+K-M4+B14+B15+form; T4 regresyon (R-00…R-78), `economy.test` 4 satır, rapor.

**Otomatik testler:** `economy.test` (140/120/115/225; hepsi→0; negatif yok), `flags.test` (A3'te 4 içerik kapanır), `graph.test` (B11-A bayrağı restoranda okunur), `dialogue.test` (eczacı/kahveci satırları), `walk.test` Y3 kısmi.

**Tam regresyon:** R-00…R-71, yeni:
- R-72 ₺ 140; HUD yok; cüzdan E ile sayılır.
- R-73 K-M1→B10; −20/−10; hepsi→0; düğme iki yolda; "Geç"→düğme yok; Yadigâr istemez.
- R-74 B11 Götür→Sıdkı 180 sn, sonra restoran bayrağı; Al +85.
- R-75 B14 A≤2; "Sağ ol."; B15 eczane içi; form cepte; Döküm satırı.
- R-76 K-M3 çay 5₺; "Kaşık yok. Parmağınla."; K-M4 "Hep."
- R-77 `economy.test` 4 satır.
- R-78 A3'te Yadigâr/Muzaffer/form çıkmaz; yarı-derin doğrultma kapatır; ateş +3 pencere yok; iç ses 4; şema v6.

**Kullanıcı test senaryosu (≈ 40 dk):**
0. qa build.
1. Cüzdanı aç→140; çay iste→135, "Kaşık yok. Parmağınla."
2. Yadigâr avuç açar→K-M1→**B10** Biraz→115, düğme→K-M2. Yeni sekmede Hepsi→0; dikiş sahnesi.
3. Durak cüzdanı→**B11** Götür→Sıdkı "Tam."; yeni sekmede Al→225.
4. Sedirde Muzaffer "Bakma."→**B14**→eczacı gider.
5. Eczane; K-M4 "Nöbet mi?"→"Hep."; form→**B15**→İmzala→cebe.
6. A=3 yap→Yadigâr yok, sedir boş, form gelmez.
7. Yadigâr'a doğrult→"Yaklaşma."
Öznel kutular.

**Bitti tanımı:** R-00…R-78; 12 büyük seçim; `economy.test` 4 satır; EN eş.

**Onay kapısı:** "**ONAY F5**".

---

## 7. FAZ 6 — ÇARŞI VE PAZAR İKİLEMLERİ (Y3c)

**Hedef:** B12, B17, B18; Boncuk, bej montlu adam, Hacı Vehbi; vagon/makas; Y3 tamamlanır.

**İçerik:** `B12.json` (**20**/6; K-P1; A≤1; silah görünmüyor), `B17.json` (**20**/8; A≤3; kola≤3 m; "MAKAS — ÇEKMEYİN" `signs[]`), `B18.json` (**20**/5; A≤2); K-P1, K-Ç1; Boncuk "Annem 'gelirse gitme' dedi."; Vehbi "Çekersem gelirler."; iki söylenti; vagon sahnesi (sayı yok, ölüm gösterilmez); Postal 12 vagonu it; iç ses 3 ("Soğuk demir.", "Ters.", "Kırmızı.").

**Sistemler:** `scripted/Wagon.ts` (kinematik 60 m; sahne olayı); makas kolu≤3 m; çocuk kuralı; ihbar direği+geçici alarm; söylenti sistemi; anons; şema v7.

**Asset listesi (ASSET-ISTEK-F6.md):** Boncuk, bej montlu adam, Hacı Vehbi, esnaf başı; direk, takoz, kovalar, örtü 4; 10 ses.

**Yapım adımları:** T1 Wagon+makas+B17+K-Ç1+Çiçek Pasajı+vagonu it; T2 Boncuk/adam+çocuk kuralı+K-P1+B12+söylenti+anons; T3 direk+Vehbi+B18+geçici alarm; T4 regresyon (R-00…R-83), rapor.

**Otomatik testler:** `aim.test` çocuk kilidi, `alarm.test` geçici +1, `flags.test` (A eşikleri), `i18n.test` (B17 metinlerinde `\d` yok), `walk.test` Y3 20–40 dk.

**Tam regresyon:** R-00…R-78, yeni:
- R-79 B12 A≤1, K-P1 sonrası, 20 sn; silahla Boncuk kaçar; nişan kilitlenmez; iki söylenti.
- R-80 B17≤3 m, A≤3; 0,25×; sayı/ölüm yok; A→pasaj kapalı, A+1; K-Ç1 bakış.
- R-81 B18: A→Vehbi oturur; B→zil, bekçi, çay, bakmaz; +1 180 s geçici.
- R-82 Söylentiler kahvecide; vagonu it 2 m, ödül yok.
- R-83 İç ses 3; şema v7.

**Kullanıcı test senaryosu (≈ 40 dk):**
0. qa build.
1. Pazar: Boncuk→K-P1→adam, telefon→**B12** (20 sn) Tut→anons, A=1; yeni sekmede Bırak→gider; kahvecide iki söylenti.
2. Silah elde pazara→Boncuk kaçar; kart yok.
3. Çarşı hattı: vagon, "Tutun!"→**B17**→Çek→ses, kova, sessizlik; esnaf başı; pasaj kapalı; vagonu it.
4. Kırmızı direk: Vehbi→**B18**→Geri dur→zil, bekçi, çay; +1 180 sn geçici.
5. A=4'te B17/B18 çıkmaz.
Öznel kutular.

**Bitti tanımı:** R-00…R-83; ICERIK Y3 Kabul tamamı; 15 büyük seçim.

**Onay kapısı:** "**ONAY F6**".

---

## 8. FAZ 7 — ARABA VE FREN KORİDORLARI (Y4)

**Hedef:** Arcade-gerçekçi araba, 4 fren koridoru, B25, B26; Postal araçlı 3.

**İçerik:** `B25.json` (**60**/8; hız > 80≥1,5 sn; K1–K4; engeller), `B26.json` (45/6; +25 sn); K-A1…K-A3; `events/koridor.json`; `zones/okul-yolu.json` (2 chunk, `pollution 0.6`)+pazar arkası düzlüğü; araba saati duruk; radyo araçta; karşı kaldırım figürü; iç ses 3 ("Döndü.", "Pedal boş.", "Duruyor.").

**Sistemler:** `vehicle/Vehicle.ts` (dinamik import; Rapier `DynamicRayCastVehicleController`+arcade katmanı: 0→100 6 s, 120 tavan, geri 25, 120'de direksiyon 0,35×; anahtar şart; kokpit; korna; far tek spot; `speedKmh`), `vehicle/Corridor.ts` (çizgi; silahlanma; pedal "tık… fısss"; 0,25×; çarpma gösterilmez), araç devre dışı (`vehicleDisabled`→S5 yok), sersemlemiş 240 s, figürana çarpma +2, korna spam +1, kendi arabana vur, Paşa kaputtan atlar, uzun far→`eyeAdapt` 0, streaming 100 m önce, araç ses katmanı 12 klip; şema v8.

**Karar kapısı F7-T2 (P4):** iki turda ölçüt (Çayan 3 denemede koridora > 80 ile kontrolü kaybetmeden girer; devrilme yok; 60 fps titreme yok) sağlanmazsa 2B bisiklet modeli+4 zemin ışını, Rapier yalnız çarpışma. Raporda yazılır.

**Asset listesi (ASSET-ISTEK-F7.md):** araba kokpit+dış 4 LOD+hasar 2; engel seti 4 kalem; koridor siluetleri 4; levha/çit/cephe 4; 18 ses.

**Yapım adımları:** T1 Vehicle+biniş/iniş+kokpit+korna+farlar+düzlük; **T2 karar kapısı P4**+Okul Yolu 2 chunk; T3 Corridor+B25 K1–K4+çarpma sunumu+devre dışı; T4 B26+K-A1–3+sersemlemiş+Postal araçlı 3+figür+sesler; T5 streaming 120 km/s+bench araçla (vekil); T6 regresyon (R-00…R-91), rapor.

**Otomatik testler:** `vehicle.test` (6 ± 0,5 s; 120; 79 km/s 1,5 s yok; 81/1,4 yok; 81/1,5 var), `graph.test` (B26 sonrası S5 yok), `alarm.test` (çarpma +2; korna +1; B26), `i18n.test` koridor `bannedTerms`, `walk.test` Y4; `boot.spec` Okul Yolu draw≤120; `budgets` `vehicle/*` başlangıç parçasında değil.

**Tam regresyon:** R-00…R-83, yeni:
- R-84 Araba: anahtar; 6 s; 120; 25; 0,35×; devrilme yok; gösterge analog.
- R-85 B25 yalnız > 80≥1,5 s çizgide (79'da yok); kan/beden yok; kesme+tek ses.
- R-86 B26 25 s; A +1 defter; B +2 çırak; araç bir daha çalışmaz; S5 yok.
- R-87 Sersemlemiş 240 s; çeşme kısaltır.
- R-88 Figürana çarpma: pencere yok, +2, desatüre.
- R-89 Korna/Paşa/kendi arabana vur/uzun far.
- R-90 120 km/s'de sınır 100 m önce yüklenir.
- R-91 Araç ses katmanı; radyo kart anında kesilir; iç ses 3; şema v8.

**Kullanıcı test senaryosu (≈ 45 dk):**
0. qa build.
1. Anahtar→araba; anahtarsız "Anahtar yok."
2. Düzlükte 6 sn'de 100; 120 tavan; devrilme yok.
3. Okul Yolu'na 85+→levha, pedal, radyo kesilir→**B25**→Düz tut→kesme, zil, sessizlik→25 sn **B26** Kal.
4. 79 km/s→hiçbir şey.
5. Ebeveyn→Direksiyonu kır→ikincil ses; Yürü→A+2, çırak.
6. Araba çalışmaz; yavaş yürüyüş; çeşme kısaltır.
7. Meydan'da korna ×5→A+1; arabaya tekme→siren; Paşa atlar; uzun far→gök kapanır.
8. Düz kısımda dur→karşı figür durur; karşıya geç→kimse yok.
9. `?q=low` araçla tur: takılma yok.
Öznel kutular.

**Bitti tanımı:** R-00…R-91; ICERIK Y4 Kabul; P4 raporda; 17 büyük seçim.

**Onay kapısı:** "**ONAY F7**".

---

## 9. FAZ 8 — BARİYER VE EVRENİN KODLARI (Y5)

**Hedef:** Doğu ucu: B27 Titreyen Tabela, B28 Siyahın Önü, 28 sn sekans, **6 satırlık canlı döküm**, tünel, mühür.

**İçerik:** `B27.json` (**60**/6; hız > 80; 120 m;≤80 kart çıkmaz), `B28.json` (60; ara sahne=28 sn sekans); `events/kenar.json`; `zones/cevre-yolu.json` (2 chunk, `pollution 0.15`); sekans: asfalt 8 sn→aynı yağ lekesi her 12 m, aynı ağaç ×3, hız 52 kilidi→kontrplak cepheler, yarım ÇIKIŞ→paneller 9, 10, 11, 12, **14**→doku kaybı→siyah hacim; 3 sn sessizlik; **dökümün 6 satırı** siyah hacmin yüzeyinde (monospace, Türkçe/İngilizce etiket; değerler canlı: evren, üst evren, koli, silah, lamba, alarm); gökte ufka 10° yakın dikiş çizgisi (yalnız bu bölge); A: tünel 17 sn × 3 varyant (2. döngüde paneller yerine 6 satırın kırpılmış tekrarı; 3.'de 13 yanar), floresan üç titreme (≤ 3 geçiş/sn), evin önünde uyanış, tamponda parça, radyo son cümleyi tekrar eder; B: U dönüşü, 1,5 sn bakış→tabela/kol yok; ikinci geliş inşaat bariyeri "YAPIM AŞAMASINDA — TESLİM: BELİRSİZ" (`signs[]`)+bayrak+termos. İç ses 4 ("Titriyor.", "Aynı leke.", "On üç yok.", "Hiç.").

**Sistemler:** `scripted/Barrier.ts`, `scripted/EdgeSequence.ts` (dinamik import; ray sürüş; hız kilidi; doku kaybı materyali; siyah hacim shader+`ui/EdgeDump.ts` 6 satır `GameState`'ten), `scripted/Tunnel.ts`, ışınlama, `edgeSealed`, radyo önbelleği, gök `uSeam` uniform; A4 sayacı durur; şema v9.

**Asset listesi (ASSET-ISTEK-F8.md yalnız Poly Haven satırları):** bariyer/tabela/inşaat bariyeri/flaşör/panel 8/tünel/kontrplak/ÇIKIŞ/bayrak+termos 12 kalem (kendi+Poly Haven); shader 2 (kendi); 10 ses.

**Yapım adımları:** T1 çevre yolu+Barrier+B27; T2 EdgeSequence+siyah hacim+EdgeDump+dikiş+B28; T3 Tunnel 3 varyant+ışınlama+mühür+U dönüşü+inşaat bariyeri+radyo; T4 regresyon (R-00…R-97), rapor.

**Otomatik testler:** `barrier.test` (≤ 80 yok; 81 var), `sequence.test` (28 ± 1 s; panel sırası; 3. döngüde 13; dökümdeki 6 değer `GameState` ile eşit), `flags.test` (`edgeSealed` sonrası B27/B28 yok), `i18n.test` (yasaklı: sınır, hata, yükleniyor, limit, error, loading, simülasyon, kod, render — `content.*`/`subtitle.*`), `walk.test` Y5.

**Tam regresyon:** R-00…R-91, yeni:
- R-92≤80: kırılmaz, kart yok; 60'ta titrer, 80'de 3°+cıvata.
- R-93 B27-A→28 ± 1 s; 52 kilidi; paneller; siyah hacim fara tepkisiz; 3 s sessizlik+tıkırtı; **6 satır canlı, değerler doğru**; dikiş çizgisi yalnız bu bölgede.
- R-94 B28-A→tünel ×3; 2. döngüde döküm tekrarı; 3.'de 13; evin önü; tampon parçası; radyo tekrarı.
- R-95 B28-B→U dönüşü; 1,5 s→yok; ikinci geliş inşaat bariyeri+bayrak+termos; mühürden sonra kart yok.
- R-96 İçerik metninde yasaklı kelimeler yok (TR/EN); A4 sayacı durur.
- R-97 İç ses 4; şema v9; `scripted/Edge*` başlangıç parçasında değil.

**Kullanıcı test senaryosu (≈ 30 dk):**
0. qa build.
1. 70 ile bariyer→kırılmaz, kart yok.
2. 85+→**B27**→Frene bas→durur; tekrar dene.
3. Gazı kökle→28 sn sekans→siyah hacim; dur; 3 sn; yüzeyde 6 satır (evren kimliğin, koli/silah/lamba/alarm durumun doğru)→**B28**.
4. İleri sür→tünel; 2. döngüde satırlar; 3.'de 13→evin önü, tampon, radyo tekrarı. Bariyere dön→kart yok.
5. Ebeveyn→Geri dön→bak→tabela yok; tekrar gel→inşaat bariyeri, bayrak, termos.
6. Hiçbir yerde "sınır/hata/yükleniyor/kod" yok (EN'de de).
Öznel kutular.

**Bitti tanımı:** R-00…R-97; ICERIK Y5 Kabul; 19 büyük seçim.

**Onay kapısı:** "**ONAY F8**".

---

## 10. FAZ 9 — RESTORAN (Y6; OYUNCU MÜŞTERİ)

**Hedef:** Son Akşam Yemeği: kapı denetimi, B31, B33, B29, B30; S4; ekonomi 9 satır; **ikinci gerçek D1 ölçümü**.

**İçerik:** `B29.json` (**90**/10), `B30.json` (**90**/8), `B31.json` (**20**/6), `B33.json` (45/6); K-R1…K-R6; `dialogues/edhem-sidki.json` (ICERIK §2); menü 20/60/25/40; kapı ret 4 varyant; `zones/restoran.json` (8 masa, 13 yok; yankı 0,35); defterde 9; Paşa pervazda; S4; iç ses 4.

**Sistemler:** `restaurant/*` (dinamik import): Seating, Menu+ekonomi, ritüel eşiği, kapı denetimi (kart kaynağı; personel kartı reddi; ₺ 20/60; A≥3), vestiyer (fiş 313), salon kayması, algı efektleri (rakamsız çubuk), engel zinciri→"Şimdi değil"+240 s+su, kart iade+`restaurantSealed`, Sıdkı dalgınlık, B11-A kuyruğu, dört vuruş→üç (salonun kendi döngüsü), derin NPC→B33, S7 kapı varyantı; şema v10.

**Asset listesi (ASSET-ISTEK-F9.md):** restoran iç kiti 9 kalem; sofra+tepsi+2 şişe+menü 4 kalem; Edhem, Sıdkı kıyafeti, Münire, misafir 3; dış cephe+mum; 10 ses.

**Yapım adımları:** T1 hücre+kapı (4 ret)+vestiyer+K-R1+Seating; T2 Menu+ekonomi+K-R2…5+eşik+diyaloglar+defter; T3 B31+kayma+B33+S7 kapı; T4 B29+Servis+B30+algı+engel zinciri+K-R6+S4; T5 yankılar+Destek köşeleri+EN+**gerçek D1 ölçümü (restoran+5 bölge)**; T6 regresyon (R-00…R-107), `economy.test` 9 satır, rapor.

**Otomatik testler:** `economy.test` 9 satır; `graph.test` (B29 ön koşulları; B33-A sonrası B29 yok; mühür sonrası giriş yok); `i18n.test` (şişe metinleri yalnız "Servis"/"öteki"); `endings.test` S4; `walk.test` Y6; `budgets` `restaurant/*` ayrı parça, JS≤340 KB.

**Tam regresyon:** R-00…R-97, yeni:
- R-98 Kapı 4 ret; kart iade+mühür (< 20₺).
- R-99 Menü; 145 yalnız≥145.
- R-100 Kapanış yalnız ana yemek+ödenmiş hesap.
- R-101 B31 20 sn; A→Edhem 3 s, Kapanış yok; B→Masa 6 kayar, örtü, palto.
- R-102 B33≥2 sn; A "Emanet." 313; B→12 s boşalır, A→5, S7.
- R-103 B29→Servis→20 s→B30; üç engel→"Şimdi değil"; su; 240 s.
- R-104 S4; müzik eklenmez; Döküm+Destek.
- R-105 `economy.test` 9 satır; cüzdan bakiyesi S5'te (F11).
- R-106 Şişe metinleri; B30 çubuğu rakamsız.
- R-107 K-R1 emanet→B33 yok; çıkışta silah; Edhem kartı iki kez okur; Sıdkı tepsiyi iki kez düzeltir; gerçek D1 restoran p95≤36; iç ses 4; şema v10.

**Kullanıcı test senaryosu (≈ 60 dk; duman: 1, 2, 4, 6, 7):**
0. qa build.
1. Kartsız→"Davetiyeniz?" ret; personel kartı ret; kart+0₺→"Bu akşam masa yok, efendim.", mühür.
2. Kart+140: **K-R1** emanet (313); defterde 9; Masa 9.
3. Çorba+ana+şarap=120; Münire→**B31** Kal→Masa 6 kayar; palto.
4. Hesap→**K-R5**; tepsi, iki şişe, Destek→**B29** Kalk→kart iade, "Bu evde 'bir daha' yoktur."
5. Ebeveyn→Tepsiyi çek→Servis→**B30** Uzan→üç engel→"Şimdi değil."→su.
6. Ebeveyn→Otur→**S4**→DÖKÜM.
7. Silahla: Sıdkı'ya 2 sn→**B33**; İndir→"Emanet."; Ateş→boşalır→S7.
8. Yalnız çorba→Kapanış gelmez.
9. EN'de 1–4.
Öznel kutular.

**Bitti tanımı:** R-00…R-107; ICERIK Y6 Kabul; 23 büyük seçim; D1 raporu 2.

**Onay kapısı:** "**ONAY F9**".

---

## 11. FAZ 10 — sTressT GÖMME (Y7; iframe, BİREBİR)

**Hedef:** Atölye Sokağı'nın servis kapısından girince Çayan'ın sTressT'i **birebir** oynanır (iframe); çıkınca DİLEMMA kaldığı yerden sürer. Kart yok; K-S1.

**İçerik:** `zones/atolye.json` (çıkmaz 110 m, servis kapısı, eldiven çivisi, dolap, yarım bariyer, duvar yazısı "İÇERİDE HER ŞEY ELLE KIRILIR." `signs[]`, `pollution 0.5`); K-S1; kapı kuralları (koli kapıda, sayaç akar; silah dolaba; araba giremez; CR ≠ ₺); çıkış çınlaması 12 sn; alarm aynen.

**Sistemler (K1; TEKNIK §1.5):** `bridge/StressT.ts` (dinamik import): `<iframe src="./stresst/index.html?q=<tier>&lang=<tr|en>" allow="pointer-lock; fullscreen">`; göz kırpması 100/400/200 ms (≤ 0,8 sn+yükleme); iframe açılırken DİLEMMA `forceContextLoss()`+`setAnimationLoop(null)`+ses suspend+Input `detach()`; `postMessage` `stresst:ready | pause | resume | quality | exit | state-hash`; ebeveyn donunca `pause`; çıkışta restore+ısınma karesi. sTressT tarafı: `src/host-bridge.ts` (≤ 40 satır; standalone'da no-op; pause menüsüne "Sokağa dön" ekler)+`main.ts`'e 1 import. `tools/release/copy-stresst.mjs` dist'i kopyalar; Google Fonts bağlantısı sTressT'teki gibi kalır (Archivo, JetBrains Mono OFL satırları lisans ekranına). IDB'ler ayrı. Kapı: `git diff --stat apps/stresst` yalnız iki dosya; 76 vaka yeşil. Şema v11.

**Asset listesi:** sTressT'in mevcut ≈ 200 dosyası (`/stresst/` altında, pack'e girmez; onaylı; `boxing_glove` CC-BY 3.0 atfı lisans ekranına); servis kapısı, eldiven, dolap, yarım bariyer, duvar yazısı (ASSET-ISTEK-F10.md); 4 ses.

**Yapım adımları:** T1 Atölye chunk+kapı kuralları+K-S1+dolap/koli; T2 `host-bridge.ts`+`bridge/StressT.ts`+copy betiği+göz kırpması+protokol; T3 donma/pause, kalite/dil geçişi, "Sokağa dön", lisans satırları, `stresst.spec`; T4 regresyon (R-00…R-113), bench (iframe açıkken DİLEMMA 0 draw call), rapor.

**Otomatik testler:** `bridge.test` (mount/exit 5 kez, heap ±%10; DİLEMMA IDB'de sTressT anahtarı yok; CR→₺ efekti yok; aynı seed state-hash eşit), `licenses.test` (`boxing_glove`, Archivo, JetBrains Mono), sTressT 76 vaka kökte. Playwright `stresst.spec` (kapı→sTressT menüsü≤3 s→"Sokağa dön"→aynı konum; `document.title` geri).

**Tam regresyon:** R-00…R-107, yeni:
- R-108 Kapı kuralları: koli kalır (sayaç sürer), silah dolaba, araba geçmez, ₺ içeride yok, CR dışarıda hiçbir şey almaz.
- R-109 Göz kırpması≤0,8 sn; iframe açıkken DİLEMMA `render.calls === 0` ve bağlam serbest; çıkışta restore.
- R-110 sTressT kaydı yalnız kendi IDB'sinde.
- R-111 `git diff --stat apps/stresst` yalnız iki dosya; 76 vaka; `__APP_VERSION__` sTressT menüsünde.
- R-112 Ebeveyn donunca iframe `pause`; çıkışta koli yerinde, sayaç geçen süre kadar; silah dolaptan.
- R-113 Çınlama 12 sn; alarm aynen; Esc→"Sokağa dön"; aynı profil+seed→state-hash iki pencerede eşit, menü metinleri eşit, fps ±%10.

**Kullanıcı test senaryosu (≈ 45 dk):**
0. qa build.
1. Koli+silahla Atölye (110 m); koliyi bırak, silahı kilitle; **K-S1**.
2. Kapı→göz kırpması→sTressT menüsü (sürüm).≥5 dk oyna; tam ekran+pointer lock.
3. Esc→"Sokağa dön"→sokak; sayaç ilerlemiş; koli; dolaptan silah; çınlama.
4. Araba→yarım bariyer.
5. İçerideyken başka sekmede büyük seçim→Devam→sTressT sekmesi donar; kapat→kaldığı yerden.
6. DevTools IndexedDB: iki depo ayrı.
7. Ayrı sTressT (5180) ile aynı profil+seed, 60 sn: `__stresst.state()` hash eşit; menü ekran görüntüsü eşit.
Öznel kutular.

**Bitti tanımı:** R-00…R-113; ICERIK Y7 Kabul; TEKNIK §1.5 kapısı; lisans ekranında üç yeni satır.

**Onay kapısı:** "**ONAY F10**".

---

## 12. FAZ 11 — TEPE, GARİP VE FİNAL (Y8)

**Hedef:** Yamaç ve Uçurum; Garip; B34, B35, B36 (+B36′); **S1**, S5 (3 varyant), S6 (3+Garip'siz); kenar kuralı.

**İçerik:** `B34.json` (**60**/6), `B35.json` (45/6), `B36.json` (**90**/12); K-G1…K-G5 (**K-G3 "Kahve var mı?/Çay olur"**→"Kahve yok. Çay var."); `dialogues/garip.json` (KANON §5–§9 cümleleri; 10 sn sessizlik kuralı; ilk kuş sesi patikada); `zones/yamac.json` (patika 300 m, `pollution 0.25`), Uçurum (`0.1`); Paşa bankın altında; form ucu; S1 (son kare iki bardak, buhar, bank, **termos kapağı açık**; Döküm "Gece: sürüyor."); S5 3 varyant (cüzdan bakiyesi); S6 3+Garip'siz; iç ses 4.

**Sistemler:** `npc/Garip.ts`; diyalog+10 sn; **kenar kuralı** (Garip yaşıyor+`garipSentenceSaid=false`+kenara 8 m→kalkar, cümleyi erken söyler, K-G atlanır, 6 sn→B36; Garip ölü/yok→serbest S6); UI sönme (son 90 sn); final ara sahnesi; B36′≤2; kader zarı sunum; Garip'siz kip; gök en açık; ses katmanı Yamaç 2/Uçurum 1+kuş; A4 sayacı durur; şema v12.

**Asset listesi (ASSET-ISTEK-F11.md):** yamaç arazi+badem 6+taş duvar+çakıl+çim 5 kalem; bank, termos, bardak 2, şekerlik, demir kapı, bayrak direği 6; Garip (4 animasyon); şehir ışıkları+ufuk (kendi); 15 ses (kuş sürüsü yalnız bu paketlerde).

**Yapım adımları:** T1 Yamaç/Uçurum+patika+gök/ses+demir kapı+B34+S5; T2 Garip+diyalog+K-G1…5+10 sn+kenar kuralı; T3 B35+Garip'siz+B36+final ara sahnesi+B36′+UI sönme; T4 S1+S6+form ucu+Paşa+"Gece: sürüyor."; T5 regresyon (R-00…R-122), rapor.

**Otomatik testler:** `endings.test` (`survives` yalnız S1, yalnız B36-A; S5/S6 `variants: 3`), `graph.test` (B35-B sonrası S1 yok; B36′≤2; Yamaç'ta B36 ya da S6'ya bağlanmayan "sessiz kenar" düğümü yok), `dialogue.test` (Garip ilk cümlesi tek anahtar; final tek kullanımlık; Garip satırları soru işaretiyle bitmez — "Şeker kaç?" istisna), `flags.test` (`nameTold`; `garipSentenceSaid` kenar tetiğinden de yazılır), `audio-budget.test` (kuş yalnız yamac/ucurum), `walk.test` (Y8; tek oynayış 45–100 dk ilk tam zincir).

**Tam regresyon:** R-00…R-107, yeni:
- R-114 Garip her varışta aynı cümle; bakmaz.
- R-115 K-G1…5 30 sn; 10 sn sessizlikte gündelik satır; kahve istenince çay; K-G5→"Duydum." "Şeker kaç?"
- R-116 B34 60 m; A→in, Garip 60 sn; motor açık→kuş cümlesi; B→S5 3 varyant, bakiye doğru.
- R-117 B35≥2 sn; A "Teşekkür ederim."; B→kuşlar, 40 sn rüzgâr, S1 kapanır, A+3, Garip'siz kip.
- R-118 B36 12 sn ara sahne, 90 sn; B36′ 8 m,≤2.
- R-119 Kenar kuralı: banktan doğrudan kenara→8 m'de Garip kalkar, cümle, B36; görünmez duvar yok.
- R-120 Son 90 sn HUD söner, altyazı kalır.
- R-121 S1 tek hayatta kalış; termos kapağı açık; "Gece: sürüyor."; silah taşın dibine konabilir; S6 3+Garip'siz; "FERMAN!" yalnız ad söylendiyse.
- R-122 Kirlilik 0,25/0,1; ilk kuş sesi patikada; A4 sayacı durur; iç ses 4; şema v12.

**Kullanıcı test senaryosu (≈ 45 dk):**
0. qa build.
1. Patika: gök açılır; ilk kuş sesi; Garip "Çay koydum. İki bardak oldu."; Paşa bankın altında.
2. K-G1 "Kimsin?"→K-G2 "Ferman"→K-G3 "Kahve var mı?"→"Kahve yok. Çay var."→K-G4; 10 sn sus→gündelik satır; K-G5.
3. Cümle→6 sn→**B36** (HUD sönük)→Banka yürü→**S1**: kaşık sesi; termos kapağı açık; DÖKÜM "Gece: sürüyor."
4. Ebeveyn→Kenara yürü→**S6**; "FERMAN!" (ad söylendi). Adsız evrende yok.
5. Çaydan kalk, kenara 8 m→**B36′** ×2; üçüncüde yok.
6. Yeni run: bankı geç, doğrudan kenara yürü→8 m'de Garip kalkar, cümle→**B36**.
7. Silahla: Garip'e 2 sn→**B35**; İndir; Ateş→kuşlar, bardaklar soğur→kenar→S6 Garip'siz.
8. Arabayla servis yolu→**B34** Frene bas→in; motor açık→60 sn kuş cümlesi; Gaza bas→**S5** (cüzdan bakiyesi); 3 yenilemede aynı varyant.
9. Form imzalıysa cepten ucu görünür.
Öznel kutular.

**Bitti tanımı:** R-00…R-122; ICERIK Y8 Kabul; 26 büyük seçim; `expectedBig=26`.

**Onay kapısı:** "**ONAY F11**".

---

## 13. FAZ 12 — SONLAR, DÖKÜM, MENÜ (Y9)

**Hedef:** 7 son tutarlı (S3 7 mekân kipi; S2/S4/S7 cilası), DÖKÜM üretici, arşiv, ana menü, uyanış metinleri, TR/EN tam (EN tam okuma), içerik testleri nihai.

**İçerik:** S3 Sessiz Oda 7 kip; `endings.json` 7 `implemented`; `dokum-rules.json` (bayrak→satır; 6–9; boş "—"); içerik uyarısı metin cilası; ana menü: Başla/Devam/Arşiv (spoilersız)/Ayarlar/Lisanslar/Destek; uyanış metinleri; jenerik (Çayan, Fable 5, tüm atıflar); sekme başlıkları "DİLEMMA — Olasılık n".

**Sistemler:** `endings/Player.ts`, `ui/Dokum.ts` üretici, `save/Archive.ts` (`dilemma.archive.v1`), menü+Devam/Baştan, `window.close()`/`history.back()`, `walk.test` 200 tohum, `choices.test` 26; **EN tam okuma turu** (bir İngilizce okur, 7 son+26 kart, 1 sayfalık kontrol listesi; kabul 0 açık çeviri notu); şema v13; JS≤350 KB.

**Asset listesi:** kâğıt dokusu, damga sesi (Kenney; ASSET-ISTEK-F12.md), arşiv silüetleri 7 (kendi).

**Yapım adımları:** T1 S3 7 kip+S2/S4/S7 cilası+sunum zarı; T2 DÖKÜM üretici+`dokum-rules.json`+Arşiv+EN tam okuma; T3 menü+uyarı cilası+Devam/Baştan+uyanış metinleri+jenerik+başlıklar; T4 regresyon (R-00…R-130), 200 tohum, rapor.

**Otomatik testler (nihai):** `choices` 26; `graph` (her yol `Ending`); `endings` (7; `survives` 1;≥6 satır; S5/S6 3; S7 2); `walk` (200 tohum: %90'ı 45–100 dk; tüm içerik 4–6 saat; her son≤40 düğüm); `i18n` (tüm anahtarlar; Döküm eş; başlık şablonunda `B\d+` yasak); `flags`; `dokum.test`. Playwright `support.spec` 7 son; `window.spec` DÖKÜM "Bu pencereyi kapat"; `emulator.spec` `history.back()`.

**Tam regresyon:** R-00…R-122, yeni:
- R-123 7 son≤40 düğüm; 200 tohum %90 45–100 dk.
- R-124 DÖKÜM TR/EN eş; 6–9; "—"; "Gece: sürüyor." yalnız S1.
- R-125 S3 7 kip.
- R-126 Arşiv spoilersız; Baştan yeni run; Devam son evren.
- R-127 Menü 6 düğme; uyarı ilk açılışta ve Ayarlar'dan.
- R-128 `choices` 26; 10 içerik testi+sistem testleri nihai.
- R-129 `bannedTerms` tüm locales+endings+iç ses+tabela; EN tam okuma 0 açık not.
- R-130 Sekme başlığı "DİLEMMA — Olasılık n"; `B\d+` yok; şema v13; JS≤350 KB.

**Kullanıcı test senaryosu (≈ 60 dk; duman: 1, 2 (S1, S7), 4, 6):**
0. qa build; tarayıcı verisini temizle.
1. Uyarı→menü 6 düğme→Lisanslar.
2. F9 QA menüsüyle 7 sonu sırayla: S1, S2, S3 (Meydan+araba içi), S4, S5 (3 varyant), S6, S7 (iki varyant); her birinde DÖKÜM, Destek, "Bu pencereyi kapat".
3. Arşiv 7 işaretli, metin yok.
4. Devam→son evren; Baştan→yeni run; eski sekme→"Ebeveyn evren kapandı; bu evren tek başına sürer."
5. EN'de 1–3.
6. Sekme başlıkları: kök "DİLEMMA", çocuk "DİLEMMA — Olasılık 2".
Öznel kutular.

**Bitti tanımı:** R-00…R-130; ICERIK Y9 Kabul; içerik tamam (26 büyük, küçükler, 7 son, TR/EN).

**Onay kapısı:** "**ONAY F12**".

---

## 14. FAZ 13 — CİLA I: SES, GÖK, VAT, PERFORMANS

**Hedef:** Ses bütçesi tamam, gök son katmanları (meteor, ufuk, **nebula**), **VAT figüranlar**, GC/soak, **üçüncü gerçek D1 ölçümü**, TEKNIK §2 kapanır.

**İçerik:** ses≤10,5 MB (TEKNIK §8.2; ilk yük≤1,2 MB); meteor 90–240 sn; ufuk varyantları; **nebula sprite 4** (512²; kendi ya da ESO CC BY 4.0; yalnız `pollution≤0,25` ve `eyeAdapt > 0,5`; Dengeli+Yüksek; D1≤0,1 ms); kademe tablosu tam (TEKNIK §2.3).

**Sistemler:** `audio/Voices.ts` (16; öncelik), yankı 0,04/0,28/0,35, alarm katmanları, `eyeAdapt`→−3 dB; `sky/Meteor.ts`, `sky/Nebula.ts`; kademe tablosu; **VAT hattı**: `tools/assets/vat.mjs` (Blender→256×64 RGBA16F)+`npc/ExtrasVat.ts` (3 kıyafet=3 draw call; 900/1.500 üçgen); `gc.test.ts` (`/** @frame */` fonksiyonlarda tahsis→kırmızı); 30 dk soak; context lost tam yol; bench 8 nokta × 10 bölge; gerçek D1 (K5); gerekirse "Çok düşük".

**Asset listesi (ASSET-ISTEK-F13.md):** eksik ambiyanslar 5; SFX ≈ 60 yeni; drone 6 (kendi ya da Kenney Music Loops); meteor/ufuk/nebula sprite'ları (kendi ya da ESO).

**Yapım adımları:** T1 ses bütçesi+Voices+yankı+katmanlar; T2 gök son katmanlar+nebula+kademe tablosu; T3a VAT hattı (`vat.mjs`+shader); T3b 3 kıyafet+LOD+D1 bench; T4 GC/soak/context-lost+`gc.test`; T5 gerçek D1 ölçümü, bütçe tablosu, gerekirse "Çok düşük"; T6 regresyon (R-00…R-138), rapor.

**Otomatik testler:** `audio-budget.test` (≤ 10,5 MB; paket≤1,2 MB), `budget.test` 10 bölge, `quality.test`, `gc.test`, `vat.test` (doku boyutu, klip sayısı); Playwright `boot.spec` 10 bölge × 8 nokta; `soak.spec` (10 dk; heap ±%10; chromium).

**Tam regresyon:** R-00…R-130, yeni:
- R-131 Ses≤10,5 MB; 16 ses; yankı; A1–A5 katmanları; `eyeAdapt` −3 dB; serbest dolaşımda müzik yok.
- R-132 Meteor; ufuk; gök≤0,6 ms D1; Yamaç'ta 60 sn beklenince≥1 nebula seçilebilir.
- R-133 Kademe tablosu üç kademede fark; içerik/figüran aynı; Düşük'te blob gölge.
- R-134 Gerçek D1: Meydan, Çarşı, Okul Yolu (araçla), restoran, Yamaç p95≤36 ms, %1 düşük≥24; başlık≤3 s; Başla→kontrol≤8 s soğuk.
- R-135 GC≤2 MB/sn; 30 dk soak ±%10; `programs` sabit; `gc.test` yeşil.
- R-136 Context lost→restored; 5 s yoksa "Yenile"; kayıpsız.
- R-137 VAT: 3 draw call; 900/1.500 üçgen; A0'da 14 figüran D1≤1 ms CPU; tanık mantığı aynı.
- R-138 Fotosensitivite: `tools/bench/flash.mjs` ile B28/S7/silah kayıtlarında 1 sn'de≤3 geçiş.

**Kullanıcı test senaryosu (≈ 60 dk; biri D1 cihazında):**
0. qa build.
1. Kulaklıkla tur: ev yankılı, sokak kuru, restoran en yankılı; Meydan 5 katman; Yamaç rüzgâr+köpek+kuş; Uçurum rüzgâr.
2. Yamaç'ta 60 sn→gök açılırken dünya kısılır;≥1 nebula.
3. 5 dk gök→meteor.
4. Düşük/Dengeli/Yüksek: gölge, sis, bloom farkı; figüran sayısı aynı; figüranlar akıcı (VAT).
5. D1 cihazında: otomatik Düşük; Meydan p95≤36; Okul Yolu takılmasız; Başla→kontrol≤8 s.
6. 30 dk oyna: heap düz.
7. `__dilemma.loseContext()`→2–3 s siyah→geri; kayıp yok.
Öznel kutular.

**Bitti tanımı:** R-00…R-138; TEKNIK §2.1 D1 sütunu gerçek cihazda, D2 Çayan'ın makinesinde; 10 bölge bench; §8 kabulleri; VAT kapısı (ya da kesme 7 kararı raporda).

**Onay kapısı:** "**ONAY F13**".

---

## 15. FAZ 14 — CİLA II: ERİŞİLEBİLİRLİK, AYARLAR, GÜVENLİK, LİSANS, TARAYICI MATRİSİ

**Hedef:** Oyun herkes için okunur ve güvenli kapanır; tarayıcı matrisi ve bilinen sınırlar kapanır.

**İçerik:** Ayarlar tam: dil; kalite (3+otomatik); hassasiyet; ters Y; FOV 70–100; head bob; sarsıntı; 5 ses bus'ı; film greni; altyazı boyutu 3+arka plan+konuşmacı rengi; süre çubuğu şekil/renk (desenli); **flaş azalt**; tuş yeniden atama; evren modu; "İçerik uyarısını yeniden göster"; **`timerScale` ×1/×1,5/×2** (yalnız Çayan onayladıysa); Destek. İçerik uyarısı nihai metin; `support.json` dil başına≥1 güncel kaynak; `bannedTerms` son tarama; Lisanslar ekranı; `plan/TEST-MATRIS.md` (tarayıcı × 12 adım).

**Sistemler:** `save/settings.ts` (`validateSettings`), `ui/Settings.ts`, `input/Remap.ts`, `ui/Subtitles.ts`, `fx/FlashReduce.ts` (0,3× ve≥200 ms), çubuk deseni, Destek gerçek ağ, `ui/Licenses.ts`, webkit tüm DOM spec'leri+gerçek Safari (ödünç Mac varsa; yoksa webkit yeterli, sınır raporda).

**Yapım adımları:** T1 Ayarlar+remap+altyazı+flaş+desen (+ timerScale kararı); T2 uyarı metni+Destek doğrulama+Lisanslar+son tarama; T3 matris+el testi protokolü+bilinen sınırların kapanışı+regresyon (R-00…R-144), rapor.

**Otomatik testler:** `settings.test`, `remap.test`, `i18n.test` (support≥1; uyarı anahtarları; `bannedTerms` nihai), `licenses.test` (CC BY satırlarında `attribution` dolu); Playwright üç tarayıcı tüm spec'ler; `support.spec` ağ engelli→3 s yedek; `i18n.spec` altyazı boyutu.

**Tam regresyon:** R-00…R-138, yeni:
- R-139 Ayarlar tümü çalışır ve kalıcı; remap çakışma vermez.
- R-140 Destek: her dilde≥1; ağ yokken 3 s yedek; tüm yerlerde görünür.
- R-141 Lisanslar: ESO, `boxing_glove`, OFL ×3, BSC5; `licenses.json` ile eş.
- R-142 Matris: Chrome/Edge/Firefox 12 adım; webkit yeşil; engel ekranları; **bilinen sınırlar tablosu boş**.
- R-143 Flaş azalt; altyazı 3 boyut; desenli çubuk deuteranopia'da okunur.
- R-144 `timerScale` (varsa) süreleri çarpar, zar/kilit mantığını değiştirmez.

**Kullanıcı test senaryosu (≈ 45 dk):**
0. qa build.
1. Her ayarı değiştir, F5→kalıcı; E→Q; çakışma reddi.
2. Büyük altyazı+arka plan: Hurşit sohbetinde taşma yok.
3. Flaş azalt: silah+B28 tünel→keskin flaş yok.
4. DevTools deuteranopia→çubuk okunur.
5. Offline→Destek→3 s yedek.
6. Lisanslar okunuyor.
7. Firefox+Edge `TEST-MATRIS.md` 12 adım.
Öznel kutular.

**Bitti tanımı:** R-00…R-144; TEKNIK §9.3; risk 14; ICERIK §8.3 maddeleri raporda işaretli; bilinen sınırlar kapandı.

**Onay kapısı:** "**ONAY F14**".

---

## 16. FAZ 15 — YAYIN

**Hedef:** Web sürümü Cloudflare Pages'te (Access kaldırılır), itch.io "istediğin kadar öde"; aynı zip; v1.0.0; kurtarma tatbikatı.

**İçerik:** `dist/dilemma-web/`, `dist/dilemma-itch.zip` (`index.html` kökte; dosya sayısı≤400; itch resmî sınırı T1'de dokümandan teyit ve R-146'ya yazılır); `_headers`; itch sayfası (slug `dilemma`, TR/EN açıklama, içerik uyarısı sayfada, 6 ekran görüntüsü, kapak 630×500, 1280×720+tam ekran, **SAB kutusu kapalı**, asgari 0); CHANGELOG v1.0.0; README (kontroller, tarayıcılar, Destek).

**Sistemler:** `npm run release`=check+zip+`verify-headers`; Cloudflare prod (build `npm run check && npm run release`); kurtarma planı tatbikatı; Steam kapsam dışı.

**Yapım adımları:** T1 release zinciri+itch sınır teyidi+`_headers`+Cloudflare prod+CHANGELOG+README; T2 itch sayfası (Çayan hesabı)+canlı regresyon (R-00…R-149)+rapor; T3 kurtarma tatbikatı+v1.0.0 etiketi.

**Otomatik testler:** `release.test` (dosya sayısı; kök `index.html`; `_headers`); Playwright `window.spec`, `emulator.spec` canlı URL ve itch'te (manuel tetik).

**Tam regresyon:** R-00…R-144, yeni:
- R-145 Prod build: `__dilemma` yok; overlay yok; sürüm `1.0.0`.
- R-146 Zip≤400 dosya ve itch resmî sınırının altında (sayı raporda); kökte `index.html`.
- R-147 Canlı `curl -I`: COOP, immutable, no-cache, wasm MIME; streaming yolu.
- R-148 itch: emülatör varsayılan; "yeni sekme" seçilince handoff≤1 s; pointer lock+tam ekran; SAB kapalı; depo adı çakışmaz.
- R-149 Kurtarma tatbikatı: önceki sürüm 5 dk içinde canlıda, sonra ileri alınır; CHANGELOG; etiket.

**Kullanıcı test senaryosu (≈ 60 dk; prod build):**
1. Canlı URL Chrome/Firefox/Edge: başlık≤3 s; kontrol≤8 s; B1→pencere→kapat→uyan.
2. itch sayfası: gömülü, tam ekran, emülatör; Ayarlar→yeni sekme→handoff; Destek yeni sekme.
3. Telefondan→engel ekranı.
4. 0 ile ödeme akışı.
5. Lisanslar, jenerik, sürüm.
6. Claude önceki sürümü geri yükler→5 dk içinde eski sürüm numarası canlıda→tekrar ileri.
Öznel kutular.

**Bitti tanımı:** R-00…R-149; TEKNIK §9 canlıda; itch yayında; D1 gerçek cihaz raporu `tools/bench/reports/` içinde.

**Onay kapısı:** "**ONAY F15 — YAYIN**".

---

## 17. KESME PLANI

Tetikler: (a) takvim — faz planlanan turun 1,5 katını aştı; (b) performans — F4/F9/F13 D1 kapısı iki düzeltme turundan sonra kırmızı. Önce performans kesimi: "Çok düşük" kademesi (0,4×, sis 60 m, LOD 0,5, gök 1024, lightmap 1024) → gölge kapalı → post yok → LOD 0,5× → uzak hal siluet. Her kesim raporda "KESİLDİ: <madde> — <neden>", Çayan onayıyla. Sıra ICERIK §8.2 ile birebir:

| Sıra | Kesilen | Faz | Kazanç | Etki |
|---|---|---|---|---|
| 1 | Koridor K3, K4 | F7 | 1 tur | 26 kalır |
| 2 | S5/S6 varyantları 3→1 | F11 | 1 tur | zar yalnız kuyruk |
| 3 | Tünel döngüsü 3→1 | F8 | 1 tur | 26 kalır |
| 4 | Postal 12→6 (tekme, fırlat, korna, lamba, havaya ateş, konteyner kalır) | F4–F7 | 1 tur | alarm aynı |
| 5 | SOMA 12→8 (saatler, radyo, durak, 13, gök, kuş, afiş, çamaşır kalır) | F1, F4 | 0,5 tur | — |
| 6 | VAT→SkinnedMesh kalıcı | F13 | 2 tur | D1 CPU; sayı düşmez |
| 7 | Lightmap→vertex AO+maske vertex renginde | F4 | 2 tur | görsel; lamba söndür korunur |
| 8 | B18→küçük seçim | F6 | 0,5 tur | 25 |
| 9 | B14→serbest sahne | F5 | 0,5 tur | 24 |
| 10 | B12 kesilir | F6 | 1 tur | 23 — yalnız F4 kapısı iki turda geçilemezse |
| 11 | B11→serbest eylem | F5 | 0,5 tur | 22; aynı koşul |
| 12 | sTressT yayın sonrasına (kapı yerinde, "Kapalı" kâğıdı) | F10 | 4 tur | **en son**; kullanıcının açık isteği |

**Kesilmez:** 7 son, Y1/Y2/Y8 omurgası, TR+EN, Destek, pencere sistemi, alarm 0–5, ekonomi, içerik uyarısı, Lisanslar, hata ekranı, D1 30 fps hedefi (kademe eklenir, hedef düşmez).

---

## 18. TEST RAPORU ŞABLONU VE ONAY

`plan/RAPOR-F<n>.md` (sohbete aynen yapıştırılır):

```
# DİLEMMA — F<n> <ad> — Test Raporu (<tarih>, build <sürüm+qa>, commit <hash>)
## 0. Ortam — Node, Chrome/Firefox/Edge sürümleri, GPU, OS; CI çalıştırma bağlantısı
## 1. Bu fazda ne yapıldı — 5–12 satır, dosya adlarıyla; git diff --stat özeti
## 2. Otomatik sonuçlar — check: YEŞİL/KIRMIZI; vitest <dosya>/<vaka>; Playwright chromium/firefox/webkit x/y; bench: bölge p95/draw/tri/GPU/heap, kademe, cihaz; GPU vekili ms × katsayı (tahmin); bütçeler: başlangıç JS/toplam JS/ilk yük/ses/dosya sayısı
## 3. Kümülatif regresyon — regress.mjs çıktısı: R-00 ✔ … (✘ — görülen — düzeltildi/açık); toplam yeşil/toplam; elle madde sayısı ve dakikası
## 4. Karar kapıları — P3/P4/P5/K kararları ve gerekçe
## 5. Kesilen/ertelenen — KESİLDİ satırları ya da "yok"
## 6. Bilinen sınırlar — madde/tarayıcı/sürüm/kapanış fazı
## 7. Çayan için test senaryosu — 0. adım build/sürüm; duman listesi işaretli; iki öznel kutu; tahmin/Çayan'ın gerçek süresi
## 8. Çalıştırma — npm run preview:qa→4181 (prod 4182; dev 5181; sTressT 5180); QA menüsü F9; __dilemma
## 9. Onay için beklenen cümle — "ONAY F<n>" ya da "RET F<n> [<sürüm+commit>]: <adım> — <görülen>"
## 10. Taşınan işler — kaynak faz, durum (plan/TASINAN.md kümülatif)
```

Onay: yalnız **`ONAY F<n>`**; `ONAY F<n> — not: <istek>` notu taşınan iş olur; `ONAY F<n> — sınır kabul: <adım>, <tarayıcı>` (§0.4). Ret formatı sürüm+commit taşır. Her onay `git tag onay-F<n>`. Son mesaj kazanır.

---

## 19. ELEŞTİRİ BULGULARININ İŞLENMESİ

Üç eleştirmen raporundan **58 bulgu** değerlendirildi: **55 uygulandı**, **1 kısmen uygulandı**, **2 reddedildi**.

**Uygulananlar:** teknik rapor 17/17 (K1–K6, K9, K10; Blender/ortam/bake; fetch/lisans/animasyon kaynağı; yetim kipi; `gc.test`; Firefox prefs; SHA-256 baseline; faz numaraları; `focus()` metni); içerik raporu 17/17 (A4 yalnız B5-B; S7 iki varyant; 6 satırlık döküm; sayaç gerekçesi; B3-B→zil→B9; K-K1; kenar kuralı; `signs[]`; iç ses 42; kesme sırası; kuş; nebula; K-G3; mizah; B4-B; "AÇIK."; "Olasılık n"); süreç raporu 21/24 (`?noidb`; K7; K8; qa build; R-LIST; autosave/Devam; şema fixture'ları; D1 adlandırma; F0 bitti ikiye; tarayıcı kuralı; `est`; `?u=` boot; R-13; uyarı F1; i18n scan+EN okuma; CI; allow-list; rapor §0/§10; duman listesi; state-hash; flaş; TEST-FORM; cihaz listesi; `release`). Her madde ilgili fazın metnine işlenmiştir.

**Kısmen uygulanan:** "gerçek pencere yalnız handoff başarılıysa açılsın" — `window.open` tıklamanın senkron gövdesinde çağrılmak zorunda olduğundan başarı önceden bilinemez; bunun yerine iframe'de varsayılan emülatör, "yeni sekme" yalnız oyuncu seçerse ve çocuk 4 s içinde snapshot alamazsa kendini kapatıp ebeveyni emülatöre düşürür.

**Reddedilenler:** (1) B28'de "3 yıldızın yanında `y-0412` tarzı etiket" — gök kubbesi tüm bölgelerde paylaşılan tek shader'dır; üç saniyelik bir an için ayrı metin atlası ve draw call gerektirir, dikiş çizgisi+6 satırlık döküm fikri zaten taşır. (2) "Playwright firefox `headless: false`" seçeneği — Çayan'ın makinesine bağımlı ve CI'da koşamaz; `firefoxUserPrefs` ile WebGL zorlaması tercih edildi, geçmezse yalnız DOM spec'leri zorunlu.

---

## 20. TUTARLILIK TABLOSU (KANON v4; ICERIK v2.1; TEKNIK v1.2; bu plan)

| Konu | Karar (kaynak metinler düzeltildi) |
|---|---|
| Büyük seçim | 26 (F11 sonunda); test sabiti 26; kesme 8–11 koşullu düşürür |
| Süreler/zar | 20/45/60/90; küçük 30 `pick`; B2/B36 `pick` Çayan kararı |
| Pencere | derinlik≤4; üç taşıyıcı; iframe'de emülatör; her kademede sahne dispose; yetim kipi |
| Saat/ölçüm | `pointerLockLost` yalnız `idle`; Esc açık; ölçüm 5 sn uyanışta; Başla→kontrol≤8 s |
| Alarm/S7/B6 | A4 yalnız B5-B, NPC'ye ateş, B26-B; S7 iki varyant; B6=K-K1 |
| Gök | yıldızlar kaymaz; yaşam=eyeAdapt+meteor+kirlilik+nebula; dikiş yalnız Dünya Kenarı |
| Figüran | SkinnedMesh F4–F12; VAT F13; sayı kademeden bağımsız |
| sTressT | iframe birincil; `host-bridge.ts`+1 import; kesme sırasında en son |
| D1 ölçümü | gerçek cihaz F4/F9/F13; arada vekil × katsayı ("tahmin") |
| Build/dosya | dev 5181, qa 4181, prod 4182; pack F4;≤250 ara,≤400 nihai |
| Faz numaraları | Faz 0=F0, 1=F1–F3, 2=F4–F6, 3=F7–F8, 4=F9+F11+F12, 5=F10+F13–F15 |

