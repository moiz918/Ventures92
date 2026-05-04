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
