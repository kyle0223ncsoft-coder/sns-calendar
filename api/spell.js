module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'No text provided' });

  try {
    const response = await fetch('https://speller.town', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      return res.status(502).json({ error: '맞춤법 서버 오류: ' + response.status });
    }

    const data = await response.json();
    const suggestions = data.suggestions || [];

    if (suggestions.length === 0) {
      return res.status(200).json({ corrected: text, changed: false });
    }

    // start/end 기반으로 뒤에서부터 교체
    let corrected = text;
    const sorted = [...suggestions].sort((a, b) => b.start - a.start);
    for (const s of sorted) {
      if (s.candidates && s.candidates.length > 0) {
        corrected = corrected.slice(0, s.start) + s.candidates[0] + corrected.slice(s.end);
      }
    }

    res.status(200).json({ corrected, changed: corrected !== text });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
