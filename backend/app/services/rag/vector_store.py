from __future__ import annotations

import logging
import math
import re
from dataclasses import dataclass
from typing import Dict, List, Optional, Protocol, Sequence, runtime_checkable

from app.services.rag.documents import Chunk

logger = logging.getLogger("ai_secretary.rag.store")

_WORD_RE = re.compile(r"[a-z0-9]+")


def _tokenize(text: str) -> List[str]:
    return _WORD_RE.findall(text.lower())


@dataclass(slots=True)
class RetrievedChunk:
    """A chunk returned from retrieval with its relevance score."""

    id: str
    text: str
    source: str
    chunk_index: int
    score: float
    metadata: Dict[str, str]


@runtime_checkable
class Embedder(Protocol):
    """Turns text into vectors. Query and document embeddings must be comparable."""

    async def embed_documents(self, texts: Sequence[str]) -> List[List[float]]: ...

    async def embed_query(self, text: str) -> List[float]: ...


@runtime_checkable
class VectorStore(Protocol):
    """Stores embedded chunks and supports dense (and optional lexical) search."""

    async def add(self, chunks: Sequence[Chunk], embeddings: Sequence[Sequence[float]]) -> None: ...

    async def search(self, query_embedding: Sequence[float], k: int) -> List[RetrievedChunk]: ...

    async def keyword_search(self, query: str, k: int) -> List[RetrievedChunk]:
        """Optional lexical search. Implementations may return ``[]`` if unsupported."""
        ...

    def count(self) -> int: ...


class OpenAIEmbedder:
    """Adapts the OpenAI client to the :class:`Embedder` protocol."""

    def __init__(self, client) -> None:  # client: OpenAIClient (duck-typed)
        self._client = client

    async def embed_documents(self, texts: Sequence[str]) -> List[List[float]]:
        return await self._client.embed(list(texts))

    async def embed_query(self, text: str) -> List[float]:
        vectors = await self._client.embed([text])
        return vectors[0] if vectors else []


# ── in-memory store ───────────────────────────────────────────────
class InMemoryVectorStore:
    """Pure-Python cosine-similarity store. No external dependencies.

    Used when ``vector_store=memory`` or when chromadb is unavailable, and as the
    test double. Not persistent and O(n) per query — fine for small corpora/tests.
    """

    def __init__(self) -> None:
        self._chunks: Dict[str, Chunk] = {}
        self._embeddings: Dict[str, List[float]] = {}

    async def add(self, chunks: Sequence[Chunk], embeddings: Sequence[Sequence[float]]) -> None:
        for chunk, emb in zip(chunks, embeddings):
            self._chunks[chunk.id] = chunk
            self._embeddings[chunk.id] = list(emb)

    async def search(self, query_embedding: Sequence[float], k: int) -> List[RetrievedChunk]:
        q = list(query_embedding)
        scored = [
            (cid, _cosine(q, emb)) for cid, emb in self._embeddings.items()
        ]
        scored.sort(key=lambda x: x[1], reverse=True)
        return [self._to_retrieved(cid, score) for cid, score in scored[:k]]

    async def keyword_search(self, query: str, k: int) -> List[RetrievedChunk]:
        terms = _tokenize(query)
        if not terms:
            return []
        scored: List[tuple[str, float]] = []
        for cid, chunk in self._chunks.items():
            doc_terms = _tokenize(chunk.text)
            if not doc_terms:
                continue
            tf = sum(min(doc_terms.count(t), 3) for t in set(terms))
            if tf:
                scored.append((cid, float(tf)))
        scored.sort(key=lambda x: x[1], reverse=True)
        return [self._to_retrieved(cid, score) for cid, score in scored[:k]]

    def count(self) -> int:
        return len(self._chunks)

    def _to_retrieved(self, cid: str, score: float) -> RetrievedChunk:
        c = self._chunks[cid]
        return RetrievedChunk(
            id=c.id, text=c.text, source=c.source, chunk_index=c.chunk_index,
            score=score, metadata=c.metadata,
        )


def _cosine(a: Sequence[float], b: Sequence[float]) -> float:
    if not a or not b:
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


