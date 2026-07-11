# For transporting layer.

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, AsyncIterator, Dict, List, Optional, Sequence

import httpx
from google import genai
from google.genai import errors as genai_errors
from google.genai import types as genai_types

from app.core.config import Settings

logger = logging.getLogger("ai_secretary.gemini")

# Chat Message for the role and content

Message = Dict[str, str]


class LLMError(Exception):
    """Base class for all LLM errors."""

    def __init__(self, message: str, *, retryable: bool = False, status_code: Optional[int] = None):
        super().__init__(message)
        self.retryable = retryable
        self.status_code = status_code


@dataclass(slots=True)
class ChatResult:
    """Represents the result of a chat completion request."""

    text: str
    model: str
    finish_reason: Optional[str] = None
    usage: Dict[str, Any] = field(default_factory=dict)


class GeminiClient:
    """Client for interacting with the Google Gemini API."""

    def __init__(self, settings: Settings, client: Optional[genai.Client] = None) -> None:
        self.settings = settings
        self.client = client or genai.Client(
            api_key=settings.gemini_api_key,
            http_options=genai_types.HttpOptions(
                timeout=int(settings.gemini_timeout_seconds * 1000),  # milliseconds
            ),
        )

    @property
    def chat_model(self) -> str:
        """Returns the chat model based on the settings."""
        return self.settings.gemini_chat_model

    @property
    def embedding_model(self) -> str:
        """Returns the embedding model based on the settings."""
        return self.settings.gemini_embedding_model

    async def aclose(self) -> None:
        """Closes the underlying client connection."""
        try:
            await self.client.aio.aclose()
        except Exception:
            logger.debug("Gemini client close failed", exc_info=True)

    # chat
    async def chat(
        self,
        messages: Sequence[Message],
        *,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, Any]] = None,
    ) -> ChatResult:
        system, contents = _split_messages(messages)
        config = genai_types.GenerateContentConfig(
            system_instruction=system,
            temperature=self.settings.gemini_temperature if temperature is None else temperature,
            max_output_tokens=max_tokens or self.settings.gemini_max_output_tokens,
            response_mime_type=(
                "application/json"
                if response_format and response_format.get("type") == "json_object"
                else None
            ),
        )

        resolved_model = model or self.settings.gemini_chat_model
        try:
            resp = await self.client.aio.models.generate_content(
                model=resolved_model, contents=contents, config=config
            )
        except Exception as exc:
            raise _wrap_error(exc) from exc

        return ChatResult(
            text=(resp.text or "").strip(),
            model=getattr(resp, "model_version", None) or resolved_model,
            finish_reason=_finish_reason(resp),
            usage=_usage_dict(getattr(resp, "usage_metadata", None)),
        )

    async def chat_stream(
        self,
        messages: Sequence[Message],
        *,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> AsyncIterator[str]:
        system, contents = _split_messages(messages)
        config = genai_types.GenerateContentConfig(
            system_instruction=system,
            temperature=self.settings.gemini_temperature if temperature is None else temperature,
            max_output_tokens=max_tokens or self.settings.gemini_max_output_tokens,
        )

        try:
            stream = await self.client.aio.models.generate_content_stream(
                model=model or self.settings.gemini_chat_model,
                contents=contents,
                config=config,
            )
        except Exception as exc:
            raise _wrap_error(exc) from exc

        try:
            async for event in stream:
                content = getattr(event, "text", None)
                if content:
                    yield content
        except Exception as exc:
            raise _wrap_error(exc) from exc

    # embeddings
    async def embed(self, texts: Sequence[str], *, model: Optional[str] = None) -> List[List[float]]:
        texts = list(texts)
        if not texts:
            return []

        vectors: List[List[float]] = []
        batch_size = max(1, self.settings.gemini_embedding_batch_size)
        for start in range(0, len(texts), batch_size):
            batch = texts[start : start + batch_size]
            try:
                resp = await self.client.aio.models.embed_content(
                    model=model or self.settings.gemini_embedding_model,
                    contents=batch,
                )
            except Exception as exc:
                raise _wrap_error(exc) from exc
            vectors.extend(list(e.values or []) for e in (resp.embeddings or []))
        return vectors


def _split_messages(messages: Sequence[Message]) -> tuple[Optional[str], List[genai_types.Content]]:
    """OpenAI-style role/content dicts -> Gemini system instruction + contents."""
    system_parts: List[str] = []
    contents: List[genai_types.Content] = []
    for msg in messages:
        role = msg.get("role", "user")
        text = msg.get("content", "")
        if role == "system":
            system_parts.append(text)
            continue
        contents.append(
            genai_types.Content(
                role="model" if role == "assistant" else "user",
                parts=[genai_types.Part.from_text(text=text)],
            )
        )
    return ("\n\n".join(system_parts) or None), contents


def _finish_reason(resp: Any) -> Optional[str]:
    candidates = getattr(resp, "candidates", None) or []
    if not candidates:
        return None
    reason = getattr(candidates[0], "finish_reason", None)
    if reason is None:
        return None
    return getattr(reason, "name", str(reason)).lower()


def _usage_dict(usage: Any) -> Dict[str, Any]:
    if usage is None:
        return {}
    return {
        "prompt_tokens": getattr(usage, "prompt_token_count", 0) or 0,
        "completion_tokens": getattr(usage, "candidates_token_count", 0) or 0,
        "total_tokens": getattr(usage, "total_token_count", 0) or 0,
    }


def _wrap_error(exc: Exception) -> LLMError:
    """Wraps an exception from the Gemini client into an LLMError."""
    if isinstance(exc, httpx.TimeoutException):
        return LLMError("LLM request timed out.", retryable=True)
    if isinstance(exc, httpx.ConnectError):
        return LLMError(f"Could not connect to LLM Provider: {exc}", retryable=True)
    if isinstance(exc, genai_errors.APIError):
        code = exc.code
        if code == 429:
            return LLMError("LLM Rate Limit Exceeded.", retryable=True, status_code=429)
        return LLMError(
            f"LLM provider returned HTTP {code}.",
            retryable=bool(code and code >= 500),
            status_code=code,
        )
    return LLMError(f"Unexpected LLM client error: {exc}")
