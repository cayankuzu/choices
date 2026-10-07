# R-00 — Ortam kontrolü (F0-T1)

Makine: Windows 11 Pro 10.0.26200 (x64). Ölçüm tarihi: F0-T1.

| Araç | Sürüm | Durum | Not |
|---|---|---|---|
| Node | v26.7.0 | var | Plan 22 der; `engines: ">=22"`, 26 ile çalışıyor. CI Node 22 kullanır. |
| npm | 11.19.0 | var | workspaces `apps/*`, `tools/*` |
| git | 2.55.0.windows.1 | var | `git subtree` mevcut |
| Python | 3.13.14 (`python`) | var | `python3` takma adı yok (Store yönlendirmesi); betiklerde `python` kullan |
| fontTools | 4.66.0 | var | IBM Plex alt küme için (onaydan sonra) |
| Blender 4.2 LTS | — | **YOK** | F4'e kadar gerekmez (`tools/bake/blockout.py`, lightmap). F4-T1'den önce kurulmalı. |
| toktx (KTX-Software) | — | **YOK** | F4'e kadar gerekmez (KTX2 sıkıştırma). F4-T1'den önce kurulmalı. |
| TypeScript | 7.0.2 | npm | kökte tek sürüm (dilemma + stresst) |
| Vite | 8.3.3 | npm | rolldown tabanlı; sTressT `^8.3.1` ile dedupe |
| vitest | 5.0.3 | npm | kök `vitest.config.ts` projeleri: dilemma, tools; sTressT ayrı |
| oxlint | 1.87.0 | npm | |
| three | 0.186.1 | npm | `npm ls three` → tek kopya (dilemma + stresst dedupe) |
| @dimforge/rapier3d | 0.21.0 | npm | wasm ayrı dosya (vite eklentisi) |
| @playwright/test | 1.63.0 | npm | |

## Playwright tarayıcıları (`%LOCALAPPDATA%\ms-playwright`)

| Tarayıcı | Revizyon | Sürüm | Yerel durum |
|---|---|---|---|
| chromium | 1243 | 153.0.8010.12 | **çalışıyor** — `boot.spec` geçti (SwiftShader bayraklarıyla) |
| chromium-headless-shell | 1243 | 153.0.8010.12 | var |
| firefox | 1543 | 155.0 | indirildi; **başlatılamıyor** (juggler bağlantısı gelmiyor; `firefox.exe --version` bile askıda kalıyor) |
| webkit | 2359 | 26.6 | indirildi; **başlatılamıyor** (`Playwright.exe` çıkış kodu 0xC0E90002, olay günlüğünde çökme yok) |

Firefox/WebKit notu: `npx playwright install` "Host system is missing dependencies" uyarısı verdi (winldd), ama
listelenen DLL'ler tarayıcı klasörlerinde mevcut ve VC++ Runtime 14.50 kurulu; `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`
ile de aynı sonuç; sandbox dışında da aynı. Makineye özgü bir engel (politika/antivirüs olasılığı). Çözüm T5c'ye
not edildi: yönetici terminalinde `npx playwright install --with-deps firefox webkit` denenir; CI (ubuntu-latest)
üç tarayıcıyı `--with-deps` ile kurar ve matris orada koşar. Eski önbellek (firefox-1538, webkit-2336, chromium-1234)
başka bir Playwright sürümüne aittir; dokunulmadı.

## Portlar
dev 5181 · qa 4181 · prod 4182 (sTressT standalone 5180). Port 3000'deki eski Next dev süreci T1'de kapatıldı.
