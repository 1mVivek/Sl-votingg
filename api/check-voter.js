// api/check-voter.js
// POST /api/check-voter  { name: "Vivek" }
// Returns: { allowed: true/false, hasVoted: true/false }

const BIN_URL_BASE = `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.body || {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name is required' });
  }

  const nameLower = name.trim().toLowerCase();

  try {
    const r = await fetch(BIN_URL_BASE + '/latest', {
      headers: { 'X-Master-Key': process.env.JSONBIN_API_KEY },
    });
    if (!r.ok) throw new Error('JSONBin fetch failed');

    const data = (await r.json()).record;
    const allowed = (data.allowed_voters || []).map(v => v.toLowerCase());
    const voted   = (data.voted         || []).map(v => v.toLowerCase());

    const isAllowed  = allowed.includes(nameLower);
    const hasVoted   = isAllowed && voted.includes(nameLower);

    return res.status(200).json({ allowed: isAllowed, hasVoted });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
