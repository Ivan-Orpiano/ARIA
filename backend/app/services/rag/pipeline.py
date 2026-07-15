from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Sequence

from app.clients.gemini_client import LLMError
from app.core.config import Settings
from app.services.llm_service import LLMService
from app.services.rag import prompts
from app.services.rag.documents import (
    Chunk,
    Document,
    chunk_documents,
    count_tokens,
)
from app.services.rag.vector_store import Embedder, RetrievedChunk, VectorStore

logger = logging.getLogger("ai_secretary.rag.pipeline")

_CITATION_RE = re.compile(r"\[(\d+)\]")


class RagError(Exception):
    """Raised when a RAG operation cannot complete."""


@dataclass(slots=True)
class IngestResult:
    documents: int
    chunks: int
    collection_size: int


@dataclass(slots=True)
class Source:
    """A retrieved passage, surfaced for citation."""

    n: int
    source: str
    chunk_index: int
    score: float
    snippet: str
    cited: bool
    metadata: Dict[str, str] = field(default_factory=dict)


@dataclass(slots=True)
class QueryResult:
    answer: str
    sources: List[Source]
    used_context: bool
    model: str
    usage: Dict[str, int] = field(default_factory=dict)


class RagPipeline:
    """End-to-end retrieval-augmented generation over an ingested corpus."""

    def __init__(
        self,
        *,
        settings: Settings,
        embedder: Embedder,
        store: VectorStore,
        llm: LLMService,
    ) -> None:
        self._settings = settings
        self._embedder = embedder
        self._store = store
        self._llm = llm

    # ── ingestion ─────────────────────────────────────────────────
    async def ingest(self, docs: Sequence[Document]) -> IngestResult:
        """Chunk, embed and store documents. Returns counts for visibility."""
        if not docs:
            return IngestResult(documents=0, chunks=0, collection_size=self._store.count())

        chunks: List[Chunk] = chunk_documents(
            list(docs),
            chunk_size_tokens=self._settings.chunk_size_tokens,
            chunk_overlap_tokens=self._settings.chunk_overlap_tokens,
        )
        if not chunks:
            logger.warning("Ingestion produced no chunks from %d documents.", len(docs))
            return IngestResult(documents=len(docs), chunks=0, collection_size=self._store.count())

        try:
            embeddings = await self._embedder.embed_documents([c.text for c in chunks])
        except LLMError as exc:
            raise RagError(f"Embedding failed: {exc}") from exc

        if len(embeddings) != len(chunks):
            raise RagError("Embedding count does not match chunk count.")

        await self._store.add(chunks, embeddings)
        logger.info("Ingested %d documents -> %d chunks.", len(docs), len(chunks))
        return IngestResult(
            documents=len(docs), chunks=len(chunks), collection_size=self._store.count()
        )

    # ── retrieval ─────────────────────────────────────────────────
    async def retrieve(self, query: str, *, top_k: Optional[int] = None) -> List[RetrievedChunk]:
        """Retrieve candidates via dense (+ optional lexical) search and fuse them."""
        top_k = top_k or self._settings.rag_top_k
        fetch_k = max(self._settings.rag_fetch_k, top_k)

        try:
            query_vec = await self._embedder.embed_query(query)
        except LLMError as exc:
            raise RagError(f"Query embedding failed: {exc}") from exc

        dense = await self._store.search(query_vec, fetch_k)

        if not self._settings.rag_hybrid_search:
            return dense[:top_k]

        try:
            lexical = await self._store.keyword_search(query, fetch_k)
        except Exception as exc:  # noqa: BLE001 - lexical is best-effort
            logger.warning("Keyword search failed (%s); using dense only.", exc)
            lexical = []

        fused = _reciprocal_rank_fusion(dense, lexical)
        return fused[:top_k]

    # ── generation ────────────────────────────────────────────────
    async def query(self, question: str, *, top_k: Optional[int] = None) -> QueryResult:
        """Answer a question grounded in retrieved context, with citations."""
        question = (question or "").strip()
        if not question:
            raise RagError("Query must not be empty.")

        retrieved = await self.retrieve(question, top_k=top_k)
        if not retrieved:
            return QueryResult(
                answer="I don't have anything in the knowledge base about that.",
                sources=[],
                used_context=False,
                model=self._settings.gemini_chat_model,
            )

        context_block, used = self.assemble_context(retrieved)
        user_prompt = prompts.build_rag_user_prompt(question, context_block)

        try:
            result = await self._llm.complete(
                user_prompt, system=prompts.RAG_SYSTEM_PROMPT, temperature=0.1
            )
        except LLMError as exc:
            raise RagError(f"Generation failed: {exc}") from exc

        cited_ns = {int(n) for n in _CITATION_RE.findall(result.text)}
        sources = [
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
        return QueryResult(
            answer=result.text.strip(),
            sources=sources,
            used_context=True,
            model=result.model,
            usage=result.usage,
        )

    async def stream_answer(self, question: str, retrieved: Sequence[RetrievedChunk]):
        """Stream a grounded answer for already-retrieved chunks (text deltas)."""
        context_block, _used = self.assemble_context(retrieved)
        user_prompt = prompts.build_rag_user_prompt(question.strip(), context_block)
        async for delta in self._llm.stream(
            user_prompt, system=prompts.RAG_SYSTEM_PROMPT, temperature=0.1
        ):
            yield delta

    def assemble_context(
        self, retrieved: Sequence[RetrievedChunk]
    ) -> tuple[str, List[RetrievedChunk]]:
        """Build a numbered context block within the token budget.

        Returns the block plus the chunks actually included (so source numbering
        in the answer matches the returned sources exactly).
        """
        budget = self._settings.rag_max_context_tokens
        used: List[RetrievedChunk] = []
        parts: List[str] = []
        total = 0
        for i, rc in enumerate(retrieved):
            header = f"[{len(used) + 1}] (source: {rc.source}#chunk{rc.chunk_index})"
            block = f"{header}\n{rc.text}"
            block_tokens = count_tokens(block)
            if used and total + block_tokens > budget:
                break
            used.append(rc)
            parts.append(block)
            total += block_tokens
        return "\n\n".join(parts), used


def _reciprocal_rank_fusion(
    dense: Sequence[RetrievedChunk],
    lexical: Sequence[RetrievedChunk],
    *,
    k: int = 60,
) -> List[RetrievedChunk]:
    """Fuse two ranked lists with Reciprocal Rank Fusion.

    RRF combines rankings without needing comparable raw scores: each list
    contributes 1/(k + rank). The fused score is stored on the returned chunk.
    """
    scores: Dict[str, float] = {}
    chunks: Dict[str, RetrievedChunk] = {}
    for ranked in (dense, lexical):
        for rank, rc in enumerate(ranked):
            scores[rc.id] = scores.get(rc.id, 0.0) + 1.0 / (k + rank + 1)
            chunks.setdefault(rc.id, rc)
    fused = sorted(chunks.values(), key=lambda rc: scores[rc.id], reverse=True)
    for rc in fused:
        rc.score = round(scores[rc.id], 6)
    return fused


def _snippet(text: str, limit: int = 240) -> str:
    text = " ".join(text.split())
    return text if len(text) <= limit else text[:limit].rstrip() + "…"