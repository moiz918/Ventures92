# CLAUDE.md — Ventures 92 Developer Reference

This file is the single source of truth for spinning up, operating, and
developing the Ventures 92 Docker-based development environment.

---

## Stack at a Glance

| Layer      | Technology                  | Host Port |
|------------|-----------------------------|-----------|
| Frontend   | Next.js 16 (App Router)     | 3000      |
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
  seed.sql               # Idempotent seed data for all 12 domain tables
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
    schemas/
      property.py        # PropertyBase, PropertyCreate, PropertyUpdate,
                         #   PropertyResponse, PropertyDetailResponse
      project.py         # ProjectBase, ProjectResponse
      lead.py            # LeadCreate, LeadResponse
    api/
      v1/
        router.py        # api_router — registers all endpoint sub-routers
        endpoints/
          properties.py  # GET /properties/, GET /properties/{slug}
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

## Seeding the Database

Run once after `alembic upgrade head` to populate all 12 tables with
development data. The script is idempotent — safe to re-run.

```bash
docker-compose exec -T db psql -U ventures_user -d ventures92 < backend/seed.sql
```

**What is seeded:** 21 users (4 roles), 6 site settings, 6 corporate partners,
10 locations, 6 projects, 7 milestones, 15 amenities, 13 properties,
9 property media items, 13 property–amenity links, 6 leads, 5 lead interactions.

> `session_replication_role` is intentionally absent — `ventures_user` is not
> a superuser. FK insertion order in the script makes it unnecessary.

---

## Backend — API Layer

### Registered routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/ping` | Liveness check |
| **Properties** | | |
| `GET` | `/api/v1/properties/` | Search properties (8 optional filters + pagination) |
| `GET` | `/api/v1/properties/{slug}` | Property detail — eager-loads media + amenities |
| `POST` | `/api/v1/properties/` | [Admin] Create property |
| `PUT` | `/api/v1/properties/{id}` | [Admin] Partial update (toggle status, price, etc.) |
| `DELETE` | `/api/v1/properties/{id}` | [Admin] Delete property |
| **Projects** | | |
| `GET` | `/api/v1/projects/` | List projects (optional `status` filter) |
| `GET` | `/api/v1/projects/{slug}` | Project detail — includes milestones ordered by date |
| `GET` | `/api/v1/projects/{slug}/properties` | All properties under a project |
| `POST` | `/api/v1/projects/{id}/milestones` | [Admin] Log a construction milestone |
| **Leads (CRM)** | | |
| `POST` | `/api/v1/leads/` | Public enquiry / client requirements form |
| `GET` | `/api/v1/leads/` | [Admin] List leads — filters: `status`, `assigned_agent_id` |
| `PUT` | `/api/v1/leads/{id}/status` | [Admin] Update pipeline status + assign agent |
| `POST` | `/api/v1/leads/{id}/interactions` | [Admin/Agent] Log CRM note / call / meeting |
| **Site Settings** | | |
| `GET` | `/api/v1/settings/` | Fetch all site settings (WhatsApp/call numbers, etc.) |
| `PUT` | `/api/v1/settings/{key}` | [Admin] Update a setting value by key |
| **Corporate Partners** | | |
| `GET` | `/api/v1/partners/` | Active partners ordered by `display_order` (carousel) |
| `POST` | `/api/v1/partners/` | [Admin] Add a partner |
| `PUT` | `/api/v1/partners/{id}` | [Admin] Update partner / toggle active |
| `DELETE` | `/api/v1/partners/{id}` | [Admin] Remove a partner |
| **Locations** | | |
| `GET` | `/api/v1/locations/` | All cities + societies for search dropdowns |

### Query parameters — `GET /api/v1/properties/`

| Parameter | Type | Description |
|---|---|---|
| `property_type` | enum | `RESIDENTIAL` \| `COMMERCIAL` |
| `property_category` | enum | `PLOT` \| `HOUSE` \| `APARTMENT` \| `OFFICE` \| `SHOP` |
| `location_id` | UUID | Joins through `Project` — filters by `projects.location_id` |
| `min_price` | Decimal | Inclusive lower price bound |
| `max_price` | Decimal | Inclusive upper price bound |
| `availability_status` | enum | `AVAILABLE` \| `RESERVED` \| `SOLD` |
| `is_featured` | bool | `true` / `false` |
| `limit` | int | Default 20, max 100 |
| `offset` | int | Default 0 |