# ── Chroma store ──────────────────────────────────────────────────
class ChromaVectorStore:
    """Persistent vector store backed by Chroma.

    We pass embeddings in explicitly (no Chroma embedding function), so no model
    is downloaded and the same :class:`Embedder` is used for documents & queries.
    """

    def __init__(self, persist_dir: str, collection: str) -> None:
        import chromadb  # imported lazily so the dep is optional

        self._client = chromadb.PersistentClient(path=persist_dir)
        # Cosine space matches our query embeddings; distance -> similarity below.
        self._collection = self._client.get_or_create_collection(
            name=collection, metadata={"hnsw:space": "cosine"}
        )

    async def add(self, chunks: Sequence[Chunk], embeddings: Sequence[Sequence[float]]) -> None:
        if not chunks:
            return
        self._collection.upsert(
            ids=[c.id for c in chunks],
            documents=[c.text for c in chunks],
            embeddings=[list(e) for e in embeddings],
            metadatas=[dict(c.metadata) for c in chunks],
        )

    async def search(self, query_embedding: Sequence[float], k: int) -> List[RetrievedChunk]:
        res = self._collection.query(
            query_embeddings=[list(query_embedding)],
            n_results=k,
            include=["documents", "metadatas", "distances"],
        )
        return self._unpack(res)

    async def keyword_search(self, query: str, k: int) -> List[RetrievedChunk]:
        # Chroma has no BM25; approximate by pulling docs that contain query terms,
        # then scoring them lexically in Python.
        terms = sorted(set(_tokenize(query)), key=len, reverse=True)[:8]
        if not terms:
            return []
        seen: Dict[str, RetrievedChunk] = {}
        for term in terms:
            try:
                res = self._collection.get(
                    where_document={"$contains": term},
                    include=["documents", "metadatas"],
                    limit=max(k * 4, 20),
                )
            except Exception:  # pragma: no cover - provider edge cases
                continue
            ids = res.get("ids") or []
            docs = res.get("documents") or []
            metas = res.get("metadatas") or []
            for cid, text, meta in zip(ids, docs, metas):
                if cid in seen:
                    continue
                doc_terms = _tokenize(text or "")
                score = float(sum(min(doc_terms.count(t), 3) for t in terms))
                seen[cid] = RetrievedChunk(
                    id=cid, text=text or "", source=str((meta or {}).get("source", "")),
                    chunk_index=int((meta or {}).get("chunk_index", 0) or 0),
                    score=score, metadata=dict(meta or {}),
                )
        ranked = sorted(seen.values(), key=lambda r: r.score, reverse=True)
        return ranked[:k]

    def count(self) -> int:
        try:
            return self._collection.count()
        except Exception:  # pragma: no cover
            return 0

    @staticmethod
    def _unpack(res) -> List[RetrievedChunk]:
        ids = (res.get("ids") or [[]])[0]
        docs = (res.get("documents") or [[]])[0]
        metas = (res.get("metadatas") or [[]])[0]
        dists = (res.get("distances") or [[]])[0]
        out: List[RetrievedChunk] = []
        for cid, text, meta, dist in zip(ids, docs, metas, dists):
            meta = meta or {}
            out.append(
                RetrievedChunk(
                    id=cid,
                    text=text or "",
                    source=str(meta.get("source", "")),
                    chunk_index=int(meta.get("chunk_index", 0) or 0),
                    score=1.0 - float(dist),  # cosine distance -> similarity
                    metadata=dict(meta),
                )
            )
        return out


def build_vector_store(settings) -> VectorStore:
    """Construct the configured store, falling back to in-memory on failure."""
    if settings.vector_store == "memory":
        logger.info("Using in-memory vector store.")
        return InMemoryVectorStore()
    try:
        store = ChromaVectorStore(settings.chroma_persist_dir, settings.chroma_collection)
        logger.info("Using Chroma vector store at %s", settings.chroma_persist_dir)
        return store
    except Exception as exc:  # noqa: BLE001
        logger.warning("Chroma unavailable (%s); falling back to in-memory store.", exc)
        return InMemoryVectorStore()