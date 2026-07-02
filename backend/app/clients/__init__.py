"""External provider clients (transport layer).

Everything that talks to a third-party API lives here, behind small typed
wrappers so the rest of the app never imports provider SDKs directly.
Re-exported so callers can do ``from app.clients import OpenAIClient``.
"""

from app.clients.openai_client import (
    ChatResult,
    LLMError,
    Message,
    OpenAIClient,
)

__all__ = [
    "ChatResult",
    "LLMError",
    "Message",
    "OpenAIClient",
]