### Schemas added in Step 2

| File | Classes |
|---|---|
| `schemas/setting.py` | `SettingResponse`, `SettingUpdate` |
| `schemas/partner.py` | `PartnerBase`, `PartnerCreate`, `PartnerUpdate`, `PartnerResponse` |
| `schemas/location.py` | `LocationResponse` |
| `schemas/project.py` | *(inline in endpoint)* `MilestoneCreate`, `MilestoneResponse`, `ProjectDetailResponse` |
| `schemas/lead.py` | *(inline in endpoint)* `LeadStatusUpdate`, `InteractionCreate`, `InteractionResponse`, `LeadDetailResponse` |

### Conventions (MUST follow when adding endpoints)

- **Router file:** create `app/api/v1/endpoints/<resource>.py`, define
  `router = APIRouter()`, then register in `app/api/v1/router.py` with
  `api_router.include_router(router, prefix="/<resource>", tags=["Tag"])`.
- **Schema file:** create `app/schemas/<resource>.py`. Response schemas use
  `model_config = ConfigDict(from_attributes=True)`.
- **DB session:** always inject via `db: Session = Depends(get_db)`.
- **SQLAlchemy 2.0 style:** use `db.scalars(select(Model).where(...)).all()` — never `.query()`.
- **Eager loading:** use `selectinload` for collections, `joinedload` for single FK rows.
- **404 pattern:** `raise HTTPException(status_code=404, detail="...")` when
  a `.first()` query returns `None`.
- **Partial updates:** call `payload.model_dump(exclude_unset=True)` and iterate — never
  overwrite the whole row.

### Schema conventions (Pydantic v2)

- **Enums:** always import from `app.models.enums` — never redefine inline.
- **Monetary/area fields:** use `Decimal`, not `float`, to match `NUMERIC(15,2)`
  and `NUMERIC(10,2)` DB columns and avoid floating-point precision loss.
- **Pattern:** `Base` → `Create` (inherits Base) → `Update` (all Optional) →
  `Response` (inherits Base + id + timestamps) → `DetailResponse` (nested).
- **Email fields:** use `EmailStr` for automatic format validation.
- **`completion_percentage` on projects:** `Optional[int] = None` — this field
  belongs to `project_milestones` in the DB, not `projects`.

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

| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | frontend (browser) |

> For server-side Next.js fetches inside the Docker network, set
> `API_URL=http://backend:8000/api/v1` in the frontend service environment.

---

## Frontend — Architecture

### Versions

| Package      | Version  | Notes                                              |
|--------------|----------|----------------------------------------------------|
| Next.js      | 16.2.4   | App Router · breaking changes vs. 14/15 — read AGENTS.md |
| React        | 19.2.4   |                                                    |
| Tailwind CSS | 4.x      | CSS-first — **no `tailwind.config.ts`**            |

> **Before writing any Next.js/React code**, read `frontend/AGENTS.md`.
> Next.js 16 has breaking API changes. `params` and `searchParams` are
> async Promises in page components.

### Directory layout

```
frontend/
  app/
    globals.css          # Tailwind v4 @theme tokens + base styles (DO NOT add boilerplate)
    layout.tsx           # Root layout — Navbar + Footer (Server Components)
    page.tsx             # Homepage (to be built)
  services/
    api.ts               # Fetch client — api.get/post/put/delete, ApiError class
    propertyService.ts   # getProperties(), getPropertyBySlug() + all TS interfaces
```

### Design System — "Architectural Prestige"

Source: **Stitch MCP** → project `8267215256843583173` ("Ventures 92 Design System")  
DO NOT hardcode colors or fonts that are not in the table below.

#### Color tokens (defined in `globals.css` `@theme`)

