# DİLEMMA — İÇERİK v2.1 (budama, dolaylılık, yollar, sistem listeleri, ekonomi, sonlar, kapsam)

Resmî ad **DİLEMMA** (KANON). "Son Gün" yalnız eski çalışma adıdır ve bu belgede bir daha geçmez.
Kaynak önceliği: **docs/KANON.md** > bu belge > TEKNIK.md (yalnız teknik kabul) > FAZLAR.md > eski ciltler 12–18 (yalnız arka plan). Eski ciltlerin saat/gündüz/meslek/kardeş/telefon katmanı yok sayılmıştır: Ferman'ın geçmişi yoktur, hep gecedir, dünya saati yoktur.

Kısaltmalar: **B#** büyük seçim (KANON v3 numarası korunur; boşluklar kesilenlerdir) · **K-xx** küçük seçim · **Y#** yol · **S#** son · **A0–A5** mahalle alarmı · **₺** oyun parası · **CR** sTressT kredisi.
Süre sınıfları (KANON): refleks **20 sn** · normal **45 sn** · araç **60 sn** · ağır **90 sn** (B2, ritüel, final) · küçük **30 sn** (dolunca Ferman kendi cevabını verir: kartta önceden yazılı "Ferman'ın cevabı", zar değil).
İçerik dosyaları (TEKNIK §6.1 şeması): `content/choices/B1.json … B36.json` + küçük kartlar (`K-*.json`, K-K1 dahil), `content/dialogues/hursit.json | garip.json | edhem-sidki.json | sokak.json | ferman.json` (iç ses), `content/events/paket-sayac.json | alarm.json | koridor.json | kenar.json`, `content/zones/ev | mahalle | meydan | carsi | pazar | okul-yolu | cevre-yolu | restoran | yamac | atolye.json` (her biri `signs[]` ile dünya içi yazıları iki dilde tanımlar), `content/endings.json`, `content/dokum-rules.json`, `content/support.json`, `locales/tr.json`, `locales/en.json`.

