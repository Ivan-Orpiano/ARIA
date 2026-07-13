"""Tests for the thin Gemini SDK wrapper (transport layer)."""
from __future__ import annotations

from types import SimpleNamespace
from typing import Any, Dict, List

import pytest

from app.clients.gemini_client import GeminiClient, LLMError
from app.core.config import Settings


def _chat_response(text: str = "hello", model: str = "gemini-test") -> SimpleNamespace:
    return SimpleNamespace(
        text=text,
        model_version=model,
        candidates=[SimpleNamespace(finish_reason=SimpleNamespace(name="STOP"))],
        usage_metadata=SimpleNamespace(
            prompt_token_count=5, candidates_token_count=7, total_token_count=12
        ),
    )


class FakeModels:
    def __init__(self, response=None, error: Exception | None = None, stream_chunks=None):
        self.response = response or _chat_response()
        self.error = error
        self.stream_chunks = stream_chunks or []
        self.calls: List[Dict[str, Any]] = []

    async def generate_content(self, **kwargs):
        self.calls.append(kwargs)
        if self.error is not None:
            raise self.error
        return self.response

    async def generate_content_stream(self, **kwargs):
        self.calls.append(kwargs)
        if self.error is not None:
            raise self.error

        async def _iter():
            for chunk in self.stream_chunks:
                yield chunk

        return _iter()

    async def embed_content(self, **kwargs):
        self.calls.append(kwargs)
        contents = kwargs["contents"]
        return SimpleNamespace(
            embeddings=[SimpleNamespace(values=[float(len(t)), 1.0]) for t in contents]
        )


def _fake_sdk(models: FakeModels | None = None) -> SimpleNamespace:
    models = models or FakeModels()

    async def _aclose():
        return None

    return SimpleNamespace(aio=SimpleNamespace(models=models, aclose=_aclose))


def _settings(**overrides) -> Settings:
    return Settings(_env_file=None, gemini_api_key="test-key", **overrides)


# ── chat ──────────────────────────────────────────────────────────
async def test_chat_returns_populated_chat_result():
    models = FakeModels(_chat_response("the answer", model="gemini-test"))
    client = GeminiClient(_settings(), client=_fake_sdk(models))

    result = await client.chat([{"role": "user", "content": "q"}])

    assert result.text == "the answer"
    assert result.model == "gemini-test"
    assert result.finish_reason == "stop"
    assert result.usage["total_tokens"] == 12


async def test_chat_uses_configured_model_and_temperature():
    models = FakeModels()
    client = GeminiClient(
        _settings(gemini_chat_model="my-model", gemini_temperature=0.7),
        client=_fake_sdk(models),
    )

    await client.chat([{"role": "user", "content": "q"}])

    call = models.calls[0]
    assert call["model"] == "my-model"
    assert call["config"].temperature == 0.7


async def test_chat_maps_roles_and_system_instruction():
    models = FakeModels()
    client = GeminiClient(_settings(), client=_fake_sdk(models))

    await client.chat(
        [
            {"role": "system", "content": "be brief"},
            {"role": "user", "content": "hi"},
            {"role": "assistant", "content": "hello"},
            {"role": "user", "content": "q"},
        ]
    )

    call = models.calls[0]
    assert call["config"].system_instruction == "be brief"
    roles = [c.role for c in call["contents"]]
    assert roles == ["user", "model", "user"]


async def test_chat_json_mode_sets_response_mime_type():
    models = FakeModels()
    client = GeminiClient(_settings(), client=_fake_sdk(models))

    await client.chat(
        [{"role": "user", "content": "q"}], response_format={"type": "json_object"}
    )

    assert models.calls[0]["config"].response_mime_type == "application/json"


async def test_chat_wraps_sdk_errors_as_llm_error():
    models = FakeModels(error=RuntimeError("boom"))
    client = GeminiClient(_settings(), client=_fake_sdk(models))

    with pytest.raises(LLMError):
        await client.chat([{"role": "user", "content": "q"}])


# ── streaming ─────────────────────────────────────────────────────
async def test_chat_stream_yields_content_deltas():
    chunks = [
        SimpleNamespace(text="Hel"),
        SimpleNamespace(text="lo"),
        SimpleNamespace(text=None),
    ]
    models = FakeModels(stream_chunks=chunks)
    client = GeminiClient(_settings(), client=_fake_sdk(models))

    out = [d async for d in client.chat_stream([{"role": "user", "content": "q"}])]

    assert out == ["Hel", "lo"]


# ── embeddings ────────────────────────────────────────────────────
async def test_embed_returns_vectors_in_order():
    client = GeminiClient(_settings(), client=_fake_sdk())

    vectors = await client.embed(["a", "bbb"])

    assert vectors == [[1.0, 1.0], [3.0, 1.0]]


async def test_embed_batches_requests():
    models = FakeModels()
    client = GeminiClient(_settings(gemini_embedding_batch_size=2), client=_fake_sdk(models))

    vectors = await client.embed(["a", "bb", "ccc", "dddd", "eeeee"])

    assert len(vectors) == 5
    assert len(models.calls) == 3


async def test_embed_empty_input_returns_empty():
    models = FakeModels()
    client = GeminiClient(_settings(), client=_fake_sdk(models))

    assert await client.embed([]) == []
    assert models.calls == []
