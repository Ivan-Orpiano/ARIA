import logging
from contextlib import asynccontextmanager
from typing import Optional

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.clients.gemini_client import GeminiClient
from app.core.config import get_settings
from app.routers import chat, email, rag
from app.services.briefing_service import BriefingService
from app.services.chat_service import ChatService
from app.services.llm_service import LLMService
from app.services.n8n_client import N8nClient
from app.services.rag.pipeline import RagPipeline
from app.services.rag.vector_store import GeminiEmbedder, build_vector_store

logger = logging.getLogger("ai_secretary")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))

    async with httpx.AsyncClient() as http_client:
        app.state.settings = settings
        app.state.http_client = http_client
        app.state.n8n_client = N8nClient(settings, http_client)

        # RAG pipeline is optional: only built when an API key is present.
        gemini_client: Optional[GeminiClient] = None
        llm: Optional[LLMService] = None
        app.state.rag_pipeline = None
        if settings.gemini_api_key:
            gemini_client = GeminiClient(settings)
            llm = LLMService(gemini_client)
            embedder = GeminiEmbedder(gemini_client)
            store = build_vector_store(settings)
            app.state.gemini_client = gemini_client
            app.state.llm_service = llm
            app.state.rag_pipeline = RagPipeline(
                settings=settings, embedder=embedder, store=store, llm=llm
            )
            logger.info("RAG pipeline ready (chat=%s, embed=%s).",
                        settings.gemini_chat_model, settings.gemini_embedding_model)
        else:
            logger.warning("GEMINI_API_KEY not set; RAG endpoints disabled.")

        # Chat is always available; it degrades gracefully when llm/pipeline
        # are missing instead of taking the endpoint down.
        app.state.chat_service = ChatService(
            settings=settings,
            llm=llm,
            pipeline=app.state.rag_pipeline,
            briefing=BriefingService(settings, http_client),
        )

        try:
            yield
        finally:
            if gemini_client is not None:
                await gemini_client.aclose()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="AI Secretary Backend", version="1.0.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list(),
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    app.include_router(chat.router)
    app.include_router(email.router)
    app.include_router(rag.router)

    @app.get("/health", tags=["meta"])
    async def health():
        return {
            "status": "ok",
            "env": settings.app_env,
            "rag_enabled": bool(settings.gemini_api_key),
        }

    return app


app = create_app()