**v1 → v2 değişiklikleri:** (1) ad DİLEMMA; (2) 36 kartın tamamı için karar tablosu (§1.2); (3) pencere derinliği TEKNIK §4.4 ile hizalandı: **≤ 4**, sonrası aynı sekmede dal emülatörü; (4) Garip'in kanonik ilk cümlesi eklendi ("Çay koydum. İki bardak oldu."); (5) her yola **Kabul** satırı ve faz eşlemesi (§3.0); (6) gündüz/garaj/dere gibi KANON dışı kalıntılar temizlendi.
**v2 → v2.1 değişiklikleri (eleştirmen bulguları; FAZLAR v2 ile birebir):** (1) A4 tetiği yalnız **B5-B** (Hurşit'e ateş); koli sayacının dolması alarmı etkilemez (§5.3); (2) S7 **2 koşul varyantı** (`hasGun` / silahsız) (§7); (3) B28'de **evrenin kodları**: siyah hacmin yüzeyinde 6 satırlık canlı döküm + gökte dikiş çizgisi + tünelde tekrar (§2); (4) koli sayacının gerekçesi: Zeynel'in iki satırı, B4-A'da boş ilaç kutusu, buzdolabı notu **"İlaç — son kutu"**, 270. sn'de kapı önü izi (§2, §4.2); (5) **B3-B** sonrası Hurşit'in zili B9'u doğrudan açar — örgü ilkesi (§1.3); (6) B6 **küçük karta** iner: K-K1 "Kaç / Kal", 30 sn (§1.2); (7) Yamaç **kenar kuralı**: Garip yaşıyorken cümle söylenmeden kenara 8 m → Garip cümleyi erken söyler → B36 (§1.3, Y8); (8) dünya içi yazılar `signs[]` ile iki dilde, EN'de nişangâh çevirisi (§4.2); (9) **iç ses** 42 satır, `dialogues/ferman.json` (§2); (10) kesme sırası 12 madde, sTressT **en son** (§8.2); (11) kuş kuralı: mahallede yok, yalnız Yamaç/Uçurum (§4.2-11); (12) K-G3 "Kahve var mı? / Çay olur"; Garip soru sormaz (Y8); (13) B4-B tetiği "10 m veya 40 sn, hangisi önce; baston çekince sayaç durur" (§1.3); (14) S1 son karesinde "AÇIK." yok, termos kapağı açık (§7); (15) kara mizah satırları: eczacı "Hep.", kahveci "Kaşık yok. Parmağınla." (Y3); (16) nebula F13'te gök katmanı (TEKNIK §3.1); (17) §3.0 faz eşlemesi FAZLAR F numaralarıyla; (18) sekme başlığı "DİLEMMA — Olasılık n" (seçim kimliği sızmaz); (19) Esc kararı açık (§7.3); (20) dondurulmuş sekme belleği ≤ 80 MB (§8.1).

---

## 1. BUDAMA — 36'dan 26'ya

### 1.1 Karar ilkeleri
1. Kullanıcının kendi fikirleri kalır: silah (B1, B2), ilaç/komşu (B3, B4, B5, B19), dilenci/para (B10), fren kopması/ezme (B25), bariyer/evrenin kodları (B27, B28), Garip (B35, B36), restoran/zehir-panzehir (B29, B30), organ bağışı (B15), tramvay-benzeri (B17).
2. [YENİ] işaretliler (Claude ekleri) kesilir ya da sisteme gömülür.
3. KANON kadrosunda olmayan bir karakter gerektiren seçim kesilir.
4. Aynı duygusal kası ikinci kez çalıştıran seçim kesilir.
5. Pencere açmayan "yanılsama kartı" büyük seçim sayılmaz.

### 1.2 36 kartın tamamı — karar ve tek cümle gerekçe
| ID | KANON adı | Karar | Gerekçe |
|---|---|---|---|
| B1 | Silahı al / Alma | **Kalır** | Kullanıcı fikri; `hasGun` oyunun omurgasıdır. |
| B2 | Namluyu çevir / Cebine koy | **Kalır** | Kullanıcı fikri; tek "ağır" açılış kartı, S2'nin kapısı. |
| B3 | Paketi al / Alma | **Kalır** | Kullanıcı fikri (ilaç/komşu); gizli 3 dk sayacı başlatır. |
| B4 | Kapıyı çal / Eşiğe bırak | **Kalır** | Hurşit'e tek giriş; B3'ün bedelini somutlar. |
| B5 | Hurşit'e silah: İndir / Ateş et | **Kalır** | Derin NPC'ye doğrultma kuralının ilk örneği. |
| B6 | Kıymet: Kaç / Kal | **Küçüğe iner** (K-K1; 30 sn, `onTimeout: {pick: 1}` "duruyorum") | Pencere açmaz; büyük görünümlü kart oyuncunun "kart çıktı → pencere açılır" sözleşmesini bozardı; iki yol 6 sn sonra Kıymet'in perdesi önünde buluşur, B5-B'nin kuyruğudur. |
| B7 | Ölünün kartı: Al / Dokunma | **Kalır** | Hurşit öldüğünde restorana tek yol; kart kaynağı restoranda yankılanır. |
| B8 | [YENİ] Kusur kimin | **Küçüğe iner** (K-H2) | "Kusur kimin?" doğrudan sorudur ve diyalogdur; pencere hak etmez. |
| B9 | Davet: Gir / Reddet | **Kalır** (metin: Gir / Git) | Sohbet ağacının ve kartın kapısı. |
| B10 | Yadigâr: Biraz / Hepsini | **Kalır** | Kullanıcı fikri (dilenci/para); ekonominin tek eksi kolu. |
| B11 | Cüzdan: Götür / Al | **Kalır** | Tek "+para" kaynağı; Sıdkı yankısı restoranı besler. |
| B12 | Boncuk: Çocuğa inan / Adama inan | **Kalır** (metin: Elini tut / Elini bırak) | Tek çocuk sahnesi; gerçeğin hiç öğrenilmediği tek kart. |
| B13 | Ayna Adam: Seslen / Devam | **Kesilir** → tekinsizlik ipucu §4.3-2 | Kadroda yok; oyuncunun gecesini okuyan adam "mesaj"dır. |
| B14 | Muzaffer: Yardım çağır / Uzaklaş | **Kalır** | "Yardım / uzaklaş" kası yalnız burada çalışır. |
| B15 | Form: İmzala / İmzalama | **Kalır** | Kullanıcı fikri (organ bağışı); gündelik forma gömüldü. |
| B16 | Çamaşırhane: Camı kır / İtfaiyeyi ara | **Kesilir** | Kadroda yok; duman + yangın + itfaiye aracı oyunun en pahalı tek sahnesi olurdu. |
| B17 | Makas kolu: Çek / Çekme | **Kalır** | Kullanıcı fikri (tramvay-benzeri). |
| B18 | Hacı Vehbi alarmı: Engelle / Bırak | **Kalır** | Alarm sistemini anlatıya bağlayan tek kart. |
| B19 | Esvet: Ver / Uzaklaş | **Kalır** | İlaç fikrinin ikinci yüzü: aynı koli, başka bir el. |
| B20 | [YENİ] Gece telefonu | **Kesilir** | Ferman'ın geçmişi yok; evde telefon yok (duvarda kablo ucu ipucu olarak kalır). |
| B21 | [YENİ] Kapıyı çalan yabancı | **Kesilir** | Hurşit kapısıyla aynı kas. |
| B22 | [YENİ] Penceredeki hırsız | **Kesilir** | Hurşit evine ikinci olay ve yeni NPC. |
| B23 | [YENİ] Devrilmiş araç | **Kesilir** | B25/B26 ile aynı kas. |
| B24 | [YENİ] Bekçi: Teslim et / Kaç | **Sisteme gömülür** (§5.4) | Bekçi alarm sisteminin parçasıdır; kart gerektirmez. |
| B25 | Fren kopması (4 koridor) | **Kalır** | Kullanıcı fikri. |
| B26 | Kaza sonrası: Kal / Kaç | **Kalır** | B25'in bedeli; A4'e giden tek yaya yol. |
| B27 | Bariyer: Vur / Frene bas | **Kalır** | Kullanıcı fikri. |
| B28 | Evrenin kodları: Devam / Geri dön | **Kalır** | Kullanıcı fikri. |
| B29 | Ritüel: Kabul / Bitirip çık | **Kalır** (metin: Tepsiyi çek / Kalk) | Kullanıcı fikri. |
| B30 | Öteki şişe: Uzan / Kal | **Kalır** | Kullanıcı fikri (zehir-panzehir, kurmaca). |
| B31 | Yanlış şişe: Uyar / Sessiz kal | **Kalır** (metin: Kalk / Kal) | Restoranda tek "başkası için" kart. |
| B32 | [YENİ] Yalnız misafirin hesabı | **Kesilir** | Restoranda zaten dört büyük seçim var; hesap sahnesi tekrardır. |
| B33 | Görevliye silah: İndir / Ateş et | **Kalır** | Derin NPC kuralı; S7'nin restoran girişi. |
| B34 | Araçla kenar: Dur ve in / Gaza bas | **Kalır** | S5'in tek kapısı. |
| B35 | Garip'e silah: İndir / Ateş et | **Kalır** | Kullanıcı fikri (Garip); S1'i kapatan tek eylem. |
| B36 | FİNAL: Çaya git / Kenara dön | **Kalır** (metin: Banka yürü / Kenara yürü) | Kullanıcı fikri; oyunun tek canlı sonu buradan geçer. |

Sonuç: **26 büyük seçim** (hedef 24–28), 1 tekrar kartı (**B2′**: silahı sonradan kendine çevirme; B2'nin aynısı, yeni ID değil), 2 sisteme gömme (B13, B24), 2 küçüğe indirme (B8 → K-H2, B6 → K-K1), 7 kesim. `choices.test`: `kind: "big"` olup pencere açmayan kart yoktur.

### 1.3 Nihai liste (26)
Her büyük seçim KANON gereği sinematik ara sahne içinde belirir; "Ara sahne" sütunu saniyedir.

| ID | Ad | A / B | Süre | Ara sahne | Yer | Ön koşul | Açar / Kapar (1 adım) |
|---|---|---|---|---|---|---|---|
| B1 | Çekmece | Al / Bırak | 45 | 5 | Ferman'ın evi, masa çekmecesi | — | A: B2 ve silah serbest eylemleri. B: S2, S3, S7 ve tüm "İndir / Ateş et" kartları bu evrende kapanır. |
| B2 | Elde | Çevir / Cebine koy | 90 | 8 | Aynı yer, B1-A'dan 2,5 sn sonra | `hasGun` | A: S2 İlk Sabah. B: oyun gövdesi; B2′ (her yerde, 2 sn basılı doğrultma) açılır. |
| B3 | Kapı Önündeki Koli | Al / Bırak | 45 | 6 | Ferman'ın kapı önü | Ev kapısı açıldı | A: gizli 180 sn sayaç başlar; B4, B19. B: Zeynel 90 sn sonra döner, koliyi kendisi teslim eder (Hurşit yaşar); **Hurşit'in ziline basınca B9 doğrudan açılır** (B4 atlanır; `deliveredBy: zeynel`). |
| B4 | Yan Evin Kapısı | Çal / Eşiğe bırak | 45 | 6 | Hurşit'in kapısı | Koli elde; sayaç < 180 | A: kapı açılır, Hurşit'in elinde boş ilaç kutusu, koliden yenisini çıkarıp bir tane alır, "Geç kaldı sandım."; sayaç durur; B5 mümkün; B9. B: **10 m uzaklaşma veya 40 sn, hangisi önce** → baston koliyi çeker, sayaç o anda kalıcı durur; davet için zile basmak gerekir. |
| B5 | Namlu Eşikte | İndir / Ateş et | 45 | 6 | Hurşit'in kapı önü / bahçe | `hasGun`; namlu ≥ 2 sn Hurşit'te | A: sohbet sürer ("Çay soğuyor."). B: Hurşit ölür; **A→4 + 180 sn**; K-K1 küçük kart; B7 açılır; B9 kapanır. |
| B7 | Masadaki Kart | Al / Elini çek | 45 | 6 | Hurşit'in mutfağı | Hurşit ölü; kapı açık ya da yan ev anahtarı; kart masada | A: restoran açılır (kart "…ve bir misafiri" der). B: restoran bu evrende kapanır. |
| B9 | Açık Kapı | Gir / Git | 45 | 5 | Hurşit'in eşiği | `hursitHasBox && hursitAlive` (teslim eden fark etmez; Zeynel teslim ettiyse Hurşit: "Kurye getirdi. Çay demledim, boşa gitmesin.") | A: sohbet (K-H1…K-H6), kart. B: kart ve restoran kapanır ("Çay bitti."). |
| B10 | Açık El | Birazını ver / Hepsini ver | 45 | 5 | Meydan, çeşme başı | K-M1'de "Elini cebine at"; ₺ > 0 | A: −20₺ (₺ ≤ 30 ise −10). B: ₺ = 0 → restoranda masa yok. |
| B11 | Banktaki Cüzdan | Götür / Al | 45 | 5 | Meydan, durak bankı | Cüzdan açıldı (serbest eylem) | A: Sıdkı'ya teslim (180 sn içinde Meydan'da; sonra restoran kapısında Bay Edhem'e). B: +85₺; Sıdkı restoranda dalgın (B31 kesin). |
| B12 | Tutulan El | Elini tut / Elini bırak | 20 | 6 | Gece Pazarı, peynirci tezgâhı | K-P1 sonrası bej montlu adam geldi; A ≤ 1 | A: adam gider; pazar anonsu; A+1. B: Boncuk adamla gider. İkisi: kahvecide iki çelişkili söylenti. |
| B14 | Taş Sedir | Eczacıyı çağır / Yürü | 45 | 5 | Meydan, eczane arkası | A ≤ 2 | A: nöbetçi eczacı gelir; sedir boşalır. B: "Sağ ol." (neye, belirsiz). |
| B15 | Tezgâhtaki Form | İmzala / Kalemi bırak | 45 | 6 | Meydan, nöbetçi eczane tezgâhı | Eczaneye girildi; A ≤ 2 | A: form kopyası cepte (Döküm satırı; Garip sahnesinde ucu görünür). B: form tezgâhta kalır. |
| B17 | Makas Kolu | Kolu çek / Geri çekil | 20 | 8 | Eski Çarşı, çarşı hattı makası | A ≤ 3; Ferman kola ≤ 3 m | A: vagon yan hatta; A+1; tanıklar. B: vagon düz hatta. İkisi: K-Ç1. |
| B18 | İhbar Direği | Elini tut / Geri dur | 20 | 5 | Eski Çarşı girişi, kırmızı direk | Hacı Vehbi kola uzandı; A ≤ 2 | A: Vehbi kaideye oturur, gece boyu susar. B: zil; bekçi sokağı yürür; 180 sn A+1 (geçici). |
| B19 | Kolinin Yanındaki El | Paketi uzat / Yürü | 45 | 6 | Mahalle Caddesi, bahçe duvarı dibi | Koli elde; sayaç akıyor; Hurşit'e gidilmedi | A: Esvet koliyle gider; 180. sn'de Hurşit'in radyosu susar; 270. sn'de kapı önü izi (`hursitDoorMarked`). B: Esvet duvarda kalır. |
| B25 | Fren Yok | Düz tut / Direksiyonu kır | 60 | 8 | Okul Yolu & Gece Pazarı, 4 koridor | Araçta; hız > 80 en az 1,5 sn; koridor giriş çizgisi | A: hedef. B: engel (ikincil hasar). İkisi: araç devre dışı; B26; S5 kapanır. |
| B26 | Enkaz Başında | Kal / Yürü | 45 | 6 | Kaza yeri | B25'ten 25 sn sonra | A: tanıklar toplanır; bekçi gelir; A+1. B: A+2; kahveci susar; bekçi peşte. |
| B27 | Titreyen Tabela | Gazı kökle / Frene bas | 60 | 6 | Yasak Çevre Yolu, "GİRİLMEZ" bariyeri, 120 m | Araçta; hız > 80 | A: bariyer kırılır; 28 sn sekans; B28. B: araç durur; bariyer yerinde; tekrar denenebilir. |
| B28 | Siyahın Önü | İleri sür / Geri dön | 60 | 28 (sekansın kendisi) | Dünya Kenarı | B27-A | Kart belirmeden önce siyah hacmin yüzeyinde **6 satırlık canlı döküm** (evrenin kodları). A: tünel döngüsü → evin önünde uyanış (3. döngüde mühür). B: U dönüşü; kapı silinir; ikinci gelişte inşaat bariyeri (mühür). |
| B29 | Kapanış Tepsisi | Tepsiyi çek / Kalk | 90 | 10 | Son Akşam Yemeği, Masa 9 | Ana yemek alındı ve hesap ödendi; B31'de "Kalk" seçilmedi; B33-B yok | A: "Servis" içilebilir (serbest) → B30. B: kart iade; restoran mühürlenir; Yamaç serbest. |
| B30 | Öteki Şişe | Uzan / Otur | 90 | 8 | Aynı masa, "Servis"ten 20 sn sonra | `ritualDrunk` | A: uzanma zinciri → "Şimdi değil"; sersem 240 sn. B: S4 Son Akşam Yemeği. |
| B31 | Yan Masadaki Şişe | Kalk / Kal | 20 | 6 | Restoran, Masa 6 (Münire Hanım) | Oturuldu; ana yemek geldi | A: Münire şişeyi bırakır; Kapanış Ferman'a sunulmaz. B: Masa 6 bölme arkasına kayar; temiz örtü; bej palto vestiyerde kalır. |
| B33 | Salonda Namlu | İndir / Ateş et | 45 | 6 | Restoran; Bay Edhem ya da Sıdkı | `hasGun`; vestiyere verilmedi; ≥ 2 sn doğrultma | A: "Emanet." Yemek sürer; Kapanış sunulmaz. B: salon boşalır; A→5; kapıda S7 sekansı. |
| B34 | Aralık Kapı | Frene bas / Gaza bas | 60 | 6 | Uçurum servis yolu kapısı, 60 m | Araçta | A: in; Garip 60 sn sonra. B: S5 Son Sürüş. |
| B35 | Bankta Namlu | İndir / Ateş et | 45 | 6 | Yamaç bankı | `hasGun`; ≥ 2 sn Garip'te | A: "Teşekkür ederim." Sohbet sürer. B: Garip ölür; S1 kapanır; kenar serbest eylem (S6 varyantı); A+3. |
| B36 | İki Yön | Banka yürü / Kenara yürü | 90 | 12 (cümle + 6 sn sessizlik) | Yamaç bankı ↔ kenar 25 m | Garip yaşıyor; cümle söylendi | A: S1 Bir Bardak Daha. B: S6 Uçurum. Çaydan kalkıp kenara 8 m → B36′ (en çok 2 tekrar). **Kenar kuralı:** cümle henüz söylenmemişken kenara 8 m yaklaşılırsa Garip kalkar, cümleyi erken söyler (K-G atlanır, ad eki yok), 6 sn → B36; görünmez duvar yok. Garip ölü/yoksa kenar serbest eylem → S6. |

**Zar notu:** her kartta süre dolunca seed'li zar atılır (KANON); B2 ve B36 dahil. İsteğe bağlı tasarım bayrağı (`onTimeout: {pick: 1}`) yalnız bu iki kartta "süre dolunca B uygulanır" kuralını açar; karar Çayan'ındır, varsayılan zar'dır.

**Pencere derinliği (TEKNIK §4.4 ile hizalı):** derinlik **≤ 4**; derinlik 4'teki büyük seçim yeni pencere açmaz, aynı sekmede dal emülatörüne düşer (oyuncu için tek fark donmuş-ebeveyn overlay'inin olmamasıdır). Varsayılan zincir B1→B2→B3→B4 dört pencere açar; B9 ve sonrası emülatörde sürer. Kilit kuralı (çocuk ilk büyük seçimini çözünce ebeveyndeki seçenek kilitlenir) zinciri doğal olarak budar. Faz 0 kabulü: 4 derinlikte 5. pencere açılmaz; emülatör yolu aynı sonucu verir.

---

## 2. DOLAYLILIK REVİZYONU

Test: "Bu kart ekrana bir **soru** ya da **mesaj** yazıyor mu? Seçenek metni eylem fiili mi? NPC yorum/ders veriyor mu?" Geçemeyenler duruma gömüldü. Her kartta: **Sahne** (kamera · ses · ışık) ve **Ağırlık** (dolaylı; UI'da hiçbir şey yazmaz; karma/skor yok).

**İç ses (Ferman'ı taşıyan ikinci araç):** `content/dialogues/ferman.json` + `narration/InnerVoice.ts`. Kural: nesne/mekân tetikli, ≤ 5 kelime, kuru; ≥ 20 sn aralık; büyük seçimden sonra 30 sn susar; tek oynayışta ≤ 2 satır/dk (`walk.test`). Toplam **42 satır**: Y1 6 (duvar saati "Titriyor.", radyo "Aynı kadın.", çekmece-B "Aralık kaldı.", kase "İki anahtar.", ceket "Düğme yok.", ayna "Boş."), Y2 6 (F2 3: "Ağır.", "Yan kapı.", "Gitti." · F3 3: "İki çift.", "Gülmüyor.", "Ihlamur."), Y3 15 (F4 8, F5 4, F6 3), Y4 3, Y5 4, Y6 4, Y8 4. Yasak: "neden", "sebep", "intihar", "bugün o gün" ve `bannedTerms` (`i18n.test`).

**B1 Çekmece** — Test: geçti. Sahne: çekmece gıcırtısı, bezin kenarı kalkar, el silahın 5 cm üstünde durur; musluk damlası 3 sn'den 12 sn aralığa açılır; tek ışık masa lambası. Ağırlık: B'de çekmece 3 cm aralık kalır ve gece boyu öyle durur.

**B2 Elde** — Test: geçti (eylem; "intihar" kelimesi hiçbir yerde yok). Sahne: kamera 2 cm çöker, musluk tamamen susar, renk %70 çekilir; kartın altında sönük **Destek** bağlantısı. Ağırlık: B'de cep sağa sarkar; yürüyüş animasyonuna %5 eğim.

**B3 Kapı Önündeki Koli** — Test: geçti. Sahne: paspasta koli, etikette okunur tek şey bir ad: "HURŞİT —, yan kapı"; uzaklaşan motosiklet (Zeynel), sokak lambası vızıltısı. Zeynel uzaklaşmadan iki satır: "Yan kapıymış. Üstünde acil yazıyor." / "Şikâyet için numara arkada." (sayacın gerekçesi oyuncuya böyle kurulur; "ilaç" kelimesi geçmez). Ağırlık: A'da sayaç görünmez; 120. sn'den sonra koli "ağırlaşır" (kamera her 10 sn'de 1° eğilir), 150. sn'de Hurşit'in radyosu kısılır, 180. sn'de yarım cümlede susar (40 m içinde duyulur); **270. sn'de kapı önünde okunur iz**: kapı aralık, Kıymet Hanım tencere bırakıp gider, Paşa kapı önünde miyavlar, zil kapağı bantlı; Döküm: "Koli: elde kaldı." / "Yan ev: radyo yok." Sayaç dolması alarmı etkilemez; yalnız Kıymet'in perdesi o gece hiç kapanmaz.

**B4 Yan Evin Kapısı** — Test: geçti. Sahne: kapı zili düğmesi, içeriden TV ve çaydanlık sesi, paspasta kedi tüyü; sarı kapı lambası. A'da Hurşit kapıyı açtığında elinde boş ilaç kutusu, koliden yenisini çıkarır, bir tane alır: "Geç kaldı sandım." Ağırlık: B'de Ferman 10 m uzaklaşınca **veya** 40 sn geçince (hangisi önce) kapı açılır, eğilemeyen bir adam bastonuyla koliyi çeker; bakmaz; sayaç o anda kalıcı durur.

**B5 Namlu Eşikte** — Test: geçti. Sahne: Hurşit koliyi göğsüne bastırır, gözlük ipi sallanır, Paşa ayaklarında kıpırdamaz; TV duvarın ardında suyun altındaymış gibi. Ağırlık: A'da o gece Hurşit'in perdesi kapalıdır; selam yok. (**K-K1** küçük kart "Kaç / Kal", 30 sn, dolunca "duruyorum"; pencere açmaz, ara sahne ve 0,25× yok; iki yol 6 sn sonra Kıymet Hanım'ın perdesi önünde biter; tek fark iç ses kelimesi "koşuyorum / duruyorum".)

**B7 Masadaki Kart** — Test: geçti. Sahne: mutfakta iki temiz bardak, şekerliğin gölgesi kartın üstünde, salondan tek başına konuşan TV; kamera masa seviyesinde. Ağırlık: A'da kart ıhlamur kokar (iç ses: "Ihlamur."); restoran kapısında Bay Edhem kartı iki kez okur.

**B9 Açık Kapı** — Test: "Reddet" konuşma eylemiydi → **Gir / Git**. Sahne: kapı sonuna dek açık, halı eşiği, terlik rafı (mavi ve lacivert), içeriden ütü buharı; Hurşit: "Çay demledim, boşa gitmesin." Ağırlık: B'de Ferman'ın kapı önüne 180 sn sonra üstü tabakla kapatılmış ince belli bir çay bardağı konur.

**B10 Açık El** — Test: "dilenci / para ver" doğrudandı → Yadigâr **hiçbir şey istemez**: çeşme taşında oturur, kesik şişeden bardak yapar, Ferman durunca avucunu açar (düğme vermek için de aynı el). İlk adım küçük seçim K-M1 "Elini cebine at / Geç"; sonra B10. Sahne: su sesi, banknot sürtünmesi, çeşme taşı ıslak parlar. Ağırlık: B'de Yadigâr parayı hemen almaz, Ferman'ı süzer; sonra alır ve ceketin eksik düğmesini dikmeye başlar (serbest sahne, 20 sn).

**B11 Banktaki Cüzdan** — Test: geçti. Sahne: oturak tahtaları arasına sıkışmış kahverengi cüzdan; içinde 85₺, bir kimlik (siyah yelekli adam), bir personel kartı (mum amblemi). Ağırlık: A'da Sıdkı saymaz, sonra sayar: "Tam."; B'de restoranda Sıdkı'nın eli tepsiyi iki kez düzeltir.

**B12 Tutulan El** — Test: "Çocuğa inan / Adama inan" yargı cümlesiydi → **Elini tut / Elini bırak**. Sahne: pazar lambaları altında Boncuk ceket kenarını sıkar, bej montlu adam üç adım ötede telefon kulağında ("Boncuk!"), pazar uğultusu ikiye bölünür. Adam hiçbir şey açıklamaz; Boncuk fısıldar: "Annem 'gelirse gitme' dedi." Ağırlık: hiçbir yolda gerçek öğrenilmez; kahvecide iki çelişkili söylenti, ikisi de her evrende oynar.

**B14 Taş Sedir** — Test: geçti; Muzaffer **istemez**, yalnız el sallar ("Bakma."). Sahne: eczanenin klima motoru, sedirde iki büklüm bir adam, eli bastonun ucunda; sarı kapı lambası. Ağırlık: A'da eczacı sedire gider, sonra sedir boş; B'de arkadan "Sağ ol." — neye, belirsiz.

**B15 Tezgâhtaki Form** — Test: "Organ bağışı formu" afişle duyurulursa mesajdır → **gündelik form**: nöbetçi eczacı tezgâha bir dosya kâğıdı koyar; başlığın yarısı eczacının elinin altındadır, görünen yalnız "…BAĞIŞ…" ve alt satırda **"Karar tarihi: __ / __ / __"**; eczacı: "Tarih kısmına bugünü yazın." Sahne: floresan, kalemin kâğıda sürtünmesi, kamera tarih satırına iner. Ağırlık: A'da kâğıt katlanıp cebe girer; Garip'in sahnesinde cepten ucu görünür, kimse sormaz; Döküm'de "Form: imzalı. Tarih: bugün."

**B17 Makas Kolu** — Test: tramvay problemi adıyla/sayıyla sorulamaz → **yokuştan kayan yük vagonu**. Sahne: taş kaldırımdaki eski raylar, "MAKAS — ÇEKMEYİN" yazılı dökme demir kol; yukarıdan takozu kayan 1,2 tonluk yük vagonu, esnafın "Tutun!" bağırışı; düz hatta mangal dumanı içinde siluetler (sayısı seçilemez), yan hatta tek bir lamba altında bir siluet ve çiçek kovaları; zaman 0,25×, yalnız demir tekerlek ve Ferman'ın nefesi. **Sayı hiçbir yerde söylenmez; ölüm gösterilmez** (ses + devrilen kova + sessizlik). Ağırlık: K-Ç1'de esnaf başı Ferman'a döner, bakar, hiçbir şey demez; A'da Çiçek Pasajı gece boyu kapalı, kovalar ters.

**B18 İhbar Direği** — Test: geçti. Sahne: Hacı Vehbi bastonuyla cam kapağı kırar, kola bakar, Ferman'a bakar; kasap önünde sıra durur. Vehbi'nin tek cümlesi: "Çekersem gelirler." Ağırlık: B'de zil çarşıyı doldurur, bekçi yürüyerek gelir, Vehbi'ye çay getirilir, bekçi Ferman'a bakmaz.

**B19 Kolinin Yanındaki El** — Test: geçti; Esvet ilaç adı söylemez. Sahne: bahçe duvarı dibinde oturan kadın, lambanın altında buruşuk banknotlar avucunda, gözü kolinin etiketinde; "O… o bana da lazım." Ağırlık: A'da koli gider, sayaç akar, 180. sn'de yan evin radyosu yarım cümlede susar; Ferman duyar ya da duymaz (40 m kuralı).

**B25 Fren Yok** — Test: geçti. Sahne: koridor giriş çizgisi (sarı levha), pedal "tık… fısss", ses daralır, radyo yarım cümlede kesilir, zaman 0,25×, kamera direksiyonda; önde siluet (K1 bisikletli, K2 el arabalı kadın, K3 tezgâh kuran adam, K4 köpek), yanda engel (direk, kamyonet, iskele, konteyner dizisi). Ağırlık: çarpma gösterilmez: kesme, bir nesne sesi (zil, kasa, poşet), sonra sessizlik; B'de engelin ardından ikincil bir ses (devrilen tezgâh, cam).

**B26 Enkaz Başında** — Test: geçti. Sahne: kalabalık yaklaşır ama dağılmaz, yalnız tek bir nesne sesi (bisiklet zilinin dönüşü), buhar; kamera düz, zaman 0,5×. Ağırlık: A'da bekçi gelir, defterine yazar, Ferman'a tek bakış; B'de kahvecide konuşma kesilir, bir çırak "yokuştan inen…" der ve susar.

**B27 Titreyen Tabela** — Test: geçti; hız eşiği metinle değil titremeyle öğrenilir. Sahne: 120 m'de "GİRİLMEZ" levhası; hız arttıkça levha titrer, cıvata sesi, 3° eğilir; farlar levhaya vurur. Ağırlık: A'da levha havada tek dönüşle sağ arkaya kaybolur, tek bir metal çın.

**B28 Siyahın Önü** — Test: geçti; içerik metni hiçbir yerde "sınır / hata / yükleniyor / simülasyon / kod / render" demez (`i18n.test` yasaklı liste). Sahne (28 sn sekans): normal asfalt 8 sn → aynı yağ lekesi her 12 m'de, aynı ağaç üç kez, hız 52'ye kilitlenir → evlerin kontrplak arka yüzleri, yarım bir ÇIKIŞ levhası → yol kenarında numaralı paneller 9, 10, 11, 12, **14** (13 yok, daha parlak) → asfalt dokusu kaybolur → 40 m ileride farların vurmadığı keskin kenarlı siyah hacim; araç durur, 3 sn tam sessizlik, sağ ön tıkırtı. **Evrenin kodları:** sessizlik içinde siyah hacmin yüzeyinde monospace, Türkçe etiketli (EN'de İngilizce) 6 satır canlı döküm belirir — `evren: u-7K3M2QX9` · `üst evren: u-…` (yoksa `—`) · `koli: elde | teslim | —` · `silah: cepte | —` · `lamba: n` · `alarm: n`; değerler `GameState` ile birebir (`sequence.test`). Gök kubbesinde ufka 10° yakın tek ince dikiş çizgisi (yalnız bu bölgede). Ağırlık: A'da tünel döngüsü (sodyum sarısı; 1. döngüde panel sayıları, **2. döngüde aynı 6 satırın kırpılmış tekrarı**, 3. döngüde 13 yanar), floresan üç titreme (1 sn'de ≤ 3 geçiş), Ferman evin önünde, ön tamponda bariyer parçası; **saat yok**, iz yalnız budur: araba radyosu kendiliğinden açılır ve en son duyulan cümleyi tekrar eder. B'de Ferman 1,5 sn başka yere bakınca tabela ve kol yok olur; ikinci gelişte turuncu-beyaz inşaat bariyeri ve "YAPIM AŞAMASINDA — TESLİM: BELİRSİZ".

**B29 Kapanış Tepsisi** — Test: "Kabul et" konuşma eylemiydi → **Tepsiyi çek / Kalk**. Sahne: lamba %15 kısılır, dört vuruşa tamamlanan müzik, tepside iki şişe: kehribar renkli, boynunda yalnız "Servis" yazan kâğıt etiket; şeffaf, kalay tıpalı, etiketsiz. Sıdkı: "Soldaki servis. Sağdaki öteki." Bay Edhem uzaktan: "Düşünme süresi sizin." Kartın köşesinde sönük **Destek**. Ağırlık: B'de müzik dört vuruştan üçe düşer; Bay Edhem kartı geri alır: "Bu evde 'bir daha' yoktur."

**B30 Öteki Şişe** — Test: geçti; algı anlatılır, yöntem/doz/belirti listesi yoktur, şişelerin içeriği kurmacadır. Sahne: lambaların kenarında hale, çatal sesleri uzaklaşır, kalp atışı aralıkları uzar (sayı yok), sağdaki şişe ekmek sepetinin arkasında 70 cm; süre çubuğu rakamsız (yalnız kenar kararması). Ağırlık: A'da üç engel (sepet/mum, Sıdkı'nın eli: "Emin misiniz, efendim?", kalkarsa sendeleme); "Şimdi değil." Sıdkı su getirir: "Su ücretsizdir." B'de kalan süre sessiz akar.

**B31 Yan Masadaki Şişe** — Test: "Uyar" konuşma eylemi → **Kalk / Kal**. Sahne: Sıdkı tepsiyi peçeteyle örtülü Masa 6'ya bırakır, mutfağa döner; Münire Hanım peçeteyi kaldırır: "Şarap söylememiştim. İkram olmalı." Zaman 0,25×, müzik üç vuruş. Ağırlık: A'da Bay Edhem üç saniyede Ferman'ın omzu hizasında belirir, Sıdkı'ya tek bakış; Kapanış Ferman'a sunulmaz (sessizce). B'de salon düzeni kayar, Masa 6 bölmenin arkasına gider, 40 sn sonra temiz örtüyle döner; vestiyerde fiş 6'da bej palto kalır.

**B33 Salonda Namlu** — Test: geçti. Sahne: Bay Edhem defterini kapatmaz; Sıdkı tepsiyi indirmez; misafirler çatalı bırakır; müzik durmaz. Ağırlık: A'da Bay Edhem: "Emanet." (vestiyer fişi 313 uzatılır); B'de salon 12 sn'de boşalır, kapı dışında iki far.

**B34 Aralık Kapı** — Test: geçti. Sahne: turuncu demir kapı yarı açık, rüzgârla oynar; ötesinde 40 m çakıl, sonra ufuk çizgisi; radyo çıtırdar. Ağırlık: A'da fren çakıla gömülür; motor çalışır bırakılırsa Garip: "Motoru kapat, kuşlar kalkıyor." (Garip'in tek gündelik isteği; yargı değil).

**B35 Bankta Namlu** — Test: geçti. Sahne: Garip silaha bakmaz, elleri hırka cebinde kalır, sonra iki avucunu açar, yaklaşmaz: "Burada duruyorum." Ağırlık: A'da "Teşekkür ederim." bir kez; B'de kuş sürüsü kalkar, 40 sn yalnız rüzgâr; bankta iki dolu bardak soğur.

**B36 İki Yön** — Test: geçti; Garip'in iki cümlesi de soru/ders değildir. Varışta kanonik ilk cümle: **"Çay koydum. İki bardak oldu."** (bakmadan, termosu açarken). Finalde tek kullanımlık eksiklik beyanı: **"Sana bir sebep veremem[, Ferman]; elimde bir bardak var ve bu gece onu yalnız içmek istemiyorum."** Sahne: Garip cümleyi düz söyler, 6 sn susar, banka döner, arkasına bakmaz; kart o anda belirir; rüzgâr kenardan, çimler tek yöne yatmış, gök en açık hâlinde. Ağırlık: B'de Garip'in tek tekrar edilen cümlesi: "Bardak burada kalır."

---

## 3. YOLLAR (ROUTES)

### 3.0 Bağımlılık ve faz eşlemesi
Bağımlılık grafiği: **Y1 → Y2 → Y3 → { Y4 → Y5 · Y6 · Y7 · Y8 } → Y9** (S2 İlk Sabah ve Döküm ekranı Y1 ile birlikte gelir).

| Kaba faz | FAZLAR | Yollar | Fazın kapanış ölçütü (kullanıcı tarayıcıda onaylar) |
|---|---|---|---|
| 0 | F0 | Y1 çekirdeği (pencere, kart, zar, test kartları) | TEKNIK §4.7 Faz 0 kabulü; 5 derinlik + emülatör + handoff 3 tarayıcıda |
| 1 | F1–F3 | Y1 tam + Y2 | B1/B2/S2/Döküm; Hurşit sohbeti, 3 dk sayaç, alarm çekirdeği, **10** içerik test dosyası yeşil |
| 2 | F4–F6 | Y3 | mahalle iskeleti + S7; Meydan/Çarşı/Pazar 7 kartı, figüranlar, gök sistemi, gerçek D1'de 30 fps |
| 3 | F7–F8 | Y4 + Y5 | araç fiziği, 4 koridor, bariyer sekansı, evrenin kodları, tünel döngüsü |
| 4 | F9, F11, F12 | Y6 + Y8 + Y9 | restoran, Yamaç, 7 son, Destek, TR/EN tam |
| 5 | F10, F13–F15 | Y7 + cila | sTressT iframe köprüsü, VAT, ses, performans kapıları, tarayıcı matrisi, yayın |

### Y1 · EV YOLU (Ferman'ın evi)
- **Büyük:** B1, B2 (+ B2′ tekrar kuralı).
- **Küçük (6):** K-E1 Perde: Aç / Bırak (gök görünür) · K-E2 Radyo: Aç / Kapalı kalsın · K-E3 Musluk: Kapat / Bırak (damlama evin metronomu) · K-E4 Anahtar kasesi: Araba anahtarını al / Bırak (ikinci anahtar: "H. — yan ev") · K-E5 Ceket: Giy / Bırak (bir düğmesi eksik; silah iç cebe) · K-E6 Ayna: Bak / Geç (aynada oda bir an boş).
- **NPC:** yok (Paşa pencere pervazında görülebilir).
- **Mekân:** tek katlı yer evi: oda + mutfak + banyo + hol; bahçe; araba evin önünde.
- **Sistemler:** FPS hareket · E etkileşim · tut/bırak/fırlat · kırılabilir nesneler (tabak, bardak, radyo, saat, ayna, cam; ödül yok) · silah serbest eylemleri (§5) · ara sahne + süre çubuğu + seed'li zar · **pencere sistemi** (yeni sekme, snapshot handoff, dondur/uyan, kilit, emülatör) · altyazı TR-EN · **iç ses** (6 satır; §2) · içerik uyarısı · Devam/autosave · ayarlar · Destek bağlantısı · kalite kademeleri + dinamik çözünürlük.
- **Asset:** ev modüler iç kiti 1 · mobilya 10 · küçük nesne 18 · silah 1 · radyo 1 · duvar saati 1 (duruk) · araba dış 1.
- **Bağımlılık:** yok (dikey dilimin çekirdeği).
- **Süre:** 4–8 dk.
- **Kabul:** B1 ve B2 kartları `content/choices/B1.json`, `B2.json`'dan yüklenir; süre dolunca aynı seed aynı sonucu verir (10/10 tekrar); S2 oynar ve Döküm 6–9 satır üretir; 6 kırılabilir nesne kırılır ve hiçbiri bayrak dışında bir şey vermez; D2'de 60 fps.

### Y2 · PAKET + KOMŞU YOLU
- **Büyük:** B3, B4, B5, B7, B9, B19.
- **Küçük (7):** K-H1 Çay mı kahve mi · K-H2 Kusur: "Kurye bıraktı" / "Ben geç getirdim" (B8'den indirildi; Hurşit yalnız "Olur." der) · K-H3 Paşa: Sev / Geç · K-H4 Kart: Al / Masada dursun (Hurşit yaşadıkça yeniden istenebilir) · K-H5 Söz: "Uğrarım" / "Söz veremem" · K-H6 Şayeste'nin fotoğrafı: Sor / Sorma · **K-K1** Kaç / Kal (B5-B sonrası; B6'dan indirildi).
- **NPC:** Hurşit Amca (ana diyalog NPC'si) · Zeynel (motosikletli kurye; 2 satır: "Yan kapıymış. Üstünde acil yazıyor." / "Şikâyet için numara arkada.") · Esvet (duvar dibi; 2 satır) · Kıymet Hanım (perde; tanık; 1 satır) · Paşa (kedi).
- **Mekân:** Hurşit'in evi (Y1 kitiyle), iki bahçe arası duvar, Mahalle Caddesi başı.
- **Sistemler:** gizli 180 sn sayaç (durum tablosu: ev içi 1×, kart açıkken 0,25×, ebeveyn donunca durur, teslimde ya da baston çekince kalıcı durur, koli yok edilirse 180'de yine dolar; 270. sn kapı önü izi) · taşıma + kapı etkileşimi ("Elin dolu.") · diyalog ağacı (`dialogues/hursit.json`; B9 iki varyant) · kedi AI (otur/yürü/kaç) · **alarm çekirdeği** (tanık sayımı; A4 yalnız B5-B'den; sayaç dolması alarmı etkilemez) · doğrultma algısı (≥ 2 sn) · K-K1 küçük kart · ölü ev varyantı (radyo susmuş, kapı aralık) · yan ev anahtarı.
- **Asset:** Hurşit 1 (6 animasyon) · Esvet 1 · Zeynel 1 + motosiklet 1 · Kıymet 1 · kedi 1 · koli 1 · ev içi ek 8 nesne (TV, koltuk, şekerlik, fotoğraf, baston, radyo, çaydanlık, tencere) · davet kartı 1.
- **Bağımlılık:** Y1.
- **Süre:** 6–15 dk.
- **Kabul:** sayaç 7 senaryoda doğru akar/durur (`timer.test`: 5 durum + "eşiğe bırak ve bekle 40 s → durur" + "270 s → `hursitDoorMarked`"); B5 yalnız ≥ 2 sn doğrultmada belirir, 1,9 sn'de belirmez; Hurşit sohbeti ≤ 6 dk ve her K-H kartı 30 sn'de kendi cevabını verir; ölü ev varyantında B7 kartı masada bulunur; B3-B yolundan zil ile B9'a ulaşılır (`graph.test`: S4'e B3-B yolundan erişilebilir); `alarm.test`: `hasGun=false, boxTimerExpired=true, 600 s olaysız → A sabit`.

### Y3 · MAHALLE YOLU (Mahalle Caddesi, Meydan, Eski Çarşı, Gece Pazarı)
- **Büyük:** B10, B11, B12, B14, B15, B17, B18.
- **Küçük (6):** K-M1 Yadigâr: Elini cebine at / Geç · K-M2 Düğme: Al / Alma · K-M3 Kahveci: Çay iste / Geç (5₺; çayı bırakırken "Kaşık yok. Parmağınla.") · K-P1 Boncuk: "Annen nerede?" / Geç · K-M4 Eczacı: "Nöbet mi?" / Sus (eczacı: "Hep."; form tezgâha gelir) · K-Ç1 Vagon sonrası: Esnaf başına bak / Yürü. Kara mizah kuru ve tek kelimeliktir; Sıdkı'nın "Tam."ı aynı aileden.
- **NPC:** Yadigâr · Sıdkı (Meydan'da arayan adam) · Boncuk + bej montlu adam (adsız) · Muzaffer Bey · nöbetçi eczacı (adsız) · Hacı Vehbi · gece bekçisi · figüranlar (8–14; 4 model × 3 doku) · Kıymet (perde yankısı).
- **Mekân:** Mahalle Caddesi · Meydan (çeşme, durak, nöbetçi eczane, kahveci) · Eski Çarşı (kapalı sinema, çarşı hattı, makas, Hal önü, Çiçek Pasajı) · Gece Pazarı · Atölye Sokağı ağzı.
- **Sistemler:** bölge streaming · figüran AI + alarm tepkileri (A2'de çocuk/yaşlı çekilir, A3'te sokak boşalır) · ekonomi ₺ (HUD yok; cüzdan açılınca sayılır) · **Postal etkileşimleri** (§4.1) · sokak lambaları (vurulunca söner, gök açılır) · çeşme/konteyner/kepenk fiziği · bekçi AI · **gök sistemi** (ışık yoğunluğuna göre yıldız ve Samanyolu açılımı; karanlıkta 60 sn beklemek göğü açar) · vagon + makas scripted sahne.
- **Asset:** sokak kiti (ev cephesi 6 varyant, kaldırım, lamba, çit, konteyner, kepenkli dükkân 4) · Meydan (çeşme, durak, eczane cephe + tezgâh, kahveci masa 6) · çarşı (sinema cephesi, ray 60 m, makas kolu, yük vagonu, mangal, kova 8) · pazar (tezgâh 10, kasa 20, meyve) · NPC 8 · figüran 4×3 · gece göğü HDRI 1 + yıldız shader.
- **Bağımlılık:** Y2 (alarm çekirdeği, diyalog), Y1.
- **Süre:** 20–40 dk.
- **Kabul:** 7 kartın ön koşulları `flags.test.ts`'ten geçer; alarm A0→A3 tablodaki tetiklerle yükselir ve 180 sn'de bir kademe iner; 12 Postal etkileşimi hiçbir yerde ₺/CR üretmez (grep ile `give: money` yok); D1'de Meydan 30 fps.

### Y4 · ARABA YOLU
- **Büyük:** B25 (K1–K4), B26.
- **Küçük (3):** K-A1 Radyo: Aç / Kapat · K-A2 Far: Uzun / Kısa (uzun far göğü kapatır) · K-A3 Enkazda: Motoru kapat / Bırak.
- **NPC:** koridor siluetleri 4 (K1 Okul Yolu — bisikletli; K2 Gece Pazarı — el arabalı kadın; K3 Okul Yolu dönüşü — tezgâh kuran adam; K4 pazar arkası — köpek + konteyner dizisi) · kaza tanıkları (figüran) · bekçi.
- **Mekân:** evin önü (biniş) · Okul Yolu · Gece Pazarı · aralarındaki düzlük (hız alma bölgesi).
- **Sistemler:** arcade araç fiziği (otomatik vites, 0–120) · hız eşiği 80 + silahlanma (≥ 1,5 sn) · koridor giriş çizgisi + zaman yavaşlatma · çarpma sunumu (non-grafik: kesme + nesne sesi) · araç devre dışı durumu · "sersemlemiş" durumu (yürüyüş %70, 240 sn) · figürana araçla çarpma (pencere yok, A+2) · korna.
- **Asset:** araba 1 (kokpit + dış, 4 LOD, hasar dokusu 2) · engel seti (beton direk, kamyonet, konteyner 6, iskele) · köpek 1 · bisiklet 1 · el arabası 1 · radyo UI.
- **Bağımlılık:** Y1 (anahtar), Y3 (sokaklar).
- **Süre:** 8–15 dk.
- **Kabul:** B25 yalnız hız > 80 ve ≥ 1,5 sn silahlanmışken koridor çizgisinde tetiklenir (79 km/s'te tetiklenmez); 4 koridorun her birinde A ve B sunumu kan/beden göstermez; B26'dan sonra araç bir daha çalışmaz ve S5 o evrende erişilemez (`graph.test.ts`).

### Y5 · BARİYER YOLU (Yasak Çevre Yolu / Dünya Kenarı — doğu ucu)
- **Büyük:** B27, B28.
- **Küçük:** yok.
- **NPC:** yok (ikinci gelişte bariyer ucuna bağlı bir bayrak ve bir termos; kimse yok).
- **Mekân:** çevre yolu girişi · bariyer · 28 sn'lik "kenar" yolu · tünel · evin önü (dönüş noktası).
- **Sistemler:** tabela titreme bantları (hız) · scripted sekans (ray sürüş, hız kilidi 52, panel ışıkları 9–14, doku kaybı, siyah hacim) · tünel döngüsü (3 varyant) · ışınlama (evin önü) · mühür (inşaat bariyeri) · döngü sayacı.
- **Asset:** bariyer kolu + direk 1 · tabela 2 · inşaat bariyeri 4 · sarı flaşör 1 · panel 8 · tünel modülü 1 · arka cephe kontrplak 3 · siyah hacim shader 1.
- **Bağımlılık:** Y4.
- **Süre:** 4–8 dk.
- **Kabul:** hız ≤ 80'de bariyer kırılmaz ve kart çıkmaz; sekans 28 ± 1 sn; siyah hacimdeki 6 satırın değerleri `GameState` ile eşit (`sequence.test`); 3. döngüde mühür ve evin önüne dönüş; mühürden sonra bariyer bölgesi bir daha kart üretmez; içerik metninde "sınır/hata/yükleniyor/simülasyon/kod/render" yok (i18n anahtar taraması; `app.*`/`error.*`/`boot.*` ad alanları muaf).

### Y6 · RESTORAN YOLU (Son Akşam Yemeği — oyuncu müşteri)
- **Büyük:** B29, B30, B31, B33.
- **Küçük (6):** K-R1 Vestiyer: Silahı emanet et / Cebinde tut (yalnız `hasGun`) · K-R2 Çorba: Al / Atla · K-R3 Ana yemek: Al / Atla · K-R4 Tatlı mı şarap mı (ikisi birden alınamıyorsa; yoksa iki ayrı Al/Atla) · K-R5 Bahşiş: Bırak / Tut (10₺) · K-R6 "Şimdi değil" suyu: İç / Bırak.
- **NPC:** Bay Edhem (maître; "Davetiyeniz?") · Sıdkı (garson) · Münire Hanım (Masa 6) · 3 figüran misafir (Masa 2 yaşlı adam, Masa 5 çift, Masa 4 bölme arkası görünmez).
- **Mekân:** Eski Çarşı, mumlu kapı · vestiyer · salon (8 masa; Masa 13 yok) · mutfak kapısı (girilmez).
- **Sistemler:** oturma modu (kamera masa yüksekliği) · menü/ekonomi UI · salon düzeni kayması (30 sn) · algı efektleri (bulanıklık, kalp atışı aralığı, lowpass) · uzanma engel zinciri · **ritüel eşiği** (§6) · kart iade + restoran mühürü · kapıda ret varyantları (kartsız / personel kartı / parasız / A ≥ 3).
- **Asset:** restoran iç kiti (masa 8, sandalye 16, bölme 2, büfe 1, vestiyer 1, avize 3) · sofra seti · tepsi + 2 şişe · menü kartı · 3 NPC + 3 misafir · dış cephe + mum 6.
- **Bağımlılık:** Y2 (kart), Y3 (para; Sıdkı/cüzdan).
- **Süre:** 10–18 dk.
- **Kabul:** kartsız ya da < 20₺ ile kapı açılmaz; Kapanış yalnız ana yemek + ödenmiş hesapta gelir (§6.2 tablosunun 9 satırı test edilir); B30-A'da "Şimdi değil" üç engelden sonra her zaman gerçekleşir; şişe metinlerinde yalnız "Servis" ve "öteki" geçer (i18n taraması).

### Y7 · sTressT (Atölye Sokağı; birebir mevcut proje)
- **Büyük:** yok (KANON v3: başka sistem yok; giriş/çıkış serbest eylem).
- **Küçük (1):** K-S1 Kapıda eldivenler: Tak / Geri dön.
- **Kapı kuralları:** koli kapıda bırakılır (sayaç akmaya devam eder) · silah dolaba kilitlenir ("İÇERİDE HER ŞEY ELLE KIRILIR.") · araba yarım bariyerden giremez · CR ≠ ₺, kur yok, ₺ HUD gizli.
- **Mekân:** Atölye Sokağı çıkmazı 110 m, servis kapısı; içerisi sTressT'in kendisi.
- **Sistemler:** **iframe köprüsü** (`apps/stresst/dist` → `/stresst/`; `postMessage`; sTressT'e yalnız `host-bridge.ts` ≤ 40 satır + 1 import; TEKNIK §1.5) · kayıt izolasyonu (ayrı IDB adı) · göz kırpması geçişi (100/400/200 ms) · çıkış çınlaması 12 sn · ebeveyn donunca iframe `pause` · çıkışta alarm durumunu devralma · pause menüsünde "Sokağa dön".
- **Asset:** sTressT'in mevcut asset hattı (60 GLB + 11 PBR + 110 MP3; `/stresst/` altında) · ek: servis kapısı 1, eldiven çivisi 1, dolap 1, yarım bariyer 1, duvar yazısı dokusu 1 (`signs[]`).
- **Bağımlılık:** Y3 (sokak ağzı), Y1 (pencere sistemi).
- **Süre:** 15–45 dk (isteğe bağlı; ana oynanışa sayılmaz).
- **Kabul:** sTressT içindeki hiçbir kayıt ana oyunun IndexedDB deposuna yazılmaz; CR → ₺ dönüşümü hiçbir yerde yok; kapıda bırakılan koli çıkışta yerindedir ve sayaç geçen gerçek süre kadar ilerlemiştir; silah çıkışta dolaptan geri alınır; "birebir": aynı profil + aynı seed ile 60 sn sonra `__stresst.state()` hash'i standalone ve iframe'de eşit, menü metinleri eşit, fps ±%10.

### Y8 · TEPE YOLU (Yamaç → Uçurum — kuzeybatı)
- **Büyük:** B34, B35, B36 (+ B36′).
- **Küçük (5):** K-G1 İlk cevap: "Çay istemem" / "Kimsin?" · K-G2 Ad: "Ferman" / "Önemli değil" · K-G3 **"Kahve var mı?" / "Çay olur"** (Garip: "Kahve yok. Çay var." — kullanıcının kahve motifi; sonu etkilemez) · K-G4 Şeker: Bir / Yok · K-G5 Söz açma: "Bugün…" / Sus (Garip: "Duydum." + gündelik soru: "Şeker kaç?"). Garip'in hiçbir satırı soru işaretiyle bitmez; "Şeker kaç?" tek istisnadır (`dialogue.test`).
- **NPC:** Garip (bank, termos, iki ince belli bardak; varışta "Çay koydum. İki bardak oldu.") · Paşa (bankın altında; tekinsizlik).
- **Mekân:** Yamaç yaya patikası (Meydan'dan 3 dk; mahalle ışığı azaldıkça gök açılır) · bank · kenar (alçak taş duvarın kesildiği yer, banktan 25 m) · servis yolu + turuncu demir kapı (araçla).
- **Sistemler:** gök açılımı (en açık nokta; ilk kuş sesi patikada) · UI sönme (son 90 sn: HUD, altyazı dışında her şey) · diyalog ağacı (`dialogues/garip.json`) + 10 sn sessizlik kuralı (cevap gelmezse Garip bir gündelik satır söyler) · final ara sahnesi (cümle + 6 sn) · **kenar kuralı** (Garip yaşıyor ve cümle söylenmemişken kenara 8 m → Garip kalkar, cümleyi erken söyler, K-G atlanır, 6 sn → B36; görünmez duvar yok) · tekrar kuralı (B36′ en çok 2) · kader zarı (yalnız sunum) · Garip'siz Yamaç (ocak yok; bankta iki soğuyan bardak; kenar serbest eylem → S6).
- **Asset:** yamaç arazi 1 (patika 300 m) · badem ağacı 6 · taş duvar modülü · bank 1 · termos 1 · bardak 2 · şekerlik 1 · Garip 1 (otur/ayağa kalk/yürü/çay koy) · demir kapı 1 · çakıl yol · şehir ışıkları sprite seti.
- **Bağımlılık:** Y3 (patika girişi), Y4 (araçla geliş, isteğe bağlı), Y1 (silah).
- **Süre:** 6–12 dk.
- **Kabul:** `endings.test.ts`: `survives: true` yalnız S1 ve B36-A'dan erişilir; B35-B sonrası S1 o evrende erişilemez; B36′ üçüncü kez belirmez; son 90 sn'de HUD kapanır ve altyazı kalır; Garip'in ilk cümlesi her varışta aynıdır; `graph.test`: Yamaç'ta B36 ya da S6'ya bağlanmayan "sessiz kenar" düğümü yok; `flags.test`: `garipSentenceSaid` kenar tetiğinden de yazılır; kahve istenince Garip çay koyar.

### Y9 · SONLAR
- **İçerik:** 7 son · **DÖKÜM** ekranı (§7.2) · Destek şeridi · içerik uyarısı · ana menü · "Bu pencereyi kapat" / "Baştan" akışı · ebeveyn uyanış metinleri.
- **Sistemler:** son sahnesi oynatıcı (ses katmanı soyma, kamera kilidi) · Döküm üretici (bayraklardan 6–9 satır, TR/EN) · kader zarı sunum varyantları · arşiv (görülen sonlar, spoilersız).
- **Asset:** UI yazı tipi 1 (IBM Plex Sans) · kâğıt dokusu 1 · damga sesi 1 · elma 1 · bej palto 1.
- **Bağımlılık:** hepsi (S2 İlk Sabah ve Döküm Y1 ile birlikte).
- **Süre:** 1–4 dk/son.
- **Kabul:** 7 sonun her biri `walk.test.ts`'te ≤ 40 düğümde ulaşılır; Döküm TR ve EN'de aynı satır sayısını verir; Destek şeridi hiçbir sonda gizlenemez (DOM testinde `#support` görünür); hiçbir son metninde yöntem/doz/ürün adı yok (yasaklı kelime listesi `support.json`'da, test taraması).

### Önerilen tek oynayış (60–90 dk)
Y1 (6) → Y2 (10) → Y3 (25) → Y4 veya Y6 (12) → Y8 (10) → son (3) ≈ **66 dk**; sTressT'e giren ve bariyeri deneyen oyuncu 90 dk'yı aşar.

---

## 4. SOMA + POSTAL KARIŞIMI — SOMUT LİSTE

### 4.1 Postal: 12 sistemik / absürt etkileşim (hiçbiri kart açmaz; ödül yok)
| # | Etkileşim | Nasıl | Dünya tepkisi | Alarm |
|---|---|---|---|---|
| 1 | **Tekme** (F) | Çöp kutusu, kasa, kepenk, kapı | Kutu devrilir; kepenk gürler; Paşa her zaman kaçar (kediye tekme hiç isabet etmez) | kepenk 3 vuruş → +1 |
| 2 | **Fırlat** (G basılı) | Her taşınabilir nesne: simit, elma, bardak, kasa | Figüran "Hop!"; vitrine çarparsa cam kırılır | cam → +1 |
| 3 | **Korna** | Araçta | Figüranlar sıçrar; Paşa kaputtan atlar | 10 sn'de 5 korna → +1 |
| 4 | **Lambayı vur** | Sokak lambasına ateş | Lamba söner, **o bölgede gök açılır** (yıkım ↔ güzellik) | her 3 lamba → +1 |
| 5 | **Kasaları devir** | Gece Pazarı kasaları | Elmalar yuvarlanır; pazarcı toplar, bakmaz | 0 (A2'den sonra +1) |
| 6 | **Çeşmeye kafanı sok** | Meydan çeşmesi, E basılı | Ses 5 sn boğuk, ekran ıslak; "sersemlemiş" 60 sn kısalır | 0 |
| 7 | **Konteynere gir** | Kapaklı konteyner, E | Figüranlar görmez; tanık sayısı 0'a iner; bekçi önünden geçer | 0 (saklanma) |
| 8 | **Sandalye taşı ve otur** | Kahveci sandalyesi her yere taşınır; "Otur" eylemi | Karanlıkta 60 sn oturmak göğü açar | 0 |
| 9 | **Havaya ateş** | Silah elde, yukarı nişan | Yarasalar kalkar; perdeler çekilir | her 3 atış → +1 |
| 10 | **Kendi arabana vur** | Tekme/ateş | Alarm sireni 20 sn ("bip bip"); Meydan'daysa figüranlar bakar | Meydan'da +1 |
| 11 | **Afişi yırt** | Kapalı sinema afişi, E | Afiş düşer; altından aynı afişin daha eski bir baskısı çıkar ("SABAH — yakında") | 0 |
| 12 | **Vagonu it** | Çarşı hattı vagonu, makas sonrası | Vagon 2 m gider, durur; esnaf başı bakar | 0 |

Kural: hiçbir etkileşim ₺ ya da CR vermez; Döküm'e en çok tek satır girer ("Lamba: 4 söndü.").

### 4.2 SOMA: 12 çevresel anlatı / keşif unsuru ("neden hep gece?" — cevaplanmaz)
Dünya içi yazılar (≈ 14: "İLK SEFER: —", "SABAH — Gösterim: yakında", "EKMEK DÜN GECEDEN", "GİRİLMEZ", "MAKAS — ÇEKMEYİN", "YAPIM AŞAMASINDA — TESLİM: BELİRSİZ", "İÇERİDE HER ŞEY ELLE KIRILIR.", koli etiketi, "Servis", form satırları, kapı numaraları) `zones/*.json` `signs[] {id, textKey, mesh}` ile iki dilde tanımlıdır; dokular Türkçe kalır, EN oyuncu nişangâhı ≥ 0,7 s tabelada tutunca altyazı şeridinde çeviriyi 1,2 s görür (TR'de şerit hiç çıkmaz). `i18n.test`: her `signs[].textKey` iki dilde var. Alternatif (dil başına doku çifti) Çayan kararıdır.
1. **Duran saatler:** evdeki duvar saati, kahveci saati, eczane saati, araba saati — hepsi farklı bir saati gösterir, hiçbiri işlemez; saniye ibreleri aynı noktada titrer.
2. **Radyo:** tek istasyon; kadın sesi sayılar okur, araya "…sabah…" kelimesi girer ve kesilir; hava durumu hep "yarın için" vaat edilir, "yarın" bölümü hiç gelmez.
3. **Durak tabelası:** bütün kalkış saatleri "—"; en altta "İLK SEFER: —".
4. **Buzdolabı notu (Hurşit):** "İlaç — son kutu" — tarih yok; altındaki eski notta aynı kelimeler, aynı kalem (sayacın aciliyetiyle çelişen "sabah" kelimesi kaldırıldı).
5. **Kapalı sinema afişi:** film adı "SABAH", "Gösterim: yakında"; afişin altından aynı afişin daha eski baskısı (§4.1-11).
6. **Çamaşırlar:** iplerde asılı, hiç kurumuyor; damlama sesi her bahçede aynı ritimde.
7. **Fırın:** "EKMEK DÜN GECEDEN" tabelası; fırıncı yok, ışık yanıyor, ekmek sıcak.
8. **Takvimler:** Hurşit'in takviminde yaprak çevrilmemiş; Ferman'ın evinde takvim çivisi var, takvim yok.
9. **13 yok:** mahallede kapı numaraları 11, 12, 14; Dünya Kenarı panelleri 9–14'te 13 atlanır; restoranda Masa 13 yok.
10. **Gök:** yıldızlar kaymaz; 10 dk beklenince aynı yerde; Samanyolu sabit bir yarık gibi.
11. **Mahallede kuş yok:** yalnız yarasalar; uzaktan bir horoz ötmeye başlar, yarıda kesilir (gecede bir kez). Kuş yalnız Yamaç ve Uçurum'da vardır; ilk kuş sesi patikada duyulur (gök gibi "uzaklaştıkça açılan" ikinci şey); `audio-budget.test`: kuş klipleri yalnız `yamac`/`ucurum` paketlerinde.
12. **Gece Pazarı:** tezgâhlar sabah için kurulmuş; pazarcılar termosla beklerler; "Sabah açarız" tek cümleleri.

### 4.3 Gözetlenme / tekinsizlik ipuçları (8; hepsi dolaylı, hiçbiri açıklanmaz)
1. **Kıymet Hanım'ın perdesi:** Ferman hangi sokaktaysa en yakın evin perdesi aralıktır; yaklaşınca kapanır.
2. **Karşı kaldırımdaki figür (eski Ayna Adam):** Okul Yolu'nun uzun düz kısmında karşı kaldırımda biri yürür; Ferman durunca yarım saniye sonra durur; seslenilemez, yol karşıya geçince orada kimse yoktur.
3. **Geç adım:** Eski Çarşı pasajında ayak sesi yankısı bir adım geç gelir.
4. **Lambalar:** A0'da önündeki lamba yanar, arkandaki söner.
5. **Paşa:** Hurşit'in kedisi restoranın pervazında, Yamaç bankının altında, arabanın kaputunda görünür; aynı anda iki yerde olamaz ama hep oradadır.
6. **Gezen radyo:** Hurşit'in radyosundaki ses, başka evlerin camlarından da aynı cümlede duyulur.
7. **Yönsüz düdük:** bekçi düdüğü sokağın olmadığı bir yönden gelir.
8. **Rezervasyon defteri:** Bay Edhem defteri kapatmadan önce Ferman'ın masa numarası (9) zaten yazılıdır; Ferman kartı henüz vermemiştir.

---

## 5. SİLAHIN SERBEST KULLANIMI

### 5.1 Temel
- Şarjör **6**; yedek yok; boşta "Tık." (kendine doğrultulmuşken de ölüm yok; iç ses: "Boşmuş.").
- Çek (F) 0,8 sn · Cebe koy (F) · Doğrult (sağ tık) · Ateş (sol tık) · Bırak (G) · Fırlat (G basılı) · Göm (bahçe küreği, 40 sn; Hurşit yaşıyorsa: "Ne dikiyorsun orada?") · **Verme:** hiçbir NPC'ye silah verilmez ("Veremem."); yalnız restoran vestiyerine emanet (K-R1).
- Koli taşırken çekilemez ("Elin dolu.").
- Hiçbir atış ödül, puan, para üretmez. Döküm'e yalnız "Silah: 6 atış." türü satır girer.

### 5.2 Ne zaman serbest eylem, ne zaman büyük seçim
| Hedef | Doğrultma | Ateş |
|---|---|---|
| Nesne (lamba, cam, kapı, kasa) | serbest | serbest; alarm tablosu |
| Figüran (adsız) | serbest; figüran donar, geri geri gider | serbest; **pencere yok**; figüran çöker (kan/yara yok, ekran 1 sn desatüre); +2 alarm; çevre kaçışır |
| Yarı-derin NPC (Yadigâr, Zeynel, Esvet, Muzaffer, Hacı Vehbi, Kıymet, bej montlu adam, nöbetçi eczacı, Münire) | serbest; NPC susar, içeriği o evrende kapanır ("Yaklaşma.") | serbest; pencere yok; +3 alarm; NPC'nin yolu kalıcı kapanır |
| **Derin NPC** (Hurşit, restoran görevlisi, Garip) | ≥ 2 sn → **büyük seçim** (B5 / B33 / B35) | yalnız kart yoluyla |
| Çocuk (Boncuk) | silah görünürse Boncuk kaçar, B12 açılmaz | **imkânsız**: nişan kilitlenmez (tasarım kuralı) |
| Bekçi | serbest; bekçi durur, avuçlarını açar: "Ben bir şey yapmayacağım." | serbest; **A→5 anında**; S7 sekansı başlar |
| Kendisi | 2 sn basılı → **B2′** kartı (Çevir / Cebine koy, 90 sn) | A seçilirse yeni pencere → **S3 Sessiz Oda** |

### 5.3 Alarm 0–5 (mahalle; polis/yıldız yerine)
| A | Ad | Tetik örnekleri | Sokak | Bekçi | İçerik etkisi |
|---|---|---|---|---|---|
| 0 | Sakin | — | 8–14 figüran; lambalar yolunu açar | yok | hepsi açık |
| 1 | Fısıltı | cam/lamba kırma, kepenk, korna | figüranlar sesini kısar, bir adım çekilir | yok | — |
| 2 | Kepenk | silah görüldü, figüran itildi, 3 lamba | çocuk/yaşlı figüran çekilir; kepenkler yarım | uzaktan düdük (yönsüz) | Boncuk (B12) çıkmaz |
| 3 | Boşluk | figürana ateş, havaya 3 atış | figüran 2–3; kepenkler iner | **bekçi sokağa çıkar**, yürür, tek satır: "Eve git." | Yadigâr, Muzaffer, form, Hacı Vehbi çıkmaz; restoran kapısı: "Bu akşam yetmedi." |
| 4 | Çağrı | derin/yarı-derin NPC'ye ateş, **Hurşit'e ateş (B5-B)**, B26-B | sokak boş; uzak siren **bir kez**; **180 sn gerçek sayaç** başlar (Yamaç/Uçurum/Bariyer/sTressT'te durur) | düdük, takip (koşmaz) | yalnız Garip ve kenar yolları açık |
| 5 | Kapanma | sayaç doldu, bekçiye ateş, B33-B | ambiyans soyulur; yalnız çeşme | — | **S7 Şiddetin Dönüşü** (mahalle bölgesinde) |

Gevşeme: A1–A3 olaysız **180 gerçek sn**'de bir kademe iner; A4–A5 kilitlidir. Kaynaklar (`events/alarm.json`): cam +1 · 3 lamba +1 · havaya 3 atış +1 · kepenk 3 vuruş +1 · korna spam +1 · figürana ateş +2 · yarı-derin NPC'ye ateş +3 · derin NPC'ye ateş +3 (B5-B dahil) · Hacı Vehbi zili +1 (180 sn geçici) · B17-A +1 · B12-A +1 · B26-A +1 / B26-B +2 · figürana araçla çarpma +2. **Koli sayacının dolması (Hurşit'in evinde tanıksız ölümü) alarm kaynağı değildir** (`boxTimerExpired` etkisi 0; yalnız Kıymet'in perdesi o gece hiç kapanmaz) — silahsız bir oyuncu koliyle gezdi diye kuşatmaya düşmez. A5'e silahsız ulaşılabilir (ör. cam ×3 + kepenk ×2, araçla iki figüran +4 + B26-B); S7 bunun için iki koşul varyantı taşır (§7).

### 5.4 Bekçi (B24'ün yerine sistem)
A3'te belirir; yürür, koşmaz; Ferman'a 6 m'de durur; iki satırı vardır: "Eve git." ve "Ses sana mı ait?" (cevap beklemez). A4'te düdük çalar ve 20 m geriden takip eder. Silah doğrultulursa durur, avuçlarını açar; ateş edilirse A→5. Ferman'a hiç dokunmaz, yolunu kesmez. S7'de "Tanık" o değildir (tanık her zaman silahsız bir yetişkindir; çocuk/yaşlı/hayvan tanık olmaz).

---

## 6. EKONOMİ

### 6.1 Sabitler
- Başlangıç **140₺** (cüzdanda; HUD yok, cüzdan açılınca sayılır).
- Menü (Sıdkı masaya bırakır; yemek adı yoktur): **Çorba 20 · Ana yemek 60 · Tatlı 25 · Şarap (kadeh) 40 → toplam 145₺.** "Kapanış ikramdır." kartın tek yazılı satırıdır.
- **Ritüel eşiği:** Kapanış tepsisi yalnız **ana yemek (60₺) sipariş edilip hesap ödendiyse** gelir; Bay Edhem: "Kapanış, yemeğin ardından gelir." (Çorba tek başına yemek değildir.)
- Kapıda: **< 20₺** ise kart olsa da "Bu akşam masa yok, efendim." (kart iade; restoran mühürlenir). **20–59₺:** oturulur, çorba/tatlı/şarap alınır, Kapanış sunulmaz, B31 ve B33 yine mümkündür. **≥ 60₺:** tam yol.
- Para yoksa bulaşık, mutfak, veresiye **yok** (kullanıcı kararı). Müdahale bedeli yok: B31-A'nın bedeli Kapanış'ın sunulmamasıdır.
- Küçük harcamalar: kahveci çay 5₺ (K-M3) · bahşiş 10₺ (K-R5; bakiye < 10 ise kart çıkmaz). Başka satın alma yok.
- Yadigâr: **Birazını ver = 20₺** (₺ ≤ 30 ise 10₺) · **Hepsini ver = tamamı → 0₺.** Düğme her iki yolda da verilir; K-M1'de "Geç" seçilirse düğme yok.
- Cüzdan (B11): **+85₺** yalnız "Al" yolunda. Sıdkı'ya götürülürse 0 değişim.
- sTressT CR'ı ₺'ye dönüşmez; hiçbir dükkân CR almaz.

### 6.2 Tutarlılık tablosu (başlangıç 140₺)
| Yol | Bakiye | Restoranda mümkün olan en büyük sipariş | Kapanış |
|---|---|---|---|
| Hiçbir şey | 140 | Çorba + Ana + Şarap = 120 (tam menü 145 alınamaz) | evet |
| Yadigâr "biraz" | 120 | Çorba + Ana + Şarap = 120 | evet |
| Yadigâr "biraz" + çay | 115 | Çorba + Ana + Tatlı = 105 | evet |
| Cüzdan "al" | 225 | Tam menü 145 (+ bahşiş 10) | evet |
| Cüzdan "al", sonra Yadigâr "hepsi" | 0 | kapıda ret | hayır |
| Yadigâr "hepsi" | 0 | kapıda ret | hayır |
| Yadigâr "hepsi", sonra cüzdan "al" | 85 | Ana + Tatlı = 85 | evet |
| Yalnız çay içti, cüzdanı götürdü | 135 | Çorba + Ana + Şarap = 120 | evet |
| Çay + Yadigâr "biraz" + bahşiş | 105 (yemek sonrası) | Ana + Tatlı = 85, kalan 20 ≥ bahşiş 10 | evet |

Kontrol: hiçbir yol negatif bakiye üretmez; 145₺ tam menü yalnız cüzdan yoluyla açılır (bu, B11-B'nin tek "ödülü"dür ve Sıdkı'nın dalgınlığıyla bedeli vardır). Son Sürüş sahnesinde koltuktaki cüzdan içeriği o anki bakiyeyi gösterir (140 / 120 / 0 / 225). Bu 9 satır `economy.test.ts` olarak Faz 4'te vitest'e girer.

---

## 7. SONLAR (7)

Ortak kurallar: yöntem, araç kullanımı, beden, kan, acı sesi **yok**; müzik yok (yalnız ambiyans ve nesne sesi); veda yok; kahraman/kötü adam yok; çevre yarım tepki verir; kendi seçimli sonlarda "geç kalan yardım" imgesi yasak; her son **DÖKÜM** ekranı ve sabit **Destek** şeridiyle kapanır. Zar yalnız sunum varyantını seçer, ikinci bir canlı son üretmez.

| S | Ad | Tetik | Sahneleme (3–5 cümle, non-grafik) |
|---|---|---|---|
| **S1** | **Bir Bardak Daha** (tek hayatta kalış) | B36-A | Garip bardağı uzatır; buhar Ferman'ın ellerinin titrediğini söyler. "Dikkat, sıcak." "Şeker?" "…Bir." Kaşık bardağa değer: sahnenin en yüksek sesi. Aşağıda mahallenin ışıkları yanıyor, hiçbiri bir şey ifade etmiyor; gök en açık hâlinde, yıldızlar yine kıpırdamıyor. Silah cepteyse oyun hiçbir şey demez; Ferman serbest eylemle taşın dibine koyabilir, Garip bakmaz. Son kare: iki bardak, buhar, bank; termos kapağı açık, bardaklardan birinin buharı sürer (yazı yok; DÖKÜM'ün "Gece: sürüyor." satırı aynı işi görür). |
| **S2** | **İlk Sabah** | B2-A | Oda. Buzdolabı uğultusu, duvarın ardında yan evin radyosu, kapının altından koridor ışığı. Kompresör susar; radyo susmaz. Kapının altından bir gölge geçer, durmaz; dışarıda bir motor yaklaşıp uzaklaşır. Son kare: kapı altındaki ışık şeridi; radyo "…yarın hava…" cümlesinde kesilir. (Sabah gelmez; ad budur.) |
| **S3** | **Sessiz Oda** | B2′-A (silahı sonradan kendine; her yerde) | Bulunduğu yer bir odaya döner: sesler katman katman soyulur, yalnız en yakın nesnenin sesi kalır (çeşme, çakıl, bir radyo). Ambiyans 6 sn sonra onsuz geri gelir: figüranlar yürür, lamba vızıldar. Kamera yere iner; son kare o yerin gündelik bir nesnesi (bardak, kasa, ayakkabı). Mekân kipleri: ev, bahçe, Meydan, çarşı, pazar, patika, araba içi. |
| **S4** | **Son Akşam Yemeği** | B30-B | Kamera masa yüksekliğinde: örtünün kemik beyazı, gölgesiz ışık, Ferman'ın elleri. Kalp atışı müziğin eksik vuruşunun yerine geçer: bir, iki; sonra bir tık geç; sonra yalnız müzik, üç vuruş, kimseyi beklemeden. Sıdkı peçeteyle saygılı bir uzaklıkta durur; Bay Edhem defterine küçük bir işaret koyar, kalem tık eder. Masa 2'deki yaşlı adam boş sandalyelere "İyi geceler" der; biri tuzluk ister. Son kare: tepside iki şişe, biri boş. |
| **S5** | **Son Sürüş** | B34-B | Kamera araçtan çıkmaz: direksiyon, ayak, aralık kapı. Zar üç sunumdan birini seçer: (1) Ani — motor yükselir, çakıl tekdüze bir yağmur gibi, sonra sessiz bir gri; radyonun tam o saniyede sustuğu duyulur. (2) Gecikmeli — ses kapıdan geçer; yedi saniye yalnız rüzgâr; sekizinci saniyede çok uzaktan kısa bir metal sesi, kuşlar bir kez kalkar. (3) Garip'in tarafından — bankta Garip bardağı yere koymadan başını kapı yönüne çevirir; termos kapağı açık; tek cümlesi yoktur. Son kare: aralık kapı, ufuk çizgisi yerinde. |
| **S6** | **Uçurum** | B36-B (ya da Garip'siz Yamaç'ta kenar) | Ferman çimlerde yürür; Garip bankta, arkası dönük: "Bardak burada kalır." Zar üç sunumdan birini seçer: (1) Garip'in elleri bardakta; adımlar birer birer, yedi, sekiz, dokuz; bir adım eksik; rüzgâr; kuş sürüsü bir kez kalkar. (2) Bankta iki bardak; birinin buharı ince bir çizgi; çizgi kesilir. (3) Garip bir kez seslenir — ad söylendiyse "FERMAN!", oyunun yükselen tek sesi; yamaç geri verir; sonra hiçbir şey. Garip'siz varyantta boş bir bank ve iki soğuk bardak. Son kare: bank, bardak. |
| **S7** | **Şiddetin Dönüşü** | A→5 (mahalle bölgesinde) | "Sokak Sonu": ambiyans 12 sn'de soyulur, yalnız çeşme. Sokağın ucundan silahsız bir yetişkin yürüyerek gelir, 14 adım ötede durur; ilk cümlesi gece boyu söylediği kendi gündelik satırıdır ("Simit alacaktım."). Elindeki poşeti yere bırakır, avuçlarını açar: "Ben bir şey yapmayacağım." Sokağın ötesinde yan yana iki far; hoparlör 8 sn arayla iki kez — **`hasGun` varyantı:** "Silahı yere bırakın."; **silahsız varyant:** araçla gelindiyse "Araçtan uzaklaşın.", yoksa "Ellerinizi görelim." (silah sesi karışımı yok). Sokak lambaları aynı anda yanar (röle tıkı; 1 sn'de ≤ 3 parlaklık geçişi); lambaya karışık, yönsüz tek bir ses. Son kare: bordürün dibinde yan yatmış bir elma; çeşme akar. `endings.json` S7 `variants: 2, variantBy: "hasGun"` (koşul varyantı, zar değil); her iki varyant ≥ 6 DÖKÜM satırı. Son 60 sn'de silahın elde/yerde/doğrultulmuş olması yalnız ses karışımını ve kamerayı değiştirir, sonucu değil. |

### 7.2 DÖKÜM ekranı (özet; kısa, yargısız, TR/EN)
- Başlık: **DÖKÜM / INVENTORY**. Ferman'ı yalnız eşyalar taşıdığı için özet bir **nesne listesi**dir; sıfat, yargı, puan, yüzde yok.
- 6–9 satır, kronolojik, "Nesne: durum." biçimi. Örnek: "Çekmece: 3 cm aralık." · "Koli: teslim edildi." · "Kart: cepte." · "Para: 85₺." · "Lamba: 4 söndü." · "Form: imzalı. Tarih: bugün." · "Silah: taşın dibinde." · "Bardak: dolu."
- Boş değer "—"; "yok/bilinmiyor" yazılmaz.
- Son satır her sonda aynı tipografi: S1'de **"Gece: sürüyor."**, diğerlerinde **"Gece: —."**
- Düğmeler: **Destek** (her zaman, hiç gizlenmez) · **Bu pencereyi kapat** (ebeveyn seçim ekranında uyanır) · **Baştan**. S1'de "Bu pencereyi kapat" yerine "Gece sürüyor" ve jenerik.
- Daktilo dizimi 18 karakter/sn, her satırda damga sesi; "Hızlandır" tuşu var, Destek satırı atlanmaz.
- İngilizce: aynı satır sayısı, aynı düzen; çeviri her satırda ayrı anahtar (`locales/en.json`).

### 7.3 Destek bağlantısı
- Yerler: her son ekranı altı (sabit şerit), ana menü (düğme ağırlığında), içerik uyarısı, "Şimdi değil" ekranı, B2/B2′ ve B29/B30 kartlarının köşesi (sönük), ayarlar altı, jenerik son karesi.
- Şerit metni (TR): **"Destek — yalnız olmak zorunda değilsin."** (EN: "Support — you don't have to be alone.") Ünlem, vaat, öğüt yok.
- Tıklanınca açılan sayfa: numara kodda saklanmaz; `support.json` bölgeye göre güncel kaynağın adresini tutar; erişilemezse yerel yedek metin: "Bulunduğun yerin acil yardım numarasını ara. Bu oyun bir tedavi ya da yardım değildir."
- Yeni sekmede açılır; pencere/evren mantığına dahil değildir; hiçbir kartın süresini durdurmaz. Kart açıkken Esc'in davranışı **açık karardır** (Çayan): öneri "Esc yalnız Ayarlar katmanını açar, `decisionClock` durmaz" (KANON "her seçimin süresi var"); aksi karar "Esc kartı duraklatır" olarak FAZLAR R-08'e yazılır.

---

## 8. KAPSAM UYARILARI

### 8.1 Süre hedefleri
- Tek oynayış: **60–90 dk** (Y1→Y2→Y3→Y4 ya da Y6→Y8→son).
- Tüm içerik (7 son, 26 büyük seçimin iki yüzü, 4 koridor, sTressT 30 dk): **4–6 saat**.
- En uzun tek sahne: Dünya Kenarı sekansı 28 sn + tünel 17 sn; en uzun diyalog: Hurşit sohbeti ≤ 6 dk.
- Pencere derinliği tavanı: **4** (TEKNIK §4.4; F0'da ölçülür). Donmuş ebeveyn sahnesini boşaltır: dondurulmuş sekme JS heap ≤ 80 MB; derinlik 4'te toplam ≤ 250 + 4 × 80 = 570 MB.
- Tek oynayış ve toplam içerik süreleri `walk.test`'te her kartın `est: {minS, maxS}` alanı + bölgeler arası yürüme süreleri (m / 3,4 m/s) × dolaşma katsayısı 1,6 ile hesaplanır; F3'ten itibaren rapor "tahmin / Çayan'ın gerçek süresi" sütunu taşır, sapma > %25 ise `est` güncellenir.

### 8.2 Kesme sırası (gerekirse, yukarıdan aşağıya)
1. Koridor K3 ve K4 (B25 iki koridora iner; mekanik aynı).
2. S5 ve S6 sunum varyantları 3 → 1 (zar yalnız kuyruk süresini seçer).
3. B28 tünel döngüsü 3 → 1 (ilk girişte mühür).
4. Postal etkileşimleri 12 → 6 (kalır: tekme, fırlat, korna, lambayı vur, havaya ateş, konteyner).
5. SOMA ipuçları 12 → 8 (kalır: saatler, radyo, durak, 13 yok, gök, kuş, afiş, çamaşır).
6. VAT figüran → basit SkinnedMesh kalıcı (F13'te karar).
7. Blender lightmap → vertex AO + lamba maskesi vertex renginde (F4 B planı).
8. B18 Hacı Vehbi → küçük seçim (zil yalnız ambiyans; alarm etkisi kalır).
9. B14 Muzaffer → serbest sahne (sedirde adam, kart yok; eczacıyı çağırmak serbest eylem).
10. B12 Boncuk tamamen kesilir (Boncuk yalnız pazarda limon torbasıyla görülen figüran olur).
11. B11 cüzdan → serbest eylem (+85₺ almak/almamak kartsız; Sıdkı yankısı kalır).
12. sTressT entegrasyonu yayın sonrasına (kapı yerinde, "Kapalı" kâğıdı) — **en son kesilen yol**: kullanıcının kendi oyunu ve açık isteği.
Kesilmez: 7 son, Y1/Y2/Y8 omurgası, TR+EN, Destek, pencere sistemi, alarm 0–5, ekonomi tablosu, içerik uyarısı, Lisanslar, hata ekranı. Kesme 1–7 uygulanırsa büyük seçim sayısı 26'da kalır; 8–11 uygulanırsa 22'ye iner ve hedef aralığın (24–28) altına düşer — bu yüzden 8–11 yalnız F4/F9/F13 performans kapısı iki düzeltme turunda geçilemezse açılır. FAZLAR §17 bu sıranın birebir kopyasıdır.

### 8.3 Güvenlik denetimi (bu belge için)
- Yöntem, doz, ürün adı, öğretici ayrıntı yok; şişeler "Servis" ve "öteki" adlı kurmaca nesnelerdir; etkileri yalnız algı tasviridir.
- Ölüm hiçbir yerde huzur, çözüm, ceza ya da fayda olarak çerçevelenmez; S1 bir "kurtuluş" değil, bir bardak çaydır.
- NPC'ler yargılamaz, teşhis koymaz, vaaz vermez; Garip'in tek istisnası "sebep" kelimesini **ret** olarak bir kez kullanmasıdır.
- Kendine doğrultma 2 sn "nefes" sürtünmesiyle gelir; engel değil, duraklamadır; Destek bağlantısı o kartta görünürdür.
- Bekçi, çocuk, yaşlı, hayvan hiçbir sonda "tanık" ya da duygusal araç olarak kullanılmaz; Boncuk'a nişan kilitlenmez.
- Yasaklı kelime listesi (`support.json` → `bannedTerms`) F1'den itibaren tüm `locales/*.json`, `endings.json`, iç ses (`ferman.json`) ve tabela (`signs[]`) anahtarlarında vitest ile taranır; liste bu belgede yazılmaz. İç seste ayrıca "neden / sebep / intihar / bugün o gün" yasaktır.
- UI'da "sınır / hata / yükleniyor / limit / error / loading" yasağı yalnız `content.*` ve `subtitle.*` ad alanları içindir; hata ekranı (`error.*`), ilerleme (`boot.*`) ve uygulama metinleri (`app.*`) muaftır — oyuncu hiçbir zaman açıklamasız siyah ekranda bırakılmaz.
- Sekme başlığı seçim kimliği sızdırmaz: kök "DİLEMMA", çocuk "DİLEMMA — Olasılık n" (EN "Possibility n"); `i18n.test` başlık şablonunda `B\d+` desenini yasaklar.
- Fotosensitivite: varsayılan içerikte hiçbir sahne 1 sn'de 3'ten çok tam ekran parlaklık geçişi yapmaz (B28 floresan, S7 röle anı, namlu parlaması; `tools/bench/flash.mjs`); "flaş azalt" ayarı ayrıca vardır.
