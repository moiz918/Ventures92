# CLAUDE.md — Ventures 92 Developer Reference

This file is the single source of truth for spinning up, operating, and
developing the Ventures 92 Docker-based development environment.

---

## Stack at a Glance

| Layer      | Technology                  | Host Port |
|------------|-----------------------------|-----------|
| Frontend   | Next.js 14 (App Router)     | 3000      |
| Backend    | FastAPI + Uvicorn           | 8000      |
| Database   | PostgreSQL 16               | 5432      |
| DB Admin   | pgAdmin 4                   | 5050      |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 4.x  
  (includes Docker Engine + Compose v2)
- Git

---

## One-Time Setup

### 1. Initialize the Next.js app (run once from the repo root)

```bash
cd frontend
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd ..
```

> This populates `package.json`, `tsconfig.json`, `tailwind.config.ts`, and
> the default `app/` scaffold inside `frontend/`. The existing
> `next.config.js` and `.env.local.template` files are preserved.

### 2. Copy the environment file

```bash
cp .env.template .env
# Edit .env if you want to change default credentials (optional for local dev)
```

---

## Spinning Up the Dev Environment

### Start all four services (builds images on first run)

```bash
docker-compose up --build
```

### Start in detached (background) mode

```bash
docker-compose up --build -d
```

### Stop all services (data is preserved)

```bash
docker-compose down
```

### Stop and wipe ALL data (including the Postgres volume)

```bash
docker-compose down -v
```

### Rebuild a single service without restarting the others

```bash
docker-compose up --build --no-deps backend
docker-compose up --build --no-deps frontend
```

---

## Service URLs

| Service         | URL                              | Notes                        |
|-----------------|----------------------------------|------------------------------|
| Public Portal   | http://localhost:3000            | Next.js with Fast Refresh    |
| Admin Dashboard | http://localhost:3000/dashboard  | (route to be built)          |
| FastAPI Docs    | http://localhost:8000/api/docs   | Swagger UI                   |
| FastAPI ReDoc   | http://localhost:8000/api/redoc  | Alternative API docs         |
| Health Check    | http://localhost:8000/health     | Returns `{"status": "ok"}`   |
| pgAdmin         | http://localhost:5050            | See login details below      |

---

## pgAdmin — Local Login & Server Registration

### Step 1: Log in to pgAdmin

Navigate to **http://localhost:5050** and enter:

| Field    | Value                    |
|----------|--------------------------|
| Email    | `admin@ventures92.local` |
| Password | `pgadmin_pass`           |

> These values are set by `PGADMIN_EMAIL` and `PGADMIN_PASSWORD` in `.env`.

### Step 2: Register the Postgres server (one-time)

1. In the pgAdmin sidebar, right-click **Servers → Register → Server…**
2. Fill in the two tabs:

**General tab**

| Field | Value      |
|-------|------------|
| Name  | `Ventures 92 DB` |

**Connection tab**

| Field             | Value           |
|-------------------|-----------------|
| Host name/address | `db`            |
| Port              | `5432`          |
| Maintenance DB    | `ventures92`    |
| Username          | `ventures_user` |
| Password          | `ventures_pass` |
| Save password?    | ✅ Yes          |

> Use `db` (the Docker Compose service name) — **not** `localhost` — because
> pgAdmin runs inside the same Docker network.

---

## Hot Reloading

**FastAPI** — `uvicorn --reload` is set in `docker-compose.yml`. Any `.py`
file saved under `backend/` is detected by `watchfiles` and the server
restarts automatically. No action needed.

**Next.js** — Fast Refresh is on by default. The `WATCHPACK_POLLING=true` and
`CHOKIDAR_USEPOLLING=true` env vars ensure file-change events propagate
correctly through the Docker bind mount on both macOS and Windows/WSL2.

---

## Backend — Data Layer Architecture

### Directory layout

```
backend/
  alembic/
    env.py               # Imports Base + all models for autogenerate
    script.py.mako       # Mako template for generated migration files
    versions/            # Auto-generated revision files (commit these)
  app/
    core/
      config.py          # Pydantic Settings — reads DATABASE_URL from env
    db/
      session.py         # DeclarativeBase, engine, SessionLocal, get_db()
    models/
      enums.py           # 10 Python enum.Enum classes (one per PG ENUM type)
      sa_types.py        # 10 named SAEnum singletons — import these, never
                         #   re-instantiate Enum() inline to avoid Alembic clashes
      user.py            # User
      site_setting.py    # SiteSetting
      corporate_partner.py  # CorporatePartner
      location.py        # Location
      project.py         # Project, ProjectMilestone
      property.py        # Property, PropertyMedia, Amenity, property_amenities
      lead.py            # Lead, LeadInteraction
      __init__.py        # Imports every model — must stay complete
```

### SQLAlchemy conventions (MUST follow)

