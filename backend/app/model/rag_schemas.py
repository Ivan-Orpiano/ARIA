"""Pydantic request/response models for the RAG API."""
from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field

class IngestTextItem(BaseModel):
    text: str = Field(..., min_length=1, max_length=1_000_000)
    source: str = Field(..., min_length=1, max_length=300, description="Human-readable source label.")
    metadata: Dict[str, str] = Field(default_factory=dict)

class IngestRequest(BaseModel):
    """Ingest raw text documents directly via the API."""

    documents: List[IngestTextItem] = Field(..., min_length=1, max_length=200)

class IngestResponse(BaseModel):
    status: str
    documents_ingested: int
    chunks_created: int
    collection_size: int

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=4000)
    top_k: Optional[int] = Field(default=None, ge=1, le=20)

class SourceModel(BaseModel):
    n: int = Field(..., description="Citation number referenced in the answer as [n].")
    source: str
    chunk_index: int
    score: float
    snippet: str
    cited: bool
    metadata: Dict[str, str] = Field(default_factory=dict)

class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceModel]
    used_context: bool
    model: str
    usage: Dict[str, int] = Field(default_factory=dict)