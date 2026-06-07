"""
AI Email Reading Agent — FastAPI Backend
Handles email processing, classification, scheduling, and API routes.
"""

from __future__ import annotations

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select

from database import SessionLocal, init_db
from models import ProcessedEmail
from processor import process_emails
from schemas import CategoryCount, EmailOut, Stats, TriggerResult

# ─── Load env ────────────────────────────────────────────────
load_dotenv()

# ─── Logging ─────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger("email_agent.main")

# ─── Silence noisy APScheduler logs ─────────────────────────
logging.getLogger("apscheduler.executors.default").setLevel(logging.WARNING)
logging.getLogger("apscheduler.scheduler").setLevel(logging.WARNING)


# ─── CORS origins ────────────────────────────────────────────
def _cors_origins() -> list[str]:
    raw = os.getenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:3000",
    )
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    logger.info("CORS allowed origins: %s", origins)
    return origins


# ─── Scheduler ───────────────────────────────────────────────
scheduler = AsyncIOScheduler()


async def _scheduled_job() -> None:
    """Wrapper so scheduler errors are logged, never silently swallowed."""
    try:
        result = await process_emails()
        logger.info(
            "Scheduled job complete — processed=%d skipped=%d failed=%d",
            result.processed,
            result.skipped,
            result.failed,
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("Scheduled job error: %s", exc)


# ─── Lifespan ─────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Startup:
      1. Create DB tables.
      2. Run first processing pass immediately (populates data at launch).
      3. Start scheduler for every-2-min polling.
    Shutdown:
      4. Stop scheduler cleanly.
    """
    logger.info("Starting AI Email Reading Agent…")

    # 1. Init database
    await init_db()

    # 2. First pass — so dashboard has data immediately on startup
    logger.info("Running initial email processing pass…")
    await _scheduled_job()

    # 3. Start scheduler THEN add job (avoids 'tentatively scheduled' warning)
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
        logger.info("Scheduler started — running every 2 minutes.")

    try:
        yield
    finally:
        if scheduler.running:
            scheduler.shutdown(wait=False)
            logger.info("Scheduler stopped.")


# ─── App ──────────────────────────────────────────────────────
app = FastAPI(
    title="AI Email Reading Agent",
    description="Reads, classifies, and stores important emails.",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────

@app.get(
    "/health",
    summary="Liveness probe",
    tags=["System"],
)
async def health() -> dict[str, str]:
    """Returns ok if the server is running."""
    return {"status": "ok"}


@app.get(
    "/emails",
    response_model=list[EmailOut],
    summary="List processed emails",
    tags=["Emails"],
)
async def get_emails(
    important_only: bool = Query(
        default=True,
        description="Return only important emails (true) or all emails (false).",
    ),
) -> list[EmailOut]:
    """
    Returns processed emails sorted newest first by email date.

    - `GET /emails`                    → important emails only
    - `GET /emails?important_only=false` → every processed email
    """
    async with SessionLocal() as session:
        query = select(ProcessedEmail).order_by(ProcessedEmail.date.desc())
        if important_only:
            query = query.where(ProcessedEmail.important.is_(True))
        result = await session.execute(query)
        rows = result.scalars().all()

    return [EmailOut.model_validate(row) for row in rows]


@app.post(
    "/trigger",
    response_model=TriggerResult,
    summary="Manually run the email processing job",
    tags=["Agent"],
)
async def trigger() -> TriggerResult:
    """
    Immediately runs one full processing pass:
    read → deduplicate → classify → store.
    Returns counts of processed / skipped / failed emails.
    """
    logger.info("Manual trigger fired.")
    result = await process_emails()
    logger.info(
        "Manual trigger complete — processed=%d skipped=%d failed=%d",
        result.processed,
        result.skipped,
        result.failed,
    )
    return result


@app.get(
    "/stats",
    response_model=Stats,
    summary="Aggregate statistics",
    tags=["Agent"],
)
async def get_stats() -> Stats:
    """
    Returns aggregate counts across all processed emails:
    total, important, high priority, groq vs fallback,
    and a breakdown by category (for the dashboard donut chart).
    """
    async with SessionLocal() as session:
        # Total processed
        total: int = (
            await session.scalar(
                select(func.count()).select_from(ProcessedEmail)
            )
        ) or 0

        # Important count
        important: int = (
            await session.scalar(
                select(func.count())
                .select_from(ProcessedEmail)
                .where(ProcessedEmail.important.is_(True))
            )
        ) or 0

        # High priority (important + HIGH)
        high_priority: int = (
            await session.scalar(
                select(func.count())
                .select_from(ProcessedEmail)
                .where(
                    ProcessedEmail.important.is_(True),
                    ProcessedEmail.priority == "HIGH",
                )
            )
        ) or 0

        # Fallback classifier count
        fallback: int = (
            await session.scalar(
                select(func.count())
                .select_from(ProcessedEmail)
                .where(ProcessedEmail.classifier_source == "fallback")
            )
        ) or 0

        # Groq classifier count
        groq: int = (
            await session.scalar(
                select(func.count())
                .select_from(ProcessedEmail)
                .where(ProcessedEmail.classifier_source == "groq")
            )
        ) or 0

        # Category breakdown for donut chart
        cat_rows = await session.execute(
            select(
                ProcessedEmail.category,
                func.count(ProcessedEmail.id).label("cnt"),
            )
            .group_by(ProcessedEmail.category)
            .order_by(func.count(ProcessedEmail.id).desc())
        )
        categories = [
            CategoryCount(name=row[0], count=row[1])
            for row in cat_rows.all()
        ]

    return Stats(
        total_processed=total,
        important_count=important,
        high_priority_count=high_priority,
        fallback_count=fallback,
        groq_count=groq,
        categories=categories,
    )
