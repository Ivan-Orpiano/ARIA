from __future__ import annotations

import dataclasses
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse

from app.clients.gemini_client import LLMError
from app.model.rag_schemas import (
    IngestRequest,
    IngestResponse,
    QueryRequest,
    QueryResponse,
    SourceModel,
)

from app.services.rag.documents import load_text
from app.services.rag.pipeline import RagError, RagPipeline

logger = logging.getLogger("ai_secretary.rag")

router = APIRouter(prefix="/api/rag", tags=["RAG"])


def _pipeline(request: Request) -> RagPipeline:
    pipeline: Optional[RagPipeline] = getattr(request.app.state, "rag_pipeline", None)
    if pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG pipeline not available (GEMINI_API_KEY not set).",
        )
    return pipeline

@router.post("/ingest", response_model=IngestResponse, summary = "Ingest documents.")
async def ingest(body: IngestRequest, request: Request) -> IngestResponse:
    pipeline = _pipeline(request)
    docs = [load_text(d.text, source = d.source, metadata = d.metadata) for d in body.documents]
    
    try:
        result = await pipeline.ingest(docs)
    except RagError as exc:
        logger.error("Ingestion failed: %s", exc)
        raise HTTPException(status_code = status.HTTP_502_BAD_GATEWAY, detail = str(exc) ) from exc
        
    return IngestResponse(
        status = "ingested",
        documents_ingested = result.documents,
        chunks_created = result.chunks,
        collection_size = result.collection_size,
        )
    

 
@router.post("/query", response_model=QueryResponse, summary="Ask a grounded, cited question.")
async def query(body: QueryRequest, request: Request) -> QueryResponse:
    pipeline = _pipeline(request)
    try:
        result = await pipeline.query(body.question, top_k=body.top_k)
    except RagError as exc:
        logger.error("Query failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    return QueryResponse(
        answer=result.answer,
        sources=[SourceModel(**dataclasses.asdict(s)) for s in result.sources],
        used_context=result.used_context,
        model=result.model,
        usage=result.usage,
    )
 
 
@router.post("/query/stream", summary="Stream a grounded answer (text/plain).")
async def query_stream(body: QueryRequest, request: Request) -> StreamingResponse:
    """Stream tokens for low-latency UX. Sources are retrieved first, then the
    answer is streamed; grounding context is assembled exactly as in /query."""
    pipeline = _pipeline(request)
 
    try:
        retrieved = await pipeline.retrieve(body.question, top_k=body.top_k)
    except RagError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
 
    if not retrieved:
        async def _empty():
            yield "I don't have anything in the knowledge base about that."
 
        return StreamingResponse(_empty(), media_type="text/plain")
 
    async def _generate():
        try:
            async for delta in pipeline.stream_answer(body.question, retrieved):
                yield delta
        except LLMError as exc:
            logger.error("Streaming generation failed: %s", exc)
            yield f"\n[error: {exc}]"
 
    return StreamingResponse(_generate(), media_type="text/plain")
 
        
        
    