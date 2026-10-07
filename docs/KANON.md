# DİLEMMA — KANON (nihai, kompakt); v4

Bu dosya sonraki fazlarda Claude'un **tek referansı**dır. KANON v3+ICERIK v2.1'in nihai listeleri+eleştirmen düzeltmeleri burada birleşmiştir. Çelişkide öncelik: **bu dosya > docs/ICERIK.md > docs/TEKNIK.md > docs/FAZLAR.md > eski ciltler** (eski ciltler yalnız arka plan; isim, geçmiş, saat, gündüz, bariyer eşiği konularında eskidir). "Son Gün" yalnız eski çalışma adıdır; UI, `package.json`, itch sayfası ve tüm dokümanlarda ad **DİLEMMA**'dır (kod tanımlayıcıları ASCII `dilemma`).

## 1. Oyun

- Tür: birinci şahıs, küçük-orta açık dünya, masaüstü web tarayıcısı (telefon desteği yok; klavye+fare şart). Ton: **SOMA+Postal (+ BioShock)**. Tek cümle: "Hiç sabah olmayan bir mahallede, ölmeye karar vermiş bir adamın angarya gecesi."
- Protagonist **Ferman**. Geçmişi yok: neden öleceği hiçbir yerde söylenmez; kardeş, dosya, meslek, abla, telefon yok. Onu yalnız eşyalar ve kuru, az **iç ses** taşır (§8).
- **Hep gece.** Gündüz, saat, dünya saati yok. Yalnız gerçek zamanlı gizli sayaçlar (koli 180 sn, alarm A4 180 sn, gevşeme 180 sn) ve seçim süreleri. Gök: Samanyolu, nebulalar, 9.110 yıldız; mahalle ışığından uzaklaştıkça ve karanlıkta beklendikçe açılır; **yıldızlar kaymaz** (gök dönmez; "gök yaşar"=pozlama uyumu+meteor+ışık kirliliği+nebula belirmesi).
- Dil: TR+EN (tüm metin, UI, altyazı, dünya içi yazıların çevirisi). Sesli oyunculuk yok: altyazı+ses tasarımı.
- İkilemler **dolaylı**: doğrudan soru, mesaj, ders, karma, skor yok. Tramvay problemi adıyla sorulmaz; duruma gömülür (yük vagonu+makas kolu; sayı söylenmez, ölüm gösterilmez). Seçenek metinleri yalnız eylem fiili.

## 2. Seçim sistemi

- Her seçim **tam 2 seçenek**. **Büyük seçim**=tarayıcıda gerçek yeni sekme/pencere (paralel evren): seçilen yol yeni pencerede seçimden hemen sonrasından sürer; ebeveyn seçim anında donar; çocuk kapanınca ebeveyn seçim ekranından uyanır; çocuk ebeveyni etkilemez. Popup engellenirse ya da oyun iframe içindeyse (itch) **aynı sekmede dal emülatörü** (birinci sınıf yol, her fazda test edilir).
- Büyük seçimler **sinematik ara sahne** içinde belirir (kamera devralır, dünya 0,25×, süre çubuğu); sahne seçime göre sürer.
- **Süreler:** refleks 20 sn; normal 45 sn; araç 60 sn; ağır 90 sn (B2, B29, B30, B36); küçük 30 sn. Süre dolunca büyük seçimde **seed'li zar** (`hashSeed(rootSeed, universeId, choiceId)`; yeniden yüklemeyle değişmez); küçük seçimde Ferman'ın önceden yazılı kendi cevabı (`onTimeout.pick`). Sekme arka plandayken, ebeveyn donmuşken ve menüdeyken süre durur; **seçenek ekranında pointer lock bırakılmış olması süreyi durdurmaz**.
- Zar sonucu 2 sn gösterilir; **"Devam"** tıklaması pencereyi açar (tarayıcı kısıtı; `window.open` yalnız tıklamanın senkron gövdesinde).
- **Kilit kuralı:** çocuk evren kendi ilk büyük seçimini çözünce ebeveyndeki o seçenek kilitlenir ("Bu yol yaşandı"); çözmeden kapanırsa kilit yok. **Derinlik≤4**; 4. derinlikteki büyük seçim emülatöre düşer.
- **Küçük seçim** pencere açmaz: ne içeceği, ne söyleyeceği, para verip vermemenin ilk adımı, K-K1 "Kaç/Kal" dahil.
- **Yetim ebeveyn:** tarayıcı donmuş sekmeyi atıp yeniden yüklerse sayfa donmuş durumunu görür, çocuğun kaydını okur ve seçim ekranından uyanır; oyuncu hiçbir şey kaybetmez.

