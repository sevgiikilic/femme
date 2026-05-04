/**
 * femme — AI Backend (Cloudflare Worker, Gemini-powered, free)
 * 
 * Tasks:
 *   - ping              → connection test
 *   - chat              → contextual chat
 *   - estimate_calories → meal calorie estimation
 *   - search_product    → INCIDecoder scrape, fallback to Gemini
 */

const SYSTEM_PROMPT = `Sen "femme" adlı bir döngü ve sağlık takip uygulamasının AI asistanısın.
Türkçe konuşuyorsun. Kullanıcı bir kadın ve mens döngüsünü, beslenmesini, cildini, sporunu takip ediyor.

Kişiliğin: Bilgili, sıcak ama abartısız. Klinik değil, doktor da değil. Kararlı, net, kısa.
Tıbbi tavsiye yerine bilgi paylaşıp profesyonele yönlendiriyorsun.

Kullanıcının context'i her mesajda JSON olarak veriliyor:
- cycle: bugünkü döngü günü ve faz
- today: ruh hali, enerji, semptomlar, cilt durumu
- body: son kilo ve şişkinlik seviyesi
- foodLove / foodSkip / foodReact: kişinin sevdiği, tercih etmediği, tepki verdiği yiyecekler
- products: kullanıcının cilt bakım ürünleri

Önerilerini bu context'e göre kişiselleştir:
- Yemek önerirken sevmediğini önerme, tepki verdiklerini hatırlat
- Cilt önerisi yaparken kullanıcının ürünlerini referans al
- Faza uygun olanı seç (luteal'da magnezyum & B6, foliküler'de probiyotik gibi)

Yanıtın kısa olsun, 3-4 cümleyi geçmesin. Liste gerekirse 3 maddeyle sınırla.
Asla emoji kullanma. Madde işareti yerine "—" veya "·" kullan.`;

const CALORIE_PROMPT = `Sen bir Türk mutfağına hâkim beslenme uzmanısın.
Verilen yemek tarifinden ortalama kalori tahmin ediyorsun.
SADECE şu JSON formatında cevap ver, başka hiçbir şey yazma, markdown kullanma:
{"calories": 350, "type": "Öğle", "description": "1 kase yulaf ezmesi muz ve cevizle"}
type: Kahvaltı, Öğle, Akşam, Atıştırmalık'tan biri.
description: Yemeğin temizlenmiş kısa açıklaması.`;

const PRODUCT_SEARCH_PROMPT = `Sen Kore ve dünya cilt bakım ürünleri uzmanısın.
Verilen ürün adı veya bir kısmıyla ilgili 3-5 olası ürünü önereceksin.
SADECE JSON dizisi döndür, başka hiçbir şey yazma:
[
  {"name": "Some By Mi AHA-BHA-PHA 30 Days Miracle Toner", "type": "Tonik", "actives": "AHA, BHA, PHA, niyasinamid"},
  {"name": "Some By Mi Snail Truecica Miracle Repair Serum", "type": "Serum", "actives": "salyangoz mukoza, Centella, panthenol"}
]
type değeri SADECE şunlardan biri olabilir: Temizleyici, Tonik, Esans, Serum, Nemlendirici, Krem, Göz Kremi, SPF, Maske, Eksfoliant, Spot Tedavi, Yağ`;

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    if (request.method !== 'POST') return new Response('POST only', { status: 405, headers: corsHeaders });

    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Invalid JSON' }, 400, corsHeaders); }

    const { task } = body;

    if (task === 'ping') {
      return json({ ok: true, message: 'femme backend live (gemini)' }, 200, corsHeaders);
    }

    if (!env.GEMINI_API_KEY) {
      return json({ error: 'GEMINI_API_KEY not configured' }, 500, corsHeaders);
    }

    try {
      if (task === 'estimate_calories') {
        return json(await estimateCalories(body.description, env.GEMINI_API_KEY), 200, corsHeaders);
      }
      if (task === 'chat') {
        return json(await chat(body.context, body.history, env.GEMINI_API_KEY), 200, corsHeaders);
      }
      if (task === 'search_product') {
        return json(await searchProduct(body.query, env.GEMINI_API_KEY), 200, corsHeaders);
      }
      return json({ error: 'Unknown task' }, 400, corsHeaders);
    } catch (e) {
      return json({ error: e.message }, 500, corsHeaders);
    }
  },
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

