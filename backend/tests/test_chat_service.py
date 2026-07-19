"""Tests for the retrieval-augmented chat service (ARIA's chat flow)."""
from __future__ import annotations

import pytest

from app.services.llm_service import LLMService
from app.services.rag.documents import load_text
from app.services.rag.pipeline import RagPipeline
from app.services.rag.vector_store import InMemoryVectorStore
from app.services.chat_service import ChatService

from tests.conftest import FakeLLMProvider, HashEmbedder

VACATION_DOC = (
    "Vacation policy: employees receive 25 paid vacation days per year. "
    "Unused vacation days can be carried over until March of the following year."
)
EXPENSE_DOC = (
    "Expense policy: all expenses above 100 euros require manager approval "
    "and must be filed within 30 days via the expenses portal."
)


async def _rag_setup(settings, provider: FakeLLMProvider, ingest: bool = True):
    llm = LLMService(provider)
    pipeline = RagPipeline(
        settings=settings, embedder=HashEmbedder(), store=InMemoryVectorStore(), llm=llm
    )
    if ingest:
        await pipeline.ingest(
            [
                load_text(VACATION_DOC, source="handbook.md"),
                load_text(EXPENSE_DOC, source="expenses.md"),
            ]
        )
    return llm, pipeline


# ── graceful degradation ──────────────────────────────────────────
async def test_degraded_reply_when_no_llm_configured(settings):
    service = ChatService(settings=settings, llm=None, pipeline=None)

    reply = await service.respond("hello there")

    assert reply.degraded is True
    assert reply.grounded is False
    assert reply.sources == []
    assert reply.reply  # still says something useful


async def test_ungrounded_chat_when_no_pipeline(settings):
    provider = FakeLLMProvider(reply="Hi! How can I help?")
    service = ChatService(settings=settings, llm=LLMService(provider), pipeline=None)

    reply = await service.respond("hello")

    assert reply.degraded is False
    assert reply.grounded is False
    assert reply.reply == "Hi! How can I help?"


async def test_ungrounded_chat_when_store_is_empty(settings):
    provider = FakeLLMProvider(reply="General answer.")
    llm, pipeline = await _rag_setup(settings, provider, ingest=False)
    service = ChatService(settings=settings, llm=llm, pipeline=pipeline)

    reply = await service.respond("what is the vacation policy?")

    assert reply.grounded is False
    assert reply.sources == []
    assert reply.reply == "General answer."


async def test_falls_back_to_ungrounded_when_retrieval_fails(settings):
    provider = FakeLLMProvider(reply="Still helpful.")
    llm = LLMService(provider)

    class BrokenEmbedder:
        async def embed_documents(self, texts):
            raise AssertionError("not used")

        async def embed_query(self, text):
            from app.clients.gemini_client import LLMError

            raise LLMError("embedding down")

    pipeline = RagPipeline(
        settings=settings, embedder=BrokenEmbedder(), store=InMemoryVectorStore(), llm=llm
    )
    service = ChatService(settings=settings, llm=llm, pipeline=pipeline)

    reply = await service.respond("what is the vacation policy?")

    assert reply.degraded is False
    assert reply.grounded is False
    assert reply.reply == "Still helpful."


# ── retrieval-augmented path ──────────────────────────────────────
async def test_grounded_reply_uses_retrieved_context(settings):
    provider = FakeLLMProvider(reply="You get 25 vacation days [1].")
    llm, pipeline = await _rag_setup(settings, provider)
    service = ChatService(settings=settings, llm=llm, pipeline=pipeline)

    reply = await service.respond("how many vacation days do employees get?")

    assert reply.degraded is False
    assert reply.grounded is True
    assert reply.reply == "You get 25 vacation days [1]."
    assert reply.sources, "grounded replies must surface their sources"
    assert reply.sources[0].source in {"handbook.md", "expenses.md"}

    # The generation prompt must actually contain the retrieved passage.
    sent = provider.chat_calls[-1]
    user_msg = sent[-1]["content"]
    assert "vacation" in user_msg.lower()
    assert "[1]" in user_msg


async def test_grounded_reply_marks_cited_sources(settings):
    provider = FakeLLMProvider(reply="Answer citing [1].")
    llm, pipeline = await _rag_setup(settings, provider)
    service = ChatService(settings=settings, llm=llm, pipeline=pipeline)

    reply = await service.respond("how many vacation days do employees get?")

    assert reply.sources[0].cited is True
    assert all(s.cited is False for s in reply.sources[1:])


async def test_history_is_forwarded_to_the_llm(settings):
    provider = FakeLLMProvider(reply="Sure.")
    service = ChatService(settings=settings, llm=LLMService(provider), pipeline=None)

    await service.respond(
        "and tomorrow?",
        history=[
            {"role": "user", "content": "what meetings do I have today?"},
            {"role": "assistant", "content": "You have standup at 9."},
        ],
    )

    sent = provider.chat_calls[-1]
    contents = [m["content"] for m in sent]
    assert "what meetings do I have today?" in contents
    assert "You have standup at 9." in contents


async def test_empty_message_is_rejected(settings):
    service = ChatService(settings=settings, llm=None, pipeline=None)

    from app.services.chat_service import ChatError

    with pytest.raises(ChatError):
        await service.respond("   ")