- **ORM style:** SQLAlchemy 2.0 — `Mapped[T]` + `mapped_column()` everywhere.  
  Never use the legacy `Column()` style inside model classes.
- **Base:** `class Base(DeclarativeBase): pass` in `app/db/session.py`.
- **Primary keys:** `default=uuid.uuid4` (Python-side); no `server_default`.
- **Timestamps:** `server_default=func.now()` for `created_at`;  
  `server_default=func.now(), onupdate=func.now()` for `updated_at`.
- **Enums:** Always import from `app.models.sa_types` (e.g. `sa_user_role`).  
  Never write `SAEnum(UserRole, name="user_role")` inline — it must be a  
  single shared object or Alembic will emit duplicate `CREATE TYPE` statements.
- **Relationships:** Always use `back_populates=`. Use `TYPE_CHECKING` guards  
  for cross-model imports to prevent circular imports at runtime.
- **Nullable FKs:** `Mapped[Optional[uuid.UUID]]` + `ondelete="SET NULL"`.
- **Cascades:** match the SQL schema exactly  
  (`CASCADE` on child tables, `RESTRICT` on agent references).

### Database schema summary

| Table | Key constraints |
|---|---|
| `users` | UNIQUE email, `user_role` ENUM, `ix_users_email` index |
| `site_settings` | UNIQUE `setting_key`, no `created_at` |
| `corporate_partners` | `display_order SMALLINT` |
| `locations` | UNIQUE `(city, region_or_society)` |
| `projects` | UNIQUE slug, FK `location_id` ON DELETE RESTRICT |
| `project_milestones` | CHECK `completion_percentage` 0–100, FK CASCADE |
| `properties` | UNIQUE slug, FK `project_id` ON DELETE SET NULL, 3 indexes |
| `property_media` | FK CASCADE, `sort_order SMALLINT` |
| `amenities` | UNIQUE `name` |
| `property_amenities` | Composite PK `(property_id, amenity_id)`, both CASCADE |
| `leads` | Two FK refs to `users` (user_id + assigned_agent_id), both SET NULL |
| `lead_interactions` | FK `agent_id` ON DELETE RESTRICT, no `updated_at` |

---

## Database Migrations (Alembic)

All Alembic commands run **inside the backend container**:

```bash
# Open a shell in the running backend container
docker-compose exec backend bash

# Generate a migration after editing SQLAlchemy models
alembic revision --autogenerate -m "describe_your_change"

# Apply all pending migrations
alembic upgrade head

# Roll back one migration
alembic downgrade -1

# Show current migration state
alembic current
```

> **Important:** `alembic/script.py.mako` must be present — it is the Mako
> template Alembic uses to render new revision files. It is committed to the
> repo. Do not delete it.
>
> The initial migration (`versions/20260504_*_initial_schema.py`) created all
> 12 domain tables and 10 PostgreSQL ENUM types. Always run
> `alembic upgrade head` after pulling changes that include new revision files.

---

## Linting

### Backend (Python)

```bash
# Install linters once (inside the container or a local venv)
pip install ruff

# Run from repo root or backend/
docker-compose exec backend ruff check .
docker-compose exec backend ruff format --check .
```

### Frontend (TypeScript / Next.js)

```bash
# ESLint (configured by create-next-app)
docker-compose exec frontend npm run lint

# Type-check without emitting files
docker-compose exec frontend npx tsc --noEmit
```

---

## Running Tests

### Backend

```bash
# Install pytest once
docker-compose exec backend pip install pytest pytest-asyncio httpx

# Run all tests
docker-compose exec backend pytest

# Run with verbose output
docker-compose exec backend pytest -v
```

### Frontend

```bash
# Jest (add jest + @testing-library/react if not already in package.json)
docker-compose exec frontend npm test
```

---

## Viewing Logs

```bash
# All services
docker-compose logs -f

# Single service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

---

## Useful One-Liners

```bash
# List running containers
docker-compose ps

# Open a Python REPL inside the backend container
docker-compose exec backend python

# Connect to Postgres directly via psql
docker-compose exec db psql -U ventures_user -d ventures92

# Nuke everything and start completely fresh
docker-compose down -v --remove-orphans && docker-compose up --build
```

---

## Environment Variables Reference

| Variable            | Default value            | Used by                  |
|---------------------|--------------------------|--------------------------|
| `POSTGRES_USER`     | `ventures_user`          | db, backend              |
| `POSTGRES_PASSWORD` | `ventures_pass`          | db, backend              |
| `POSTGRES_DB`       | `ventures92`             | db, backend              |
| `PGADMIN_EMAIL`     | `admin@ventures92.local` | pgadmin                  |
| `PGADMIN_PASSWORD`  | `pgadmin_pass`           | pgadmin                  |

Change any of these in the root `.env` file before running `docker-compose up`.
