"""Maneuver 'Talk to Founder' voice agent — Alex."""

from __future__ import annotations

import asyncio
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from livekit import api, rtc
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
from livekit.plugins import cartesia, deepgram, groq
from livekit.plugins import silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from prompts import build_instructions, load_knowledge_base
from tools import LeadStore, ManeuverTools, RpcClient

logger = logging.getLogger("maneuver.agent")

# Load env from project root and agent folder
ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")

LEADS_PATH = ROOT / "leads.json"

# Room name from environment or default
ROOM_NAME = os.getenv("LIVEKIT_ROOM", "maneuver-room")


class AlexAgent(ManeuverTools, Agent):
    """Alex — Maneuver founder voice agent with discovery + Q&A modes."""

    def __init__(self, room: rtc.Room, lead_store: LeadStore) -> None:
        self.rpc = RpcClient(room)
        self.lead_store = lead_store
        kb = load_knowledge_base()

        super().__init__(
            instructions=build_instructions(kb),
        )


server = AgentServer()


def prewarm(proc: JobProcess) -> None:
    """Load VAD model once per worker process."""
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="maneuver-alex")
async def maneuver_agent(ctx: JobContext) -> None:
    ctx.log_context_fields = {"room": ctx.room.name}
    
    # Set the room name if not already set
    if not ctx.room.name:
        ctx.room.name = ROOM_NAME
    
    logger.info(f"🚀 Agent starting for room: {ctx.room.name}")

    lead_store = LeadStore(LEADS_PATH)
    lead_store.start_session()

    # Voice pipeline: Deepgram STT → Groq LLM → Cartesia TTS
    session = AgentSession(
        stt=deepgram.STT(
            model="nova-2",
            language="en-US",
            interim_results=True,
            smart_format=True,
            punctuate=True,
        ),
        llm=groq.LLM(
            model="llama-3.3-70b-versatile",
            temperature=0.7,
        ),
        tts=cartesia.TTS(
            model="sonic",
            voice="a0e99841-438c-4a64-b679-ae501e7d6091",
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
        user_away_timeout=10.0,
    )

    agent = AlexAgent(room=ctx.room, lead_store=lead_store)

    @session.on("user_state_changed")
    def on_user_state_changed(ev: UserStateChangedEvent) -> None:
        if ev.new_state == "away":
            asyncio.create_task(
                session.say("Hey, you still there? No worries — just wanted to check in. Ready when you are!")
            )

    await session.start(
        agent=agent,
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(),
        ),
    )

    await ctx.connect()
    
    logger.info(f"✅ Agent connected and waiting in room: {ctx.room.name}")

    # Alex opens the call naturally
    await session.say(
        "Hey there! I'm Alex, founder of Maneuver. Really excited to chat with you. "
        "Who am I speaking with? And what are you working on?"
    )


if __name__ == "__main__":
    cli.run_app(server)