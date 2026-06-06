# AI Email Reading Agent

An AI agent that **reads incoming emails, decides which ones matter, and shows only the important ones** on a clean dashboard. Unimportant mail (newsletters, promotions, spam) is silently ignored. Every email is processed at most once.

Built for the TQTech *Software Engineer 2 — AI Automation Engineer* technical task.

---

## 1. Overview

A background scheduler polls a mock mailbox (`mock_data/emails.json`) every 2 minutes. For each new email it:

1. Checks whether the `email_id` already exists in PostgreSQL — if so, it is skipped.
2. Classifies the email with **Groq AI** (JSON mode).
3. If Groq is unavailable or returns anything invalid, it **immediately falls back** to a deterministic rule-based classifier.
4. Stores the structured result in PostgreSQL.

The Next.js dashboard polls the backend and renders only emails marked `important = true`, newest first.

> The app is **fully functional with no Groq API key** — it simply runs in deterministic fallback mode.

## 2. Features

- Hybrid classifier: Groq LLM with a deterministic rule-based fallback.
- Structured decision per email: `important`, `priority`, `category`, `reason`.
- Duplicate prevention enforced at the database level (unique `email_id`).
- Scheduler polls every 2 minutes (APScheduler `AsyncIOScheduler`).
- Manual **Run agent** (`POST /trigger`) and **Refresh** controls on the dashboard.
- Polished dark **SaaS dashboard**: sidebar navigation, agent-status bar, stat cards, priority-colored email rows, a categories donut, a live "next check" countdown, and a recent-activity feed.
- Client-side **filters** (priority, category, time range) and **Dashboard / Important / All Emails** views.
- One-command local run via Docker Compose.
- Deployment-ready for Render (backend), Vercel (frontend), and Neon (PostgreSQL).

## 3. Architecture

```
mock_data/emails.json
        │  (read every 2 min by APScheduler)
        ▼
   processor.py ──► ai_agent.py ──► Groq (JSON mode)
        │                 └─ on ANY failure ─► deterministic fallback
        ▼
   PostgreSQL (processed_emails, unique email_id)
        ▲
        │  GET /emails  (important only, newest first)
        │  GET /stats   (counts)
        │  POST /trigger (manual run)
        ▼
   Next.js dashboard (SWR, polls every 30s)
```

The backend is split for separation of concerns: `schemas.py` (contracts), `models.py` (ORM), `database.py` (engine/session), `ai_agent.py` (classification), `processor.py` (the job), `main.py` (API + scheduler + lifespan).

## 4. Folder structure

```
ai-email-reading-agent/
├── docker-compose.yml
├── .env.example
├── README.md
├── mock_data/
│   └── emails.json
├── backend/
│   ├── Dockerfile
│   ├── render.yaml
│   ├── requirements.txt
│   ├── main.py          # FastAPI app, lifespan, scheduler, routes
│   ├── ai_agent.py      # Groq + deterministic fallback classifier
│   ├── processor.py     # read JSON, dedupe, classify, persist
│   ├── database.py      # async engine + session + init_db
│   ├── models.py        # ProcessedEmail ORM model
│   └── schemas.py       # Pydantic v2 schemas
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── tsconfig.json
    ├── lib/
    │   ├── utils.ts             # cn() + SWR fetcher + timeAgo/initials
    │   └── email.ts             # shared Email type + priority/category colors
    ├── components/
    │   ├── EmailCard.tsx
    │   ├── Donut.tsx            # dependency-free SVG donut
    │   └── ui/ (card, badge, button, skeleton)
    └── src/app/
        ├── layout.tsx
        ├── page.tsx             # dashboard (use client)
        └── globals.css
```

## 5. Local setup without Docker

**Backend** (Python 3.10+, needs a reachable PostgreSQL):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/email_agent"
export MOCK_EMAIL_FILE="../mock_data/emails.json"
uvicorn main:app --reload --port 8000
```

**Frontend** (Node 18+):

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local
npm run dev    # http://localhost:3000
```

## 6. Docker setup (recommended)

```bash
cp .env.example .env        # optional; add GROQ_API_KEY if you have one
docker compose up --build
```

Then open:

- Dashboard: <http://localhost:3000>
- API docs:  <http://localhost:8000/docs>

Postgres has a `pg_isready` healthcheck and the backend waits for `service_healthy` before starting.

## 7. Environment variables

| Variable                | Purpose                                              | Example                                                        |
| ----------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| `DATABASE_URL`          | Async PostgreSQL URL (`postgresql://` auto-upgraded) | `postgresql+asyncpg://postgres:postgres@postgres:5432/email_agent` |
| `GROQ_API_KEY`          | Groq key. **Empty = fallback mode**                  | *(empty)*                                                      |
| `GROQ_MODEL`            | Groq model name                                      | `llama3-8b-8192`                                               |
| `MOCK_EMAIL_FILE`       | Path to the mock mailbox                             | `/app/mock_data/emails.json`                                   |
| `BACKEND_CORS_ORIGINS`  | Comma-separated allowed origins                      | `http://localhost:3000`                                        |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL the browser calls                      | `http://localhost:8000`                                        |

## 8. API documentation

| Method | Path       | Description                                  | Response                                                                 |
| ------ | ---------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| GET    | `/health`  | Liveness probe                               | `{"status":"ok"}`                                                        |
| GET    | `/emails`  | Emails newest-first. `?important_only=false` lists everything (default `true` = important only) | `[{ email_id, sender, subject, body, date, important, priority, category, reason, classifier_source, created_at }]` |
| POST   | `/trigger` | Run one processing pass now                  | `{"processed":2,"skipped":3,"failed":0}`                                |
| GET    | `/stats`   | Aggregate counts + category breakdown        | `{"total_processed":9,"important_count":6,"fallback_count":9,"groq_count":0,"high_priority_count":6,"categories":[{"name":"PAYMENT_ISSUE","count":1}]}` |

