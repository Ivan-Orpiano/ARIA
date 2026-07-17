from __future__ import annotations
import json
import logging
from typing import Any, AsyncIterator, Dict, List, Optional, Protocol, Sequence, runtime_checkable

from app.clients.gemini_client import ChatResult, LLMError, Message

logger = logging.getLogger("ai_secretary.llm")


@runtime_checkable
class LLMProvider(Protocol):
    """Structural contract every provider client must satisfy."""

    async def chat(
        self,
        messages: Sequence[Message],
        *,
        model: Optional[str] = ...,
        temperature: Optional[float] = ...,
        max_tokens: Optional[int] = ...,
        response_format: Optional[Dict[str, Any]] = ...,
    ) -> ChatResult: ...

    async def chat_stream(
        self,
        messages: Sequence[Message],
        *,
        model: Optional[str] = ...,
        temperature: Optional[float] = ...,
        max_tokens: Optional[int] = ...,
    ) -> AsyncIterator[str]: ...

    async def embed(self, texts: Sequence[str], *, model: Optional[str] = ...) -> List[List[float]]: ...


class LLMService:
    """High-level prompting API used across the app."""

    def __init__(self, provider: LLMProvider) -> None:
        self._provider = provider

    @staticmethod
    def _build_messages(
        user: str,
        *,
        system: Optional[str] = None,
        history: Optional[Sequence[Message]] = None,
    ) -> List[Message]:
        messages: List[Message] = []
        if system:
            messages.append({"role": "system", "content": system})
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": user})
        return messages

    async def complete(
        self,
        user: str,
        *,
        system: Optional[str] = None,
        history: Optional[Sequence[Message]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> ChatResult:
        """Single-shot completion. Raises :class:`LLMError` on provider failure."""
        messages = self._build_messages(user, system=system, history=history)
        return await self._provider.chat(
            messages, temperature=temperature, max_tokens=max_tokens
        )

    async def complete_json(
        self,
        user: str,
        *,
        system: Optional[str] = None,
        temperature: float = 0.0,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Completion constrained to JSON, parsed defensively.

        Returns ``{}`` (logged) rather than raising if the model emits invalid
        JSON, so a malformed response never crashes a caller.
        """
        messages = self._build_messages(user, system=system)
        result = await self._provider.chat(
            messages,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
        )
        return _safe_json(result.text)

    async def stream(
        self,
        user: str,
        *,
        system: Optional[str] = None,
        history: Optional[Sequence[Message]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> AsyncIterator[str]:
        """Stream text deltas for a completion."""
        messages = self._build_messages(user, system=system, history=history)
        async for delta in self._provider.chat_stream(
            messages, temperature=temperature, max_tokens=max_tokens
        ):
            yield delta

    async def embed(self, texts: Sequence[str]) -> List[List[float]]:
        return await self._provider.embed(texts)


def _safe_json(text: str) -> Dict[str, Any]:
    """Parse JSON, tolerating code fences and surrounding prose."""
    if not text:
        return {}
    cleaned = text.strip()
    if cleaned.startswith("```"):
        # Strip ```json ... ``` fences.
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Last-ditch: grab the outermost {...} span.
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if 0 <= start < end:
            try:
                return json.loads(cleaned[start : end + 1])
            except json.JSONDecodeError:
                pass
    logger.warning("Model returned non-JSON output; returning empty dict.")
    return {}


__all__ = ["LLMService", "LLMProvider", "LLMError"]