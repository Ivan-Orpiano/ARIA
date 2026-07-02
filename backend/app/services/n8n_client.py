from __future__ import annotations

import logging
from typing import Any, Dict

import httpx

from app.core.config import Settings
from app.core.workflows import Workflow, resolve_webhook_url

logger = logging.getLogger("ai_secretary.n8n")


class N8nError(Exception):
    """Raised when the call to n8n fails or returns a non-2xx status."""

    def __init__(self, message: str, *, status_code: int | None = None, body: Any = None):
        super().__init__(message)
        self.status_code = status_code
        self.body = body


class N8nClient:
    def __init__(self, settings: Settings, client: httpx.AsyncClient):
        self._settings = settings
        self._client = client

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        # Send the shared secret only if configured. The n8n Webhook node
        # should verify this with a Header Auth credential.
        if self._settings.n8n_webhook_secret:
            headers["X-Webhook-Secret"] = self._settings.n8n_webhook_secret
        return headers

    async def trigger(self, workflow: Workflow, payload: Dict[str, Any]) -> Any:
        url = resolve_webhook_url(workflow, self._settings)
        logger.info("Triggering n8n workflow=%s url=%s", workflow.value, url)

        try:
            resp = await self._client.post(
                url,
                json=payload,
                headers=self._headers(),
                timeout=self._settings.n8n_timeout_seconds,
            )
        except httpx.TimeoutException as exc:
            logger.warning("n8n timeout: %s", exc)
            raise N8nError("n8n webhook timed out.") from exc
        except httpx.RequestError as exc:
            # DNS failure, connection refused, TLS error, etc.
            logger.warning("n8n connection error: %s", exc)
            raise N8nError(f"Could not reach n8n webhook: {exc}") from exc

        if resp.status_code >= 400:
            # Surface n8n's own error body but never leak it as 200.
            body = _safe_body(resp)
            logger.warning("n8n returned %s: %s", resp.status_code, body)
            raise N8nError(
                f"n8n responded with HTTP {resp.status_code}.",
                status_code=resp.status_code,
                body=body,
            )

        return _safe_body(resp)


def _safe_body(resp: httpx.Response) -> Any:
    """Return parsed JSON when possible, otherwise the trimmed text body."""
    content_type = resp.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            return resp.json()
        except ValueError:
            pass
    text = resp.text or ""
    return text.strip()[:2000]