Interactive docs are served at `/docs`.

## 9. Scheduler

`main.py` starts a single `AsyncIOScheduler` inside the FastAPI lifespan. The job runs once on startup (so the dashboard is populated immediately) and then every 2 minutes. `max_instances=1` + `coalesce=True` prevent overlapping runs.

## 10. Duplicate prevention

`processed_emails.email_id` is **unique and indexed**. Before each pass the processor loads all existing IDs in one query and skips matches. If two runs race, the unique constraint raises `IntegrityError`, which is caught and counted as a *skip* — so the same email is never stored or displayed twice.

## 11. AI logic — Groq + fallback

The classifier (`ai_agent.py`) always returns the same Pydantic `Classification` schema:

```json
{ "important": true, "priority": "HIGH", "category": "PAYMENT_ISSUE",
  "reason": "Payment failure requires immediate action.", "classifier_source": "groq" }
```

The categories are operational and match the task examples: `PAYMENT_ISSUE`, `BILLING_ISSUE`, `SERVER_DOWN`, `CLIENT_COMPLAINT`, `SECURITY`, `INTERVIEW`, `SUBSCRIPTION`, `NEWSLETTER`, `SPAM`, `OTHER`.

**Groq path:** calls `llama3-8b-8192` with `response_format={"type": "json_object"}` and a strict system prompt, then validates with Pydantic and normalizes priority/category casing.

**Fallback path** (deterministic, keyword-based) triggers on *any* of: missing API key, timeout, rate limit, network error, empty response, invalid JSON, missing keys, or out-of-range priority/category. Each category rule carries a default priority and importance; the first matching rule wins (checked in this order):

- **Important (HIGH):** `SERVER_DOWN` (outage, downtime, instance stopped), `SECURITY` (new/suspicious login, password reset, unauthorized), `PAYMENT_ISSUE` (payment failed/declined, card declined), `BILLING_ISSUE` (invoice, overdue, past due), `CLIENT_COMPLAINT` (cannot access, urgent, refund, action required), `INTERVIEW` (interview, hiring, recruiter).
- **Not important (LOW):** `SUBSCRIPTION` (renewal successful, auto-renew), `NEWSLETTER` (newsletter, unsubscribe, promotion, sale), `SPAM` (lottery, winner, free money, claim prize, crypto giveaway).
- Explicit urgency words (urgent, asap, critical, immediately, action required) escalate priority to HIGH; spam keywords always force `SPAM`/LOW/not-important.

Because the fallback is complete on its own, the system satisfies the "mock mode must work without credentials" requirement.

## 12. Frontend polling

`page.tsx` is a client component using SWR to fetch `/emails` and `/stats` with `refreshInterval: 30000` (30s). The sidebar switches views (Dashboard/Important/All Emails plus AI Configuration, Sources, Logs, Settings info panels); the right rail holds filters, the categories donut, an agent-status widget with a live "next check" countdown, and a recent-activity feed. **Refresh** revalidates immediately; **Run agent** calls `POST /trigger` then revalidates. Skeleton loaders show while loading, an empty state shows at inbox zero, and an error state shows if the backend is unreachable. The theme is a dark SaaS layout driven by CSS design tokens in `globals.css`.

## 13. Deployment guide

**Neon (PostgreSQL):** create a project, copy the connection string into `DATABASE_URL`. The app auto-converts `postgresql://` → `postgresql+asyncpg://` and strips `sslmode` params (asyncpg negotiates SSL automatically).

**Render (backend):** `backend/render.yaml` is included. Create a Python web service with root directory `backend`, build `pip install -r requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port $PORT`. Set `DATABASE_URL` (Neon), optional `GROQ_API_KEY`, and `BACKEND_CORS_ORIGINS` to your Vercel URL.

**Vercel (frontend):** import the repo with root directory `frontend`. Set `NEXT_PUBLIC_BACKEND_URL=https://your-render-backend-url.onrender.com`. Deploy.

## 14. Submission checklist

- [x] GitHub repository with full source code
- [x] Dockerfile (backend + frontend) and `docker-compose.yml`
- [x] `.env.example` with all variables (no real secrets)
- [x] Mock email dataset (`mock_data/emails.json`)
- [x] README (setup, AI logic, dashboard, limitations)
- [ ] Live demo link (add after deploying to Vercel/Render)

## 15. Troubleshooting

- **Dashboard shows "Can't reach the agent":** the backend isn't running or `NEXT_PUBLIC_BACKEND_URL` is wrong. Check <http://localhost:8000/health>.
- **`NEXT_PUBLIC_BACKEND_URL` change has no effect:** it is inlined at build time. Rebuild the frontend (`npm run build` / `docker compose build frontend`).
- **Backend can't connect to DB:** wait for Postgres health, and confirm the URL uses `postgresql+asyncpg://`.
- **No emails appear:** the agent runs every 2 min — click **Run agent**, and confirm `MOCK_EMAIL_FILE` points to a valid JSON array.
- **Want to test Groq:** put a real key in `GROQ_API_KEY`; otherwise everything runs in fallback mode by design.

## 16. Limitations

- Mock mailbox only (JSON file); no live Gmail/IMAP connection.
- Tables are auto-created on startup (no migrations) — acceptable for this task.
- Fallback is keyword-based, so adversarial wording can be misclassified.
- No authentication on the dashboard/API (out of scope).
