# Maneuver Frontend Setup Complete ✅

## What Was Done

### 1. ✅ Template Integration
- Cloned LiveKit agent-starter-react template
- Replaced entire frontend folder with fresh template
- Configured for Maneuver branding

### 2. ✅ Environment Configuration
- Updated `.env.local` with agent dispatch settings
- Set `AGENT_NAME=maneuver-alex` to route to your Python agent
- Set LiveKit credentials (same as agent/.env)

### 3. ✅ Branding & Design
- **Colors**: Dark background (#0a0a0a) + Gold accent (#c8a96e)
- **Fonts**: DM Serif Display (headings) + DM Sans (body)
- **UI Components**: 
  - Hero section with company tagline
  - Voice agent showcase for "Alex"
  - Services listing (5 service categories)
  - CEO/Founder section with bio
  - Company footer with contact info & stats

### 4. ✅ Company Information
Embedded all company details:
- Name: Maneuver
- Tagline: "Fortune 500 AI thinking. Built for SMBs."
- Services: Intelligent Workflows, Voice AI, Self-Learning Agents, Bespoke Apps, Systems Integration
- Contact: husain@maneuver.ae | +971 58 284 9985
- Stats: 6+ Countries, 10+ Projects, 5+ Industries, 100% Retention
- CEO: Husain Topiwala with LinkedIn profile

### 5. ✅ Voice Agent Integration
- Single agent mode: "Alex"
- Agent name: `maneuver-alex` (matches agent/main.py)
- Token route: `/api/token` (generates JWT with agent dispatch)
- Ready for 24/7 English/Arabic support

## Required Environment Variables

Fill these in `frontend/.env.local`:

```env
# Your LiveKit Cloud credentials
LIVEKIT_URL=wss://maneuver-voice-3vqgrhi4.livekit.cloud
LIVEKIT_API_KEY=APIGRugyp6vM4Sz
LIVEKIT_API_SECRET=MpqIK00I9cnAWKeqWRSBLWWb6HfXaJ4osAff5zR6oIIA

# Agent dispatch - DO NOT CHANGE
AGENT_NAME=maneuver-alex

# Optional: CEO photo URL (CDN URL for Husain's photo)
NEXT_PUBLIC_CEO_PHOTO_URL=https://your-cdn.com/husain-photo.jpg
```

**Values are already filled in from agent/.env - just verify they match!**

## How It Works

1. **Frontend** (React/Next.js):
   - User clicks "Talk to Alex" button
   - Requests `/api/token` endpoint
   - Frontend receives LiveKit token with agent dispatch: `agents: [{ agent_name: "maneuver-alex" }]`
   - Connects to LiveKit room

2. **Agent Dispatch** (LiveKit):
   - LiveKit routes connection to agent named "maneuver-alex"

3. **Backend** (Python):
   - Your agent with `@server.rtc_session(agent_name="maneuver-alex")` receives connection
   - Session uses: Deepgram STT/TTS, Groq LLM, Silero VAD
   - Processes voice in English/Arabic

## Running Everything

### Terminal 1: Start Python Agent
```bash
cd agent
source .venv/Scripts/activate
python main.py
```

### Terminal 2: Start Frontend
```bash
cd frontend
pnpm install  # (already running)
pnpm dev      # or: npm run dev
```

Then visit: **http://localhost:3000**

## File Changes Summary

✅ **Created/Updated**:
- `frontend/app-config.ts` - Branding & company info
- `frontend/styles/globals.css` - Maneuver colors (dark + gold)
- `frontend/app/layout.tsx` - Added DM Serif + DM Sans fonts
- `frontend/components/app/welcome-view.tsx` - Full Maneuver homepage
- `frontend/.env.local` - Agent dispatch config
- `frontend/.env.example` - Documentation

❌ **Untouched**:
- `agent/` - Python code untouched
- `agent/main.py` - Agent logic preserved
- `agent/.env` - Agent config preserved

## Next Steps

1. **Install dependencies** (currently running: `pnpm install`)
2. **Verify env variables** match agent/.env
3. **Start frontend**: `pnpm dev` in /frontend
4. **Test connection**:
   - Navigate to http://localhost:3000
   - Click "Talk to Alex"
   - Should connect to your Python agent

## Troubleshooting

**If frontend won't connect:**
- Verify LIVEKIT_URL, API_KEY, API_SECRET match agent/.env
- Check agent is running: `python agent/main.py`
- Verify AGENT_NAME=maneuver-alex in both configs

**If agent doesn't respond:**
- Check Python agent console for errors
- Verify Deepgram/Groq API keys in agent/.env
- Check LiveKit Cloud dashboard for room creation

## Design Details

- **Hero**: "Fortune 500 AI thinking. Built for SMBs." with full company description
- **Alex Section**: Large microphone button with 24/7 availability message
- **Services**: 5-column grid of service offerings
- **CEO Bio**: Husain Topiwala's profile with LinkedIn link + optional photo
- **Footer**: Contact info, quick links, company stats

All text is directly editable in `frontend/app-config.ts`!
