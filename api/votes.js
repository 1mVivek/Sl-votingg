// api/votes.js
// GET /api/votes  → public vote counts
// No API key exposed to client

const BIN_URL = `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}/latest`;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const r = await fetch(BIN_URL, {
      headers: {
        'X-Master-Key': process.env.JSONBIN_API_KEY,
      },
    });

    if (!r.ok) throw new Error('JSONBin fetch failed: ' + r.status);

    const json = await r.json();
    const data = json.record;

    // Only return vote counts — never expose allowed_voters or voted list
    return res.status(200).json({
      votes: data.votes || { p1: 0, p2: 0, p3: 0 },
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

