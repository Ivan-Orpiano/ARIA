from __future__ import annotations

import dataclasses
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Request, status

from app.model.chat_schemas import ChatRequest, ChatResponse
from app.model.rag_schemas import SourceModel
from app.services.chat_service import ChatError, ChatService

logger = logging.getLogger("ai_secretary.chat")

router = APIRouter(tags=["Chat"])


def _service(request: Request) -> ChatService:
    service: Optional[ChatService] = getattr(request.app.state, "chat_service", None)
    if service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chat service not available.",
        )
    return service


@router.post("/chat", response_model=ChatResponse, summary="Chat with ARIA, grounded in the knowledge base.")
async def chat(body: ChatRequest, request: Request) -> ChatResponse:
    service = _service(request)
    history = [m.model_dump() for m in body.history]
    try:
        result = await service.respond(body.message, history=history, top_k=body.top_k)
    except ChatError as exc:
        logger.error("Chat turn failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    return ChatResponse(
        reply=result.reply,
        sources=[SourceModel(**dataclasses.asdict(s)) for s in result.sources],
        grounded=result.grounded,
        degraded=result.degraded,
        model=result.model,
        usage=result.usage,
    )
