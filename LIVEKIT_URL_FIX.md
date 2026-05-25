# Fix for "LIVEKIT_URL is not defined" Error

## Issue
The frontend dev server is trying to read environment variables from `.env.local` but they're not loaded yet.

## Root Cause
- Next.js caches environment variables at startup
- The dev server needs to be restarted after `.env.local` is created/modified

## Solution

### Step 1: Verify `.env.local` has correct values
Your `frontend/.env.local` should contain:

```env
LIVEKIT_URL=wss://maneuver-voice-3vqgrhi4.livekit.cloud
LIVEKIT_API_KEY=APIGRugyp6vM4Sz
LIVEKIT_API_SECRET=MpqIK00I9cnAWKeqWRSBLWWb6HfXaJ4osAff5zR6oIIA
AGENT_NAME=maneuver-alex
NEXT_PUBLIC_CEO_PHOTO_URL=
NEXT_PUBLIC_APP_CONFIG_ENDPOINT=
SANDBOX_ID=
```

✅ These values are already set in your `.env.local` file.

### Step 2: Clear Next.js Cache
```bash
cd frontend
rm -r .next        # Clear build cache
```

✅ This has been done.

### Step 3: Start Fresh Dev Server
```bash
cd frontend
pnpm dev
# or: npm run dev
```

**Important**: The dev server will:
1. Read `.env.local` file on startup
2. Make NEXT_PUBLIC_* variables available in the browser
3. Load environment variables into `process.env` for API routes

### Step 4: Test the Fix
1. Visit `http://localhost:3000`
2. Click "Talk to Alex" button
3. Should see loading indicator
4. Token endpoint will now have LIVEKIT_URL defined
5. Will connect to LiveKit and dispatch to "maneuver-alex" agent

---

## API Endpoint Flow

```
Browser Request:
  ↓
GET /api/token
  ↓
Token Route (route.ts):
  - Reads process.env.LIVEKIT_URL ✅ (from .env.local)
  - Reads process.env.LIVEKIT_API_KEY ✅ (from .env.local)
  - Reads process.env.LIVEKIT_API_SECRET ✅ (from .env.local)
  - Reads process.env.AGENT_NAME ✅ (from .env.local)
  - Generates JWT with agent dispatch
  ↓
Returns ConnectionDetails:
  {
    serverUrl: "wss://maneuver-voice-3vqgrhi4.livekit.cloud",
    roomName: "voice_assistant_room_...",
    participantToken: "JWT_TOKEN_WITH_AGENT_DISPATCH",
    participantName: "user"
  }
  ↓
Browser connects to LiveKit
  ↓
LiveKit dispatches to "maneuver-alex" agent
  ↓
Python agent receives connection
```

---

## Environment Variables Reference

| Variable | Location | Purpose | Value |
|----------|----------|---------|-------|
| `LIVEKIT_URL` | `.env.local` | LiveKit server URL | `wss://maneuver-voice-3vqgrhi4.livekit.cloud` |
| `LIVEKIT_API_KEY` | `.env.local` | LiveKit API auth | `APIGRugyp6vM4Sz` |
| `LIVEKIT_API_SECRET` | `.env.local` | LiveKit API auth | `MpqIK00I9cnAWKeqWRSBLWWb6HfXaJ4osAff5zR6oIIA` |
| `AGENT_NAME` | `.env.local` | Agent to dispatch to | `maneuver-alex` |
| `NEXT_PUBLIC_CEO_PHOTO_URL` | `.env.local` | (Optional) CEO photo | Leave empty or add CDN URL |

**All values must match between `agent/.env` and `frontend/.env.local`** ✅

---

## Verification Checklist

- [ ] `.env.local` exists in `/frontend` with all values
- [ ] Build cache cleared (`rm -r .next`)
- [ ] Run `pnpm dev` in `/frontend`
- [ ] Visit `http://localhost:3000`
- [ ] Click "Talk to Alex" button
- [ ] Token endpoint returns without error
- [ ] Frontend connects to LiveKit
- [ ] Python agent receives connection

---

## If Still Having Issues

### Check 1: Verify .env.local exists and has values
```bash
cd frontend
cat .env.local
```

Should show:
```
LIVEKIT_URL=wss://maneuver-voice-3vqgrhi4.livekit.cloud
LIVEKIT_API_KEY=APIGRugyp6vM4Sz
...
```

### Check 2: Look at token endpoint in browser console
```javascript
// Browser console - when you click "Talk to Alex":
// You should see the token request being made
```

### Check 3: Check Next.js console for errors
```bash
# Terminal running: pnpm dev
# Should show no errors when starting
# Should show successful API route when clicking button
```

### Check 4: Verify agent is running
```bash
cd agent
python main.py
# Should show: ✅ Agent started for room: maneuver-room
```

---

## Quick Start

```bash
# Terminal 1: Python Agent
cd agent
source .venv/Scripts/activate
python main.py

# Terminal 2: Frontend
cd frontend
pnpm dev

# Browser: Visit http://localhost:3000
```

Then click **"Talk to Alex"** to start the voice session! 🎤
