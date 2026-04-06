export default async function handler(req, res) {
  // Allow CORS from anywhere (our own frontend)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { username } = req.query;

  if (!username || username.trim() === '') {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const url = `https://api.sololearn.com/v2/search?query=${encodeURIComponent(username.trim())}&type=user&index=0&count=5`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'SoloLearn API error', found: false });
    }

    const data = await response.json();
    const users = data?.data?.users || [];

    // Exact match — case insensitive
    const match = users.find(
      u => u.name.toLowerCase() === username.trim().toLowerCase()
    );

    if (match) {
      return res.status(200).json({
        found: true,
        name: match.name,         // exact SL name
        id: match.id,
        avatarUrl: match.avatarUrl || null,
      });
    } else {
      return res.status(200).json({ found: false });
    }

  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: 'Internal error', found: false });
  }
}
