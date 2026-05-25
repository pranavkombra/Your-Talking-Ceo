# Quick Fix: "LIVEKIT_URL is not defined" Error ⚡

## The Problem
```
Error generating token from endpoint /api/token: received 500 / LIVEKIT_URL is not defined
```

## The Solution (3 Steps)

### 1️⃣ Verify `.env.local` Exists
Your file is already at: `frontend/.env.local`

It should have:
```env
LIVEKIT_URL=wss://maneuver-voice-3vqgrhi4.livekit.cloud
LIVEKIT_API_KEY=APIGRugyp6vM4Sz
LIVEKIT_API_SECRET=MpqIK00I9cnAWKeqWRSBLWWb6HfXaJ4osAff5zR6oIIA
AGENT_NAME=maneuver-alex
```

✅ All values are already set!

### 2️⃣ Kill Old Dev Server
If you had the frontend running before:
- Stop it (Ctrl+C in terminal)
- This is important!

### 3️⃣ Start Fresh Dev Server
```bash
cd frontend
pnpm dev
```

**Wait for it to start** - you should see:
```
▲ Next.js 15.5.18
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

Then visit `http://localhost:3000` ✅

---

## Why This Works

Next.js loads `.env.local` **only when the dev server starts**. If:
- You created `.env.local` AFTER the dev server was running → it won't load the variables
- You restart the dev server → it WILL load them

**That's why you're getting "LIVEKIT_URL is not defined"** — the old dev server instance doesn't see the new file.

---

## Immediate Action Items

```bash
# 1. Go to frontend folder
cd c:\Users\google\Downloads\maneuver-voice-ai\frontend

# 2. Stop any running dev server (Ctrl+C)

# 3. Start fresh dev server
pnpm dev

# 4. Wait for "ready" message, then visit http://localhost:3000
```

Done! The token endpoint will now work. ✅

---

## If It Still Doesn't Work

Check the `.env.local` file content:
```bash
cat frontend/.env.local
```

You should see all 4 variables with values (not empty).

If any are empty or missing, add them:
```env
LIVEKIT_URL=wss://maneuver-voice-3vqgrhi4.livekit.cloud
LIVEKIT_API_KEY=APIGRugyp6vM4Sz
LIVEKIT_API_SECRET=MpqIK00I9cnAWKeqWRSBLWWb6HfXaJ4osAff5zR6oIIA
AGENT_NAME=maneuver-alex
```

Then restart: `pnpm dev`

---

## Next: Start Both Servers

```bash
# Terminal 1: Python Agent
cd agent
python main.py

# Terminal 2: Frontend
cd frontend
pnpm dev

# Browser: http://localhost:3000
# Click: "Talk to Alex" → Should work now! 🎤
```
