"""Hybrid email classifier.

Strategy:
1. If a GROQ_API_KEY is configured, ask Groq (JSON mode) to classify the email.
2. Validate the model output with Pydantic. ANY problem -- missing key, bad
   priority/category, invalid JSON, timeout, rate-limit, network error, empty
   response, or no key at all -- falls back immediately to a deterministic
   rule-based classifier.

The fallback alone is fully functional, so the app works end-to-end with an
empty GROQ_API_KEY.
"""

from __future__ import annotations

import json
import logging
import os

from dotenv import load_dotenv
from pydantic import ValidationError

from schemas import Classification

load_dotenv()

logger = logging.getLogger("email_agent.ai")

GROQ_API_KEY: str = (os.getenv("GROQ_API_KEY") or "").strip()
GROQ_MODEL: str = (os.getenv("GROQ_MODEL") or "llama3-8b-8192").strip()
GROQ_TIMEOUT_SECONDS: float = 20.0

SYSTEM_PROMPT = (
    "You are an email triage assistant. Read the email and return ONLY a single "
    "JSON object, with no markdown, no code fences, and no commentary.\n\n"
    "The JSON object MUST have exactly these keys:\n"
    '  "important": boolean,\n'
    '  "priority": one of "HIGH", "MEDIUM", "LOW",\n'
    '  "category": one of "PAYMENT_ISSUE", "BILLING_ISSUE", "SERVER_DOWN", '
    '"CLIENT_COMPLAINT", "SECURITY", "INTERVIEW", "SUBSCRIPTION", "NEWSLETTER", '
    '"SPAM", "OTHER",\n'
    '  "reason": a short one-sentence justification.\n\n'
    "Mark important=true (usually HIGH) for: client complaints or urgent customer "
    "requests, payment failures or billing issues, server/outage alerts, security "
    "or account alerts, and interview/hiring messages. Mark important=false (LOW) "
    "for subscription/automated confirmations, newsletters, promotions, and spam."
)

# --------------------------------------------------------------------------- #
# Deterministic fallback rules
# --------------------------------------------------------------------------- #

_UNIMPORTANT_KEYWORDS = (
    "newsletter", "promotion", "discount", "unsubscribe", "sale", "coupon",
    "marketing", "weekly digest", "subscription renewed", "renewal successful",
)
_SPAM_KEYWORDS = (
    "lottery", "winner", "free money", "claim prize", "crypto giveaway",
    "you have won", "congratulations you",
)

# Category rules ordered by precedence; the first match wins. Each maps to an
# operational category and a default priority + importance.
_CATEGORY_RULES: tuple[tuple[str, str, bool, tuple[str, ...]], ...] = (
    # (category, priority, important, keywords)
    ("SPAM", "LOW", False, _SPAM_KEYWORDS),
    ("SERVER_DOWN", "HIGH", True,
     ("server down", "server is down", "outage", "downtime", "ec2", "instance",
      "503", "service unavailable", "site is down")),
    ("SECURITY", "HIGH", True,
     ("security alert", "new login", "suspicious login", "password", "reset your",
      "2fa", "unauthorized", "account locked", "verify your account")),
    ("PAYMENT_ISSUE", "HIGH", True,
     ("payment failed", "payment declined", "card declined", "transaction failed",
      "update your payment", "payment method")),
    ("BILLING_ISSUE", "HIGH", True,
     ("invoice", "overdue", "billing issue", "past due", "unpaid", "receipt")),
    ("CLIENT_COMPLAINT", "HIGH", True,
     ("cannot access", "can't access", "not working", "complaint", "angry",
      "refund", "urgent", "asap", "customer cannot", "checkout is down",
      "losing orders", "action required")),
    ("INTERVIEW", "HIGH", True,
     ("interview", "hiring", "recruiter", "job offer", "application", "shortlist")),
    ("SUBSCRIPTION", "LOW", False,
     ("subscription", "renewed", "renewal successful", "auto-renew", "trial ends")),
    ("NEWSLETTER", "LOW", False,
     ("newsletter", "weekly digest", "unsubscribe", "promotion", "discount",
      "sale", "coupon", "marketing")),
)

