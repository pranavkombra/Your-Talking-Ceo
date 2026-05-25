<<<<<<< HEAD
# Maneuver Voice AI — Talk to Founder

A full-stack voice AI application that lets prospects have a natural conversation with **Alex**, founder of **Maneuver**. Alex runs discovery (who you are, your problem, timeline, budget) and answers questions about Maneuver — with visuals that appear in sync with the voice via LiveKit RPC.

## Architecture

```
┌─────────────────┐     WebRTC audio      ┌──────────────────────────────┐
│  React frontend │ ◄──────────────────► │  LiveKit room                │
│  (agent-starter)│     LiveKit RPC      │  + Python agent (Alex)       │
│  Visual panel   │ ◄─────────────────── │  Deepgram → Groq → Cartesia  │
└─────────────────┘                      └──────────────┬───────────────┘
                                                        │
                                                        ▼
                                                 leads.json (live capture)
```

**Flow:** User speaks → Deepgram STT (nova-2) → Groq LLM (llama-3.3-70b) decides reply + tool calls → Cartesia TTS speaks → RPC updates React visual panel instantly.

**Two modes in one agent:**
- **Discovery** — conversational lead capture, saved live to `leads.json`
- **Q&A** — answers from `agent/maneuver_kb.md`, triggers slides/diagrams via tools

## Project structure

```
maneuver-voice-ai/
├── agent/           # Python LiveKit agent
│   ├── main.py      # Entry point, voice pipeline, session setup
│   ├── prompts.py   # Alex system instructions
│   ├── tools.py     # RPC tools + lead storage
│   └── maneuver_kb.md
├── frontend/        # React app (agent-starter-react base)
├── leads.json       # Captured leads (updated live during calls)
└── README.md
```

## Prerequisites

- [LiveKit Cloud](https://cloud.livekit.io) project (or self-hosted LiveKit server)
- API keys: **Deepgram**, **Groq**, **Cartesia**
- Python 3.10+
- Node.js 18+ and [pnpm](https://pnpm.io)

## Setup

### 1. Clone and configure environment

```bash
cd maneuver-voice-ai
```

Copy env files and fill in your keys:

```bash
# Agent
cp agent/.env.example agent/.env.local

# Frontend
cp frontend/.env.local.example frontend/.env.local
```

Use the **same** LiveKit URL, API key, and secret in both files.

**Agent** (`agent/.env.local`):

| Variable | Description |
|----------|-------------|
| `LIVEKIT_URL` | WebSocket URL from LiveKit Cloud |
| `LIVEKIT_API_KEY` | LiveKit API key |
| `LIVEKIT_API_SECRET` | LiveKit API secret |
| `DEEPGRAM_API_KEY` | Deepgram API key |
| `GROQ_API_KEY` | Groq API key |
| `CARTESIA_API_KEY` | Cartesia API key |

**Frontend** (`frontend/.env.local`):

| Variable | Description |
|----------|-------------|
| `LIVEKIT_URL` | Same as agent |
| `LIVEKIT_API_KEY` | Same as agent |
| `LIVEKIT_API_SECRET` | Same as agent |
| `AGENT_NAME` | `maneuver-alex` (must match `main.py`) |

### 2. Install and run the agent

```bash
cd agent
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python main.py dev
```

The agent registers as `maneuver-alex` and waits for room jobs from LiveKit.

### 3. Install and run the frontend

In a **second terminal**:

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), click **Talk to Alex**, and allow microphone access.

## Model choices

| Component | Choice | Why |
|-----------|--------|-----|
| **STT** | Deepgram nova-2 | Strong real-time accuracy and low latency for conversational English; handles natural pauses well. |
| **LLM** | Groq llama-3.3-70b-versatile | Fast inference keeps voice turns snappy; 70B quality for natural founder-style dialogue and reliable tool calling. |
| **TTS** | Cartesia sonic-3 | Natural, low-latency speech that fits a warm founder persona; streams well with LiveKit Agents. |
| **Turn detection** | Silero VAD + LiveKit multilingual model | Reduces talking over the user; supports interruption and graceful endpointing. |

## Visual RPC tools

Defined in `agent/tools.py`, handled in `frontend/hooks/useManeuverRpc.tsx`:

| Tool | Frontend effect |
|------|-----------------|
| `show_services_slide()` | All service cards |
| `show_service_detail(name)` | Zoom into one service |
| `show_process_diagram()` | 5-step process |
| `show_case_studies()` | Case study cards |
| `update_lead_field(field, value)` | Live lead panel + `leads.json` |

## Lead capture

Each call creates a new entry in `leads.json`:

```json
{
  "leads": [
    {
      "name": "",
      "company": "",
      "problem": "",
      "timeline": "",
      "budget": "",
      "timestamp": "2026-05-20T12:00:00+00:00"
    }
  ]
}
```

Fields update live as Alex learns them during discovery.

## Behavior notes

- **Silence:** After ~10 seconds with no speech, Alex gently checks if you're still there (`user_away_timeout=10`).
- **Interruption:** User can interrupt while Alex is speaking; the pipeline supports barge-in.
- **Errors:** Frontend shows toast alerts on agent failure; RPC errors appear in the visual panel.

## What we'd build next (one more week)

1. **CRM webhook** — push qualified leads to HubSpot/Notion when discovery is complete
2. **Post-call email** — summary + next steps sent automatically
3. **Analytics dashboard** — call duration, fields captured, Q&A topics
4. **Multi-language** — extend STT/LLM for Hindi and other markets Maneuver serves
5. **Production auth** — secure token endpoint and rate limiting before public launch

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Agent doesn't join | Ensure `python main.py dev` is running and `AGENT_NAME=maneuver-alex` matches |
| No audio | Click "Start Audio" if browser blocks autoplay; check mic permissions |
| RPC visuals missing | Confirm you're connected; check browser console for RPC registration |
| API errors | Verify all API keys in `agent/.env.local` |

IF I HAD 1 MORE WEEK, I WOULD DO THIS:
1️⃣ INTELLIGENT SERVICE POPUPS
While users are mid-conversation, the AI would intelligently trigger relevant service popups based on what they're saying — no interrupting, just smart contextual suggestions.

2️⃣ BUSINESS-RELEVANT VOICE
I would add deep configuration prompts to customize the voice tone, personality, and industry jargon so it sounds exactly like your business — whether luxury or tech.

3️⃣ FULLY CONFIGURABLE PROMPT ENGINE
The AI would learn your business rules and response guidelines, adapting to your specific industry needs through prompt injection.



=======
# Your-Talking-Ceo (PRANAV K S)
>>>>>>> ed5c31bcb171615e717a47f032e98e89d35448b1