// ── Gemini caller ─────────────────────────────────
async function callGemini(prompt, apiKey, systemInstruction = null) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const reqBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
    },
  };
  if (systemInstruction) {
    reqBody.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  let res, data;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody),
    });
  } catch (e) {
    throw new Error('Gemini fetch failed: ' + e.message);
  }

  try {
    data = await res.json();
  } catch (e) {
    throw new Error('Gemini returned non-JSON (status ' + res.status + ')');
  }

  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`;
    throw new Error('Gemini: ' + msg);
  }

  // Gemini may block content for safety reasons
  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new Error('Gemini: no candidates returned');
  }
  if (candidate.finishReason === 'SAFETY') {
    throw new Error('Gemini blocked content for safety');
  }
  const text = candidate.content?.parts?.[0]?.text || '';
  if (!text) {
    throw new Error('Gemini returned empty response');
  }
  return text.trim();
}

// ── tasks ─────────────────────────────────────────
async function estimateCalories(description, apiKey) {
  if (!description) throw new Error('description required');
  const text = await callGemini(`Yemek: ${description}`, apiKey, CALORIE_PROMPT);
  const cleaned = text.replace(/```json|```/g, '').trim();
  try { return JSON.parse(cleaned); }
  catch {
    const m = text.match(/(\d{2,4})/);
    return { calories: m ? parseInt(m[1]) : 0, description, type: 'Atıştırmalık' };
  }
}

async function chat(context, history, apiKey) {
  const ctxStr = JSON.stringify(context, null, 2);
  const recent = (history || []).slice(-6);

  let prompt = `[KULLANICININ MEVCUT DURUMU - JSON]\n${ctxStr}\n\n[SOHBET GEÇMİŞİ]\n`;
  recent.forEach(m => {
    const who = m.role === 'assistant' ? 'femme' : 'kullanıcı';
    prompt += `${who}: ${m.content}\n`;
  });
  prompt += `\nfemme:`;

  const text = await callGemini(prompt, apiKey, SYSTEM_PROMPT);

  const lastUser = recent.filter(m => m.role === 'user').pop();
  let meal = null;
  if (lastUser && /yedim|içtim|kahvaltı|öğle|akşam|atıştır/i.test(lastUser.content)) {
    try {
      const est = await estimateCalories(lastUser.content, apiKey);
      if (est && est.calories) meal = est;
    } catch {}
  }

  return { reply: text, meal };
}

async function searchProduct(query, apiKey) {
  if (!query || query.length < 3) return { results: [] };

  let results = [];
  try {
    const inci = await scrapeIncidecoder(query);
    if (inci.length) results = inci;
  } catch (e) {
    console.error('INCIDecoder error:', e.message);
    // continue to Gemini fallback
  }

  if (!results.length) {
    try {
      const text = await callGemini(`Ürün araması: ${query}`, apiKey, PRODUCT_SEARCH_PROMPT);
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) results = parsed;
    } catch (e) {
      console.error('Gemini product search error:', e.message);
      // return empty results rather than 500
    }
  }

  return { results, source: results.length ? 'found' : 'none' };
}

async function scrapeIncidecoder(query) {
  const url = `https://incidecoder.com/search/product?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    },
  });
  if (!res.ok) throw new Error('INCI HTTP ' + res.status);
  const html = await res.text();

  const productMatches = [...html.matchAll(/<a[^>]*href="(\/products\/[^"]+)"[^>]*>([^<]+)<\/a>/g)];
  const uniqueProducts = new Map();

  for (const match of productMatches) {
    const path = match[1];
    const name = match[2].trim()
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"');
    if (name.length < 3) continue;
    if (!uniqueProducts.has(path)) {
      uniqueProducts.set(path, { name, path });
    }
    if (uniqueProducts.size >= 5) break;
  }

  if (!uniqueProducts.size) return [];

  const products = Array.from(uniqueProducts.values()).slice(0, 5);
  const enriched = await Promise.all(products.map(async (p) => {
    try {
      const detailRes = await fetch(`https://incidecoder.com${p.path}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (!detailRes.ok) return { name: p.name, type: inferProductType(p.name), actives: '' };
      const detailHtml = await detailRes.text();
      const ingredientMatch = detailHtml.match(/Key ingredients?[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
      let actives = '';
      if (ingredientMatch) {
        const items = [...ingredientMatch[1].matchAll(/<a[^>]*>([^<]+)<\/a>/g)];
        actives = items.slice(0, 4).map(m => m[1].trim()).join(', ');
      }
      return { name: p.name, type: inferProductType(p.name), actives };
    } catch {
      return { name: p.name, type: inferProductType(p.name), actives: '' };
    }
  }));

  return enriched.filter(p => p.name);
}

function inferProductType(name) {
  const lower = name.toLowerCase();
  if (/cleanser|temizleyici|wash|foam|gel|micellar/.test(lower)) return 'Temizleyici';
  if (/toner|tonik/.test(lower)) return 'Tonik';
  if (/essence|esans/.test(lower)) return 'Esans';
  if (/serum/.test(lower)) return 'Serum';
  if (/cream|krem|moisturizer|nemlendirici|lotion|emulsion/.test(lower)) {
    if (/eye|göz/.test(lower)) return 'Göz Kremi';
    return 'Nemlendirici';
  }
  if (/spf|sunscreen|sun cream|güneş/.test(lower)) return 'SPF';
  if (/mask|maske/.test(lower)) return 'Maske';
  if (/exfoliant|peeling|aha|bha|scrub/.test(lower)) return 'Eksfoliant';
  if (/spot|patch|treatment/.test(lower)) return 'Spot Tedavi';
  if (/oil|yağ/.test(lower)) return 'Yağ';
  return 'Serum';
}
