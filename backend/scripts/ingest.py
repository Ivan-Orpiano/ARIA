from __future__ import annotations

import argparse
import asyncio
import logging
import sys
from pathlib import Path
from typing import List

from app.clients.openai_client import OpenAIClient
from app.core.config import get_settings
from app.services.llm_service import LLMService
from app.services.rag.documents import Document, load_path
from app.services.rag.pipeline import RagError, RagPipeline
from app.services.rag.vector_store import OpenAIEmbedder, build_vector_store

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("ai_secretary.ingest")


def _collect(paths: List[str]) -> List[Document]:
    docs: List[Document] = []
    for raw in paths:
        p = Path(raw)
        if not p.exists():
            logger.warning("Path does not exist, skipping: %s", p)
            continue
        docs.extend(load_path(p))
    return docs


async def _run(paths: List[str]) -> int:
    settings = get_settings()
    if not settings.openai_api_key:
        logger.error("OPENAI_API_KEY is not set; cannot embed documents.")
        return 2

    docs = _collect(paths)
    if not docs:
        logger.error("No supported documents found.")
        return 1

    client = OpenAIClient(settings)
    try:
        pipeline = RagPipeline(
            settings=settings,
            embedder=OpenAIEmbedder(client),
            store=build_vector_store(settings),
            llm=LLMService(client),
        )
        result = await pipeline.ingest(docs)
    except RagError as exc:
        logger.error("Ingestion failed: %s", exc)
        return 3
    finally:
        await client.aclose()

    logger.info(
        "Done: %d documents -> %d chunks (collection size: %d).",
        result.documents, result.chunks, result.collection_size,
    )
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest documents for RAG.")
    parser.add_argument("paths", nargs="+", help="Files or directories to ingest.")
    args = parser.parse_args()
    sys.exit(asyncio.run(_run(args.paths)))


if __name__ == "__main__":
    main()