| Token                    | Hex       | Usage                              |
|--------------------------|-----------|------------------------------------|
| `--color-surface`        | `#16130d` | Page background                    |
| `--color-surface-low`    | `#1e1b15` | Alternate section bg               |
| `--color-surface-section`| `#221f19` | Section containers                 |
| `--color-surface-card`   | `#2d2a23` | Property / content cards           |
| `--color-surface-high`   | `#38342d` | Elevated cards, dropdowns          |
| `--color-gold`           | `#C9A84C` | Primary brand — CTAs, badges, logo |
| `--color-gold-bright`    | `#e6c364` | Highlight / active states          |
| `--color-gold-hover`     | `#E2C87A` | Button hover                       |
| `--color-charcoal`       | `#1A1A1A` | Text on gold buttons               |
| `--color-on-surface`     | `#e9e1d7` | Primary body text                  |
| `--color-on-surface-muted`| `#d0c5b2`| Secondary / helper text            |
| `--color-outline`        | `#99907e` | Borders, dividers                  |
| `--color-outline-variant`| `#4d4637` | Subtle borders                     |
| `--color-success`        | `#1D9E75` | READY TO POSSESS badge             |
| `--color-warning`        | `#E8A020` | UNDER CONSTRUCTION badge           |
| `--color-warm-white`     | `#F7F5F0` | Admin dashboard backgrounds        |

#### Typography

| Role            | Font          | Size  | Weight | Tracking  |
|-----------------|---------------|-------|--------|-----------|
| Display hero    | Epilogue      | 80px  | 800    | −0.04em   |
| H1              | Epilogue      | 48px  | 700    | −0.02em   |
| H2              | Epilogue      | 32px  | 700    | −0.01em   |
| Body / UI       | Manrope       | 16px  | 400    | 0em       |
| Price / data    | Space Grotesk | 18px  | 500    | +0.02em   |
| Label caps      | Manrope       | 12px  | 700    | +0.1em    |

Fonts are loaded in `app/layout.tsx` via `next/font/google` and exposed as CSS
variables: `--font-epilogue`, `--font-manrope`, `--font-space-grotesk`.
Use these variables directly — never import a font elsewhere.

#### Shape language

**0 px border-radius everywhere.** Circles (`rounded-full`) are permitted only
for icon containers and avatars. This is enforced by `* { border-radius: 0 }`
in `@layer base`.

#### Key component specs

| Component       | Spec                                                                 |
|-----------------|----------------------------------------------------------------------|
| Navbar          | Fixed, `backdrop-blur(20px)`, `rgba(255,255,255,0.10)` bg, gold border-bottom |
| Primary button  | `bg-gold text-charcoal` · all-caps Manrope · 0px radius             |
| Secondary button| Transparent + 2px gold border                                        |
| Property card   | `bg-surface-card` · PKR price in Space Grotesk bottom-left of image  |
| Input           | `bg-surface-section` border `outline-variant` · label always uppercase Manrope |
| Admin sidebar   | 240px wide, `bg-surface`, active item = 4px gold left-border + gold text |

### Tailwind v4 conventions (MUST follow)

- **No `tailwind.config.ts`** — configuration lives entirely in `globals.css`.
- Add new design tokens to the `@theme` block in `globals.css`.
- Tailwind generates utilities automatically from `@theme`:
  `--color-gold` → `bg-gold`, `text-gold`, `border-gold`
  `--font-heading` → `font-heading`
- For hover effects in Server Components, use Tailwind `hover:` classes — never
  `onMouseOver`/`onMouseOut` event handlers.
- Prefer Server Components (no `"use client"`). Only add `"use client"` when
  the component requires `useState`, `useEffect`, browser APIs, or event handlers.

### Service layer conventions

- All backend calls go through `services/api.ts` (`api.get / post / put / delete`).
- Create `services/<resource>Service.ts` for each domain (properties, projects, leads, etc.).
- Monetary / area values from the backend are `string` (Decimal) — never cast to `number`.
- `ApiError` (from `services/api.ts`) carries `.status` — catch it to show 404 vs 500 UI.
- For server-side data fetching in Server Components, call service functions directly
  (they use `fetch` internally). For client-side, wrap in a `useEffect` or SWR/React Query.

### Stitch MCP — Screen inventory

| Project ID           | Title                          | Key screens                          |
|----------------------|--------------------------------|--------------------------------------|
| `12841052455491568048` | Ventures 92 Real Estate Portal | 5. Homepage · 8/9. Property Detail · 11/12. Client Requirements · 15. Admin Dashboard · 16. Priority Lead Inbox · 18. Live Inventory |
| `8313867810962667973`  | Ventures 92 Property Portal    | Screen 1: Homepage · Screen 3: Property Details · Screen 12: Admin Dashboard |
| `8267215256843583173`  | Ventures 92 Design System      | "Architectural Prestige" — source of all tokens |

Always query the Stitch MCP before adding new screens to verify colors, spacing,
and component structure against the design.
