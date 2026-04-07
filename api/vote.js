export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { username, candidate } = req.body || {};

    // 🔐 Input validation
    if (
      typeof username !== "string" ||
      typeof candidate !== "string" ||
      username.trim().length < 2 ||
      username.length > 30
    ) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const user = username.toLowerCase().trim();

    // 🔒 Whitelist
    const ALLOWED_USERS = ["vivek", "mimileni", "batman", "pretty"];

    if (!ALLOWED_USERS.includes(user)) {
      return res.status(403).json({ error: "❌ You are not allowed to vote" });
    }

    const BIN_ID = process.env.BIN_ID;
    const API_KEY = process.env.JSONBIN_KEY;
    const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

    // 📥 Fetch latest
    const r = await fetch(BIN_URL + "/latest", {
      headers: { "X-Master-Key": API_KEY }
    });

    if (!r.ok) throw new Error("Fetch failed");

    const data = await r.json();

    if (!data.votes) data.votes = {};
    if (!Array.isArray(data.voted_users)) data.voted_users = [];

    // 🔁 Prevent duplicate vote
    const already = data.voted_users.find(
      v => v.username.toLowerCase() === user
    );

    if (already) {
      return res.status(409).json({ error: "⚠️ You already voted!" });
    }

    // 📊 Update vote
    data.votes[candidate] = (data.votes[candidate] || 0) + 1;

    data.voted_users.push({
      username: user,
      voted_for: candidate,
      time: new Date().toISOString()
    });

    // 📤 Save
    const update = await fetch(BIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify(data)
    });

    if (!update.ok) throw new Error("Update failed");

    return res.json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
