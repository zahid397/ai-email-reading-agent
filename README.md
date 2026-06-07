# AI Email Reading Agent

An autonomous AI agent that reads incoming emails, classifies them as important or not, assigns priority (`HIGH` / `MEDIUM` / `LOW`), categorizes them (`PAYMENT_ISSUE`, `SERVER_DOWN`, `CLIENT_COMPLAINT`, `SECURITY`, `SPAM`, etc.), and explains each decision with a human-readable `reason`. A white/orange Next.js dashboard shows only what matters, with duplicate prevention and a 2-minute scheduler.

Built for the TQTech *Software Engineer 2 — AI Automation Engineer* technical task.

---

## Features

- **AI classification** — `important` (true/false), `priority`, `category`, `reason` per email
- **Groq LLM** with strict JSON output when `GROQ_API_KEY` is set
- **Rule-based fallback** — deterministic keyword classifier (minimum acceptable mode; works without any API key)
- **Duplicate prevention** — unique `email_id` tracking; already-processed emails are skipped
- **Scheduler** — backend APScheduler polls every 2 minutes; frontend simulates the same interval
- **Dashboard** — stat cards, workflow animation, important/all email tables, sources, logs, settings
- **Docker Compose** — one command runs PostgreSQL + FastAPI + Next.js
- **Deployment-ready** — Render (backend), Vercel (frontend), with graceful mock fallback

---

## Architecture

```
mock_data/emails.json  (backend)          MOCK_INBOX 14 emails (frontend fallback)
        │                                        │
        ▼                                        ▼
   FastAPI backend                      Next.js API routes (/api/*)
   processor.py → ai_agent.py           mockEngine.ts (stateful demo)
   Groq OR rule-based fallback                  │
        │                                      │
        ▼                                      ▼
   PostgreSQL                           Browser dashboard (SWR)
        ▲
        │  GET /health, /stats, /emails, POST /trigger
        └──────── proxied when Groq is active ────────┘
```

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 14 App Router, React, Tailwind CSS, SWR |
| Backend | FastAPI, Python, SQLAlchemy, APScheduler |
| Database | PostgreSQL (Docker) / Neon (production) |
| AI | Groq API (`llama3-8b-8192`) + rule-based fallback |
| Infra | Docker Compose, Render, Vercel |

---

## Submission note

> The live Vercel demo uses same-origin Next.js API routes with Render backend fallback. If the Render free-tier backend is sleeping or unavailable, the UI falls back to a **stateful mock dataset** (14 emails, rule-based fallback mode, `groq_count = 0`) so reviewers can still test the dashboard, Run Agent workflow, and scheduler. The full FastAPI backend, scheduler, duplicate prevention, and Docker setup are included in the repository and can be run locally with `docker compose up --build`.

Without a Groq API key, the Next.js API routes serve the mock engine (initial 4 processed → +3 per Run Agent click → 14 max → duplicate prevention). With Groq active, live backend data is used automatically.

---

## Quick start (Docker — recommended)

```bash
cp .env.example .env          # optional: add GROQ_API_KEY
docker compose up --build
```

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000 |
| FastAPI docs | http://localhost:8000/docs |
| Health check | http://localhost:3000/api/health |

---

## Local setup (without Docker)

