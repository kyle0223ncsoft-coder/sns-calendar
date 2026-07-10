module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return res.status(500).json({ error: 'Webhook URL not configured' });

  const { type, evName, region, platform, assignee, reviewer, date } = req.body;

  const REGION_LABEL = {
    common:'전 권역 공통', game:'전 권역 공통', fun:'전 권역 공통',
    kr:'KR 단독', jp:'JP 단독', en:'EN 단독', tw:'TW 단독'
  };

  let text = '';
  let color = '';
  let emoji = '';

  if (type === 'review_request') {
    emoji = '📋';
    color = '#F59E0B';
    text = `*검수 요청*\n*소재:* ${evName}\n*권역:* ${REGION_LABEL[region]||region}\n*플랫폼:* ${platform}\n*담당자:* ${assignee||'-'}\n*날짜:* ${date}`;
  } else if (type === 'approved') {
    emoji = '✅';
    color = '#10B981';
    text = `*검수 승인*\n*소재:* ${evName}\n*권역:* ${REGION_LABEL[region]||region}\n*플랫폼:* ${platform}\n*검수자:* ${reviewer||'-'}\n*날짜:* ${date}`;
  } else if (type === 'rejected') {
    emoji = '❌';
    color = '#EF4444';
    text = `*검수 반려*\n*소재:* ${evName}\n*권역:* ${REGION_LABEL[region]||region}\n*플랫폼:* ${platform}\n*검수자:* ${reviewer||'-'}\n*날짜:* ${date}`;
  } else if (type === 'live') {
    emoji = '🚀';
    color = '#6366F1';
    text = `*라이브 완료*\n*소재:* ${evName}\n*권역:* ${REGION_LABEL[region]||region}\n*플랫폼:* ${platform}\n*날짜:* ${date}`;
  } else {
    return res.status(400).json({ error: 'Unknown type' });
  }

  const payload = {
    attachments: [{
      color,
      text: `${emoji} ${text}`,
      footer: 'BMW · Global SNS Calendar',
      ts: Math.floor(Date.now() / 1000)
    }]
  };

  try {
    const r = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) return res.status(502).json({ error: 'Slack error: ' + r.status });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
