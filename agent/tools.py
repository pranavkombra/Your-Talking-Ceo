"""LiveKit function tools + RPC helpers for the Maneuver visual frontend."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING

from livekit.agents import RunContext, function_tool

if TYPE_CHECKING:
    from livekit import rtc

logger = logging.getLogger("maneuver.tools")

# Valid lead fields matching leads.json schema
LEAD_FIELDS = frozenset({"name", "company", "problem", "timeline", "budget"})

# Service names accepted by show_service_detail
SERVICE_NAMES = frozenset(
    {
        "Product Strategy",
        "UX/UI Design",
        "MVP Development",
        "Growth Consulting",
    }
)


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
        """Create a new lead entry when a call begins."""
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
        """Update a single field on the active lead."""
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
        """Find the human participant (non-agent) in the room."""
        for participant in self._room.remote_participants.values():
            identity = participant.identity
            if "agent" not in identity.lower():
                return identity
        return None

    async def call(self, method: str, payload: dict | None = None) -> str:
        """Perform RPC to the frontend participant."""
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
    """Mixin providing @function_tool methods for Alex agent."""

    rpc: RpcClient
    lead_store: LeadStore

    @function_tool()
    async def show_services_slide(self, context: RunContext) -> str:
        """Display all Maneuver service cards on the visual panel.

        Call when giving an overview of services or when the user asks what Maneuver does.
        """
        await self.rpc.call("show_services_slide", {"view": "services"})
        return "Services slide displayed."

    @function_tool()
    async def show_service_detail(self, context: RunContext, name: str) -> str:
        """Zoom into one service card on the visual panel.

        Args:
            name: Service name — one of Product Strategy, UX/UI Design, MVP Development, Growth Consulting.
        """
        normalized = name.strip()
        # Fuzzy match common variations
        for service in SERVICE_NAMES:
            if service.lower() in normalized.lower() or normalized.lower() in service.lower():
                normalized = service
                break

        await self.rpc.call("show_service_detail", {"name": normalized})
        return f"Showing detail for {normalized}."

    @function_tool()
    async def show_process_diagram(self, context: RunContext) -> str:
        """Display the 5-step Discover → Define → Design → Develop → Deploy process diagram.

        Call when explaining how Maneuver works or our process.
        """
        await self.rpc.call("show_process_diagram", {"view": "process"})
        return "Process diagram displayed."

    @function_tool()
    async def show_case_studies(self, context: RunContext) -> str:
        """Display case study cards on the visual panel.

        Call when discussing past work, results, or portfolio.
        """
        await self.rpc.call("show_case_studies", {"view": "case_studies"})
        return "Case studies displayed."

    @function_tool()
    async def update_lead_field(self, context: RunContext, field: str, value: str) -> str:
        """Save a discovery answer to the lead record and update the live lead panel.

        Call immediately when the user shares discovery information.

        Args:
            field: One of name, company, problem, timeline, budget.
            value: The value the user provided.
        """
        field = field.strip().lower()
        if field not in LEAD_FIELDS:
            return f"Invalid field. Use one of: {', '.join(sorted(LEAD_FIELDS))}"

        self.lead_store.update_field(field, value)
        await self.rpc.call("update_lead_field", {"field": field, "value": value.strip()})
        return f"Saved {field}."
