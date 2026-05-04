# femme — Cycle & Wellness Tracker

## Proje Özeti

Sevgi (Istanbul, doktor) için Türkçe menstrüel döngü, ruh hali, beden, cilt, beslenme ve spor takip uygulaması. Tek dosya HTML uygulama (localStorage tabanlı) + Cloudflare Worker AI backend (Gemini-tabanlı, ücretsiz).

## Dosyalar

- **`femme.html`** — Ana uygulama. Single-file HTML, ~3200 satır. localStorage key: `femme_v3` (eski `femme_v2`'den otomatik migration var).
- **`femme-worker.js`** — Cloudflare Worker backend. Gemini 2.5 Flash kullanır. 4 task: ping, chat, estimate_calories, search_product. INCIDecoder scrape + Gemini fallback ile cilt ürün arama.
- **`README-backend.md`** — Worker kurulum rehberi (Gemini API key + Cloudflare Worker deploy adımları).

## Mevcut Sürüm: v3

### Tasarım — "noir-shoujo"
Cowboy Bebop × Sailor Moon estetiği. **Dual tema**:
- **Varsayılan: gece moru** (#15102a deep night purple, neon crimson #e63b5e, hot gold #f4c14f, dust pink, mint accents)
- **Alt: warm cream** (#f0ead8 paper, #8b1a2e crimson)

Sidebar'da brand altında tema switch var. Tercih localStorage'a kaydediliyor.

### Font hiyerarşisi
4 font, role bazlı CSS değişkenleri ile:
- `--f-logo` Cinzel — sadece "FEMME" logosu + roma rakamları
- `--f-display` Cormorant Garamond italik — büyük başlıklar, sayılar (page-title, ring-day, phase-name, card-value)
- `--f-ui` DM Sans — gövde, butonlar, formlar, tablolar, listeler
- `--f-meta` JetBrains Mono — eyebrow'lar, etiketler (11px medium weight)

### Sayfalar (11 toplam)
**Daily:** Bugün, Semptomlar, Beden, Yemek Günlüğü
**Library:** Döngü, Beslenme, Cilt, Spor
**Insights:** Öngörüler, Sohbet, Ayarlar

### Detaylar (mantık)
- **Cycle math:** Weighted-recent average cycle length. Ovulation = avgC - 14. Phase boundaries: menstrual (1 to avgP), follicular (avgP+1 to ovuDay-2), ovulation (ovuDay±1), luteal (rest).
- **4 faz library:** menstrual / follicular / ovulation / luteal — her biri için Türkçe semptom listeleri, food good/bad listeleri, fitness önerileri, skincare focus (am/pm), aktif içerik öncelikleri.
- **Food tracking:** 4-tier (love / neutral / skip / react). React'tekilere "issue" eklenebilir (örn. baş ağrısı). Foliküler fazda probiyotik, luteal'de magnezyum & B6 önerisi gibi faza özel öneriler.
- **Skin products:** INCIDecoder scrape ile ürün adı yazınca otomatik tamamlama, Gemini fallback. Kullanıcının ürünleri faza göre öncelik skoruyla sıralanıp AM/PM rutinlerinde öneriliyor.
- **Meal tracking:** AI varsa "1 kase yulaf cevizle" yazınca otomatik kalori tahmini.

## Sevgi'nin tercihleri (proje için önemli)

- **Türkçe arayüz** — tüm metinler Türkçe.
- **Asla emoji yok** — SVG ikonları, "·" ve "—" kullan.
- **Direkt iletişim** — tasarım/kod kararlarında hedge'leme, açık net konuş.
- **Diyetik kısıtlamalar:** yumurta, tavuk, kümes hayvanı yok; laktoz intoleransı (yoğurt/peynir tolere); baklagil, yulaf, işlenmiş et yok.
- **Skincare markaları:** Some By Mi, Purito, INO Beauty, Dear Klairs.
- **Fitness hedefleri:** düz karın, splits, headstand, yağsız silüet.

## Setup & Deploy

### Local çalıştırma
`femme.html` dosyasını tarayıcıda aç, hepsi bu. localStorage kullanır.

### AI backend (opsiyonel)
1. https://aistudio.google.com/app/apikey — Gemini API key al (ücretsiz, kart yok)
2. https://dash.cloudflare.com — Worker oluştur ("Create application" → "Start with Hello World!")
3. Worker editörüne `femme-worker.js` içeriğini yapıştır, Deploy
4. Settings → Variables and Secrets → `GEMINI_API_KEY` (Secret olarak) ekle
5. Worker URL'ini femme.html → Ayarlar → AI Backend URL'e yapıştır

Detay: `README-backend.md`

## Açık konular / Olası geliştirmeler

- Apple Health entegrasyonu (iOS Shortcuts üzerinden konuşulmuştu, henüz yapılmadı)
- Cloud sync (Supabase free tier konuşulmuştu)
- PWA install / offline desteği
- Bildirimler (yaklaşan adet, ovulasyon)
- Mobile native app (web kilitlenince)

## Önceki sürüm geçmişi

- **v1:** İlk sürüm, krem zemin + bordo, font karışıklığı, AI yoktu, semptom chip'leri buggy idi (Türkçe karakter onclick string sorunu)
- **v2:** Bug'lar düzeldi, autosave, food preferences, skincare custom products, AI chat (FAB panel, Anthropic-based — pahalıydı)
- **v3 (mevcut):** Noir-shoujo aesthetic, dual theme, full-page chat, Gemini-based AI (free), INCIDecoder + AI fallback product search, 11 sayfa
