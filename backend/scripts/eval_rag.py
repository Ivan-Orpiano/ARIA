"""Minimal end-to-end eval / smoke test against a live OpenAI key.

Ingests a tiny synthetic corpus, then checks (1) the LLM call works, (2) retrieval
returns the relevant chunk (retrieval recall), and (3) the answer is grounded and
cites a source. Run manually:

    python -m scripts.eval_rag

Requires OPENAI_API_KEY. Exits non-zero if any check fails.
"""

from __future__ import annotations

import asyncio
import logging
import sys

from app.clients.openai_client import OpenAIClient
from app.core.config import get_settings
from app.services.llm_service import LLMService
from app.services.rag.documents import load_text
from app.services.rag.pipeline import RagPipeline
from app.services.rag.vector_store import OpenAIEmbedder, InMemoryVectorStore

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("ai_secretary.eval")

CORPUS = [
    ("policy_pto.md", "Employees accrue 1.5 days of paid time off per month, capped at 30 days."),
    ("policy_remote.md", "Remote work is allowed up to three days per week with manager approval."),
    ("policy_expenses.md", "Expense reports must be submitted within 30 days; receipts over $25 are required."),
]
# (question, expected source, a term we expect grounded in the answer)
CASES = [
    ("How many PTO days accrue each month?", "policy_pto.md", "1.5"),
    ("How many days can I work remotely?", "policy_remote.md", "three"),
]


async def _run() -> int:
    settings = get_settings()
    if not settings.openai_api_key:
        logger.error("OPENAI_API_KEY not set; cannot run live eval.")
        return 2

    client = OpenAIClient(settings)
    pipeline = RagPipeline(
        settings=settings,
        embedder=OpenAIEmbedder(client),
        store=InMemoryVectorStore(),  # ephemeral, isolated from any persisted DB
        llm=LLMService(client),
    )

    failures = 0
    try:
        await pipeline.ingest([load_text(t, source=s) for s, t in CORPUS])

        for question, expected_source, expected_term in CASES:
            retrieved = await pipeline.retrieve(question)
            recall_hit = any(rc.source == expected_source for rc in retrieved)

            result = await pipeline.query(question)
            grounded = expected_term.lower() in result.answer.lower()
            cited = any(s.cited for s in result.sources)

            ok = recall_hit and grounded and cited
            failures += not ok
            logger.info(
                "Q: %s\n  retrieval_recall=%s grounded=%s cited=%s\n  answer: %s",
                question, recall_hit, grounded, cited, result.answer.replace("\n", " "),
            )
    finally:
        await client.aclose()

    if failures:
        logger.error("%d/%d cases failed.", failures, len(CASES))
        return 1
    logger.info("All %d cases passed.", len(CASES))
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(_run()))