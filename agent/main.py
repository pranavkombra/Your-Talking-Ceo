"""Maneuver 'Talk to Founder' voice agent — Alex."""

from __future__ import annotations

import asyncio
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    UserStateChangedEvent,
    cli,
    room_io,
)
from livekit.plugins import deepgram, groq
from livekit.plugins import silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from prompts import build_instructions, load_knowledge_base
from tools import LeadStore, ManeuverTools, RpcClient

logger = logging.getLogger("maneuver.agent")

# Load env — .env.local overrides .env (same pattern as Next.js frontend)
ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")
load_dotenv(ROOT / ".env.local", override=True)

LEADS_PATH = ROOT / "leads.json"

# Room name from environment or default
ROOM_NAME = os.getenv("LIVEKIT_ROOM", "maneuver-room")


class AlexAgent(Agent):
    """Alex — Maneuver founder voice agent with discovery + Q&A modes."""

    def __init__(self, room: rtc.Room, lead_store: LeadStore) -> None:
        kb = load_knowledge_base()
        
        # Create ManeuverTools instance to access the decorated methods
        tools_provider = ManeuverTools()
        tools_provider.rpc = RpcClient(room)
        tools_provider.lead_store = lead_store
        
        # Collect all @function_tool() decorated methods
        tools = [
            tools_provider.show_services_slide,
            tools_provider.show_process_diagram,
            tools_provider.show_case_studies,
            tools_provider.update_lead_field,
        ]

        super().__init__(
            instructions=build_instructions(kb),
            tools=tools,
        )


server = AgentServer()


def prewarm(proc: JobProcess) -> None:
    """Load VAD model once per worker process."""
    try:
        logger.info("🔄 Prewarming worker process - loading VAD model...")
        vad_model = silero.VAD.load()
        proc.userdata["vad"] = vad_model
        logger.info("✅ VAD model loaded successfully")
    except Exception as exc:
        logger.error(f"❌ PREWARM FAILED: {exc}", exc_info=True)
        raise


server.setup_fnc = prewarm


@server.rtc_session(agent_name="maneuver-alex")
async def maneuver_agent(ctx: JobContext) -> None:
    ctx.log_context_fields = {"room": ctx.room.name}
    
    # Set the room name if not already set
    if not ctx.room.name:
        ctx.room.name = ROOM_NAME
    
    logger.info(f"🚀 Agent starting for room: {ctx.room.name}")
    
    # Verify API keys are loaded
    api_keys_status = {
        "DEEPGRAM_API_KEY": bool(os.getenv("DEEPGRAM_API_KEY")),
        "GROQ_API_KEY": bool(os.getenv("GROQ_API_KEY")),
        "LIVEKIT_API_KEY": bool(os.getenv("LIVEKIT_API_KEY")),
        "LIVEKIT_API_SECRET": bool(os.getenv("LIVEKIT_API_SECRET")),
    }
    logger.info(f"📋 API Keys Status: {api_keys_status}")
    
    # Check critical keys
    critical_keys = ["DEEPGRAM_API_KEY", "GROQ_API_KEY", 
                     "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"]
    missing_critical = [key for key in critical_keys if not api_keys_status[key]]
    
    if missing_critical:
        error_msg = f"❌ Missing critical API keys: {', '.join(missing_critical)}"
        logger.error(error_msg)
        raise ValueError(error_msg)

    try:
        lead_store = LeadStore(LEADS_PATH)
        lead_store.start_session()
        logger.info("📝 Lead store initialized")

        logger.info("🎤 Initializing voice pipeline...")
        
        # Get VAD model with fallback
        vad_model = ctx.proc.userdata.get("vad")
        if not vad_model:
            logger.warning("⚠️ VAD model not prewarmed, loading now...")
            vad_model = silero.VAD.load()
            ctx.proc.userdata["vad"] = vad_model
        
        # Voice pipeline: Deepgram STT → Groq LLM → Deepgram TTS
        session = AgentSession(
            stt=deepgram.STT(
                model="nova-2",
                language="en-US",
                interim_results=True,
                smart_format=True,
                punctuate=True,
            ),
            llm=groq.LLM(
                model="llama-3.1-8b-instant",
                temperature=0.7,
            ),
            tts=deepgram.TTS(
                model="aura-asteria-en",
            ),
            turn_detection=MultilingualModel(),
            vad=vad_model,
            preemptive_generation=True,
            user_away_timeout=10.0,
        )
        logger.info("✅ Voice pipeline created")

        agent = AlexAgent(room=ctx.room, lead_store=lead_store)
        logger.info("✅ Agent instance created")

        @session.on("user_state_changed")
        def on_user_state_changed(ev: UserStateChangedEvent) -> None:
            logger.info(f"👤 User state changed: {ev.old_state} → {ev.new_state}")
            if ev.new_state == "away":
                # session.say() returns a SpeechHandle, not a coroutine
                # Just call it without wrapping
                session.say("Hey, you still there? No worries — just wanted to check in. Ready when you are!")

        # Start the session and connect — this must complete before any audio operations
        logger.info("🔗 Starting session.start()...")
        await session.start(
            agent=agent,
            room=ctx.room,
            room_options=room_io.RoomOptions(
                audio_input=room_io.AudioInputOptions(),
            ),
        )
        logger.info("✅ session.start() completed successfully")

        # Ensure the agent is fully connected before attempting to speak
        await asyncio.sleep(0.5)  # Brief pause to ensure session is ready
        
        logger.info(f"✅ Agent connected and waiting in room: {ctx.room.name}")

        # Alex opens the call naturally — only after session is fully initialized
        logger.info("🗣️ Agent speaking opening line...")
        await session.say(
            "Hey there! I'm Alex, founder of Maneuver. Really excited to chat with you. "
            "Who am I speaking with? And what are you working on?"
        )
        logger.info("✅ Opening line delivered")

    except Exception as exc:
        logger.error(f"❌ INITIALIZATION FAILED: {exc}", exc_info=True)
        raise


if __name__ == "__main__":
    cli.run_app(server)