## 3. Dünya

- Yer evleri mahallesi (apartman yok). Bölgeler (10): Ferman'ın evi; Hurşit Amca'nın evi (yan ev); Mahalle Caddesi; Atölye Sokağı (sTressT kapısı); Meydan (çeşme, durak, nöbetçi eczane, kahveci); Eski Çarşı (Son Akşam Yemeği, kapalı sinema, çarşı hattı+makas); Okul Yolu & Gece Pazarı (fren koridorları); Yamaç (patika, bank, Garip); Uçurum (kenar, servis yolu kapısı) — **kuzeybatı**; Yasak Çevre Yolu/Dünya Kenarı ("GİRİLMEZ" bariyeri) — **doğu ucu**. Bariyer ile tepe ayrı yerler; **fren kopması ≠ bariyer**.
- Araba evin önünde; anahtar mutfaktaki kasede (ikinci anahtar "H. — yan ev"); arcade-gerçekçi sürüş (0→100 km/s 6 s, azami 120, geri 25).
- Mini alanlar yalnız iki: **sTressT** (tek mini oyun; Çayan'ın ayrı projesiyle birebir; iframe'de çalışır; CR ≠ ₺) ve **Son Akşam Yemeği** (restoran; oyuncu müşteri; davet kartı şart; para yoksa yemek de ritüel de yok). Başka mini alan/sistem yok.
- **Mahalle alarmı A0–A5** (polis/yıldız yerine): tanıklar, kepenkler, siren, gece bekçisi (§7).
- Işık kirliliği (0–1): Meydan 0,9; Cadde 0,8; Çarşı 0,75; Okul Yolu 0,6; Ev 0,55; Atölye 0,5; Yamaç 0,25; Dünya Kenarı 0,15; Uçurum 0,1.
- **Kuş kuralı:** mahallede kuş yok (yalnız yarasalar ve gecede bir kez yarıda kesilen horoz); kuş yalnız Yamaç ve Uçurum'da; ilk kuş sesi patikada duyulur.

## 4. Kadro (isimler kesin)

Ferman (oyuncu); Hurşit Amca (yan komşu; karısı Şayeste öldü; kedisi Paşa); Garip (Yamaç'ta bankta oturan çaycı; Don Ritchie esinli); Yadigâr (evsiz terzi; hiçbir şey istemez, düğme verir); Zeynel (gece kuryesi); Bay Edhem (maître; "Davetiyeniz?"); Sıdkı (garson; Meydan'da cüzdanını arar); Boncuk (kayıp çocuk); Muzaffer Bey (sedirde acı çeken yabancı); Esvet (koliyi isteyen bağımlı); Hacı Vehbi (yanlış alarmcı); Münire Hanım (restoranda yanlış şişe); Kıymet Hanım (komşu kadın; perde; tanık); gece bekçisi (adsız; sistem); nöbetçi eczacı, bej montlu adam, esnaf başı (adsız yarı-derin). NPC'ler sormaz, yargılamaz, teşhis koymaz, vaaz vermez; Garip'in hiçbir satırı soru işaretiyle bitmez ("Şeker kaç?" tek istisna).

