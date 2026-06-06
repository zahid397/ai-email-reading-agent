"""Database wiring: async engine, session factory, settings, table creation.

Uses SQLAlchemy 2.0 async ORM with the asyncpg driver. The session factory is
exported so other modules (scheduler job, routes) can open short-lived async
sessions without importing the engine directly.
"""

from __future__ import annotations

import logging
import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from models import Base

load_dotenv()

logger = logging.getLogger("email_agent.database")


def _normalize_db_url(url: str) -> str:
    """Ensure the URL uses the asyncpg driver.

    Neon / Render frequently hand out a plain `postgresql://...` URL. SQLAlchemy
    async requires the `postgresql+asyncpg://...` form, so we upgrade it here
    instead of failing at connect time.
    """
    if url.startswith("postgresql+asyncpg://"):
        return url
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    return url


DATABASE_URL: str = _normalize_db_url(
    os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@postgres:5432/email_agent",
    )
)

# asyncpg does not understand libpq `?sslmode=` params; strip them so Neon URLs
# copied verbatim still connect. SSL is negotiated automatically by asyncpg.
if "sslmode=" in DATABASE_URL:
    base, _, query = DATABASE_URL.partition("?")
    kept = [p for p in query.split("&") if p and not p.startswith("sslmode=")]
    DATABASE_URL = base + (("?" + "&".join(kept)) if kept else "")

engine: AsyncEngine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

SessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine, expire_on_commit=False, class_=AsyncSession
)


async def init_db() -> None:
    """Create tables if they do not yet exist (acceptable for this task)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified / created.")


@asynccontextmanager
async def get_session() -> AsyncIterator[AsyncSession]:
    """Yield an async session and guarantee it is closed afterwards."""
    async with SessionLocal() as session:
        yield session
