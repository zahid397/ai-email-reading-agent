"""FastAPI application entrypoint.

- Initializes the database and starts an APScheduler AsyncIOScheduler (once)
  inside the lifespan context.
- Runs the email-processing job every 2 minutes, plus once on startup so the
  dashboard has data immediately.
- Exposes /health, /emails, /trigger, /stats.
"""

from __future__ import annotations

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select

from database import SessionLocal, init_db
from models import ProcessedEmail
from processor import process_emails
from schemas import CategoryCount, EmailOut, Stats, TriggerResult

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger("email_agent.main")


def _cors_origins() -> list[str]:
    raw = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


scheduler = AsyncIOScheduler()


async def _scheduled_job() -> None:
    """Wrapper so scheduler errors are logged, never silently swallowed."""
    try:
        await process_emails()
    except Exception as exc:  # noqa: BLE001
        logger.error("Scheduled processing job errored: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Startup: init DB, run once, start scheduler. Shutdown: stop scheduler."""
    await init_db()

    # Initial pass so the dashboard isn't empty for the first 2 minutes.
    await _scheduled_job()

    if not scheduler.running:
        scheduler.start()
        scheduler.add_job(
            _scheduled_job,
            trigger="interval",
            minutes=2,
            id="email_processing_job",
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )
        logger.info("Scheduler started: processing emails every 2 minutes.")

    try:
        yield
    finally:
        if scheduler.running:
            scheduler.shutdown(wait=False)
            logger.info("Scheduler stopped.")


app = FastAPI(title="AI Email Reading Agent", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    """Liveness probe."""
    return {"status": "ok"}


@app.get("/emails", response_model=list[EmailOut])
async def get_emails(important_only: bool = True) -> list[EmailOut]:
    """Return processed emails, newest first by the email's own date.

    By default only important emails are returned (the dashboard's main view).
    Pass `important_only=false` to list everything the agent has processed.
    """
    async with SessionLocal() as session:
        query = select(ProcessedEmail).order_by(ProcessedEmail.date.desc())
        if important_only:
            query = query.where(ProcessedEmail.important.is_(True))
        result = await session.execute(query)
        rows = result.scalars().all()
    return [EmailOut.model_validate(row) for row in rows]


@app.post("/trigger", response_model=TriggerResult)
async def trigger() -> TriggerResult:
    """Manually run one processing pass and return the counts."""
    return await process_emails()


@app.get("/stats", response_model=Stats)
async def get_stats() -> Stats:
    """Aggregate counts across all processed emails."""
    async with SessionLocal() as session:
        total = await session.scalar(select(func.count()).select_from(ProcessedEmail)) or 0
        important = (
            await session.scalar(
                select(func.count())
                .select_from(ProcessedEmail)
                .where(ProcessedEmail.important.is_(True))
            )
            or 0
        )
        fallback = (
            await session.scalar(
                select(func.count())
                .select_from(ProcessedEmail)
                .where(ProcessedEmail.classifier_source == "fallback")
            )
            or 0
        )
        groq = (
            await session.scalar(
                select(func.count())
                .select_from(ProcessedEmail)
                .where(ProcessedEmail.classifier_source == "groq")
            )
            or 0
        )
        high_priority = (
            await session.scalar(
                select(func.count())
                .select_from(ProcessedEmail)
                .where(ProcessedEmail.important.is_(True))
                .where(ProcessedEmail.priority == "HIGH")
            )
            or 0
        )
        category_rows = await session.execute(
            select(ProcessedEmail.category, func.count())
            .group_by(ProcessedEmail.category)
            .order_by(func.count().desc())
        )
        categories = [CategoryCount(name=name, count=count) for name, count in category_rows.all()]

    return Stats(
        total_processed=total,
        important_count=important,
        fallback_count=fallback,
        groq_count=groq,
        high_priority_count=high_priority,
        categories=categories,
    )
