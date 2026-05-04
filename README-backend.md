# femme — AI Backend Kurulum Rehberi

> Tamamen ücretsiz. Kart bilgisi gerekmiyor. Yaklaşık 10 dakika.

## Ne yapacaksın

Cilt ürün arama, AI sohbet ve kalori tahmini için bir backend kurman gerekiyor. Bu backend Cloudflare Worker üzerinde çalışıyor (ücretsiz katman, ayda 100,000 istek) ve Google Gemini API'ı kullanıyor (günde 1500 istek ücretsiz, kart yok).

Hiçbir veri loglanmaz. Sadece istekleri Gemini'ye yönlendiren bir aracı.

---

## ADIM 1 — Gemini API anahtarı al

1. https://aistudio.google.com/app/apikey adresine git
2. Google hesabınla giriş yap (mevcut Gmail hesabın yeterli)
3. **"Create API Key"** veya **"API anahtarı oluştur"** butonuna tıkla
4. "Create API key in new project" seç (yeni proje oluştursun)
5. Açılan kutuda uzun bir anahtar göreceksin — **AIzaSy...** ile başlar
6. Bu anahtarı kopyala ve güvenli bir yere not et

> Önemli: Kart sorulmuyor, fatura adresi sorulmuyor. Sadece Google hesabı yeterli. Free tier'da kalmak için ekstra ayar yapmana gerek yok.

---

## ADIM 2 — Cloudflare hesabı

1. https://dash.cloudflare.com/sign-up adresine git
2. Email + şifre ile hesap aç (kart bilgisi istemez)
3. Email doğrulamasını yap

---

## ADIM 3 — Worker oluştur

1. Cloudflare panelinde sol menüden **"Compute (Workers)"** ya da **"Workers & Pages"** sekmesine tıkla
2. **"Create"** veya **"Create Worker"** butonuna bas
3. İsim ver: ör. `femme-ai`
4. **"Deploy"** butonuna bas (varsayılan "Hello World" worker'ı kurulur)
5. Açılan ekranda **"Edit code"** ya da **"Continue to project" → "Edit code"** butonuna tıkla
6. Sağda kod editörü açılır. İçindeki örnek kodun TAMAMINI sil
7. `femme-worker.js` dosyamın içeriğini kopyala, editöre yapıştır
8. Sağ üstteki **"Deploy"** butonuna bas
9. "Deployed successfully" mesajını gördüğünde hazır

Bu noktada worker URL'in görünür olacak — şuna benzer:
```
https://femme-ai.SENIN-KULLANICI-ADIN.workers.dev
```
Bu URL'i kopyala.

---

## ADIM 4 — Gemini anahtarını Worker'a ekle

Anahtarı kodun içine YAZMA. Onu güvenli bir Secret olarak ekleyeceğiz.

1. Worker sayfasında **Settings** sekmesine geç
2. **"Variables and Secrets"** ya da **"Variables"** bölümüne git
3. **"Add variable"** butonuna bas
4. Variable name: `GEMINI_API_KEY`
5. Type: **Secret** seç (önemli — Plain text değil)
6. Value: 1. adımda aldığın Gemini anahtarını yapıştır
7. **"Deploy"** ya da **"Save"** ile onayla

---

## ADIM 5 — femme'e bağla

1. femme.html dosyasını tarayıcıda aç
2. Sol menüden **Ayarlar**'a git
3. **AI Backend URL** alanına 3. adımda aldığın worker URL'ini yapıştır
4. **Bağlantıyı Test Et** butonuna bas
5. `[ ✓ bağlandı ]` görmen lazım

Eğer "× bağlandı" çıkarsa:
- URL'in başında `https://` var mı kontrol et
- Sonunda `/` yoksa eklemene gerek yok
- Worker'ın deploy edildiğinden emin ol
- Cloudflare'de Worker logs sekmesinden hata var mı bak

---

## Test et

Sohbet sayfasına git ve sor: **"Bugün ne yemeliyim?"**

Faza ve sevdiğin yiyeceklere göre öneri vermeli.

Cilt sayfasında ürün kutusuna **"some by mi"** yaz. 3 saniye içinde otomatik tamamlama listesi açılmalı.

---

## Limitler ve maliyet

- **Cloudflare Worker:** Ücretsiz katman ayda 100,000 istek. Femme tipik kullanımda günde 50-100 istek arasındadır → endişelenmenize gerek yok.
- **Gemini API:** Ücretsiz katman günde 1500 istek, dakikada 15 istek. Yine bireysel kullanım için fazlasıyla yeter.

İkisinde de kart bilgisi yok, otomatik ödeme yok. Limit aşılırsa servis durur, ücretlendirme olmaz.

---

## Sorun çıkarsa

**INCIDecoder ürün bulamıyor:**  
Çoğu zaman çalışır. Bulamazsa otomatik olarak Gemini'ye sorar. Eğer ikisi de bulamıyorsa kendin elle ekle.

**Sohbet yanıt vermiyor:**  
Cloudflare Workers panelinde Worker'ına git → **"Logs"** → **"Begin log stream"** ile gerçek zamanlı hata mesajını gör.

**429 / Quota exceeded hatası:**  
Gemini günlük limitini aştın (1500 istek). Ertesi gün resetlenir.

---

## Güvenlik notu

Worker'ın tek görevi: senin tarayıcından gelen isteği Gemini'ye yönlendirmek. Hiçbir şey kaydetmez. Gemini API anahtarın senin Cloudflare hesabında Secret olarak duruyor — kimse göremez, kodda görünmüyor.

Eğer ileride `localhost` veya kendi domain'in dışından kullanmayı düşünmüyorsan, worker.js'in en üstüne CORS kısıtlaması ekleyebilirsin:

```js
'Access-Control-Allow-Origin': 'https://senin-domain.com',
```

Ama tek başına kullanımda `*` yeterli ve güvenli.
