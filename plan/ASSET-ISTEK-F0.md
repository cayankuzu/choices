# ASSET İSTEK — F0

Kural (TEKNIK §7.4): hiçbir indirme onaysız yapılmaz. Çayan "onay <id>" yazınca `approved: true` olur ve
`fetch.mjs` (F1) yalnız onaylı satırları indirir. Onaya kadar UI `system-ui` yazı tipi yığınıyla çalışır
(`apps/dilemma/src/style.css`).

| id | kaynak | URL | lisans | yazar | boyut (MB) | neden gerekli | alternatif | approved |
|---|---|---|---|---|---|---|---|---|
| font-ibm-plex-sans | IBM Plex (GitHub release, `IBM-Plex-Sans/fonts/complete/woff2/`) | https://github.com/IBM/plex/releases | OFL 1.1 | IBM | ≈ 0,08 (2 ağırlık: Regular 400 + SemiBold 600, latin+latin-ext woff2) | UI, altyazı, DÖKÜM; Türkçe `İ/ı/ş/ğ` tam kapsama; TEKNIK §6.2 | `system-ui` yığını (mevcut varsayılan) | false |

Bekleyen onay: **`onay font-ibm-plex-sans`**

Notlar:
- İndirme sonrası `ASSET_LICENSES.md` + `public/licenses.json` satırı (F1 lisans defteri) eklenir.
- Alt küme (subset) fontTools 4.66 ile yerelde yapılır (R-00'da mevcut); Google Fonts bağlantısı kullanılmaz.
