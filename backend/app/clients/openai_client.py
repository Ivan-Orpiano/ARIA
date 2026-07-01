# For trasporting layer.

from __future__ import annotations

import logging 
from dataclasses import dataclass, field
from typing import Any, AsyncIterator, Dict, List, Optional, Sequence

from openai import ( 
    APIConnectionError,
    APIError,
    APIStatusError,
    APITimeoutError,
    AsyncOpenAI,
    RateLimitError,
    )
  

from app.core.config import Settings

logger = logging.getLogger("ai_secretary.openai")

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
    
class OpenAIClient:
    """Client for interacting with the OpenAI API."""
    
    def __init__(self, settings: Settings, client: Optional[AsyncOpenAI] = None) -> None:
        self.settings = settings
        self.client = client or AsyncOpenAI(
            api_key = settings.openai_api_key,
            base_url = settings.openai_base_url,
            timeout = settings.openai_timeout_seconds,
            max_retries = settings.openai_max_retries,
        )
        
    @property
    def chat_mode(self) -> str:
        """Returns the chat mode based on the settings."""
        return self.settings.openai_chat_mode
    
    @property
    def embedding_model(self) -> str:
        """Returns the embedding model based on the settings."""
        return self.settings.openai_embedding_model
    
    async def aclose(self) -> None:
        """Closes the underlying client connection."""
    
        try:
            await self.client.aclose()
        except Exception:
            logger.debug("OpenAI client close failed", exc_info=True)
     
    # chat
    async def chat(
         self, messages: Sequence[Message], 
         *, 
         model: Optional[str] = None,
         temperature: Optional[float] = None,
         max_tokens: Optional[int] = None,
         response_format: Optional[Dict[str, Any]] = None,
    ) -> ChatResult:
    
        try: 
            resp = await self._client.chat.completions.create(
                model = model or self._setting.openai_chat_model,
                messages = list (messages),
                temperature = self._settings.openai_temperature if temperature is None else temperature,
                max_tokens = max_tokens or self._settings.openai_max_output_tokens,
                response_format = response_format,
        ) 
        except Exception as exc:
            raise _wrap_error(exc) from exc
        
        choice = resp.choices[0]
        usage = resp.usage
        return ChatResult(
            text=choice.message.content or "",
            model=resp.model,
            finish_reason=choice.finish_reason,
            usage={
                "prompt_tokens": getattr(usage, "prompt_tokens", 0) or 0,
                "completion_tokens": getattr(usage, "completion_tokens", 0) or 0,
                "total_tokens": getattr(usage, "total_tokens", 0) or 0,
            },
        )
 
    async def chat_stream(
        self,
        messages: Sequence[Message],
        *,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> AsyncIterator[str]:
        """Stream a chat completion, yielding text deltas as they arrive."""
        try:
            stream = await self._client.chat.completions.create(
                model=model or self._settings.openai_chat_model,
                messages=list(messages),  # type: ignore[arg-type]
                temperature=self._settings.openai_temperature if temperature is None else temperature,
                max_tokens=max_tokens or self._settings.openai_max_output_tokens,
                stream=True,
            )
        except Exception as exc:  # noqa: BLE001
            raise _wrap_error(exc) from exc
 
        try:
            async for chunk in stream:
                if not chunk.choices:
                    continue
                delta = chunk.choices[0].delta
                if delta and delta.content:
                    yield delta.content
        except Exception as exc:  # noqa: BLE001 - mid-stream failure
            raise _wrap_error(exc) from exc
 
    # ── embeddings ────────────────────────────────────────────────
    async def embed(self, texts: Sequence[str], *, model: Optional[str] = None) -> List[List[float]]:
        """Embed a batch of texts, chunked to the configured batch size."""
        if not texts:
            return []
        out: List[List[float]] = []
        batch = self._settings.openai_embedding_batch_size
        mdl = model or self._settings.openai_embedding_model
        for i in range(0, len(texts), batch):
            window = list(texts[i : i + batch])
            try:
                resp = await self._client.embeddings.create(model=mdl, input=window)
            except Exception as exc:  # noqa: BLE001
                raise _wrap_error(exc) from exc
            # The API preserves input order; sort defensively just in case.
            ordered = sorted(resp.data, key=lambda d: d.index)
            out.extend([list(d.embedding) for d in ordered])
        return out
        
def _wrap_error(exc: Exception) -> LLMError:
    """Wraps an exception from the OpenAI client into an LLMError."""
    if isinstance (exc, APITimeoutError):
        return LLMError("LLM request timed out.", retryable= True)
    if isinstance (exc, RateLimitError):
        return LLMError("LLM Rate Limit Exceeded.", retryable=True, status_code = 429)
    if isinstance (exc, APIConnectionError):
        return LLMError(f"Could not connect to LLM Provider: {exc}", retryable = True)
    if isinstance (exc, APIStatusError):
        code = exc.status_code
        return LLMError(f"LLM provider returned HTTP {code}.", retryable = code >= 500, status_code=code)
    if isinstance(exc, APIError):
        return LLMError(f"LLM provider error: {exc}")
    return LLMError(f"Unexpected LLM client error: {exc}")