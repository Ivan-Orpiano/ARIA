"""ARIA's chat flow: retrieval-augmented when possible, graceful otherwise.

Degradation ladder:
1. LLM + knowledge base hits  -> grounded reply with cited sources.
2. LLM, no hits / no pipeline -> plain conversational reply.
3. No LLM configured          -> canned assistant reply (the app stays usable).
"""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Sequence

from app.clients.gemini_client import LLMError, Message
from app.core.config import Settings
from app.services.briefing_service import BriefingError, BriefingService
from app.services.llm_service import LLMService
from app.services.rag import prompts
from app.services.rag.pipeline import RagError, RagPipeline, Source, _snippet
from app.services.rag.vector_store import RetrievedChunk

logger = logging.getLogger("ai_secretary.chat")

_CITATION_RE = re.compile(r"\[(\d+)\]")

DEGRADED_REPLY = (
    "I'm running without a language model right now (no API key configured), "
    "so I can't answer questions yet. Automations like email triggers still work."
)


class ChatError(Exception):
    """Raised when a chat turn cannot be completed."""


@dataclass(slots=True)
class ChatReply:
    reply: str
    sources: List[Source] = field(default_factory=list)
    grounded: bool = False
    degraded: bool = False
    model: str = ""
    usage: Dict[str, int] = field(default_factory=dict)


class ChatService:
    """Answers chat turns, grounding them in the knowledge base when available."""

    def __init__(
        self,
        *,
        settings: Settings,
        llm: Optional[LLMService],
        pipeline: Optional[RagPipeline],
        briefing: Optional[BriefingService] = None,
    ) -> None:
        self._settings = settings
        self._llm = llm
        self._pipeline = pipeline
        self._briefing = briefing

    async def respond(
        self,
        message: str,
        *,
        history: Optional[Sequence[Message]] = None,
        top_k: Optional[int] = None,
    ) -> ChatReply:
        message = (message or "").strip()
        if not message:
            raise ChatError("Message must not be empty.")

        briefing_reply = await self._maybe_briefing(message)
        if briefing_reply is not None:
            return briefing_reply

        if self._llm is None:
            return ChatReply(reply=DEGRADED_REPLY, degraded=True)

        retrieved = await self._retrieve(message, top_k)

        if retrieved and self._pipeline is not None:
            context_block, used = self._pipeline.assemble_context(retrieved)
            user_prompt = prompts.build_chat_user_prompt(message, context_block)
            system = prompts.CHAT_GROUNDED_SYSTEM_PROMPT
        else:
            used = []
            user_prompt = message
            system = prompts.CHAT_SYSTEM_PROMPT

        try:
            result = await self._llm.complete(user_prompt, system=system, history=history)
        except LLMError as exc:
            raise ChatError(f"Generation failed: {exc}") from exc

        return ChatReply(
            reply=result.text.strip(),
            sources=_build_sources(result.text, used),
            grounded=bool(used),
            model=result.model,
            usage=result.usage,
        )

    async def _maybe_briefing(self, message: str) -> Optional[ChatReply]:
        """Answer stock/weather/sports asks with live data; None if not one."""
        if self._briefing is None:
            return None
        intent = BriefingService.match_intent(message)
        if intent is None:
            return None

        try:
            data = await self._briefing.run(intent)
        except BriefingError as exc:
            logger.warning("Briefing '%s' failed (%s); falling back to LLM.", intent, exc)
            return None

        if self._llm is None:
            return ChatReply(reply=data, degraded=True)

        try:
            result = await self._llm.complete(
                prompts.build_briefing_user_prompt(message, data),
                system=prompts.BRIEFING_SYSTEM_PROMPT,
            )
            return ChatReply(reply=result.text.strip(), model=result.model, usage=result.usage)
        except LLMError as exc:
            logger.warning("Briefing formatting failed (%s); returning raw data.", exc)
            return ChatReply(reply=data)

    async def _retrieve(self, message: str, top_k: Optional[int]) -> List[RetrievedChunk]:
        """Best-effort retrieval: a broken/absent knowledge base never blocks chat."""
        if self._pipeline is None:
            return []
        try:
            return await self._pipeline.retrieve(message, top_k=top_k)
        except RagError as exc:
            logger.warning("Retrieval failed (%s); answering without context.", exc)
            return []


def _build_sources(answer: str, used: Sequence[RetrievedChunk]) -> List[Source]:
    cited_ns = {int(n) for n in _CITATION_RE.findall(answer)}
    return [
        Source(
            n=i + 1,
            source=rc.source,
            chunk_index=rc.chunk_index,
            score=round(rc.score, 4),
            snippet=_snippet(rc.text),
            cited=(i + 1) in cited_ns,
            metadata=rc.metadata,
        )
        for i, rc in enumerate(used)
    ]
