# TUR F0-T0 — Ortam notu (tüm turlar için geçerli)

## WebKit yerelde KAPALI
- Windows "Akıllı Uygulama Denetimi", Playwright WebKit'in imzasız `JavaScriptCore.dll` dosyasını her başlatmada engelliyor ve kullanıcıya güvenlik bildirimi yağdırıyor (`ms-playwright\webkit-2359\Playwright.exe`).
- Çözüm: `apps/dilemma/e2e/playwright.config.ts` içinde `webkit` projesi yalnız `CI=1` ya da `PW_WEBKIT=1` iken tanımlı. Yerelde `npm run e2e` yalnız chromium + firefox koşar.
- KURAL: hiçbir tur yerelde WebKit çalıştırmaz, `webkit` projesini koşulsuz geri eklemez, `npx playwright install webkit` çağırmaz. WebKit DOM spec'leri CI'da (`.github/workflows/check.yml`) koşar; FAZLAR'daki "webkit DOM spec'leri" kabulü raporda "CI'da / yerelde kapalı (Windows SAC)" diye yazılır.
- Güvenlik ayarına dokunulmaz (kullanıcının kararı).
