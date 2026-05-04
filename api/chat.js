export default async function handler(req, res) {
  // Sadece POST isteklerini kabul et (güvenlik için)
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Sadece POST isteği atabilirsin.' });
  }

  const { prompt } = req.body; // Siteden gelen soru
  const apiKey = process.env.GEMINI_API_KEY; // Şifreli anahtarın

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    const data = await response.json();
    // Gemini'den gelen cevabı temizleyip geri gönderiyoruz
    const aiResponse = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: aiResponse });
    
  } catch (error) {
    res.status(500).json({ error: "Bir şeyler ters gitti." });
  }
}