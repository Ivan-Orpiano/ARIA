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
        
    
        