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
            
            
            
            
            
            
        )

        
        
        
        
        
def _wrap_error(exc: Exception) -> LLMError:
    """Wraps an exception from the OpenAI client into an LLMError."""
