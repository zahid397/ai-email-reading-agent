"""FastAPI application entrypoint."""

from __future__ import annotations

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

import uvicorn
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

PORT = int(os.getenv("BACKEND_PORT", 8000))

def _cors_origins() -> list[str]:
    raw = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]

scheduler = AsyncIOScheduler()

async def _scheduled_job() -> None:
    try:
        await process_emails()
    except Exception as exc:
        logger.error("Scheduled processing job errored: %s", exc)

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    await init_db()
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
        logger.info("Scheduler started.")
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
    return {"status": "ok"}

@app.get("/emails", response_model=list[EmailOut])
async def get_emails(important_only: bool = True) -> list[EmailOut]:
    async with SessionLocal() as session:
        query = select(ProcessedEmail).order_by(ProcessedEmail.date.desc())
        if important_only:
            query = query.where(ProcessedEmail.important.is_(True))
        result = await session.execute(query)
        rows = result.scalars().all()
    return [EmailOut.model_validate(row) for row in rows]

@app.post("/trigger", response_model=TriggerResult)
async def trigger() -> TriggerResult:
    return await process_emails()

@app.get("/stats", response_model=Stats)
async def get_stats() -> Stats:
    async with SessionLocal() as session:
        total = await session.scalar(select(func.count()).select_from(ProcessedEmail)) or 0
        important = await session.scalar(select(func.count()).select_from(ProcessedEmail).where(ProcessedEmail.important.is_(True))) or 0
        fallback = await session.scalar(select(func.count()).select_from(ProcessedEmail).where(ProcessedEmail.classifier_source == "fallback")) or 0
        groq = await session.scalar(select(func.count()).select_from(ProcessedEmail).where(ProcessedEmail.classifier_source == "groq")) or 0
        high_priority = await session.scalar(select(func.count()).select_from(ProcessedEmail).where(ProcessedEmail.important.is_(True)).where(ProcessedEmail.priority == "HIGH")) or 0
        
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)