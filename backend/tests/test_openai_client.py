"""Tests for the thin OpenAI SDK wrapper (transport layer)."""
from __future__ import annotations

from types import SimpleNamespace
from typing import Any, Dict, List

import pytest

from app.clients.openai_client import LLMError, OpenAIClient
from app.core.config import Settings


def _chat_response(text: str = "hello", model: str = "gpt-test") -> SimpleNamespace:
    return SimpleNamespace(
        choices=[
            SimpleNamespace(
                message=SimpleNamespace(content=text),
                finish_reason="stop",
            )
        ],
        model=model,
        usage=SimpleNamespace(prompt_tokens=5, completion_tokens=7, total_tokens=12),
    )


class FakeCompletions:
    def __init__(self, response=None, error: Exception | None = None, stream_chunks=None):
        self.response = response
        self.error = error
        self.stream_chunks = stream_chunks or []
        self.calls: List[Dict[str, Any]] = []

    async def create(self, **kwargs):
        self.calls.append(kwargs)
        if self.error is not None:
            raise self.error
        if kwargs.get("stream"):
            async def _iter():
                for chunk in self.stream_chunks:
                    yield chunk
            return _iter()
        return self.response


class FakeEmbeddings:
    def __init__(self):
        self.calls: List[Dict[str, Any]] = []

    async def create(self, **kwargs):
        self.calls.append(kwargs)
        inputs = kwargs["input"]
        data = [
            SimpleNamespace(index=i, embedding=[float(len(t)), 1.0])
            for i, t in enumerate(inputs)
        ]
        return SimpleNamespace(data=data)


def _fake_sdk(completions: FakeCompletions | None = None) -> SimpleNamespace:
    return SimpleNamespace(
        chat=SimpleNamespace(completions=completions or FakeCompletions(_chat_response())),
        embeddings=FakeEmbeddings(),
    )


def _settings(**overrides) -> Settings:
    return Settings(_env_file=None, openai_api_key="test-key", **overrides)


# ── chat ──────────────────────────────────────────────────────────
async def test_chat_returns_populated_chat_result():
    completions = FakeCompletions(_chat_response("the answer", model="gpt-test"))
    client = OpenAIClient(_settings(), client=_fake_sdk(completions))

    result = await client.chat([{"role": "user", "content": "q"}])

    assert result.text == "the answer"
    assert result.model == "gpt-test"
    assert result.finish_reason == "stop"
    assert result.usage["total_tokens"] == 12


async def test_chat_uses_configured_model_and_temperature():
    completions = FakeCompletions(_chat_response())
    client = OpenAIClient(
        _settings(openai_chat_model="my-model", openai_temperature=0.7),
        client=_fake_sdk(completions),
    )

    await client.chat([{"role": "user", "content": "q"}])

    call = completions.calls[0]
    assert call["model"] == "my-model"
    assert call["temperature"] == 0.7


async def test_chat_omits_response_format_when_not_given():
    completions = FakeCompletions(_chat_response())
    client = OpenAIClient(_settings(), client=_fake_sdk(completions))

    await client.chat([{"role": "user", "content": "q"}])

    assert "response_format" not in completions.calls[0]


async def test_chat_wraps_sdk_errors_as_llm_error():
    completions = FakeCompletions(error=RuntimeError("boom"))
    client = OpenAIClient(_settings(), client=_fake_sdk(completions))

    with pytest.raises(LLMError):
        await client.chat([{"role": "user", "content": "q"}])


# ── streaming ─────────────────────────────────────────────────────
async def test_chat_stream_yields_content_deltas():
    chunks = [
        SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content="Hel"))]),
        SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content="lo"))]),
        SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=None))]),
    ]
    completions = FakeCompletions(stream_chunks=chunks)
    client = OpenAIClient(_settings(), client=_fake_sdk(completions))

    out = [d async for d in client.chat_stream([{"role": "user", "content": "q"}])]

    assert out == ["Hel", "lo"]
    assert completions.calls[0]["stream"] is True


# ── embeddings ────────────────────────────────────────────────────
async def test_embed_returns_vectors_in_order():
    client = OpenAIClient(_settings(), client=_fake_sdk())

    vectors = await client.embed(["a", "bbb"])

    assert vectors == [[1.0, 1.0], [3.0, 1.0]]


async def test_embed_batches_requests():
    sdk = _fake_sdk()
    client = OpenAIClient(_settings(openai_embedding_batch_size=2), client=sdk)

    vectors = await client.embed(["a", "bb", "ccc", "dddd", "eeeee"])

    assert len(vectors) == 5
    assert len(sdk.embeddings.calls) == 3


async def test_embed_empty_input_returns_empty():
    sdk = _fake_sdk()
    client = OpenAIClient(_settings(), client=sdk)

    assert await client.embed([]) == []
    assert sdk.embeddings.calls == []


# ── config hygiene ────────────────────────────────────────────────
def test_blank_openai_base_url_normalizes_to_none():
    assert Settings(_env_file=None, openai_base_url="   ").openai_base_url is None
    assert Settings(_env_file=None, openai_base_url="").openai_base_url is None
