# femme — Tam Proje Dökümü

> Sevgi'nin döngü, ruh hali, beden, cilt, beslenme ve spor takip uygulaması.
> Bu döküman: ne yaptık, neden yaptık, ne sırada yaptık, ne kaldı.

---

## Proje kimliği

**İsim:** femme
**Sahip:** Sevgi (Istanbul, doktor — iş yeri hekimi)
**Dil:** Türkçe
**Tip:** Single-file HTML web uygulaması + opsiyonel Cloudflare Worker AI backend
**Veri:** localStorage (tarayıcıda lokal, hiçbir sunucuya gitmez)
**GitHub:** github.com/sevgiikilic/femme

## Ne yapıyor

11 sayfalık bir takip uygulaması:

**Daily (günlük takip):**
1. **Bugün** — Ana dashboard. Döngü günü, faz, hızlı bakış.
2. **Semptomlar** — Her gün için kramplar, baş ağrısı, ruh hali, enerji vb. işaretle.
3. **Beden** — Kilo, bel ölçüsü, göbek şişkinliği (-1 ile +3 arası).
4. **Yemek Günlüğü** — Ne yedin, kaç kalori (AI tahmin ediyor).

**Library (referans):**
5. **Döngü** — Adet kayıtları, faz rehberi.
6. **Beslenme** — Sevdiğin/sevmediğin/tepki verdiğin yiyecekler. Faza göre öneriler.
7. **Cilt** — Ürün dolabı (INCIDecoder'dan otomatik bilgi çekme), faza göre rutin.
8. **Spor** — Antrenman kayıt, faza göre öneri.

**Insights (içgörü):**
9. **Öngörüler** — Pattern tanıma. Hangi semptom ne kadar sık, faza göre şişkinlik, tetikleyici yiyecekler.
10. **Sohbet** — AI ile konuşma. Yedim deyince otomatik yemek günlüğüne ekliyor.
11. **Ayarlar** — Yedek al, geri yükle, AI URL, sıfırla.

---

## Sürüm geçmişi

### v1 — İlk versiyon
- Minimalist krem zemin + bordo (#8b2a3a)
- 8 sayfa: Bugün, Döngü, Semptomlar, Beden, Beslenme, Cilt, Spor, Öngörüler
- Fontlar: Fraunces + Inter Tight
- AI yoktu

**Senin geri bildirimin:**
- "femme." cliché geldi (sondaki nokta)
- Semptom butonları tıklanmıyordu (bug — Türkçe karakterler onclick string'lerini bozuyordu)
- Otomatik kayıt istiyordun
- Yiyecek tercih sistemi (sevdiğim/atladığım) istiyordun
- Cilt için kendi ürünlerini eklemek istiyordun
- AI sohbet istiyordun

### v2 — Vamp + autosave
- Bodoni Moda italik logo
- Daha koyu wine (#6e1622)
- Bug fix: chip click'leri event delegation ile çözüldü
- Her etkileşimde toast'lı autosave
- 4 katmanlı yiyecek tercihi (love / neutral / skip / react)
- Kendi cilt ürünlerini ekle özelliği
- AI sohbet (sağ alt FAB panel) — Anthropic API üzerinden

**Kararlar:**
- Backend: Cloudflare Worker
- Sadece web (mobile sonra)

**Senin geri bildirimin:**
- Logo hâlâ cliché
- "Cowboy Bebop × Sailor Moon" estetiği istiyordun
- Fontlar zor okunuyor
- AI çalışmadı
- Cilt ürünü adı yazınca otomatik tamamlama + bilgi çekme istiyordun
- Ücretsiz AI istedin (kart vermeden)

### v3 (ilk hali) — Noir-shoujo + Gemini
**Estetik:** Cowboy Bebop × Sailor Moon "noir-shoujo"
- Cinzel (logo) + Cormorant italik (display) + DM Sans (gövde) + JetBrains Mono (etiketler)
- Krem zemin (#f0ead8), wine-crimson (#8b1a2e), dust pink, ribbon gold
- Film grain overlay, scan lines, "Session 001" dosya başlıkları
- SVG ay fazı ikonları (her döngü fazı için ay görseli)

**AI değişikliği:** Anthropic ($) → Google Gemini (ücretsiz, 1500 istek/gün, kart yok)

**Yeni özellikler:**
- 11 sayfa (Yemek Günlüğü ve Sohbet eklendi)
- Sohbet artık FAB panel değil, **tam sayfa**
- Cilt ürün arama: INCIDecoder scrape → bulamazsa Gemini fallback
- v2'den v3'e otomatik migration

**Senin geri bildirimin:**
- Krem zemini "vanilla" geldi, beğenmedin
- Cowboy Bebop sıcak krem zemin hatırlamıyordun (haklıydın — Bebop daha koyu)
- Fontlar daha iyi ama hâlâ tam oturmamış
- Cloudflare arayüzü değişmiş, "Create Worker" göremiyordun (yeni: "Create application" → "Start with Hello World!")

### v3 (mevcut hal) — Dual tema + font hiyerarşisi
**Renk değişikliği:**
- Varsayılan **gece moru** (#15102a deep night purple)
- Neon crimson (#e63b5e), hot gold (#f4c14f), dust pink, mint accents
- Alt tema: warm cream (eskisi)
- Sidebar'da brand altında **tema toggle butonu** (ay/güneş ikon, slide animasyonu)
- Tercih localStorage'a kaydediliyor

**Font hiyerarşisi netleşti:**
4 font, role bazlı CSS değişkenleri ile (`--f-logo`, `--f-display`, `--f-ui`, `--f-meta`):
- **Cinzel** sadece "FEMME" logosu + roma rakamları
- **Cormorant Garamond italik** sadece büyük momentler (page-title, ring-day, phase-name, card-value)
- **DM Sans** her şey fonksiyonel (gövde, butonlar, formlar, tablolar, listeler)
- **JetBrains Mono** etiketler ve metadata (eyebrow, label)

Yanlış kullanımlar düzeltildi: food-item-name, search-result-name, td.num gibi liste/tablo elemanları Cormorant'tan DM Sans'a geçti.

**Senin geri bildirimin:**
- Yazılar küçük, okuması zor (özellikle pembe-kırmızı olanlar)
- AI'da HTTP 500 hatası

### v3 (son güncelleme) — Yazılar büyütüldü + Gemini düzeltildi
**Yazı boyutları:**
- Tüm 9px etiketler → 11px
- Font weight: 400 → 500 (medium)
- `--ink-faint` (en soluk) kullanan yerler → `--ink-soft` (orta) — özellikle dark modda kontrast artışı

Etkilenen yerler: brand-tag, theme-toggle-label, nav-label, nav-num, sidebar-foot, page-eyebrow, page-meta, card-label, ring-label, phase-eyebrow, phase-stat-label, field-label, btn-sm, micro-btn, phase-row days, table th, bar-label, section-head meta, chat assistant FEMME etiketi, chat-typing, chat-quick butonları, meal-item-type, meal-day-cal, search-result-desc, onboard SESSION 001 etiketi, bloat scale alt etiketleri, ai-status, INCIDecoder bilgi satırı.

**AI hatası:**
Sebep: `gemini-2.0-flash` modeli **3 Mart 2026'da emekliye ayrılmış** (biz Mayıs'tayız). Worker artık var olmayan bir modele istek atıyordu.
Çözüm: `gemini-2.5-flash`'e geçildi (ücretsiz, günde 250 istek). Worker hata yakalama da sertleştirildi.

---

## Mevcut dosyalar

### `femme.html`
Ana uygulama. ~3200 satır single-file HTML.
- localStorage key: `femme_v3` (eski `femme_v2`'den otomatik migration)
- Tema seçimi `femme_theme` key'inde
- Tüm CSS, HTML ve JS tek dosyada (deploy kolay olsun diye)
- Hiç dış dependency yok (sadece Google Fonts'tan font yükler)

### `femme-worker.js`
Cloudflare Worker backend. ~280 satır.
4 task:
- `ping` — bağlantı testi
- `chat` — kullanıcının context'ini (cycle, food prefs, products vb.) Gemini'ye yollayıp kişiselleştirilmiş yanıt
- `estimate_calories` — yemek tarifinden kalori tahmini (Türk mutfağına özgü)
- `search_product` — INCIDecoder scrape, bulamazsa Gemini fallback

Gemini 2.5 Flash kullanır. CORS açık (her yerden istek alabilir, gerekirse kısıtlanabilir).

### `README-backend.md`
Worker kurulum rehberi.
- Gemini API key alma (5 dakika, kart yok)
- Cloudflare Worker oluşturma (yeni "Create application" → "Start with Hello World!" yolu ile)
- GEMINI_API_KEY'i Secret olarak ekleme
- femme.html'e URL'i bağlama

### `CLAUDE.md`
Claude Code için context dosyası. Bu projeyi başka bir Claude'a açtığında otomatik okur.

---

## Önemli teknik detaylar

### Cycle math
- Weighted-recent average cycle length (son döngüler daha çok ağırlık)
- Ovulation = avgC - 14
- Phase boundaries:
  - menstrual: 1 → avgPeriod
  - follicular: avgPeriod+1 → ovuDay-2
  - ovulation: ovuDay±1
  - luteal: kalan

### Phase library (4 faz, her birinde):
- Türkçe semptom listesi (ortalama 6-12 semptom)
- Yiyecek good/bad listesi (faza özel)
- Spor önerileri
- Skincare focus (AM/PM rutin)
- Aktif içerik öncelikleri (faza göre niyasinamid mi retinol mü)

### Cilt ürün eşleme
Kullanıcının ürünleri faza göre puanlanır:
- Aktif içeriği faz aktifleriyle eşleşiyorsa +3 puan
- Tip önceliği (Temizleyici > Serum > Nemlendirici > SPF) ek puan
- En yüksek puanlılar AM/PM rutinine yerleştirilir

### Yiyecek tetikleyici tespiti
Bir yiyeceğe "issue" eklediğinde (örn. "muz → şişkinlik"), preference otomatik "react"a geçer ve Öngörüler sayfasında tetikleyici listesinde görünür.

---

## Sevgi'nin tercihleri (proje boyunca uyduğumuz)

**İletişim:**
- Direkt, açık net konuşma — hedge yok
- Türkçe arayüz
- Asla emoji kullanılmayacak (SVG ikonlar, "·" ve "—")

**Diyetik kısıtlamalar:**
- Yumurta yok, tavuk yok, kümes hayvanı yok
- Laktoz intoleransı (yoğurt ve peynir tolere edilebilir)
- Baklagil yok, yulaf yok, işlenmiş et yok

**Skincare markaları:**
- Some By Mi, Purito, INO Beauty, Dear Klairs

**Fitness hedefleri:**
- Düz karın
- Splits (her iki yön)
- Headstand
- Yağsız silüet

---

## Kurulum

### Local çalıştırma
`femme.html` dosyasını çift tıkla, tarayıcıda açılır. localStorage kullanır, internet gerekmez.

### AI backend (opsiyonel — sohbet ve ürün arama için)

**Adım 1: Gemini API key**
1. https://aistudio.google.com/app/apikey
2. Google hesabınla giriş yap
3. "Create API key" → "Create API key in new project"
4. AIzaSy... ile başlayan key'i kopyala

**Adım 2: Cloudflare Worker**
1. https://dash.cloudflare.com — hesap aç (kart yok)
2. Compute (Workers) → "Create application"
3. "Start with Hello World!"
4. İsim ver (femme-ai gibi) → Deploy
5. "Edit code" → içindeki örneği sil → femme-worker.js içeriğini yapıştır → Deploy

**Adım 3: Secret ekle**
Worker → Settings → Variables and Secrets → Add variable:
- Name: `GEMINI_API_KEY`
- Type: **Secret** (önemli, Plain text değil)
- Value: 1. adımdaki Gemini key
- Save

**Adım 4: femme'e bağla**
femme'i aç → Ayarlar → AI Backend URL → worker URL'ini yapıştır (`https://femme-ai.kullanici-adin.workers.dev` gibi) → "Bağlantıyı Test Et" → ✓ bağlandı görmeli

---

## Bilinen takılma noktaları

**HTTP 500 hatası alıyorsan:** Eski worker kodunu deploy etmişsindir. Yeni femme-worker.js'i kullan (gemini-2.5-flash'a geçtik, eski 2.0 modeli emekliye ayrıldı).

**"API key not valid" hatası:** GEMINI_API_KEY Secret'ı yanlış girilmiş veya Plain text olarak girilmiş. Sil ve Secret olarak tekrar ekle.

**"Quota exceeded" hatası:** Günlük 250 istek limit dolmuş, ertesi gün resetlenir.

**INCIDecoder ürün bulamıyor:** Çoğu zaman çalışır. Bulamazsa otomatik Gemini'ye sorar. İkisi de bulamıyorsa elle eklersin.

**Veriler kayboldu sandın:** localStorage tarayıcıya bağlı. Aynı tarayıcıda çalıştığın sürece kalıcı. İncognito mode'da kalıcı değil. Farklı tarayıcıda kullanırsan farklı veri görürsün. Ayarlar'dan JSON yedek al, gerekirse içe aktar.

**v2'den geçiş:** v2'de veri varsa v3 ilk açılışta otomatik aktarır. Kayıp olmaz.

---

## Açık konular ve gelecekteki olası özellikler

Şu an yok ama konuşulmuştu / olabilir:

- **Apple Health entegrasyonu** — iOS Shortcuts üzerinden yapılabilir (export/import köprüsü)
- **Cloud sync** — Supabase free tier ile (cihazlar arası senkron)
- **PWA install** — telefonda ikon olarak ekleyip native app gibi kullanma
- **Bildirimler** — yaklaşan adet, ovulasyon, hatırlatıcılar
- **Mobile native app** — web kilitlenince Tauri/Electron ile sarmalama
- **Daha gelişmiş istatistik** — döngü trendi grafikleri, mood-symptom-cycle korelasyonları
- **Periyot tahmin doğruluğu artışı** — ML tabanlı ileri tahmin

---

## Claude Code'a aktarırken

VS Code'da femme klasörünü aç → Terminal'de `claude` komutu → ilk mesaja:

> CLAUDE.md ve PROJECT-LOG.md dosyalarını oku, projeyi kavra, sonra başlayalım.

Tüm context'i alır. İşte böyle.

---

## Son not

Bu proje 3 sürüm geçirdi, her sürümde tasarım dili ve özellik seti netleşti. Mevcut hal (v3 son güncelleme) çalışıyor ama **deploy edilmemiş** son worker kodunu Cloudflare'e yapıştırman lazım — AI'ın çalışması için kritik. Tasarım tarafında kullanıcı geri bildirimi gerekirse 11px etiketleri tekrar büyütebiliriz, palet ince ayarı yapabiliriz.

İyi çalışmalar.
