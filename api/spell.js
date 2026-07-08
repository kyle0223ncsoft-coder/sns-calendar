export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'No text provided' });

  try {
    const response = await fetch('https://speller.cs.pusan.ac.kr/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://speller.cs.pusan.ac.kr/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/javascript, */*',
      },
      body: new URLSearchParams({ text1: text }).toString(),
    });

    if (!response.ok) {
      return res.status(502).json({ error: '맞춤법 서버 오류: ' + response.status });
    }

    // 부산대 API 응답: JSON 배열
    // [{ "str": "교정된 문장", "errInfo": [...] }, ...]
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(200).json({ corrected: text, changed: false });
    }

    // 각 문단의 교정된 텍스트 합치기
    const corrected = data.map(item => item.str || '').join('\n');
    const changed = corrected !== text;

    res.status(200).json({ corrected, changed });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
