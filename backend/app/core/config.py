
from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
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

    def webhook_base(self) -> str:
        return self.n8n_webhook_base_url.rstrip("/") + "/"

    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_allow_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached accessor so the .env file is parsed only once."""
    return Settings()