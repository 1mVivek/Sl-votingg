# 🗳️ Cute Voting App

Secure voting app with Vercel serverless backend. API keys never touch the frontend.

## Project Structure

```
voting-app/
├── index.html          ← Frontend (zero secrets)
├── vercel.json         ← Vercel routing config
├── api/
│   ├── votes.js        ← GET  /api/votes        (public vote counts)
│   ├── check-voter.js  ← POST /api/check-voter  (verify name)
│   └── vote.js         ← POST /api/vote         (cast vote, server-validated)
└── README.md
```

## Setup

### 1. JSONBin — set initial data

Open your bin and set this as the record:

```json
{
  "allowed_voters": ["Batman", "Mimileni", "Pretty"],
  "votes": { "p1": 0, "p2": 0, "p3": 0 },
  "voted": []
}
```

Add/remove names from `allowed_voters` anytime to control who can vote.

### 2. Vercel — add environment variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these two:

| Name               | Value                                              |
|--------------------|----------------------------------------------------|
| `JSONBIN_API_KEY`  | `` |
| `JSONBIN_BIN_ID`   | ``                         |

### 3. Deploy

```bash
npm i -g vercel
vercel --prod
```

Or connect your GitHub repo to Vercel for auto-deploy.

## Security model

| What                          | How                                          |
|-------------------------------|----------------------------------------------|
| API key hidden                | Lives only in Vercel env vars                |
| Voter list hidden             | Server never returns `allowed_voters`        |
| Double-vote prevention        | Server checks `voted[]` before saving        |
| Invalid candidate blocked     | Server validates `candidateId` whitelist     |
| Race condition safe           | Fresh fetch-then-write on every vote request |
