// api/vote.js
// POST /api/vote  { name: "Vivek", candidateId: "p1" }
// All validation happens server-side — client never touches JSONBin

const BIN_URL_BASE = `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`;
const VALID_CANDIDATES = ['p1', 'p2', 'p3'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, candidateId } = req.body || {};

  // Input validation
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!VALID_CANDIDATES.includes(candidateId)) {
    return res.status(400).json({ error: 'Invalid candidate' });
  }

  const nameLower = name.trim().toLowerCase();

  const jsonbinHeaders = {
    'Content-Type': 'application/json',
    'X-Master-Key': process.env.JSONBIN_API_KEY,
  };

  try {
    // 1. Fetch current state
    const fetchRes = await fetch(BIN_URL_BASE + '/latest', {
      headers: jsonbinHeaders,
    });
    if (!fetchRes.ok) throw new Error('Could not fetch data');
    const data = (await fetchRes.json()).record;

    const allowed = (data.allowed_voters || []).map(v => v.toLowerCase());
    const voted   = (data.voted         || []).map(v => v.toLowerCase());

    // 2. Server-side checks — client cannot bypass these
    if (!allowed.includes(nameLower)) {
      return res.status(403).json({ error: 'Voter not on the list' });
    }
    if (voted.includes(nameLower)) {
      return res.status(409).json({ error: 'Already voted' });
    }

    // 3. Apply vote
    data.votes = data.votes || {};
    data.votes[candidateId] = (data.votes[candidateId] || 0) + 1;
    data.voted = [...(data.voted || []), nameLower];

    // 4. Save back
    const putRes = await fetch(BIN_URL_BASE, {
      method: 'PUT',
      headers: jsonbinHeaders,
      body: JSON.stringify(data),
    });
    if (!putRes.ok) throw new Error('Could not save vote');

    return res.status(200).json({
      success: true,
      votes: data.votes,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
