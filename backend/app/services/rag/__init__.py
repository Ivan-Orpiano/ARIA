"""Retrieval-augmented generation over the AI Secretary knowledge base.

Public surface re-exported here so callers can do
``from app.services.rag import RagPipeline`` instead of reaching into
submodules. The layers:

- :mod:`documents` — loading source files and chunking them into retrievable units
- :mod:`vector_store` — embedder/store protocols plus in-memory and Chroma backends
- :mod:`pipeline` — ingest, retrieve (dense + lexical RRF) and grounded generation
- :mod:`prompts` — the grounding system/user prompt templates
"""

from app.services.rag.documents import (
    Chunk,
    Document,
    chunk_document,
    chunk_documents,
    count_tokens,
    load_path,
    load_text,
)
from app.services.rag.pipeline import (
    IngestResult,
    QueryResult,
    RagError,
    RagPipeline,
    Source,
)
from app.services.rag.vector_store import (
    ChromaVectorStore,
    Embedder,
    InMemoryVectorStore,
    OpenAIEmbedder,
    RetrievedChunk,
    VectorStore,
    build_vector_store,
)

__all__ = [
    # documents
    "Chunk",
    "Document",
    "chunk_document",
    "chunk_documents",
    "count_tokens",
    "load_path",
    "load_text",
    # pipeline
    "IngestResult",
    "QueryResult",
    "RagError",
    "RagPipeline",
    "Source",
    # vector store
    "ChromaVectorStore",
    "Embedder",
    "InMemoryVectorStore",
    "OpenAIEmbedder",
    "RetrievedChunk",
    "VectorStore",
    "build_vector_store",
]
