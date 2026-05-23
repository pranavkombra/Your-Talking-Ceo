"""LiveKit function tools + RPC helpers for the Maneuver visual frontend."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING, Any

from livekit.agents import RunContext, function_tool

if TYPE_CHECKING:
    from livekit import rtc

logger = logging.getLogger("maneuver.tools")

LEAD_FIELDS = frozenset({"name", "company", "problem", "timeline", "budget"})

SERVICE_NAMES = frozenset(
    {
        "Product Strategy",
        "UX/UI Design",
        "MVP Development",
        "Growth Consulting",
    }
)

# Payloads sent to the frontend via RPC (mirrors frontend/lib/maneuver-data.ts)
SERVICES_DATA: list[dict[str, str]] = [
    {
        "name": "Product Strategy",
        "tagline": "Clarity before code",
        "description": "Validate ideas, define roadmaps, and align user needs with business goals before you build.",
        "icon": "🎯",
    },
    {
        "name": "UX/UI Design",
        "tagline": "Interfaces people love",
        "description": "Research-driven design — wireframes, polished UI, and design systems that scale.",
        "icon": "✨",
    },
    {
        "name": "MVP Development",
        "tagline": "Ship in 6–8 weeks",
        "description": "Modern engineering to get your minimum viable product in users' hands fast.",
        "icon": "🚀",
    },
    {
        "name": "Growth Consulting",
        "tagline": "Scale what works",
        "description": "Analytics, onboarding, and growth experiments to turn launches into momentum.",
        "icon": "📈",
    },
]

PROCESS_DATA: list[dict[str, Any]] = [
    {"step": 1, "name": "Discover", "description": "Research users, market, and constraints"},
    {"step": 2, "name": "Define", "description": "Scope, metrics, and product definition"},
    {"step": 3, "name": "Design", "description": "UX flows and visual design"},
    {"step": 4, "name": "Develop", "description": "Quality engineering with check-ins"},
    {"step": 5, "name": "Deploy", "description": "Launch, measure, and hand off"},
]

CASE_STUDIES_DATA: list[dict[str, str]] = [
    {
        "title": "Funded startup 0→1",
        "metric": "3 startups",
        "description": "Built from strategy through MVP launch — all raised funding.",
    },
    {
        "title": "Enterprise redesign",
        "metric": "2 products",
        "description": "Improved usability, cut support tickets, and boosted adoption.",
    },
    {
        "title": "MVP sprint delivery",
        "metric": "6–8 weeks",
        "description": "Shipped launch-ready MVPs for founders who needed speed without sacrificing quality.",
    },
]


class LeadStore:
    """Persists lead data to leads.json as fields are captured live."""

    def __init__(self, path: Path) -> None:
        self._path = path
        self._current_lead_id: str | None = None

    def _load(self) -> dict:
        if not self._path.exists():
            return {"leads": []}
        return json.loads(self._path.read_text(encoding="utf-8"))

    def _save(self, data: dict) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._path.write_text(json.dumps(data, indent=2), encoding="utf-8")

    def start_session(self) -> dict:
        data = self._load()
        lead = {
            "name": "",
            "company": "",
            "problem": "",
            "timeline": "",
            "budget": "",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        data["leads"].append(lead)
        self._save(data)
        self._current_lead_id = str(len(data["leads"]) - 1)
        logger.info("Started new lead session: index=%s", self._current_lead_id)
        return lead

    def update_field(self, field: str, value: str) -> None:
        if field not in LEAD_FIELDS:
            raise ValueError(f"Invalid field: {field}")

        data = self._load()
        if not data["leads"]:
            self.start_session()
            data = self._load()

        index = int(self._current_lead_id) if self._current_lead_id is not None else len(data["leads"]) - 1
        data["leads"][index][field] = value.strip()
        self._save(data)
        logger.info("Updated lead[%s].%s", index, field)


class RpcClient:
    """Sends RPC calls from the agent to the user's browser for instant UI updates."""

    def __init__(self, room: rtc.Room) -> None:
        self._room = room

    def _user_identity(self) -> str | None:
        for participant in self._room.remote_participants.values():
            if "agent" not in participant.identity.lower():
                return participant.identity
        return None

    async def call(self, method: str, payload: dict | None = None) -> str:
        destination = self._user_identity()
        if not destination:
            logger.warning("No user participant found for RPC: %s", method)
            return "no_user"

        body = json.dumps(payload or {})
        try:
            result = await self._room.local_participant.perform_rpc(
                destination_identity=destination,
                method=method,
                payload=body,
                response_timeout=5.0,
            )
            logger.debug("RPC %s -> %s", method, result)
            return result
        except Exception as exc:
            logger.error("RPC %s failed: %s", method, exc)
            return f"error: {exc}"


class ManeuverTools:
    """Function tools for Alex — each triggers a LiveKit RPC to update the visual panel."""

    rpc: RpcClient
    lead_store: LeadStore

    @function_tool()
    async def show_services_slide(self, context: RunContext) -> str:
        """Show all Maneuver service cards on the visual panel.

        Call when overviewing what Maneuver offers or when the user asks about services.
        """
        await self.rpc.call(
            "show_services_slide",
            {"tab": "services", "services": SERVICES_DATA},
        )
        return "Services displayed on visual panel."

    @function_tool()
    async def show_service_detail(self, context: RunContext, name: str) -> str:
        """Highlight one service on the visual panel.

        Args:
            name: Product Strategy, UX/UI Design, MVP Development, or Growth Consulting.
        """
        normalized = name.strip()
        for service in SERVICE_NAMES:
            if service.lower() in normalized.lower() or normalized.lower() in service.lower():
                normalized = service
                break

        await self.rpc.call(
            "show_service_detail",
            {"tab": "services", "name": normalized, "services": SERVICES_DATA},
        )
        return f"Showing detail for {normalized}."

    @function_tool()
    async def show_process_diagram(self, context: RunContext) -> str:
        """Show the 5-step process diagram: Discover → Define → Design → Develop → Deploy.

        Call when explaining how Maneuver works or our process.
        """
        await self.rpc.call(
            "show_process_diagram",
            {"tab": "process", "process": PROCESS_DATA},
        )
        return "Process diagram displayed on visual panel."

    @function_tool()
    async def show_case_studies(self, context: RunContext) -> str:
        """Show case study cards with titles and results.

        Call when discussing past work, portfolio, or results.
        """
        await self.rpc.call(
            "show_case_studies",
            {"tab": "case_studies", "case_studies": CASE_STUDIES_DATA},
        )
        return "Case studies displayed on visual panel."

    @function_tool()
    async def update_lead_field(self, context: RunContext, field: str, value: str) -> str:
        """Save discovery info to the lead panel and leads.json.

        Call immediately when the user shares their name, company, problem, timeline, or budget.

        Args:
            field: One of name, company, problem, timeline, budget.
            value: What the user said.
        """
        field = field.strip().lower()
        if field not in LEAD_FIELDS:
            return f"Invalid field. Use one of: {', '.join(sorted(LEAD_FIELDS))}"

        self.lead_store.update_field(field, value)
        await self.rpc.call(
            "update_lead_field",
            {"tab": "lead", "field": field, "value": value.strip()},
        )
        return f"Saved {field} to lead panel."
