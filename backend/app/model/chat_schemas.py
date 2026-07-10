"""Pydantic request/response models for the chat API."""
from __future__ import annotations

from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

from app.model.rag_schemas import SourceModel


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: List[ChatMessage] = Field(
        default_factory=list, max_length=50,
        description="Prior turns, oldest first. Kept client-side; the API is stateless.",
    )
    top_k: Optional[int] = Field(default=None, ge=1, le=20)


class ChatResponse(BaseModel):
    reply: str
    sources: List[SourceModel] = Field(default_factory=list)
    grounded: bool = Field(..., description="True when the reply used knowledge-base context.")
    degraded: bool = Field(..., description="True when no LLM is configured (canned reply).")
    model: str = ""
    usage: Dict[str, int] = Field(default_factory=dict)
