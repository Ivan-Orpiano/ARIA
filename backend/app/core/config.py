from functools import lru_cache
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, loaded from environment / .env.   """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── n8n webhook ───────────────────────────────────────────────
    n8n_webhook_base_url: str = Field(
        default="https://pianoaivan.app.n8n.cloud/webhook-test/aria-message",
        description="Base URL all n8n webhook paths are appended to.",
    )
    n8n_webhook_secret: str = Field(default="", description="Shared secret for n8n header auth.")

    # These are the values you copy out of each n8n Webhook node.
    n8n_path_daily_tasks: str = Field(default="daily-task-email")
    n8n_path_reminder: str = Field(default="reminder-email")
    n8n_path_default: str = Field(default="daily-task-email")

    # ── HTTP client ───────────────────────────────────────────────
    n8n_timeout_seconds: float = Field(default=20.0)

    # ── CORS ──────────────────────────────────────────────────────
    cors_allow_origins: str = Field(default="http://localhost:3000")

    # ── App ───────────────────────────────────────────────────────
    app_env: str = Field(default="development")
    log_level: str = Field(default="INFO", description="Root log level (DEBUG/INFO/WARNING/...).")

    # ── OpenAI / LLM provider ─────────────────────────────────────
    openai_api_key: str = Field(default="", description="OpenAI API key. RAG endpoints are disabled if empty.")
    openai_base_url: Optional[str] = Field(
        default=None,
        description="Override base URL (Azure OpenAI, a proxy, or a compatible provider).",
    )
    openai_chat_model: str = Field(default="gpt-4o-mini", description="Chat/completions model.")
    openai_embedding_model: str = Field(default="text-embedding-3-small", description="Embedding model.")
    openai_timeout_seconds: float = Field(default=30.0)
    openai_max_retries: int = Field(default=3, description="SDK-level retries on 429/5xx/connection errors.")
    openai_temperature: float = Field(default=0.2, ge=0.0, le=2.0)
    openai_max_output_tokens: int = Field(default=1024, ge=1)
    openai_embedding_batch_size: int = Field(default=64, ge=1)

    # ── RAG / vector store ────────────────────────────────────────
    vector_store: str = Field(default="chroma", description="'chroma' (persistent) or 'memory' (ephemeral).")
    chroma_persist_dir: str = Field(default="./.chroma", description="Directory for the persistent Chroma DB.")
    chroma_collection: str = Field(default="ai_secretary", description="Chroma collection name.")

    chunk_size_tokens: int = Field(default=512, ge=64, description="Target chunk size in tokens.")
    chunk_overlap_tokens: int = Field(default=64, ge=0, description="Overlap between adjacent chunks.")

    rag_top_k: int = Field(default=5, ge=1, description="Chunks assembled into the final prompt.")
    rag_fetch_k: int = Field(default=20, ge=1, description="Candidates pulled before fusion/reranking.")
    rag_max_context_tokens: int = Field(default=2000, ge=128, description="Token budget for assembled context.")
    rag_hybrid_search: bool = Field(default=True, description="Fuse dense + lexical retrieval (RRF).")

    def webhook_base(self) -> str:
        return self.n8n_webhook_base_url.rstrip("/") + "/"

    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_allow_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached accessor so the .env file is parsed only once."""
    return Settings()