Hedef sınıfları (silah): nesne (serbest); figüran (ateş serbest, pencere yok, +2); yarı-derin NPC (doğrultma içeriği kapatır "Yaklaşma.", ateş +3, pencere yok); **derin NPC** (Hurşit, Bay Edhem/Sıdkı, Garip:≥2 sn doğrultma→büyük seçim B5/B33/B35; ateş yalnız kart yoluyla); çocuk (Boncuk'a nişan kilitlenmez; silah görünürse kaçar); bekçi (ateş→A5); kendisi (2 sn basılı→B2′).

## 5. Büyük seçimler — nihai liste (26)

KANON v3 numaraları korunur; boşluklar kesilenlerdir (B13, B16, B20–B23, B32 kesildi; B8→K-H2, B6→K-K1 küçük; B24 bekçi sistemi). Her kart `content/choices/B<n>.json`; ara sahne süresi saniye.

| ID | Ad | A/B | Süre | Yer | Ön koşul | A sonucu/B sonucu |
|---|---|---|---|---|---|---|
| B1 | Çekmece | Al/Bırak | 45 | Ferman'ın evi | — | `hasGun`; B2 2,5 sn sonra/silah yolları bu evrende kapanır, çekmece 3 cm aralık kalır |
| B2 | Elde | Çevir/Cebine koy | 90 | aynı yer | B1-A | **S2** İlk Sabah/gövde; B2′ her yerde 2 sn basılı kendine doğrultmayla aynı kart |
| B3 | Kapı Önündeki Koli | Al/Bırak | 45 | kapı önü | ev kapısı açıldı | 180 sn gizli sayaç; B4, B19/Zeynel 90 sn sonra teslim eder; Hurşit'in zili doğrudan B9'u açar |
| B4 | Yan Evin Kapısı | Çal/Eşiğe bırak | 45 | Hurşit'in kapısı | koli elde, sayaç < 180 | kapı açılır, boş ilaç kutusu, "Geç kaldı sandım.", sayaç durur; B9/10 m uzaklaşınca **veya** 40 sn sonra baston koliyi çeker, sayaç o anda durur |
| B5 | Namlu Eşikte | İndir/Ateş et | 45 | Hurşit'in eşiği | `hasGun`,≥2 sn | "Çay soğuyor.", perde o gece kapalı/Hurşit ölür, **A→4+180 sn**, K-K1, B7 açılır, B9 kapanır |
| B7 | Masadaki Kart | Al/Elini çek | 45 | Hurşit'in mutfağı | Hurşit ölü, kapı açık ya da yan ev anahtarı | restoran açılır, "Ihlamur."/restoran bu evrende kapanır |
| B9 | Açık Kapı | Gir/Git | 45 | Hurşit'in eşiği | `hursitHasBox && hursitAlive` (teslim eden fark etmez) | sohbet K-H1…K-H6, kart/"Çay bitti."; 180 sn sonra kapı önüne tabakla kapatılmış bardak |
| B10 | Açık El | Birazını ver/Hepsini ver | 45 | Meydan çeşmesi | K-M1 "Elini cebine at", ₺ > 0 | −20₺ (₺≤30 ise −10)/₺=0; düğme iki yolda da |
| B11 | Banktaki Cüzdan | Götür/Al | 45 | Meydan durağı | cüzdan açıldı | Sıdkı'ya 180 sn içinde, sonra Edhem'e; "Tam."/+85₺; Sıdkı dalgın, B31 kesin |
| B12 | Tutulan El | Elini tut/Elini bırak | 20 | Gece Pazarı | K-P1, adam geldi, A≤1, silah görünmüyor | adam gider, anons, A+1/Boncuk gider; gerçek hiç öğrenilmez, iki söylenti |
| B14 | Taş Sedir | Eczacıyı çağır/Yürü | 45 | Meydan eczane arkası | A≤2 | eczacı gelir, sedir boşalır/"Sağ ol." |
| B15 | Tezgâhtaki Form | İmzala/Kalemi bırak | 45 | nöbetçi eczane | eczaneye girildi, A≤2 | form cepte; Döküm "Form: imzalı. Tarih: bugün."/form tezgâhta |
| B17 | Makas Kolu | Kolu çek/Geri çekil | 20 | Eski Çarşı makası | A≤3, kola≤3 m | vagon yan hatta, A+1, Çiçek Pasajı kapalı/düz hat; ikisi K-Ç1 |
| B18 | İhbar Direği | Elini tut/Geri dur | 20 | Çarşı girişi | Vehbi kola uzandı, A≤2 | Vehbi kaideye oturur/zil, bekçi yürür, A+1 180 sn geçici |
| B19 | Kolinin Yanındaki El | Paketi uzat/Yürü | 45 | Cadde duvar dibi | koli elde, sayaç akıyor, Hurşit'e gidilmedi | Esvet gider; 180. sn radyo susar, 270. sn kapı önü izi/Esvet kalır |
| B25 | Fren Yok | Düz tut/Direksiyonu kır | 60 | Okul Yolu & Pazar, 4 koridor | araçta, hız > 80≥1,5 sn, çizgi | hedef/engel+ikincil ses; ikisi araç devre dışı, S5 kapanır, B26 |
| B26 | Enkaz Başında | Kal/Yürü | 45 | kaza yeri | B25+25 sn | tanıklar, bekçi defter, A+1/A+2, çırak "yokuştan inen…", bekçi peşte |
| B27 | Titreyen Tabela | Gazı kökle/Frene bas | 60 | Çevre yolu, 120 m | araçta, hız > 80 | bariyer kırılır, 28 sn sekans, B28/durur; tekrar denenebilir; hız≤80: kart çıkmaz |
| B28 | Siyahın Önü | İleri sür/Geri dön | 60 | Dünya Kenarı | B27-A | tünel döngüsü, 3.'de mühür, evin önünde uyanış/U dönüşü; ikinci gelişte inşaat bariyeri |
| B29 | Kapanış Tepsisi | Tepsiyi çek/Kalk | 90 | restoran Masa 9 | ana yemek+hesap ödendi, B31-A yok, B33-B yok | "Servis" içilebilir→B30/kart iade, restoran mühürlenir |
| B30 | Öteki Şişe | Uzan/Otur | 90 | aynı masa | `ritualDrunk`+20 sn | üç engel→"Şimdi değil", sersem 240 sn/**S4** |
| B31 | Yan Masadaki Şişe | Kalk/Kal | 20 | restoran Masa 6 | oturuldu, ana yemek geldi | Münire şişeyi bırakır; Kapanış sunulmaz/Masa 6 kayar, temiz örtü, bej palto vestiyerde |
| B33 | Salonda Namlu | İndir/Ateş et | 45 | restoran | `hasGun`, emanet edilmedi,≥2 sn | "Emanet." fiş 313/salon boşalır, A→5, kapıda S7 |
| B34 | Aralık Kapı | Frene bas/Gaza bas | 60 | Uçurum servis yolu, 60 m | araçta | in; Garip 60 sn sonra/**S5** |
| B35 | Bankta Namlu | İndir/Ateş et | 45 | Yamaç bankı | `hasGun`,≥2 sn | "Teşekkür ederim."/Garip ölür, S1 kapanır, A+3, kenar serbest→S6 |
| B36 | İki Yön | Banka yürü/Kenara yürü | 90 | Yamaç bank ↔ kenar 25 m | Garip yaşıyor, cümle söylendi | **S1**/**S6**; çaydan kalkıp kenara 8 m→B36′ (en çok 2) |

**Kenar kuralı (Yamaç):** Garip yaşıyor ve cümle henüz söylenmemişken kenara 8 m yaklaşılırsa Garip kalkar, cümleyi erken söyler (K-G sohbeti atlanır, ad eki yok), 6 sn sessizlik→B36. Garip ölü/yoksa kenar serbest eylemdir→S6 Garip'siz. Görünmez duvar yok.

**Küçük seçimler (30 sn; `onTimeout.pick`):** Ev K-E1…K-E6 (perde, radyo, musluk, anahtar kasesi, ceket, ayna); Hurşit K-H1…K-H6 (çay/kahve, kusur, Paşa, kart, söz, Şayeste'nin fotoğrafı); K-K1 Kaç/Kal (B5-B sonrası; iki yol 6 sn sonra Kıymet'in perdesi önünde birleşir); Meydan K-M1…K-M4 (Yadigâr'a el, düğme, kahveci çayı 5₺, eczacı "Nöbet mi?"→"Hep."); K-P1 Boncuk; K-Ç1 esnaf başı; Araç K-A1…K-A3 (radyo, far, enkazda motor); Restoran K-R1…K-R6 (vestiyer, çorba, ana yemek, tatlı/şarap, bahşiş 10₺, "Şimdi değil" suyu); sTressT K-S1 eldivenler; Garip K-G1…K-G5 (ilk cevap, ad, **"Kahve var mı?/Çay olur"**→"Kahve yok. Çay var.", şeker, söz açma→"Duydum." "Şeker kaç?").

## 6. Yollar ve ekonomi

- Yollar: **Y1** Ev (B1, B2)→**Y2** Paket+Komşu (B3, B4, B5, B7, B9, B19)→**Y3** Mahalle (B10, B11, B12, B14, B15, B17, B18)→{**Y4** Araba (B25, B26)→**Y5** Bariyer (B27, B28); **Y6** Restoran (B29, B30, B31, B33); **Y7** sTressT; **Y8** Tepe (B34, B35, B36)}→**Y9** Sonlar. Örgü ilkesi: bir seçim seçilsin ya da seçilmesin ulaşılabilir içerik başka yoldan da açılır (B3-B→zil→B9; B7→restoran).
- Tek oynayış 45–100 dk (hedef ≈ 66); tüm içerik 4–6 saat (sTressT hariç sayılmaz).
- **Ekonomi:** başlangıç **140₺** (HUD yok; cüzdan açılınca sayılır). Menü: çorba 20; ana yemek 60; tatlı 25; şarap 40 (yemek adı yok; "Kapanış ikramdır."). **Ritüel eşiği:** ana yemek sipariş edilmiş ve hesap ödenmiş. Kapıda **< 20₺** ret+kart iade+mühür; **20–59₺** oturulur, Kapanış sunulmaz; **≥ 60₺** tam yol. Yadigâr biraz=−20 (₺≤30 ise −10), hepsi=0. Cüzdan "Al"=+85. Çay 5, bahşiş 10 (bakiye < 10 ise kart yok). Bulaşık, veresiye, mutfak yok. CR ₺'ye dönüşmez. 9 satırlık tutarlılık tablosu (ICERIK §6.2) `economy.test`'tedir; hiçbir yol negatif üretmez.
- Paket sayacı: 180 sn gerçek zaman; kart açıkken 0,25×; ebeveyn donunca/sekme gizliyken durur; teslimde (ya da baston çekince) kalıcı durur; sTressT içinde akmaya devam eder. Sayacın gerekçesi oyuncuya dolaylı kurulur: Zeynel "Yan kapıymış. Üstünde acil yazıyor."; "Şikâyet için numara arkada."; B4-A'da Hurşit'in elinde boş ilaç kutusu; buzdolabı notu **"İlaç — son kutu"**; dolunca radyo yarım cümlede susar (40 m içinde duyulur), 90 sn sonra kapı önünde iz (kapı aralık, Kıymet tencere bırakır, Paşa miyavlar, zil kapağı bantlı). **Sayaç dolması alarmı etkilemez** (A4 yalnız B5-B'den).

## 7. Alarm A0–A5

| A | Ad | Tetik | Sokak/bekçi | İçerik etkisi |
|---|---|---|---|---|
| 0 | Sakin | — | 8–14 figüran | hepsi açık |
| 1 | Fısıltı | cam, lamba ×3, kepenk ×3, korna ×5/10 sn | figüranlar sesini kısar | — |
| 2 | Kepenk | silah görüldü, figüran itildi | çocuk/yaşlı çekilir; uzak düdük | B12 çıkmaz |
| 3 | Boşluk | figürana ateş, havaya 3 atış | 2–3 figüran; **bekçi** çıkar, "Eve git." | Yadigâr, Muzaffer, form, Vehbi çıkmaz; restoran "Bu akşam yetmedi." |
| 4 | Çağrı | **B5-B**, yarı-derin/derin NPC'ye ateş, B26-B | sokak boş; tek siren; **180 sn sayaç** (Yamaç/Uçurum/Bariyer/sTressT'te durur); düdük+takip | yalnız Garip ve kenar yolları açık |
| 5 | Kapanma | sayaç doldu, bekçiye ateş, B33-B | ambiyans soyulur; yalnız çeşme | **S7** (mahalle bölgesinde) |

Kaynaklar: cam +1; 3 lamba +1; havaya 3 atış +1; kepenk 3 vuruş +1; korna spam +1; figürana ateş +2; figürana araçla çarpma +2; yarı-derin NPC'ye ateş +3; derin NPC'ye ateş +3; Vehbi zili +1 (geçici); B17-A +1; B12-A +1; B26-A +1/B26-B +2. Gevşeme: A1–A3 olaysız 180 sn'de bir kademe iner; A4–A5 kilitli. Bekçi: A3'te belirir, yürür, 6 m'de durur, iki satır; A4'te düdük+20 m takip; dokunmaz, yolu kesmez; silah doğrultulursa avuç açar; ateş→A5. S7 tanığı her zaman silahsız bir yetişkindir (çocuk, yaşlı, hayvan, bekçi tanık olmaz).

## 8. İç ses, SOMA, Postal

- **İç ses** (`content/dialogues/ferman.json`, `narration/InnerVoice.ts`): nesne/mekân tetikli,≤5 kelime, kuru;≥20 sn aralık; büyük seçimden sonra 30 sn susar; tek oynayışta≤2 satır/dk. Toplam **42 satır** (F1 6; F2 3; F3 3; F4 8; F5 4; F6 3; F7 3; F8 4; F9 4; F11 4). Örnek: "Titriyor."; "Aynı kadın."; "İki anahtar."; "Boşmuş."; "Ihlamur." Yasak: neden, sebep, intihar, "bugün o gün" ve `bannedTerms`.
- **SOMA ipuçları (12)**: duran saatler; tek istasyonlu radyo ("…sabah…" kesilir; "yarın" hiç gelmez); durak "İLK SEFER: —"; buzdolabı notu "İlaç — son kutu"; sinema afişi "SABAH — Gösterim: yakında"; kurumayan çamaşırlar; fırın "EKMEK DÜN GECEDEN"; çevrilmemiş takvim/takvim çivisi; 13 yok (kapı 11-12-14, panel 9–14, Masa 13 yok); kaymayan yıldızlar; mahallede kuş yok; pazar sabah için kurulu, "Sabah açarız". **Dünya içi yazılar** (≈ 14) `zones/*.json` `signs[] {id, textKey, mesh}` ile iki dilde tanımlıdır; EN'de nişangâh≥0,7 sn tabelada kalınca altyazı şeridinde çeviri çıkar (TR'de hiç çıkmaz).
- **Tekinsizlik (8)**: Kıymet'in perdesi en yakın evde; karşı kaldırımdaki figür (Okul Yolu); pasajda geç adım yankısı; önde lamba yanar arkada söner; Paşa hep orada; gezen radyo; yönsüz düdük; rezervasyon defterinde 9 önceden yazılı.
- **Postal (12; hiçbiri kart açmaz, ₺/CR vermez)**: tekme; fırlat; korna; lambayı vur (gök açılır); kasaları devir; çeşmeye kafanı sok; konteynere gir (tanık 0); sandalye taşı ve otur (60 sn karanlık→gök); havaya ateş; kendi arabana vur; afişi yırt; vagonu it. Kara mizah satırları kuru ve kısa: Zeynel'in iki satırı, eczacı "Hep.", kahveci "Kaşık yok. Parmağınla.", Sıdkı "Tam.", Garip "Motoru kapat, kuşlar kalkıyor."
- **Evrenin kodları (B28):** siyah hacmin yüzeyinde araç durunca monospace 6 satır canlı döküm — `evren: u-…`; `üst evren: u-… | —`; `koli: elde | teslim | —`; `silah: cepte | —`; `lamba: n`; `alarm: n` — değerler `GameState` ile eşit; gökte ufka 10° yakın tek dikiş çizgisi (yalnız bu bölgede); tünelin 2. döngüsünde panel sayıları yerine aynı 6 satırın kırpılmış tekrarı. "simülasyon/kod/render/sınır/hata/yükleniyor" kelimeleri içerik metninde yasak.

## 9. Sonlar (7) ve DÖKÜM

Tek hayatta kalış: **S1 Bir Bardak Daha** (B36-A). Ölüm sonları: **S2 İlk Sabah** (B2-A); **S3 Sessiz Oda** (B2′-A, 7 mekân kipi); **S4 Son Akşam Yemeği** (B30-B); **S5 Son Sürüş** (B34-B; 3 sunum varyantı); **S6 Uçurum** (B36-B ya da Garip'siz kenar; 3 varyant+Garip'siz); **S7 Şiddetin Dönüşü** (A5; **2 koşul varyantı**: `hasGun`→"Silahı yere bırakın." ×2; silahsız→"Araçtan uzaklaşın." ya da "Ellerinizi görelim."). Zar yalnız sunumu değiştirir; ikinci canlı son yoktur.

Ortak kurallar: yöntem, araç kullanımı, beden, kan, acı sesi yok; sonlarda müzik yok (yalnız ambiyans ve nesne sesi); veda, kahraman, kötü adam yok; "geç kalan yardım" imgesi yasak. S1 son karesi: iki bardak, buhar, bank, **termos kapağı açık** ("AÇIK." yazısı yok). S1'de kaşık sesi sahnenin en yüksek sesidir; silah cepteyse oyun hiçbir şey demez.

**DÖKÜM/INVENTORY:** 6–9 satır, kronolojik, "Nesne: durum." (sıfat, yargı, puan yok; boş değer "—"); son satır S1'de "Gece: sürüyor.", diğerlerinde "Gece: —."; daktilo 18 kr/sn, damga sesi; düğmeler **Destek** (asla gizlenmez); Bu pencereyi kapat; Baştan. TR/EN aynı satır sayısı.

**Destek:** her son, ana menü, içerik uyarısı, "Şimdi değil", B2/B2′/B29/B30 köşesi, ayarlar altı, jenerik. Şerit metni "Destek — yalnız olmak zorunda değilsin." Yeni sekme (`noopener`), hiçbir saati durdurmaz; `support.json` dil başına≥1 kaynak+yedek metin; numara kodda saklanmaz. **İçerik uyarısı** ilk açılışta (F1'den itibaren): tema (intihar, silah, ölüm sesleri), kuru, Destek düğmesiyle.

## 10. Güvenlik ve üslup sınırları

- Yöntem, doz, ürün adı, öğretici ayrıntı yok; şişeler "Servis" ve "öteki" adlı kurmaca nesnelerdir; etkileri yalnız algı tasviri.
- Ölüm huzur, çözüm, ceza ya da fayda olarak çerçevelenmez; S1 kurtuluş değil, bir bardak çaydır.
- Kendine doğrultma 2 sn "nefes" sürtünmesiyle gelir (duraklama, engel değil); Destek o kartta görünür.
- Boncuk'a nişan kilitlenmez; bekçi, çocuk, yaşlı, hayvan tanık/duygusal araç değildir.
- `bannedTerms` (`support.json`) tüm `locales/*.json`, `endings.json`, iç ses ve tabela anahtarlarında vitest'le taranır. UI'da "sınır/hata/yükleniyor/limit/error/loading" yalnız `content.*` ve `subtitle.*` ad alanlarında yasaktır; `app.*`, `error.*`, `boot.*` (hata ekranı, ilerleme) muaftır.
- Sekme başlığı seçim kimliği sızdırmaz: kök "DİLEMMA", çocuk "DİLEMMA — Olasılık <n>" (EN "Possibility").
- Fotosensitivite: varsayılan modda hiçbir sahne 1 sn'de > 3 tam ekran parlaklık geçişi yapmaz; "flaş azalt" ayarı ayrıca var.

## 11. Teknik kararların özeti (ayrıntı: docs/TEKNIK.md v1.2)

- Yığın: Vite 8+TypeScript 7+three.js 0.186+Rapier 0.21 (tek fizik motoru)+framework'süz DOM UI; tek repo, npm workspaces `apps/dilemma`, `apps/stresst` (git subtree), `tools/*`. Eski Next.js prototipi yalnız referans (etiket `next-prototype-final`, `archive/`, F4'te silinir).
- **sTressT gömme: iframe birincil** (`apps/stresst/dist`→`/stresst/`; `postMessage` köprüsü; sTressT'e yalnız `src/host-bridge.ts`≤40 satır+`main.ts`'e 1 import; iframe açıkken DİLEMMA bağlamı serbest bırakılır). Süreç içi modül yolu terk edildi.
- Performans sözleşmesi: D1 (Intel UHD 620) 30 fps kararlı (p95≤36 ms, draw≤120, üçgen≤150 k), D2 60 fps, D3 60+; üç kademe+dinamik çözünürlük; **5 sn ölçüm sahnesi** uyanış ara sahnesine gömülü; gerçek D1 cihazı F4, F9, F13 kapanışlarında, aradaki fazlarda GPU zamanlayıcı vekili × kalibrasyon katsayısı. İçerik ve figüran sayısı kademeden bağımsız.
- Işık: Blender Cycles headless lightmap+4 kanallı lamba maskesi (lamba söndürme dinamik ışıksız); blokaj `tools/bake/blockout.py` ile `layout.json`'dan üretilir; bake `npm run check` dışında.
- Pencere sistemi: IndexedDB tek doğruluk kaynağı; BroadcastChannel+`opener.postMessage` **snapshot handoff** (bölümlenmiş depolama için zorunlu); iframe içinde varsayılan emülatör; donmada her kademede sahne boşaltılır; yetim ebeveyn kipi; `?noidb=1` test bayrağı.
- İçerik veri odaklı (JSON+TS tipleri), TR/EN anahtar tabanlı; vitest içerik testleri (tam 2 seçenek, `survives` tam 1, erişilebilirlik, bayrak okunurluğu, ekonomi, `bannedTerms`, yürüyüş süresi `est` verisiyle).
- Asset: yalnız CC0/CC-BY 3.0–4.0/OFL/Apache/MIT/Public Domain/Data-Attribution (veri setleri); Mixamo ve Sketchfab standart lisansı yasak; animasyon kaynağı Quaternius Universal Animation Library; her indirme `ASSET-ISTEK-F<n>.md` onayından sonra; lisans ekranı build'den üretilir.
- Yayın: ücretsiz web Cloudflare Pages+itch.io "istediğin kadar öde" (aynı zip; SAB kutusu kapalı); Vercel Hobby kullanılmaz; Steam kapsam dışı.
- Üç build kipi: dev (5181); **qa** (4181; overlay, `__dilemma`, `?q=`, `?noidb=`, `?bench=`); prod (4182; tutamaksız). Çayan testleri qa build'de, F15 prod'da.

## 12. Süreç kuralları (ayrıntı: docs/FAZLAR.md)

- 16 faz (F0–F15), faz faz, yol yol; her faz kümülatif regresyon (R listesi yalnız büyür)+test raporu+Çayan'ın tarayıcı testi+tek cümle **`ONAY F<n>`**; ret `RET F<n> [sürüm+commit]: <adım> — <görülen>`. Son mesaj kazanır.
- Kesilmezler: 7 son, Y1/Y2/Y8 omurgası, TR+EN, Destek, pencere sistemi, alarm, ekonomi, içerik uyarısı, Lisanslar, D1 30 fps hedefi, **sTressT kapısı** (kesme sırasında en son).
- **Açık kararlar (Çayan):** (1) kart açıkken Esc yalnız Ayarlar katmanı mı (süre durmaz — öneri) yoksa duraklatma mı; (2) B2 ve B36'da süre dolunca zar mı `pick: 1` mi (varsayılan zar); (3) erişilebilirlik `timerScale` ×1/×1,5/×2 eklensin mi (KANON süreleri sabit tutar); (4) dünya içi yazıların EN'i altyazı şeridi (varsayılan) mı dil başına çift doku mu; (5) gerçek D1 cihazı F4 kapanışında bulunabilir mi, bulunamazsa vekil+kalibrasyon F13'e kadar kabul mü.
