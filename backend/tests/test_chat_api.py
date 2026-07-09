"""End-to-end tests for POST /chat through the FastAPI app."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.services.chat_service import ChatService
from app.services.llm_service import LLMService
from app.services.rag.documents import load_text
from app.services.rag.pipeline import RagPipeline
from app.services.rag.vector_store import InMemoryVectorStore

from tests.conftest import FakeLLMProvider, HashEmbedder
from tests.test_chat_service import EXPENSE_DOC, VACATION_DOC


@pytest.fixture
def client(clean_settings_cache):
    """App booted with no API key and the in-memory store (worst-case env)."""
    from app.main import create_app

    with TestClient(create_app()) as test_client:
        yield test_client


async def _install_rag_chat(app, settings, provider: FakeLLMProvider) -> None:
    """Swap in a fully working RAG chat stack backed by fakes."""
    llm = LLMService(provider)
    pipeline = RagPipeline(
        settings=settings, embedder=HashEmbedder(), store=InMemoryVectorStore(), llm=llm
    )
    await pipeline.ingest(
        [
            load_text(VACATION_DOC, source="handbook.md"),
            load_text(EXPENSE_DOC, source="expenses.md"),
        ]
    )
    app.state.rag_pipeline = pipeline
    app.state.chat_service = ChatService(settings=settings, llm=llm, pipeline=pipeline)


# ── graceful degradation ──────────────────────────────────────────
def test_app_boots_and_chat_works_without_api_key(client):
    resp = client.post("/chat", json={"message": "hello"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["degraded"] is True
    assert body["grounded"] is False
    assert body["reply"]


def test_health_reports_rag_disabled_without_key(client):
    resp = client.get("/health")

    assert resp.status_code == 200
    assert resp.json()["rag_enabled"] is False


# ── retrieval-augmented chat ──────────────────────────────────────
def test_chat_grounds_reply_in_knowledge_base(client, settings):
    provider = FakeLLMProvider(reply="Employees get 25 vacation days [1].")
    import asyncio

    asyncio.run(_install_rag_chat(client.app, settings, provider))

    resp = client.post("/chat", json={"message": "how many vacation days do I get?"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["degraded"] is False
    assert body["grounded"] is True
    assert body["reply"] == "Employees get 25 vacation days [1]."
    assert body["sources"]
    assert body["sources"][0]["source"] in {"handbook.md", "expenses.md"}
    assert body["sources"][0]["cited"] is True

    # Grounding really happened: the prompt sent to the LLM held the passage.
    user_msg = provider.chat_calls[-1][-1]["content"]
    assert "vacation" in user_msg.lower()


def test_chat_forwards_history(client, settings):
    provider = FakeLLMProvider(reply="Tomorrow you have a 1:1.")
    import asyncio

    asyncio.run(_install_rag_chat(client.app, settings, provider))

    resp = client.post(
        "/chat",
        json={
            "message": "and tomorrow?",
            "history": [
                {"role": "user", "content": "what meetings do I have today?"},
                {"role": "assistant", "content": "Standup at 9."},
            ],
        },
    )

    assert resp.status_code == 200
    contents = [m["content"] for m in provider.chat_calls[-1]]
    assert "Standup at 9." in contents


# ── validation ────────────────────────────────────────────────────
def test_chat_rejects_empty_message(client):
    assert client.post("/chat", json={"message": ""}).status_code == 422
    assert client.post("/chat", json={}).status_code == 422


def test_chat_rejects_bad_history_role(client):
    resp = client.post(
        "/chat",
        json={"message": "hi", "history": [{"role": "wizard", "content": "x"}]},
    )
    assert resp.status_code == 422
