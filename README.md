# Ventures 92 — Monorepo Setup

High-end integrated real estate portfolio portal.
**Stack:** Next.js (App Router) · FastAPI · PostgreSQL · SQLAlchemy · Alembic

---

## Repository Structure

```
ventures92/
├── backend/                     # FastAPI Python project
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       └── router.py    # Add feature routers here
│   │   ├── core/
│   │   │   └── config.py        # Pydantic settings (reads .env)
│   │   ├── db/
│   │   │   └── session.py       # SQLAlchemy engine + get_db()
│   │   └── models/              # SQLAlchemy ORM models go here
│   ├── alembic/
│   │   ├── versions/            # Auto-generated migration files
│   │   └── env.py
│   ├── main.py                  # App entry-point + CORS config
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env.template            # Copy → .env and fill in values
│
├── frontend/                    # Next.js 14 App Router project
│   ├── app/
│   │   ├── (public)/            # Public-facing portal routes
│   │   │   └── listings/
│   │   └── (admin)/             # Admin dashboard routes
│   │       └── dashboard/
│   ├── components/
│   │   └── ui/                  # Shared UI primitives
│   ├── lib/                     # Utilities, API helpers
│   ├── next.config.js           # API proxy rewrites → FastAPI
│   └── .env.local.template      # Copy → .env.local and fill in
│
├── .gitignore
└── README.md
```

---

## 1 · One-time Setup

### 1a — Create the PostgreSQL database
```bash
psql -U postgres -c "CREATE DATABASE ventures92;"
```

### 1b — Bootstrap the backend
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# macOS / Linux:
source .venv/bin/activate
# Windows (PowerShell):
# .venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create your real .env from the template
cp .env.template .env
# Edit .env — set DATABASE_URL with your Postgres credentials
```

### 1c — Bootstrap the frontend
```bash
cd frontend

# Initialise the Next.js app (run once, inside the frontend/ folder)
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"

# Copy env template
cp .env.local.template .env.local
```

---

## 2 · Running the Development Servers

Open **two terminals** from the repo root.

**Terminal 1 — FastAPI (with hot reload):**
```bash
cd backend
source .venv/bin/activate          # Windows: .venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- Interactive docs: http://localhost:8000/api/docs
- Health check:     http://localhost:8000/health

**Terminal 2 — Next.js (hot reload is on by default):**
```bash
cd frontend
npm run dev
```
- Portal: http://localhost:3000

---

## 3 · Database Migrations (Alembic)

```bash
cd backend
source .venv/bin/activate

# Generate a new migration after editing models/
alembic revision --autogenerate -m "describe_your_change"

# Apply pending migrations
alembic upgrade head

# Roll back one step
alembic downgrade -1
```

---

## 4 · Key Development Notes

- The `next.config.js` proxy rewrites `/api/*` → `http://localhost:8000/api/*`
  so client-side fetches can use relative URLs and bypass browser CORS entirely.
- `uvicorn --reload` uses **watchfiles** (bundled with `uvicorn[standard]`) for
  fast, cross-platform file-change detection — no extra config needed.
- Add new SQLAlchemy models under `backend/app/models/` and import them in
  `backend/alembic/env.py` so Alembic's autogenerate can detect schema changes.
- Feature API routes go in `backend/app/api/v1/` and are registered in
  `router.py`; include the sub-router there and it flows up to `main.py`.