_HIGH_KEYWORDS = (
    "urgent", "asap", "deadline", "immediately", "critical", "action required",
)
_MEDIUM_KEYWORDS = (
    "follow up", "reminder", "please review", "pending",
)


def _contains_any(text: str, keywords: tuple[str, ...]) -> bool:
    return any(keyword in text for keyword in keywords)


def fallback_classify(subject: str, body: str) -> Classification:
    """Deterministic, rule-based classification. Never raises."""
    text = f"{subject}\n{body}".lower()

    category = "OTHER"
    priority = "MEDIUM"
    important = False
    matched = False

    for name, base_priority, base_important, keywords in _CATEGORY_RULES:
        if _contains_any(text, keywords):
            category = name
            priority = base_priority
            important = base_important
            matched = True
            break

    # Escalate priority if explicit urgency words appear, regardless of category.
    if important and _contains_any(text, _HIGH_KEYWORDS):
        priority = "HIGH"
    elif not matched and _contains_any(text, _HIGH_KEYWORDS):
        # No category matched but it sounds urgent -> treat as a client issue.
        category, priority, important = "CLIENT_COMPLAINT", "HIGH", True
        matched = True
    elif not matched and _contains_any(text, _MEDIUM_KEYWORDS):
        priority = "MEDIUM"

    # Spam / newsletter / subscription override importance to false.
    if _contains_any(text, _SPAM_KEYWORDS):
        category, priority, important = "SPAM", "LOW", False
    elif not important and _contains_any(text, _UNIMPORTANT_KEYWORDS):
        important = False

    if important:
        reason = f"Matched {category.replace('_', ' ').lower()} signals; needs attention."
    elif category in ("NEWSLETTER", "SUBSCRIPTION", "SPAM"):
        reason = f"Classified as {category.replace('_', ' ').lower()}; safe to ignore."
    else:
        reason = "No high-signal keywords detected; treated as routine."

    return Classification(
        important=important,
        priority=priority,  # type: ignore[arg-type]
        category=category,  # type: ignore[arg-type]
        reason=reason,
        classifier_source="fallback",
    )


# --------------------------------------------------------------------------- #
# Groq classifier (with graceful degradation)
# --------------------------------------------------------------------------- #

async def _groq_classify(subject: str, body: str) -> Classification:
    """Call Groq in JSON mode and validate. Raises on any failure."""
    # Imported lazily so the app starts even if the package were missing.
    from groq import AsyncGroq

    client = AsyncGroq(api_key=GROQ_API_KEY, timeout=GROQ_TIMEOUT_SECONDS)
    user_content = f"Subject: {subject}\n\nBody:\n{body}"

    completion = await client.chat.completions.create(
        model=GROQ_MODEL,
        response_format={"type": "json_object"},
        temperature=0,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
    )

    content = (completion.choices[0].message.content or "").strip()
    if not content:
        raise ValueError("Groq returned an empty response.")

    payload = json.loads(content)  # raises JSONDecodeError on bad JSON
    if not isinstance(payload, dict):
        raise ValueError("Groq JSON payload was not an object.")

    payload["classifier_source"] = "groq"
    return Classification.model_validate(payload)  # raises on invalid fields


async def classify_email(subject: str, body: str) -> Classification:
    """Classify an email, preferring Groq and falling back deterministically."""
    if not GROQ_API_KEY:
        logger.debug("No GROQ_API_KEY set; using deterministic fallback.")
        return fallback_classify(subject, body)

    try:
        result = await _groq_classify(subject, body)
        logger.debug("Classified via Groq: %s/%s", result.priority, result.category)
        return result
    except (ValidationError, ValueError, json.JSONDecodeError) as exc:
        logger.warning("Groq output invalid (%s); using fallback.", exc)
    except Exception as exc:  # noqa: BLE001 - any SDK/network error must degrade
        logger.warning("Groq call failed (%s: %s); using fallback.", type(exc).__name__, exc)

    return fallback_classify(subject, body)