**Backend:**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/email_agent"
export MOCK_EMAIL_FILE="../mock_data/emails.json"
uvicorn main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev    # http://localhost:3000 (or 3001 if 3000 is busy)
```

Leave `NEXT_PUBLIC_BACKEND_URL` empty to use same-origin `/api/*` routes with the mock engine.

---

## Mock demo flow (Run Agent)

The frontend mock engine has exactly **14 inbox emails**. On first load, **4 are pre-processed**.

| Action | `total_processed` |
|--------|-------------------|
| Initial load | 4 |
| Run Agent × 1 | 7 |
| Run Agent × 2 | 10 |
| Run Agent × 3 | 13 |
| Run Agent × 4 | 14 |
| Run Agent × 5 | 0 processed, 14 skipped (duplicate prevention) |

In mock/fallback mode: `groq_count = 0`, `fallback_count = total_processed`.

Test via browser:

```
http://localhost:3000/api/stats
http://localhost:3000/api/trigger
http://localhost:3000/api/stats
```

---

## API endpoints

### Next.js proxy routes (browser)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Classification statistics |
| GET | `/api/emails` | Important processed emails |
| GET | `/api/emails?important_only=false` | All processed emails |
| POST | `/api/trigger` | Process next email batch |
| GET | `/api/trigger` | Same as POST (browser testing) |
| POST | `/api/demo/reset` | Reset mock state to 4 processed |

All routes return `X-Data-Source: mock` or `render` and `Cache-Control: no-store`.

### FastAPI backend (direct)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness probe |
| GET | `/stats` | Aggregate counts |
| GET | `/emails` | Emails (`?important_only=false` for all) |
| POST | `/trigger` | Manual processing pass |

Interactive docs: http://localhost:8000/docs

---

## AI classification logic

Each email is classified into:

```json
{
  "important": true,
  "priority": "HIGH",
  "category": "PAYMENT_ISSUE",
  "reason": "Payment failure requires immediate action.",
  "classifier_source": "fallback"
}
```

**Groq path** — calls `llama3-8b-8192` with JSON mode, validates with Pydantic.

**Fallback path** (keyword-based, no API key required) — triggers on missing key, timeout, or invalid response:

| Category | Default priority | Important |
|----------|-----------------|-----------|
| SERVER_DOWN | HIGH | yes |
| SECURITY | HIGH | yes |
| PAYMENT_ISSUE | HIGH | yes |
| CLIENT_COMPLAINT | HIGH | yes |
| BILLING_ISSUE | HIGH | yes |
| INTERVIEW | HIGH | yes |
| NEWSLETTER | LOW | no |
| SPAM | LOW | no |
| SUBSCRIPTION | LOW | no |

---

## Duplicate prevention

- Backend: unique `email_id` in PostgreSQL; processor skips known IDs
- Frontend mock: `processedIds` Set in `globalThis.__emailAgentMockStore`
- Trigger response reports `skipped` count for already-processed emails

---

## Scheduler

- **Backend**: APScheduler runs every 2 minutes (`main.py` lifespan)
- **Frontend**: countdown timer auto-triggers `/api/trigger` every 2 minutes, refreshes stats/emails, logs the event

---

## Environment variables

See [`.env.example`](.env.example). **Never commit real API keys.**

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Groq API key (empty = fallback mode) |
| `DATABASE_URL` | PostgreSQL connection string |
| `MOCK_EMAIL_FILE` | Backend mock mailbox path |
| `BACKEND_CORS_ORIGINS` | Allowed CORS origins |
| `RENDER_BACKEND_URL` | Server-side backend URL (Docker/Vercel) |
| `NEXT_PUBLIC_BACKEND_URL` | Browser API base (empty = `/api/*`) |

---

## Dashboard pages

| Page | Content |
|------|---------|
| Dashboard | Stat cards, system status, workflow, recent important emails |
| Important Emails | Table of important processed emails only |
| All Emails | Table of all processed emails |
| Sources | Mock dataset (active), Gmail/Outlook (future), test/reset/run controls |
| Logs | localStorage action log with refresh/clear |
| Settings | API mode, AI engine, scheduler, demo controls, limitations |

---

## Deployment

- **Render** — deploy `backend/` as Python web service; set `DATABASE_URL`, optional `GROQ_API_KEY`
- **Vercel** — deploy `frontend/`; set `RENDER_BACKEND_URL` to Render URL; leave `NEXT_PUBLIC_BACKEND_URL` empty
- **Neon** — PostgreSQL for production `DATABASE_URL`

---

## Limitations

- Mock mailbox only (JSON file + frontend mock engine); no live Gmail/IMAP
- Free-tier Render sleeps after inactivity; UI falls back to mock dataset
- No authentication on dashboard/API (out of scope)
- Fallback classifier is keyword-based; adversarial wording may be misclassified

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Stats stuck at 4 after Run Agent | Rebuild frontend (`docker compose up --build`); API routes must be `force-dynamic` |
| Port 3000 in use | Dev server auto-uses 3001; Docker maps 3000:3000 |
| Backend unreachable | Check http://localhost:8000/health; mock fallback activates automatically |
| `npm run build` fails | Run from `frontend/` directory |

---

## Submission checklist

- [x] GitHub repository with full source code
- [x] Dockerfile (backend + frontend) and `docker-compose.yml`
- [x] `.env.example` with safe placeholders (no real secrets)
- [x] Mock email dataset (`mock_data/emails.json` + 14-email frontend mock)
- [x] README (setup, AI logic, dashboard, limitations, submission note)
- [ ] Live demo link (add after deploying to Vercel/Render)
