<div align="center">

# 🤖 AI Email Reading Agent

### TQTech · Software Engineer 2 — AI Automation Engineer

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://ai-email-reading-agent.netlify.app/)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://ai-email-reading-agent.onrender.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)

<br/>

> **An intelligent email agent that reads incoming emails, uses AI to decide what matters, and surfaces only important emails on a real-time dashboard.**

<br/>

| 🌐 Frontend Demo | 🔌 Backend API | 🐳 Local Docker |
|:---:|:---:|:---:|
| [ai-email-reading-agent.netlify.app](https://ai-email-reading-agent.netlify.app/) | [ai-email-reading-agent.onrender.com](https://ai-email-reading-agent.onrender.com) | `docker compose up --build` |

</div>

---

## 📋 Table of Contents

- [Core Idea](#-core-idea)
- [Live Links](#-live-links)
- [How It Works](#-how-it-works-end-to-end)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [AI Classification](#-ai-classification--the-heart-of-the-system)
- [Duplicate Prevention](#-duplicate-prevention)
- [Scheduler](#-scheduler)
- [Mock Email Dataset](#-mock-email-dataset)
- [Project Structure](#-project-structure)
- [Quick Start — Docker](#-quick-start--docker)
- [Local Setup — Without Docker](#-local-setup--without-docker)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Dashboard Features](#-dashboard-features)
- [Deployment Guide](#-deployment-guide)
- [Submission Checklist](#-submission-checklist)
- [Limitations](#-limitations)
- [Troubleshooting](#-troubleshooting)

---

## 💡 Core Idea

A real email account receives emails. The AI reads each incoming email, decides whether it is important or not, and if important, displays it as a notification on a dashboard. Non-important emails are silently ignored.

```
Email arrives → AI reads subject + body → Important? → Show on dashboard
                                        → Not important? → Silently ignored
                                        → Already seen? → Skip (dedup)
```

---

## 🌐 Live Links

| Resource | URL | Status |
|---|---|---|
| 🖥️ **Frontend Dashboard** | https://ai-email-reading-agent.netlify.app/ | ✅ Always Live (Static Demo) |
| 🔌 **Backend REST API** | https://ai-email-reading-agent.onrender.com | ✅ Live (may cold-start ~30s) |
| 📖 **API Docs (Swagger)** | https://ai-email-reading-agent.onrender.com/docs | ✅ Interactive |
| 🐳 **Docker** | `docker compose up --build` | ✅ Full Stack Local |

> **Note:** The Render backend uses the free tier — the first request after 15 minutes of inactivity takes ~30–60 seconds to warm up. The frontend handles this gracefully with a loading state.

---

## ⚙️ How It Works — End to End

```
┌─────────────────────────────────────────────────────────┐
│                    EVERY 2 MINUTES                       │
│                                                         │
│  mock_data/emails.json                                  │
│         │                                               │
│         ▼                                               │
│  1. Read email from JSON file                           │
│         │                                               │
│         ▼                                               │
│  2. Check email_id in PostgreSQL                        │
│         │                                               │
│    ┌────┴────┐                                          │
│    │ Exists? │                                          │
│    └────┬────┘                                          │
│    YES  │  NO                                           │
│    Skip │  3. Classify with Groq AI                    │
│         │         │                                     │
│         │    Fail? → 4. Deterministic Fallback          │
│         │         │                                     │
│         │         ▼                                     │
│         │  5. Store in PostgreSQL                       │
│         │         │                                     │
│         │         ▼                                     │
│         │  6. important=true? → Show on Dashboard       │
│         │  6. important=false? → Silently ignored       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Step by step:**

1. APScheduler polls the mock mailbox every **2 minutes**
2. Reads each email from `mock_data/emails.json`
3. Checks `email_id` uniqueness in PostgreSQL — **never processes the same email twice**
4. Classifies using **Groq AI** (llama3-8b-8192, JSON mode)
5. If Groq fails for any reason → **deterministic rule-based fallback** runs instantly
6. Stores the structured classification result in PostgreSQL
7. Frontend polls `/emails` every 30 seconds via **SWR**
8. Dashboard shows only `important = true` emails

---

## ✨ Features

### 🤖 AI Agent
- Hybrid classifier: **Groq LLM + deterministic fallback**
- Groq JSON mode with strict output validation
- Automatic fallback on timeout / rate limit / invalid response / missing key
- Fully functional with **empty `GROQ_API_KEY`** (fallback mode)
- Structured decision per email: `important`, `priority`, `category`, `reason`

### 📊 Dashboard
- Real-time stats: Total Processed, Important, High Priority, Groq vs Fallback
- **System Status** panel: Backend, Database, AI Engine, Scheduler
- **Agent Workflow** animation: Reading → Dedup → Classify → Save
- **Important Email Table**: priority borders, category badges, AI reason, sender avatars
- **Categories Donut** chart (from stats.categories)
- **Recent Activity** feed
- **Source Status** panel
- **Scheduler Timeline**
- Skeleton loaders, empty state, error state

### 🛡️ Reliability
- Duplicate prevention enforced at **database level** (unique constraint on `email_id`)
- Groq failure never crashes the app — fallback handles everything
- Missing `emails.json` file → logs warning, continues running
- Frontend shows stale data if backend is temporarily unreachable

### 🔘 Working Buttons
| Button | Action |
|---|---|
| **Run Agent** | Triggers immediate processing pass |
| **Refresh** | Revalidates all SWR keys |
| **Test Connection** | Tests health + stats + emails endpoints |
| **Bell** | Shows important count, high priority, last run |
| **Reset Demo** | Clears state (static demo only) |
| **View Logs** | Opens real-time frontend log panel |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.11** | Runtime |
| **FastAPI** | REST API framework |
| **SQLAlchemy 2.0** | Async ORM |
| **asyncpg** | Async PostgreSQL driver |
| **APScheduler** | Email polling every 2 minutes |
| **Groq SDK** | LLM classification (llama3-8b-8192) |
| **Pydantic v2** | Schema validation |
| **python-dotenv** | Environment management |
| **PostgreSQL** | Persistent email storage |

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 14** | App Router, static export |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **SWR** | Data fetching + polling |
| **Lucide React** | Icons |
| **clsx + tailwind-merge** | Class utilities |

### Infrastructure
| Service | Role |
|---|---|
| **Docker + Docker Compose** | Full local stack |
| **Render** | Backend hosting (Python web service) |
| **Netlify** | Frontend hosting (static site) |
| **Neon / PostgreSQL** | Production database |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                               │
│                                                                  │
│  Browser                                                         │
│    │                                                             │
│    ▼                                                             │
│  Netlify (Next.js Static)           Render (FastAPI)             │
│  ai-email-reading-agent             ai-email-reading-agent       │
│  .netlify.app                       .onrender.com                │
│    │  GET /api/emails                    │                        │
│    │  GET /api/stats         ───────────►│  GET /emails           │
│    │  POST /api/trigger                  │  GET /stats            │
│    │  GET /api/health                    │  POST /trigger         │
│    │                                     │  GET /health           │
│    │  (Next.js API routes                │       │                │
│    │   proxy to Render OR                │       ▼                │
│    │   serve mock data as fallback)      │  PostgreSQL (Neon)     │
│                                          │       │                │
│                                          │  APScheduler           │
│                                          │  (every 2 min)         │
│                                          │       │                │
│                                          │  mock_data/emails.json │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         LOCAL DOCKER                             │
│                                                                  │
│  Browser :3000                                                   │
│    │                                                             │
│    ▼                                                             │
│  Next.js :3000  ──────────────────►  FastAPI :8000              │
│                                          │                       │
│                                     PostgreSQL :5432             │
│                                          │                       │
│                                     mock_data/ (volume mount)    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 AI Classification — The Heart of the System

Every email goes through a **two-stage hybrid classifier**:

### Stage 1: Groq AI (Primary)

```python
client.chat.completions.create(
    model="llama3-8b-8192",
    response_format={"type": "json_object"},  # JSON mode
    messages=[
        {"role": "system", "content": STRICT_SYSTEM_PROMPT},
        {"role": "user",   "content": f"Subject: {subject}\nBody: {body}"}
    ]
)
```

Returns structured JSON:
```json
{
  "important": true,
  "priority": "HIGH",
  "category": "PAYMENT_ISSUE",
  "reason": "Payment failure detected — card declined, immediate action required.",
  "classifier_source": "groq"
}
```

### Stage 2: Deterministic Fallback (Always Ready)

Triggers on **any** Groq failure:
- Missing API key → fallback
- Timeout → fallback
- Rate limit → fallback
- Network error → fallback
- Invalid JSON → fallback
- Missing keys → fallback
- Invalid priority/category → fallback
- Any exception → fallback

**Category Rules** (first match wins):

| Category | Keywords |
|---|---|
| `SPAM` | lottery, winner, free money, claim prize, crypto giveaway |
| `SERVER_DOWN` | server down, outage, EC2, instance stopped, 503 |
| `SECURITY` | security alert, new login, suspicious, password reset |
| `PAYMENT_ISSUE` | payment failed, card declined, transaction failed |
| `BILLING_ISSUE` | invoice, overdue, past due, outstanding balance |
| `CLIENT_COMPLAINT` | cannot access, urgent, action required, 403 error |
| `INTERVIEW` | interview, hiring, recruiter, job offer |
| `SUBSCRIPTION` | renewal successful, auto-renew, next renewal |
| `NEWSLETTER` | newsletter, unsubscribe, promotion, discount |

**Priority Rules:**

| Priority | Triggers |
|---|---|
| `HIGH` | urgent, asap, critical, server down, payment failed, security alert, interview |
| `MEDIUM` | meeting, follow up, feature request, reminder |
| `LOW` | newsletter, promotion, subscription, spam |

**The app works 100% without a Groq API key** — fallback handles all classification.

---

## 🛡️ Duplicate Prevention

Duplicate prevention is enforced at **two levels**:

### Level 1 — Application Level (Fast)
```python
# Before inserting, fetch all existing IDs in one query
existing_rows = await session.execute(select(ProcessedEmail.email_id))
existing_ids: set[str] = {row[0] for row in existing_rows.all()}

for email in raw_emails:
    if email.id in existing_ids:
        skipped += 1
        continue  # Never processes the same email twice
```

### Level 2 — Database Level (Safe)
```sql
-- email_id has a UNIQUE constraint
email_id VARCHAR(255) UNIQUE NOT NULL
```

If two scheduler runs overlap (race condition), the `IntegrityError` is caught and counted as a skip — **the database guarantees deduplication**.

---

## ⏰ Scheduler

```python
# Starts on FastAPI lifespan startup
scheduler.start()
scheduler.add_job(
    process_emails,
    trigger="interval",
    minutes=2,
    max_instances=1,   # Never overlaps
    coalesce=True,     # Catches up on missed runs
)
```

- Runs **once on startup** (dashboard has data immediately)
- Then every **2 minutes** automatically
- `POST /trigger` allows manual on-demand runs
- Frontend shows live countdown: **"Next run in 01:47"**

---

## 📬 Mock Email Dataset

9 realistic emails covering all required scenarios:

| # | From | Subject | Category | Important |
|---|---|---|---|---|
| 1 | billing@paysecure.com | Payment failed for Invoice #INV-2287 | `PAYMENT_ISSUE` | ✅ HIGH |
| 2 | alerts@aws.amazon.com | Server is DOWN — Urgent Action Required | `SERVER_DOWN` | ✅ HIGH |
| 3 | support@yourapp.com | Urgent: Customer cannot access account | `CLIENT_COMPLAINT` | ✅ HIGH |
| 4 | careers@tqtech.ie | Interview invitation — Software Engineer 2 | `INTERVIEW` | ✅ HIGH |
| 5 | security@authguard.com | Security alert: new login to your account | `SECURITY` | ✅ HIGH |
| 6 | billing@cloudhost.io | Invoice INV-0481 is overdue | `BILLING_ISSUE` | ✅ HIGH |
| 7 | noreply@saasapp.com | Subscription renewal successful | `SUBSCRIPTION` | ❌ LOW |
| 8 | newsletter@techweekly.com | Weekly newsletter — June 2026 | `NEWSLETTER` | ❌ LOW |
| 9 | rewards@luckydraw-prizes.net | Congratulations WINNER! | `SPAM` | ❌ LOW |

**Result:** 6 important, 3 ignored — exactly what a smart email agent should do.

---

## 📁 Project Structure

```
ai-email-reading-agent/
│
├── 🐳 docker-compose.yml          # Runs everything: postgres + backend + frontend
├── 📄 .env.example                # All environment variables documented
├── 📖 README.md
│
├── backend/
│   ├── Dockerfile
│   ├── render.yaml                # Render deployment config
│   ├── requirements.txt
│   ├── main.py                    # FastAPI app, lifespan, scheduler, routes
│   ├── ai_agent.py                # Groq classifier + deterministic fallback
│   ├── processor.py               # Email processing job (read→dedupe→classify→store)
│   ├── database.py                # Async SQLAlchemy engine + session + init_db
│   ├── models.py                  # ProcessedEmail ORM model
│   └── schemas.py                 # Pydantic v2 schemas
│
├── frontend/
│   ├── Dockerfile
│   ├── next.config.js             # output: "export" for static builds
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # Main dashboard ("use client")
│   │   │   ├── globals.css
│   │   │   └── api/               # Next.js proxy routes (Vercel mode)
│   │   │       ├── emails/route.ts
│   │   │       ├── stats/route.ts
│   │   │       ├── trigger/route.ts
│   │   │       └── health/route.ts
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── StatCards.tsx
│   │   │   ├── SystemStatus.tsx
│   │   │   ├── AgentWorkflow.tsx
│   │   │   ├── EmailTable.tsx
│   │   │   ├── RightPanel.tsx
│   │   │   ├── LogsPanel.tsx
│   │   │   ├── SourcesPanel.tsx
│   │   │   ├── SettingsPanel.tsx
│   │   │   └── ui/ (card, badge, button, skeleton)
│   │   └── lib/
│   │       ├── api.ts             # API_BASE, endpoint(), safeFetcher, types
│   │       ├── utils.ts           # cn(), timeAgo(), initials(), categoryBadge()
│   │       ├── staticMockEngine.ts # Complete client-side mock backend
│   │       └── clientLogs.ts      # localStorage log utility
│   └── public/
│
└── mock_data/
    └── emails.json                # 9 sample emails for the agent to read
```

---

## 🚀 Quick Start — Docker

**Requires:** Docker Desktop

```bash
# 1. Clone the repository
git clone https://github.com/zahid397/ai-email-reading-agent
cd ai-email-reading-agent

# 2. Copy environment file
cp .env.example .env

# 3. (Optional) Add your Groq API key for real AI classification
# Leave empty to use the deterministic fallback — it still works perfectly
# GROQ_API_KEY=gsk_your_key_here

# 4. Run everything
docker compose up --build

# 5. Open the dashboard
open http://localhost:3000

# API docs available at
open http://localhost:8000/docs
```

**What starts:**

| Service | URL | Description |
|---|---|---|
| 🖥️ Frontend | http://localhost:3000 | Next.js dashboard |
| 🔌 Backend | http://localhost:8000 | FastAPI REST API |
| 🗄️ Database | localhost:5432 | PostgreSQL |

The backend runs an **initial processing pass on startup** — by the time you open the browser, emails are already classified and visible.

---

## 💻 Local Setup — Without Docker

### Backend (Python 3.10+)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

pip install -r requirements.txt

# Copy and configure environment
cp ../.env.example .env
# Edit .env — set DATABASE_URL to a local or Neon PostgreSQL URL

# Run the server
uvicorn main:app --reload --port 8000
```

### Frontend (Node 18+)

```bash
cd frontend
npm install

# Create local env file
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local

# Start dev server
npm run dev
# Open http://localhost:3000
```

---

## 🔑 Environment Variables

### `.env.example`

```bash
# ── Backend ────────────────────────────────────────────────────
# PostgreSQL connection string
# Docker:  postgresql+asyncpg://postgres:postgres@postgres:5432/email_agent
# Neon:    postgresql+asyncpg://user:pass@ep-xxx.neon.tech/email_agent
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/email_agent

# Groq API key — LEAVE EMPTY to use deterministic fallback (still works!)
GROQ_API_KEY=

# Groq model name
GROQ_MODEL=llama3-8b-8192

# Path to mock email file
# Local:  mock_data/emails.json
# Docker: /app/mock_data/emails.json
MOCK_EMAIL_FILE=mock_data/emails.json

# Allowed CORS origins (comma-separated)
BACKEND_CORS_ORIGINS=http://localhost:3000,https://ai-email-reading-agent.netlify.app

# ── Frontend ───────────────────────────────────────────────────
# Leave empty = use Next.js own /api/* routes (Netlify/Vercel)
# Set to backend URL = bypass Next.js routes (Docker local)
NEXT_PUBLIC_BACKEND_URL=

# ── Production only ────────────────────────────────────────────
# Render backend URL (used by Next.js API proxy routes)
RENDER_BACKEND_URL=https://ai-email-reading-agent.onrender.com
```

---

## 📡 API Documentation

Full interactive docs: **https://ai-email-reading-agent.onrender.com/docs**

### Endpoints

#### `GET /health`
```json
{ "status": "ok" }
```

#### `GET /emails`
Returns important emails only (newest first).

```bash
curl https://ai-email-reading-agent.onrender.com/emails
```

```json
[
  {
    "email_id": "email_001_payment_failed",
    "sender": "billing@paysecure.com",
    "subject": "Payment failed for Invoice #INV-2287",
    "body": "Your payment for invoice #INV-2287 has failed...",
    "date": "2026-06-04T16:18:00Z",
    "important": true,
    "priority": "HIGH",
    "category": "PAYMENT_ISSUE",
    "reason": "Payment failure detected — card declined, immediate action required.",
    "classifier_source": "fallback",
    "created_at": "2026-06-04T16:20:00Z"
  }
]
```

#### `GET /emails?important_only=false`
Returns all processed emails (important + not important).

#### `POST /trigger`
Manually triggers one full processing pass.

```bash
curl -X POST https://ai-email-reading-agent.onrender.com/trigger
```

```json
{ "processed": 6, "skipped": 3, "failed": 0 }
```

#### `GET /stats`
Returns aggregate statistics.

```bash
curl https://ai-email-reading-agent.onrender.com/stats
```

```json
{
  "total_processed": 9,
  "important_count": 6,
  "fallback_count": 9,
  "groq_count": 0,
  "high_priority_count": 6,
  "categories": [
    { "name": "PAYMENT_ISSUE", "count": 2 },
    { "name": "SERVER_DOWN",   "count": 1 },
    { "name": "SECURITY",      "count": 1 }
  ],
  "last_run": "2026-06-04T16:20:00Z",
  "total_runs": 3
}
```

---

## 🖥️ Dashboard Features

### Stats Cards
| Card | Description |
|---|---|
| **Total Processed** | All emails classified |
| **Important Emails** | Flagged for attention |
| **High Priority** | Urgent action required |
| **Groq / Fallback** | AI source breakdown |

### System Status Panel
Shows live health of Backend, Database, AI Engine, and Scheduler.

### Agent Workflow
4-step animated timeline that activates when Run Agent is clicked:
```
Reading Emails → Checking Duplicates → AI Classification → Saving Results
```

### Important Email Table
Each row shows:
- **Sender** avatar (initials, deterministic color)
- **Subject** + body preview
- **Priority** badge (RED=HIGH, ORANGE=MEDIUM, GREEN=LOW) + left border
- **Category** badge (colored per category)
- **AI Reason** (why it was flagged)
- **Date/time**
- **Source** (Groq or Fallback)

### Right Panel
- AI Classification Pipeline (step-by-step status)
- Recent Activity feed
- Source Status (Mock Data / Gmail / Outlook)
- Scheduler Timeline

---

## 🚢 Deployment Guide

### Option A — Netlify (Frontend) + Render (Backend) ← Current Setup

**Backend on Render:**
```
Service type:    Web Service (Python)
Root directory:  backend
Build command:   pip install -r requirements.txt
Start command:   uvicorn main:app --host 0.0.0.0 --port $PORT
```

Environment variables on Render:
```
DATABASE_URL         = postgresql+asyncpg://... (Neon connection string)
GROQ_API_KEY         = (optional)
GROQ_MODEL           = llama3-8b-8192
MOCK_EMAIL_FILE      = ../mock_data/emails.json
BACKEND_CORS_ORIGINS = https://ai-email-reading-agent.netlify.app
```

**Frontend on Netlify:**
```
Base directory:   frontend
Build command:    npm run build
Publish directory: out
```

Environment variables on Netlify:
```
NEXT_PUBLIC_BACKEND_URL   = (leave empty — uses Next.js proxy routes)
RENDER_BACKEND_URL        = https://ai-email-reading-agent.onrender.com
```

---

### Option B — Cloudflare Pages (Static Demo — Always Works)

No backend needed. Runs entirely in the browser using localStorage.

```
Framework preset:  Next.js (Static HTML Export)
Root directory:    frontend
Build command:     npm run build
Output directory:  out
```

No environment variables required.

---

### Option C — Neon PostgreSQL

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Set `DATABASE_URL` (app auto-upgrades `postgresql://` → `postgresql+asyncpg://`)
4. Tables are created automatically on startup

---

## ✅ Submission Checklist

- [x] **GitHub repository** with full source code
- [x] **Live frontend demo** — https://ai-email-reading-agent.netlify.app/
- [x] **Live backend API** — https://ai-email-reading-agent.onrender.com
- [x] **Dockerfile** (backend + frontend)
- [x] **docker-compose.yml** — `docker compose up --build` runs everything
- [x] **`.env.example`** — all variables documented, no real secrets
- [x] **Mock email dataset** — `mock_data/emails.json` (9 emails)
- [x] **README** — setup, AI logic, dashboard, limitations
- [x] **AI importance detection** — Groq LLM + deterministic fallback (40 marks)
- [x] **Dashboard notification display** — all fields shown (10 marks)
- [x] **Email reading / mock data** — JSON-based mock mailbox (20 marks)
- [x] **Duplicate prevention** — unique DB constraint + application-level check (10 marks)
- [x] **Docker setup** — full stack via compose (10 marks)
- [x] **Documentation** — this README (5 marks)
- [x] **Code quality** — typed, modular, async, clean (5 marks)

**Submitted to:** https://forms.gle/uqkDo9kN6hfF4qj86

---

## ⚠️ Limitations

1. **Mock mailbox only** — reads from `emails.json`, not real Gmail/IMAP
2. **No authentication** — dashboard is public (out of scope for this task)
3. **Render cold start** — free tier sleeps after 15 min idle; first request takes ~30–60s
4. **Auto table creation** — uses `metadata.create_all()` instead of migrations (acceptable for this task)
5. **Static dates** — mock emails have fixed timestamps; relative times show "X days ago"
6. **Fallback only in static demo** — Groq is only active when the Python backend is running

---

## 🔧 Troubleshooting

### Dashboard shows all zeros / "Backend unavailable"

The Render backend may be cold-starting.

```bash
# Wake it up manually
curl https://ai-email-reading-agent.onrender.com/health
# Wait for: {"status":"ok"} then refresh the dashboard
```

### Docker: frontend can't reach backend

```bash
# Check all services are healthy
docker compose ps

# Check backend logs
docker compose logs backend

# Check CORS origins
# In docker-compose.yml, backend should have:
# BACKEND_CORS_ORIGINS=http://localhost:3000
```

### Emails not appearing after trigger

```bash
# Check the backend processed them
curl http://localhost:8000/stats

# Manually trigger
curl -X POST http://localhost:8000/trigger

# Check the emails endpoint
curl http://localhost:8000/emails
```

### Build fails on Netlify/Cloudflare

```bash
# Test the build locally first
cd frontend
npm run build
# Should generate out/ with no errors
```

### Groq returns errors

The app **automatically falls back** to the rule-based classifier on any Groq error.
You can verify which classifier was used via `classifier_source` field in the API response.

```bash
# Check if Groq is being used
curl https://ai-email-reading-agent.onrender.com/stats | python3 -m json.tool | grep groq_count
```

---

## 👨‍💻 Author

**Zahid Hasan**
Full Stack Developer · Dhaka, Bangladesh
[GitHub: zahid397](https://github.com/zahid397)

---

<div align="center">

**Built for the TQTech Software Engineer 2 — AI Automation Engineer position**

*Submission Deadline: June 13, 2026*

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square)](https://github.com/zahid397)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>
