"""Pydantic v2 schemas used across the AI Email Reading Agent.

These models define the contract for:
- the AI classification result (Groq or fallback),
- the raw mock email payload read from JSON,
- the API responses (`/emails`, `/stats`, `/trigger`).
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

# Canonical value sets. These are the single source of truth for valid
# priorities / categories / classifier sources across the whole backend.
Priority = Literal["HIGH", "MEDIUM", "LOW"]
Category = Literal[
    "PAYMENT_ISSUE",
    "BILLING_ISSUE",
    "SERVER_DOWN",
    "CLIENT_COMPLAINT",
    "SECURITY",
    "INTERVIEW",
    "SUBSCRIPTION",
    "NEWSLETTER",
    "SPAM",
    "OTHER",
]
ClassifierSource = Literal["groq", "fallback"]

VALID_PRIORITIES: set[str] = {"HIGH", "MEDIUM", "LOW"}
VALID_CATEGORIES: set[str] = {
    "PAYMENT_ISSUE",
    "BILLING_ISSUE",
    "SERVER_DOWN",
    "CLIENT_COMPLAINT",
    "SECURITY",
    "INTERVIEW",
    "SUBSCRIPTION",
    "NEWSLETTER",
    "SPAM",
    "OTHER",
}


class Classification(BaseModel):
    """Structured decision produced for every email.

    The same schema is returned by both the Groq classifier and the
    deterministic fallback classifier, so downstream code never needs to
    branch on the source.
    """

    important: bool
    priority: Priority
    category: Category
    reason: str = Field(min_length=1)
    classifier_source: ClassifierSource

    @field_validator("priority", mode="before")
    @classmethod
    def _normalize_priority(cls, value: object) -> str:
        """Uppercase / strip arbitrary model output before validation."""
        if not isinstance(value, str):
            raise ValueError("priority must be a string")
        return value.strip().upper()

    @field_validator("category", mode="before")
    @classmethod
    def _normalize_category(cls, value: object) -> str:
        """Normalize to UPPER_SNAKE so 'payment issue' -> 'PAYMENT_ISSUE'."""
        if not isinstance(value, str):
            raise ValueError("category must be a string")
        return value.strip().upper().replace(" ", "_").replace("-", "_")

    @field_validator("classifier_source", mode="before")
    @classmethod
    def _normalize_source(cls, value: object) -> str:
        if not isinstance(value, str):
            raise ValueError("classifier_source must be a string")
        return value.strip().lower()


class RawEmail(BaseModel):
    """A single mock email as stored in `mock_data/emails.json`."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    sender: str = Field(alias="from")
    subject: str = ""
    body: str = ""
    date: datetime

    @field_validator("id")
    @classmethod
    def _id_not_blank(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("email id must not be empty")
        return value.strip()


class EmailOut(BaseModel):
    """Shape of an email returned by `GET /emails`."""

    model_config = ConfigDict(from_attributes=True)

    email_id: str
    sender: str
    subject: str
    body: str
    date: datetime
    important: bool
    priority: str
    category: str
    reason: str
    classifier_source: str
    created_at: datetime


class CategoryCount(BaseModel):
    """A single slice of the category breakdown used by the dashboard donut."""

    name: str
    count: int


class Stats(BaseModel):
    """Shape returned by `GET /stats`."""

    total_processed: int
    important_count: int
    fallback_count: int
    groq_count: int
    high_priority_count: int
    categories: list[CategoryCount]


class TriggerResult(BaseModel):
    """Shape returned by `POST /trigger`."""

    processed: int
    skipped: int
    failed: int
