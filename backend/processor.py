"""Email-processing job.

Reads mock emails from a JSON file, skips any whose `email_id` is already in
the database, classifies the rest (Groq -> fallback), and persists the result.
Returns processed / skipped / failed counts. Safe to call from the scheduler
and from the manual `POST /trigger` route.
"""

from __future__ import annotations

import json
import logging
import os

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from ai_agent import classify_email
from database import SessionLocal
from models import ProcessedEmail
from schemas import RawEmail, TriggerResult

logger = logging.getLogger("email_agent.processor")


def _mock_file_path() -> str:
    return os.getenv("MOCK_EMAIL_FILE", "mock_data/emails.json")


def _load_raw_emails() -> list[RawEmail]:
    """Load + validate mock emails. Missing/broken file -> warning + empty list."""
    path = _mock_file_path()
    if not os.path.exists(path):
        logger.warning("Mock email file not found at '%s'; skipping run.", path)
        return []

    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, json.JSONDecodeError) as exc:
        logger.warning("Could not read mock email file '%s': %s", path, exc)
        return []

    if not isinstance(data, list):
        logger.warning("Mock email file '%s' must contain a JSON array.", path)
        return []

    emails: list[RawEmail] = []
    for index, item in enumerate(data):
        try:
            emails.append(RawEmail.model_validate(item))
        except Exception as exc:  # noqa: BLE001 - skip malformed records, keep going
            logger.warning("Skipping malformed email at index %d: %s", index, exc)
    return emails


async def process_emails() -> TriggerResult:
    """Run one full processing pass. Never raises to the caller."""
    raw_emails = _load_raw_emails()
    if not raw_emails:
        return TriggerResult(processed=0, skipped=0, failed=0)

    processed = skipped = failed = 0

    async with SessionLocal() as session:
        # Fetch existing IDs once to avoid a round trip per email.
        existing_rows = await session.execute(select(ProcessedEmail.email_id))
        existing_ids: set[str] = {row[0] for row in existing_rows.all()}

        for email in raw_emails:
            if email.id in existing_ids:
                skipped += 1
                continue

            try:
                result = await classify_email(email.subject, email.body)
                record = ProcessedEmail(
                    email_id=email.id,
                    sender=email.sender,
                    subject=email.subject,
                    body=email.body,
                    date=email.date,
                    important=result.important,
                    priority=result.priority,
                    category=result.category,
                    reason=result.reason,
                    classifier_source=result.classifier_source,
                )
                session.add(record)
                await session.commit()
                existing_ids.add(email.id)
                processed += 1
            except IntegrityError:
                # Another run inserted the same email_id concurrently -> treat
                # as a skip rather than a failure (duplicate prevention holds).
                await session.rollback()
                existing_ids.add(email.id)
                skipped += 1
            except Exception as exc:  # noqa: BLE001
                await session.rollback()
                failed += 1
                logger.error("Failed to process email '%s': %s", email.id, exc)

    logger.info(
        "Processing pass complete: processed=%d skipped=%d failed=%d",
        processed, skipped, failed,
    )
    return TriggerResult(processed=processed, skipped=skipped, failed=failed)
