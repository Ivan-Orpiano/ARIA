from __future__ import annotations

import hashlib
import logging
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Dict, List, Optional

logger = logging.getLogger("ai_secretary.rag.documents")

# Extensions we treat as plain UTF-8 text. Other types are skipped (logged).
TEXT_SUFFIXES = {".txt", ".md", ".markdown", ".rst", ".text"}


@dataclass(slots=True)
class Document:
    """A loaded source document before chunking."""

    text: str
    source: str
    metadata: Dict[str, str] = field(default_factory=dict)


@dataclass(slots=True)
class Chunk:
    """A retrievable unit with a stable id and provenance metadata."""

    id: str
    text: str
    source: str
    chunk_index: int
    metadata: Dict[str, str] = field(default_factory=dict)


# ── token counting ────────────────────────────────────────────────
def _build_token_counter() -> Callable[[str], int]:
    """Return a token counter, preferring tiktoken, else a ~4 chars/token heuristic."""
    try:
        import tiktoken

        enc = tiktoken.get_encoding("cl100k_base")
        return lambda s: len(enc.encode(s))
    except Exception:  # pragma: no cover - exercised only offline
        logger.warning("tiktoken unavailable; using character-based token estimate.")
        return lambda s: max(1, len(s) // 4)


count_tokens: Callable[[str], int] = _build_token_counter()


# ── loading ───────────────────────────────────────────────────────
def load_text(text: str, *, source: str, metadata: Optional[Dict[str, str]] = None) -> Document:
    """Wrap a raw string as a :class:`Document`."""
    return Document(text=text, source=source, metadata=dict(metadata or {}))


def load_path(path: Path) -> List[Document]:
    """Load a file or recursively load all text files under a directory."""
    path = Path(path)
    if path.is_dir():
        docs: List[Document] = []
        for p in sorted(path.rglob("*")):
            if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES:
                docs.extend(load_path(p))
        return docs

    if path.suffix.lower() not in TEXT_SUFFIXES:
        logger.warning("Skipping unsupported file type: %s", path)
        return []
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        logger.error("Failed to read %s: %s", path, exc)
        return []
    if not text.strip():
        logger.warning("Skipping empty file: %s", path)
        return []
    return [Document(text=text, source=path.name, metadata={"path": str(path)})]


# ── chunking ──────────────────────────────────────────────────────
# Split on the strongest available boundary first (paragraphs), then sentences.
_PARAGRAPH_RE = re.compile(r"\n\s*\n")
_SENTENCE_RE = re.compile(r"(?<=[.!?])\s+")


def _split_units(text: str) -> List[str]:
    """Break text into atomic units (paragraphs, then long ones into sentences)."""
    units: List[str] = []
    for para in _PARAGRAPH_RE.split(text):
        para = para.strip()
        if not para:
            continue
        if count_tokens(para) <= 0:
            continue
        units.append(para)
    return units


def chunk_document(
    doc: Document,
    *,
    chunk_size_tokens: int,
    chunk_overlap_tokens: int,
) -> List[Chunk]:
#   """Split a document into overlapping chunks of at most ``chunk_size_tokens``."""
    units = _split_units(doc.text)
    if not units:
        return []

    # Expand any single unit that already exceeds the budget: first on sentence
    # boundaries, then hard-split on whitespace for boundary-less walls of text.
    expanded: List[str] = []
    for unit in units:
        if count_tokens(unit) <= chunk_size_tokens:
            expanded.append(unit)
            continue
        sentences = [s.strip() for s in _SENTENCE_RE.split(unit) if s.strip()]
        for sentence in sentences or [unit]:
            if count_tokens(sentence) <= chunk_size_tokens:
                expanded.append(sentence)
            else:
                expanded.extend(_hard_split(sentence, chunk_size_tokens))

    chunks_text: List[str] = []
    current: List[str] = []
    current_tokens = 0

    for unit in expanded:
        unit_tokens = count_tokens(unit)
        if current and current_tokens + unit_tokens > chunk_size_tokens:
            chunks_text.append("\n\n".join(current))
            current, current_tokens = _carry_overlap(current, chunk_overlap_tokens)
        current.append(unit)
        current_tokens += unit_tokens

    if current:
        chunks_text.append("\n\n".join(current))

    return [_make_chunk(doc, i, text) for i, text in enumerate(chunks_text) if text.strip()]


def _hard_split(text: str, max_tokens: int) -> List[str]:
#   """Split a long text into chunks of at most ``max_tokens`` using whitespace."""
    words = text.split()
    out: List[str] = []
    current: List[str] = []
    for word in words:
        candidate = " ".join(current + [word])
        if current and count_tokens(candidate) > max_tokens:
            out.append(" ".join(current))
            current = []
        current.append(word)
    if current:
        out.append(" ".join(current))
    return out or [text]


def _carry_overlap(units: List[str], overlap_tokens: int) -> tuple[List[str], int]:
    """Return the trailing units (and their token count) to seed the next chunk."""
    if overlap_tokens <= 0:
        return [], 0
    carried: List[str] = []
    total = 0
    for unit in reversed(units):
        t = count_tokens(unit)
        if total + t > overlap_tokens:
            break
        carried.insert(0, unit)
        total += t
    return carried, total


def _make_chunk(doc: Document, index: int, text: str) -> Chunk:
    raw_id = f"{doc.source}::{index}::{hashlib.sha1(text.encode('utf-8')).hexdigest()[:12]}"
    chunk_id = hashlib.sha1(raw_id.encode("utf-8")).hexdigest()
    meta = dict(doc.metadata)
    meta["source"] = doc.source
    meta["chunk_index"] = str(index)
    return Chunk(id=chunk_id, text=text, source=doc.source, chunk_index=index, metadata=meta)


def chunk_documents(
    docs: List[Document],
    *,
    chunk_size_tokens: int,
    chunk_overlap_tokens: int,
) -> List[Chunk]:
    chunks: List[Chunk] = []
    for doc in docs:
        chunks.extend(
            chunk_document(
                doc,
                chunk_size_tokens=chunk_size_tokens,
                chunk_overlap_tokens=chunk_overlap_tokens,
            )
        )
    return chunks