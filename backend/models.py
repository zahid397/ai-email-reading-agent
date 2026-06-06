"""SQLAlchemy 2.0 ORM models."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def _utcnow() -> datetime:
    """Timezone-aware UTC now (used as a column default)."""
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


class ProcessedEmail(Base):
    """A single email that has been read and classified.

    `email_id` is unique + indexed so duplicate processing is impossible at
    the database level, even under concurrent runs of the scheduler job.
    """

    __tablename__ = "processed_emails"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email_id: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    sender: Mapped[str] = mapped_column(String(320), nullable=False, default="")
    subject: Mapped[str] = mapped_column(String(998), nullable=False, default="")
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    important: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    priority: Mapped[str] = mapped_column(String(16), nullable=False, default="LOW")
    category: Mapped[str] = mapped_column(String(32), nullable=False, default="Other")
    reason: Mapped[str] = mapped_column(Text, nullable=False, default="")
    classifier_source: Mapped[str] = mapped_column(String(16), nullable=False, default="fallback")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )
