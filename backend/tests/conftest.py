"""Shared fixtures and lightweight fakes for the test suite.

The fakes satisfy the same structural protocols the app uses (LLMProvider,
Embedder) so tests exercise the real pipeline/service/router code with no
network access.
"""
from __future__ import annotations

import re
import zlib
from typing import Any, Dict, List, Optional, Sequence

import pytest

from app.clients.gemini_client import ChatResult
from app.core.config import Settings, get_settings

_WORD_RE = re.compile(r"[a-z0-9]+")


class HashEmbedder:
    """Deterministic bag-of-words embedder: overlapping words -> similar vectors."""

    dim = 64

    def _vec(self, text: str) -> List[float]:
        v = [0.0] * self.dim
        for word in _WORD_RE.findall(text.lower()):
            v[zlib.crc32(word.encode()) % self.dim] += 1.0
        return v

    async def embed_documents(self, texts: Sequence[str]) -> List[List[float]]:
        return [self._vec(t) for t in texts]

    async def embed_query(self, text: str) -> List[float]:
        return self._vec(text)


class FakeLLMProvider:
    """In-memory LLMProvider that records calls and returns a canned reply."""

    def __init__(self, reply: str = "Grounded answer [1].", model: str = "fake-model") -> None:
        self.reply = reply
        self.model = model
        self.chat_calls: List[List[Dict[str, str]]] = []

    async def chat(
        self,
        messages: Sequence[Dict[str, str]],
        *,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, Any]] = None,
    ) -> ChatResult:
        self.chat_calls.append(list(messages))
        return ChatResult(
            text=self.reply,
            model=self.model,
            finish_reason="stop",
            usage={"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15},
        )

    async def chat_stream(
        self,
        messages: Sequence[Dict[str, str]],
        *,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ):
        self.chat_calls.append(list(messages))
        for piece in self.reply.split(" "):
            yield piece + " "

    async def embed(self, texts: Sequence[str], *, model: Optional[str] = None) -> List[List[float]]:
        embedder = HashEmbedder()
        return [embedder._vec(t) for t in texts]


@pytest.fixture
def settings() -> Settings:
    """Settings isolated from .env and the real environment."""
    return Settings(
        _env_file=None,
        gemini_api_key="test-key",
        vector_store="memory",
        chunk_size_tokens=64,
        chunk_overlap_tokens=8,
    )


@pytest.fixture
def clean_settings_cache(monkeypatch):
    """Boot the app against a controlled environment (no API key, memory store)."""
    monkeypatch.setenv("GEMINI_API_KEY", "")
    monkeypatch.setenv("VECTOR_STORE", "memory")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()
