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
| Admin Dashboard | http://localhost:3000/admin/dashboard  | Lead Kanban + property management |
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
    api/
      deps.py            # get_current_user / require_admin / require_super_admin
    core/
      config.py          # Pydantic Settings — DATABASE_URL, JWT_SECRET, cookie config
      security.py        # bcrypt + JWT (access/refresh) + reset-token utilities
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
| **Amenities** | | |
| `GET` | `/api/v1/amenities/` | All amenities ordered by name — used by PropertyForm for UUID checkbox wiring |

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
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | frontend — browser-side fetches |
| `INTERNAL_API_URL`  | `http://backend:8000/api/v1` | frontend — **server-side RSC fetches inside Docker** |

Change any of these in the root `.env` file before running `docker-compose up`.

> **Docker networking:** RSC pages run inside the `frontend` container and cannot reach
> `localhost:8000`. They must use the Docker service name `backend`.
> `services/api.ts` resolves the base URL with the fallback chain:
> `INTERNAL_API_URL` → `API_URL` → `NEXT_PUBLIC_API_URL` → `http://localhost:8000/api/v1`.
> Always set `INTERNAL_API_URL=http://backend:8000/api/v1` in the frontend service environment
> in `docker-compose.yml` — omitting it causes all server-side fetches to silently fail.

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
    globals.css               # Tailwind v4 @theme tokens + base styles (DO NOT add boilerplate)
    layout.tsx                # Root layout — Navbar + Footer + WhatsApp FAB (Server Components)
    page.tsx                  # Homepage — async RSC, fetches featured properties, three render states
    error.tsx                 # "use client" — global error boundary; Reset + Back to Home; shows error.digest
    loading.tsx               # Global loading spinner — gold CSS spin animation, branded
    not-found.tsx             # Global 404 — "404" hero numeral + Back to Home + Browse Properties
    about/
      page.tsx                # "Our Vision" — Server Component, hero + stat strip + 3-pillar grid + CTA band
    admin/
      layout.tsx              # Admin route group layout — sticky sidebar + header, no URL change
      dashboard/
        page.tsx              # Lead Management Pipeline — embeds LeadKanban
      properties/
        page.tsx              # "use client" — property data table, Add New + Delete with confirm
      projects/
        page.tsx              # Async RSC — read-only project roster with status badges and View links
      settings/
        page.tsx              # Async RSC — read-only site settings table (key/value/description/updated)
    projects/
      page.tsx                # Async RSC — "Exclusive Developments" hero, stat strip, 3-col ProjectCard grid
      [slug]/
        page.tsx              # Async RSC — project hero, description, MilestoneTimeline, sticky sidebar
        not-found.tsx         # Project-specific 404 — "We couldn't find that development"
    properties/
      page.tsx                # Property search — async RSC, URL-driven filters + pagination
      [slug]/
        page.tsx              # Property detail — async RSC, 404 → notFound(), gallery + sidebar
        not-found.tsx         # Property-specific 404 — "We couldn't find that property"
    contact/
      page.tsx                # Lead capture — two-column layout, trust grid, contact details
    login/
      page.tsx                # "use client" — split-screen auth, email+password, mock → /admin/dashboard
    signup/
      page.tsx                # "use client" — split-screen auth, name+email+password, mock → /admin/dashboard
  components/
    HeroSection.tsx           # Full-viewport hero, architectural gradient, native GET search bar
    CorporatePartners.tsx     # Async Server Component — CSS marquee carousel, getPartners(), logo/name fallback
    LeadCaptureForm.tsx       # "use client" — full lead form, focus states, success/error handling
    PropertyCard.tsx          # Luxury card — status badge, PKR price overlay, specs row, gradient placeholder; uses SafeImage
    PropertyGallery.tsx       # "use client" — hero image, thumbnail strip, prev/next nav; uses SafeImage with HeroFallback + ThumbnailFallback
    SafeImage.tsx             # "use client" — <img> wrapper with onError fallback; used by CorporatePartners, PropertyCard, PropertyGallery
    SearchFilters.tsx         # "use client" — URL-driven filter bar (type/category/location/price); locations prop from server
    admin/
      LeadKanban.tsx          # "use client" — 4-column Kanban, fetch on mount, optimistic status moves
      PropertyForm.tsx        # "use client" — right-side slide-over, 3-section form, createProperty()
    ProjectCard.tsx           # Server Component — luxury development card, status badge, gradient placeholder
    MilestoneTimeline.tsx     # Server Component — vertical timeline, completed/upcoming node states, progress bars
  services/
    api.ts                    # Fetch client — api.get/post/put/delete, ApiError class; env fallback: INTERNAL_API_URL → API_URL → NEXT_PUBLIC_API_URL
    leadService.ts            # submitLead(), getLeads(), updateLeadStatus() + all TS interfaces
    locationService.ts        # getLocations() + Location interface — cities/societies for search dropdowns
    partnerService.ts         # getPartners() + Partner interface — active partners ordered by display_order
    # NOTE: propertyService.ts uses area_size (Decimal string) + area_unit (AreaUnit enum), NOT area_sqft
    # NOTE: projectService.ts ProjectStatus uses 'PLANNING' (not 'PLANNED') to match backend enum
    projectService.ts         # getProjects(), getProjectBySlug() + Project, ProjectDetail, ProjectMilestone interfaces
    propertyService.ts        # getProperties(), getPropertyBySlug(), createProperty(), deleteProperty() + all TS interfaces
```

### Properties Search — `app/properties/page.tsx`

- Async RSC; `searchParams` is `Promise<Record<...>>` — always `await` it (Next.js 16).
- **`budget` redirect**: converts hero search shorthand (`u50m`, `50m-150m`, `150m-plus`) to
  explicit `min_price`/`max_price` params so `SearchFilters` selects stay in sync.
- Fetches locations server-side via `getLocations().catch(() => [])` in parallel with properties.
- Passes cleaned params to `getProperties()` — only sets keys that have a value (including `location_id`).
- Three render states: **property grid** | **EmptyState** (`hasFilters` aware) | **ErrorState**.
- `hasFilters` includes `location_id` — triggers "Search Results" heading + clear button.
- `SearchFilters` is wrapped in `<Suspense fallback={<FilterBarSkeleton hasLocations={...} />}>` because it calls
  `useSearchParams()` — required by Next.js App Router.
- Filter bar is `position: sticky; top: 64px` — sits below the fixed navbar.

#### `components/SearchFilters.tsx` (`"use client"`)

- Accepts `locations?: Location[]` prop fetched server-side (avoids async in a Client Component).
- Location dropdown renders only when `locations.length > 0`; positioned between Category and Min Price.
- Reads current filter values from `useSearchParams()` to keep selects controlled.
- On any `<select onChange>`, calls `router.push(pathname + '?' + newParams, { scroll: false })`.
- Always deletes `offset` from params on filter change (resets pagination).
- `useTransition` wraps each navigation for pending-state opacity fade.
- Shows "N filters active" badge + "Clear Filters" button only when at least one filter is set.
- `activeCount` includes `location_id` in its count.
- Predefined PKR price options (`1 Cr / 5 Cr / 10 Cr / 15 Cr / 50 Cr`) map to raw integer strings
  the backend expects for `min_price` / `max_price`.

### Corporate Partners — `components/CorporatePartners.tsx`

- Async Server Component; calls `getPartners()` — returns `null` render if no partners.
- **Marquee**: `overflow: hidden` wrapper + duplicated partner array (renders list twice) + `animation: marquee 40s linear infinite` for seamless CSS-only loop.
- `@keyframes marquee`: `translateX(0) → translateX(-50%)` (half the doubled width = one full cycle).
- **Logo display**: uses `<SafeImage>` (client component) with `filter: brightness(0) invert(1); opacity: 0.45` for monochrome treatment. When `logo_url` is missing **or fails to load (broken URL, 404, CORS, decode error)**, renders premium `<PartnerTextMark>` fallback — uppercase Manrope label in muted gold. No empty grey boxes.
- Partner tiles link to `website_url` when present (`target="_blank" rel="noopener noreferrer"`).
- Left/right fade edges via `linear-gradient` pseudo-overlays (`zIndex: 1`).
- Uses regular `<img>` via SafeImage (not `next/image`) — partner logo domains are arbitrary, avoiding domain config churn.
- **Anchor target**: home page wraps `<CorporatePartners />` with `<div id="partners">` so the footer `/#partners` link smooth-scrolls to it (`scrollMarginTop: 64px` offsets the fixed navbar).

### Property Detail — `app/properties/[slug]/page.tsx`

- Async RSC; `params` is `Promise<{ slug: string }>` — always `await` it (Next.js 16).
- `loadProperty(slug)`: calls `getPropertyBySlug(slug)`. Catches `ApiError` with `.status === 404`
  and calls `notFound()` — triggers Next.js 404 page cleanly. All other errors propagate.
- `generateMetadata` shares the same `loadProperty` helper for SEO title + description.
- **Layout**: breadcrumb bar → two-column grid (`1fr 360px` on desktop, stacked on mobile).
- **Left column**: `<PropertyGallery>` → badge row + H1 → specs grid → description → amenities pills.
- **Right sidebar** (`position: sticky; top: 88px`): Asking Price (Space Grotesk gold) → status row →
  Book Consultation (gold fill) → WhatsApp Us (gold outline) → phone link → Back to Listings.
- `formatPKR()` converts decimal strings to `"X Crore"` / `"X Lakh"` (full word, not abbreviation).
- `formatArea(size, unit)` renders `area_size` + `area_unit` in the specs grid. No `area_sqft` or `floors` fields exist — do not reference them.
- `hasSpecs`: `property.bedrooms != null || property.bathrooms != null || property.area_size != null` — shows specs grid only when at least one value is present.
- Status colours: AVAILABLE = gold badge, RESERVED = dark amber, SOLD = muted.
- Inline SVG icons (Bed, Bath, Area) — no external icon library. Floors icon removed.
- Mobile: price shown inline below H1 (hidden on `lg:`); sidebar stacks below gallery column.

#### `components/PropertyGallery.tsx` (`"use client"`)

- Sorts `media[]` by `is_primary` desc then `sort_order` asc before rendering.
- `useState(0)` for active index; `useCallback` memoises prev/next handlers.
- **Hero** (16:9): active image + bottom gradient scrim + photo counter bottom-right + "Primary Photo"
  gold badge top-left when `active.is_primary`.
- **Thumbnail strip**: `overflowX: auto`, 112×72px buttons; active = 2px gold border + full opacity;
  inactive = 60% opacity; transitions on `opacity` and `border-color`.
- `NavButton`: absolute-positioned prev/next arrows; disabled state uses muted colour + dimmed bg.
- **Empty state**: per-category dark gradient placeholder (matches `PropertyCard`) + faint SVG watermark.

### Auth Pages — `app/login/page.tsx` + `app/signup/page.tsx`

Both pages share an identical split-screen layout pattern:

- **`"use client"`** — require `useRouter` for post-submit redirect.
- **Layout**: `min-height: calc(100vh - 64px)` dark base (`#100e08`), architectural 72px grid overlay.
- **Left panel** (`hidden lg:flex`): gold radial gradient glow, `flex: 1`, `border-right: 1px solid #2d2a23`. Contains logo, headline copy in Epilogue 800, descriptive text, and a bottom "Secure Authentication" trust line with shield SVG. Hidden below `lg` breakpoint.
- **Right panel** (`max-width: 520px` login / `540px` signup): `backgroundColor: #16130d`, centered flex column, `padding: 48px 56px`. Contains mobile logo (hidden `lg:`), form header, the form, and a bottom "Secure Authentication" footer.
- **Input style**: `backgroundColor: '#100e08'` (darker than global surface), `border: 1px solid #4d4637` → `#C9A84C` on focus. Icon slot `paddingLeft: 42px` for mail/lock SVGs; icon color transitions `#4d4637` → `#C9A84C` on focus.
- **Password field**: `type` toggles `"password"` / `"text"` via `showPassword` state; EyeIcon / EyeOffIcon button absolutely positioned at right.
- **Mock submit**: `setTimeout(700ms)` then `router.push('/admin/dashboard')`. Replace with real auth call when backend is ready.
- **Login extras**: "Forgot password?" link aligned right of label; divider + "Create an Account" ghost button below form; link to `/signup`.
- **Signup extras**: name fields in 2-col grid; password hint text; custom styled checkbox for terms agreement; link to `/login`.
- **No real auth logic** — state is ephemeral, no tokens stored. Auth implementation is a future phase.

### Contact / Lead Capture — `app/contact/page.tsx`

- Async Server Component (no `"use client"`).
- Two-column layout: left = copy + trust grid (2×2) + direct contact items; right = `<LeadCaptureForm />` sticky at `top: 88px`.
- Trust grid: 4 cells (`24h`, `100+`, `6+`, `10+`) in Space Grotesk 700 gold, rendered as a 2-col hairline-grid.
- Contact items: phone, email, office — each with 36px square gold-outline icon box.
- Does **not** manage any form state — that is fully delegated to `LeadCaptureForm`.

#### `components/LeadCaptureForm.tsx` (`"use client"`)

- Single `FormState` object managed with one `useState`; `focused` string tracks which field has gold border.
- `inputStyle(focused: boolean)` factory returns inline style with `border-color` toggling `#C9A84C` / `#4d4637`.
- **Fields**: `first_name` + `last_name` (2-col grid) · `email` · `phone` · `preferred_property_type` (select with chevron overlay) · `min_budget` + `max_budget` (2-col grid) · `message` (textarea, resizable vertically).
- On submit: validates `preferred_property_type` non-empty, builds `LeadCreatePayload`, calls `submitLead()`.
- **Success state**: replaces form with gold-bordered checkmark + "Enquiry Received" copy + "Submit Another" ghost button.
- **Error state**: inline warning box with SVG icon; `ApiError` 422 → "check your details", else generic message.
- `isSubmitting`: dims form to 0.7 opacity, swaps button text to spinner + "Submitting…", disables button.
- Privacy note below submit button.

#### `services/leadService.ts`

- `LeadCreatePayload`: `first_name`, `last_name`, `email`, `phone`, `preferred_property_type` (RESIDENTIAL | COMMERCIAL), optional `min_budget`, `max_budget`, `message`.
- `LeadResponse`: full lead object with `id`, `status` (`NEW | CONTACTED | QUALIFIED | IN_PROGRESS | CLOSED | LOST`), `assigned_agent_id`, `created_at`, `updated_at`.
- `submitLead(data)`: `api.post<unknown>('/leads/', data)` — returns `void`, throws `ApiError` on failure.
- `getLeads()`: `api.get<LeadResponse[]>('/leads/')` — admin only.
- `updateLeadStatus(id, status)`: `api.put<LeadResponse>('/leads/{id}/status', { status })` — admin only.
- **IMPORTANT**: always use `first_name` + `last_name` — never `full_name` (backend schema constraint).

### Admin Core — `app/admin/`

The `admin/` directory wraps all admin pages under the `/admin/*` URL namespace with a shared sidebar + header layout. It renders **inside** the root layout's `<main className="flex-1 pt-16">`, so the fixed navbar is still present above.

#### `app/admin/layout.tsx`

- **Sidebar** (`position: sticky; top: 0; height: calc(100vh - 64px)`): `width: 240px`, `backgroundColor: #100e08`, `border-right: 1px solid #4d4637`.
- Nav items: Dashboard · Properties · Projects · Settings — each as `<Link>` with SVG icon + uppercase Manrope label.
- Active item styling: `color: #C9A84C`, `border-left: 4px solid #C9A84C` (applied via `admin-nav-link` class + JS, or manually via `usePathname` in a client wrapper).
- Sidebar footer: "← Back to Site" link → `/`.
- **Admin header** (`height: 56px`, `backgroundColor: #1e1b15`, `border-bottom: 1px solid #4d4637`): shows admin avatar placeholder + "Logout" outlined button → `/login`.
- Main content area: `flex: 1`, `backgroundColor: #16130d`, `overflowY: auto`.

#### `components/admin/LeadKanban.tsx` (`"use client"`)

- Fetches all leads via `getLeads()` on mount; stores in `useState<LeadResponse[]>`.
- **6 columns** matching backend `LeadStatus` enum, each with a distinct accent colour:
  | Status | Label | Accent |
  |---|---|---|
  | `NEW` | New | `#99907e` |
  | `CONTACTED` | Contacted | `#C9A84C` |
  | `QUALIFIED` | Qualified | `#1D9E75` |
  | `IN_PROGRESS` | In Progress | `#5B8AF0` |
  | `CLOSED` | Closed | `#4d4637` |
  | `LOST` | Lost | `#8B2E2E` |
- `STATUS_TRANSITIONS`: maps each status to its valid next states — only those buttons are rendered per card.
- Each column header: `border-top: 3px solid {accent}`, label + count badge.
- **Lead card**: `backgroundColor: #1e1b15`, `border-left: 3px solid {accent}`. Shows name, time ago, property type badge, email, phone, budget range (formatted PKR), message snippet.
- **Status move buttons** at card bottom: only valid next-status transitions shown (e.g. NEW can only go to CONTACTED). Styled as outlined buttons in the target column's accent colour.
- **Optimistic update**: immediately updates local state on click, calls `updateLeadStatus`, reverts if API errors.
- `movingId` state dims the card being moved (`opacity: 0.5`) during the API call.
- Loading state: skeleton columns at 40% opacity with CSS pulse animation.
- Error state: inline muted error card.

#### `app/admin/dashboard/page.tsx`

- Server Component; renders a page header ("CRM" eyebrow + "Lead Management Pipeline" H1) then `<LeadKanban />`.

### Admin Property Management — `app/admin/properties/`

#### `app/admin/properties/page.tsx` (`"use client"`)

- Fetches all properties via `getProperties({ limit: 100 })` on mount.
- **Stat row**: 4 `StatCard` cells — All Listings / Available / Reserved / Sold (Space Grotesk gold values).
- **Data table**: CSS Grid `2fr 1fr 1fr 1fr 1fr` columns: Property (title + /slug), Type + Category, Price (Space Grotesk gold), Status badge, Actions.
- Header row: `backgroundColor: #100e08`, `border-bottom: 2px solid #4d4637`, Manrope 10px uppercase `#4d4637` labels.
- Rows: `backgroundColor: #1e1b15`, `border-bottom: 1px solid #4d4637`, hover `#2d2a23` via `.table-row-hover` class in `globals.css`.
- Status badges: AVAILABLE=gold, RESERVED=amber (`#E8A020`), SOLD=muted (`#4d4637`) — outlined, no fill.
- **Delete flow**: Click "Delete" → sets `confirmDeleteId`. Row shows "Confirm" + "Cancel" buttons. "Confirm" calls `deleteProperty(id)` with optimistic removal. Dim row with opacity 0.4 + `deletingId` state during API call. On error, sets `actionError` state — shown as a dismissible red-tinted banner above the table.
- **Add New Property** button (gold fill) opens `<PropertyForm>` slide-over. `onSuccess` prepends the new property to local state.
- **View link**: each row has a "View" `<a target="_blank">` linking to `/properties/{slug}` (public listing). No edit UI exists yet.
- **`router.refresh()`**: called after both successful delete and successful create to invalidate the Next.js RSC cache so public listing pages reflect the DB change immediately.
- `<TableSkeleton />`: 5 skeleton rows at 0.4 opacity with CSS pulse animation (shared `@keyframes pulse` in `globals.css`).

#### `components/admin/PropertyForm.tsx` (`"use client"`)

- Right-side slide-over panel: `position: fixed; right: 0; height: 100vh; width: 600px; background: #16130d; border-left: 1px solid #4d4637; z-index: 200`. Dark backdrop click closes panel.
- Panel header: "Admin" eyebrow (gold) + "Add New Property" title + X close button.
- **Section 1 — Basic Info**: title (required), description (textarea, 4 rows), price (PKR, required), area_size + area_unit select (SQ_FT/SQ_YARD/MARLA/KANAL) — 2-col grid; bedrooms + bathrooms — 2-col grid. No `floors` field.
- **Section 2 — Classification**: property_type select (RESIDENTIAL / COMMERCIAL), property_category select (APARTMENT / HOUSE / PLOT / OFFICE / SHOP) — 2-col grid; availability_status select full-width.
- **Section 3 — Features & Amenities**: `ToggleRow` for `is_featured` (slide toggle pill, gold when active); amenity checkboxes fetched live from `GET /amenities/` via `getAmenities()` — each checkbox value is the amenity UUID, submitted as `amenity_ids[]`.
- `SectionHeading`: gold 10px uppercase label + flex-1 `#4d4637` divider line.
- `inputStyle(focused: boolean)`: `background: #100e08; border: 1px solid {focused ? #C9A84C : #4d4637}; color: #e9e1d7; padding: 12px 14px`.
- All `<select>` elements use `appearance: none` + absolute `ChevronIcon` overlay.
- Submit: builds `PropertyCreatePayload`, calls `createProperty()`. ApiError 422 → "check details" message, else generic. `isSubmitting` → dims form to 0.7 opacity, gold → muted button bg, spinner SVG.
- Panel footer: sticky Cancel (muted outline) + Publish Property (gold fill) buttons.

#### Additions to `services/propertyService.ts`

- `PropertyCreatePayload`: title, slug?, description?, property_type, property_category, price (Decimal string), area_size? (Decimal string), area_unit? (AreaUnit enum), bedrooms?, bathrooms?, availability_status, is_featured, project_id?, amenity_ids? (UUID[]).
- `createProperty(data)`: `api.post<Property>('/properties/', data)`.
- `deleteProperty(id: string)`: `api.delete<unknown>('/properties/{id}')` — returns void.
- `getAmenities()`: `api.get<Amenity[]>('/amenities/')` — returns `{ id: string; name: string; icon_name?: string }[]` ordered by name. Used by PropertyForm to populate real amenity UUID checkboxes.
- **`area_sqft` and `floors` do not exist** — use `area_size` (Decimal string) + `area_unit` (AreaUnit enum) everywhere.

### Projects Portal — `app/projects/`

#### `app/projects/page.tsx`

- Async RSC; fetches `getProjects()` wrapped in `.catch(() => null)` — never throws to the browser.
- **Hero header**: `#1e1b15` bg + architectural 72px grid overlay + gold left-edge accent. Epilogue 800 headline: "Exclusive / Developments" (second line gold). Subtitle in `#99907e`.
- **Stat strip**: 4-cell grid (All / Under Construction / Delivered / Upcoming) in Space Grotesk gold values, computed from the project list.
- **Project grid**: `auto-fill minmax(380px, 1fr)` gap `24px`. Each cell renders a `<ProjectCard>`.
- **Bottom CTA band**: dark section with "Enquire Now" gold button → `/contact`. Only rendered when projects exist.
- Empty state: centered bordered card with muted text.
- Error state: bordered card with "Contact Our Team →" gold link.

#### `app/projects/[slug]/page.tsx`

- Async RSC; `params: Promise<{ slug: string }>` — always `await` it (Next.js 16).
- `loadProject(slug)`: calls `getProjectBySlug`. Catches `ApiError` 404 → `notFound()`.
- `generateMetadata` shares the same `loadProject` helper.
- **Hero banner** (`min-height: 320px`): gradient by status (amber for UNDER_CONSTRUCTION, green for COMPLETED, neutral for PLANNED) + grid overlay + building silhouette + gold left-edge + bottom scrim + overlaid H1 + status badge + location.
- **Body**: two-column `lg:grid-cols-[1fr_360px]`, sidebar sticky at `top: 88px`.
- **Left**: "About This Development" section (description) + "Construction Timeline" section (`<MilestoneTimeline>`).
- **Right sidebar**: status badge card, location InfoRow, progress InfoRow, completion date InfoRow → "Enquire About This Development" gold-fill CTA → "Chat on WhatsApp" gold-outline → "← All Developments" muted back link.
- `SectionHeading`: gold 10px uppercase + flex-1 `#4d4637` divider (same pattern as contact/property pages).
- `InfoRow`: label in 10px uppercase `#4d4637` + value in 13px `#d0c5b2`, `border-bottom: 1px solid #4d4637`.

#### `components/ProjectCard.tsx`

- Server Component (no `"use client"`).
- Props: `{ project: Project }`. Entire card is a `<Link href="/projects/{slug}">`.
- **Image area** (16:9 aspect ratio): gradient placeholder by status — PLANNED=neutral dark, UNDER_CONSTRUCTION=warm amber-dark, COMPLETED=deep cool green-dark.
- Overlays: 48px architectural grid, diagonal gold tint, centred SVG building silhouette (watermark), gold left accent bar.
- **Status badge**: top-left; PLANNED=muted `#99907e`, UNDER_CONSTRUCTION=amber `#E8A020`, COMPLETED=green `#1D9E75`.
- **Card body**: location eyebrow (uppercase, `#4d4637`) → title (Epilogue 700 17px uppercase) → description snippet (2-line clamp) → footer divider + "View Details →" gold link.

### About — `app/about/page.tsx`

- Server Component (no `"use client"`) — purely static; metadata exported.
- **Hero**: `Our / Vision` headline (Epilogue 800, second word gold), 72px architectural grid + radial gold glow + gold left-edge accent.
- **Stat strip**: 4 cells (`10+` / `6+` / `100+` / `24h`) — Space Grotesk gold values, mirrors the projects page strip.
- **Narrative section**: 2-column eyebrow-then-body layout (`280px 1fr`); H2 + two paragraphs of brand story.
- **Pillars grid**: 3 cards in `auto-fit minmax(280px, 1fr)` hairline-grid — numbered eyebrow (01/02/03), title, body.
- **Closing CTA**: centered "Begin a Conversation" eyebrow + headline + Begin Enquiry (gold fill → `/contact`) + Browse Portfolio (gold outline → `/properties`).
- `<SectionEyebrow>` shared sub-component — gold caps label flanked by hairline rules; `center` variant for the closing block.

### Image Hardening — `components/SafeImage.tsx`

- `"use client"` — needs `useState` + `onError` to track decode failures.
- Props: `{ src: string | null | undefined; alt: string; fallback: ReactNode; ...imgAttrs }`.
- Renders `<img>` initially; on `onError` (network failure, broken decode, CORS), swaps to `fallback` ReactNode.
- Also renders fallback when `src` is empty/null/undefined (so callers don't need to guard).
- **Used by**:
  - `CorporatePartners` → fallback = `<PartnerTextMark>` (uppercase Manrope label).
  - `PropertyGallery` → hero fallback = `<HeroFallback>` (per-category gradient + camera SVG + "Image Unavailable" caption); thumbnail fallback = `<ThumbnailFallback>` (small dark gradient + tiny camera glyph).
  - `PropertyCard` → fallback = the same `<BuildingIcon>` watermark used when no `imageUrl` is provided in the first place.
- Result: no broken-image icons anywhere in the app, even when the backend serves dead URLs.

### Admin Projects — `app/admin/projects/page.tsx`

- Async Server Component; calls `getProjects().catch(() => null)` — never throws to the client.
- 4-column data table (Project / Status / Listed / Actions) using the same hairline-row styling as `/admin/properties`.
- Status badges follow the same colour map as the public projects portal (PLANNING=muted, UNDER_CONSTRUCTION=amber, COMPLETED=green).
- "View" button on each row opens the public `/projects/{slug}` listing in a new tab.
- Read-only — milestone editing happens via `POST /api/v1/projects/{id}/milestones` (admin UI is roadmap).
- Empty / error states match the design system (bordered card, muted Manrope copy).

### Admin Settings — `app/admin/settings/page.tsx`

- Async Server Component; reads `GET /api/v1/settings/` directly via `api.get<SettingResponse[]>()`.
- 4-column read-only table: Key (Space Grotesk gold) / Value / Description / Updated.
- Footer note documents that mutation is performed via `PUT /api/v1/settings/{key}` (no in-app editor yet).
- Empty / error states match the rest of admin.

#### `components/MilestoneTimeline.tsx`

- Server Component; accepts `{ milestones: ProjectMilestone[] }`.
- **Empty state**: bordered dark panel + stacked faded square placeholder nodes + "Development timeline coming soon" text.
- **Overall progress header**: "X/N Phases Complete" label + master gold gradient progress bar + large percentage.
- **Milestone nodes**: vertical layout; each has a 20×20px node square + connecting line + date/title/description/progress.
  - Completed (100%): gold filled node + checkmark + gold line + gold date/percentage.
  - In progress (1–99%): amber outlined node + step number + amber bar.
  - Upcoming (0%): muted outlined node + step number + muted `#2d2a23` bar.
- Progress bar: 3px tall track (`#2d2a23`) + fill (gold at 100%, amber in progress).
- `formatDate(iso)`: converts ISO string to "15 March 2025" via `toLocaleDateString('en-GB', {...})`.

#### `services/projectService.ts`

- `ProjectStatus`: `'PLANNING' | 'UNDER_CONSTRUCTION' | 'COMPLETED'` — **`PLANNING` not `PLANNED`** (matches backend enum)
- `ProjectMilestone`: `{ id, project_id, title, description?, milestone_date, completion_percentage (0-100), created_at }`
- `Project`: `{ id, slug, title, description?, status, location_id?, location?: ProjectLocation | null, created_at, updated_at }`
- `ProjectDetail extends Project`: adds `milestones: ProjectMilestone[]`
- `getProjects(status?)`: `api.get<Project[]>('/projects/?status=...')` — status param optional.
- `getProjectBySlug(slug)`: `api.get<ProjectDetail>('/projects/{slug}')` — includes milestones ordered by date.

### Homepage — `app/page.tsx`

- Async Server Component; no `"use client"`.
- Calls `getProperties({ is_featured: true, limit: 6 })` wrapped in `try/catch`.
- Section order: `<HeroSection />` → `<CorporatePartners />` → Featured Properties grid.
- Three render states for Featured section: **property grid** (3-col auto-fill) | **EmptyState** | **ErrorState**.
- Never throws to the browser — backend failure shows a styled error card with contact CTA.

### Components

#### `components/HeroSection.tsx`

- Full-viewport (`min-h-92vh`) dark architectural gradient background.
- CSS grid-line overlay (72px, 2.5% gold opacity) + gold vertical accent left edge.
- Headline uses `clamp(44px, 5.5vw, 80px)` Epilogue 800, uppercase, middle word in gold.
- **Quick Search bar**: native `<form method="GET" action="/properties">` — works without JS.
  Fields: Location (text), Type (RESIDENTIAL/COMMERCIAL select), Budget (PKR range select).
- Purely a Server Component — zero `"use client"`.

#### `components/PropertyCard.tsx`

- Accepts `property: Property` + optional `imageUrl?: string`.
- **Image area** (16:9): real image when `imageUrl` provided; otherwise per-category
  architectural gradient placeholder with faint gold building SVG watermark.
- **Price overlay** bottom-left of image — Space Grotesk, gold (`#e6c364`), per design spec.
- **Status badge** top-left: `AVAILABLE` (gold) · `RESERVED` (amber) · `SOLD` (muted).
- **Type badge** top-right: Residential / Commercial.
- **`formatPKR(price: string)`**: converts decimal string → `"PKR 3.5 Cr"` / `"PKR 85 L"` notation.
- **`formatArea(size: string, unit: AreaUnit)`**: renders `area_size` + `area_unit` (e.g. `"5 Marla"`, `"1,200 sqft"`). Uses `AREA_UNIT_LABEL` map: `SQ_FT→sqft`, `SQ_YARD→sq yd`, `MARLA→Marla`, `KANAL→Kanal`. Never reference `area_sqft` or `floors` — those fields no longer exist.
- Specs row with inline SVG icons (no external icon library).
- Entire card is a `<Link>` → `/properties/{slug}` for full-page navigation.

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

---

## Authentication & Authorization

### Architecture

JWT bearer tokens delivered as **HttpOnly Secure SameSite=Lax cookies**.
Access tokens carry the role; refresh tokens are opaque to the client.
Middleware silently rotates expired access cookies using the refresh cookie.

| Layer | Responsibility |
|---|---|
| `backend/app/core/security.py` | bcrypt hash/verify · access + refresh JWT encode/decode · password-reset token gen + SHA-256 hash |
| `backend/app/core/config.py` | `JWT_SECRET`, expiry settings, cookie flags, CORS list, lockout policy |
| `backend/app/api/deps.py` | `get_current_user` · `require_admin` · `require_super_admin` |
| `backend/app/api/v1/endpoints/auth.py` | login · logout · me · refresh · forgot-password · reset-password |
| `frontend/middleware.ts` | gates `/admin/*`; auto-refreshes when only the refresh cookie is present |
| `frontend/lib/auth.ts` | RSC helper — `getCurrentUser()` / `getAdminUserOrNull()` |
| `frontend/services/authService.ts` | typed client for the auth endpoints |
| `frontend/app/admin/layout.tsx` | server-side role check; redirects to `/login?next=…` if missing |
| `frontend/app/admin/AdminShell.tsx` | client wrapper — sidebar, header, mobile drawer, real logout |

### Endpoints (`/api/v1/auth/*`)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/login` | email + password → sets `v92_access` + `v92_refresh` HttpOnly cookies |
| `POST` | `/auth/logout` | clears auth cookies |
| `GET`  | `/auth/me` | returns current authenticated user (used for SSR rehydration) |
| `POST` | `/auth/refresh` | rotates the access cookie using the refresh cookie |
| `POST` | `/auth/forgot-password` | logs (or emails) a one-time reset link; **always 200** to prevent enumeration |
| `POST` | `/auth/reset-password` | verifies token + sets new password; resets lockout state |

### Roles

`SUPER_ADMIN` and `AGENT` may access `/admin/*` and admin endpoints. `INVESTOR`
and `BUYER_TENANT` cannot — `require_admin` returns `403`. The middleware only
gates cookie *presence*; the layout's `getAdminUserOrNull()` is the role gate.

### Security hardening

- **bcrypt cost 12** — matches all seeded hashes; verified by `passlib`.
- **Account lockout** — `MAX_FAILED_LOGIN_ATTEMPTS=5` failures → lock for `LOCKOUT_MINUTES=15`. Successful login zeroes both counters and stamps `last_login_at`.
- **Timing-equivalent failures** — login runs a dummy `verify_password` when the email is unknown so response time leaks no enumeration signal.
- **Reset tokens** — the raw token is delivered once via email/log; only its SHA-256 hex is persisted in `users.password_reset_token_hash`. Tokens expire after `PASSWORD_RESET_EXPIRE_MINUTES=30`.
- **CORS** — `allow_credentials=True` requires an explicit allowlist. Configure via `CORS_ORIGINS` (comma-separated).
- **Cookies** — `HttpOnly`, `SameSite=Lax`, `Path=/`. Set `COOKIE_SECURE=true` when serving over HTTPS in production.
- **CSRF** — `SameSite=Lax` blocks cross-site form-POST CSRF. Frontend POSTs originate from the same site; no separate CSRF token required for this configuration.

### Auth env vars (configure in `.env`)

| Variable | Default | Notes |
|---|---|---|
| `JWT_SECRET` | dev placeholder | **MUST** be overridden in prod (`python -c "import secrets;print(secrets.token_urlsafe(64))"`) |
| `JWT_ALGORITHM` | `HS256` | |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `14` | |
| `PASSWORD_RESET_EXPIRE_MINUTES` | `30` | |
| `MAX_FAILED_LOGIN_ATTEMPTS` | `5` | |
| `LOCKOUT_MINUTES` | `15` | |
| `COOKIE_SECURE` | `false` (dev) | flip to `true` behind HTTPS |
| `COOKIE_SAMESITE` | `lax` | |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | |
| `FRONTEND_URL` | `http://localhost:3000` | used inside reset-password emails |

### Dev login credentials (seeded)

All `SUPER_ADMIN` and `AGENT` accounts in `backend/seed.sql` share one bcrypt hash:

```
Password: Ventures92Admin@2026
```

Example admin emails: `admin@ventures92.com`, `agent.ali@ventures92.com`. After
first login in any non-dev environment, force a password reset.

### Verification

**Login flow (curl):**
```bash
# 1. Sign in — captures cookies into auth.txt
curl -c auth.txt -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ventures92.com","password":"Ventures92Admin@2026"}'

# 2. Inspect cookies — should contain v92_access (HttpOnly) and v92_refresh
cat auth.txt

# 3. Hit a protected endpoint
curl -b auth.txt http://localhost:8000/api/v1/auth/me

# 4. Refresh the access cookie
curl -b auth.txt -c auth.txt -X POST http://localhost:8000/api/v1/auth/refresh

# 5. Logout — cookies cleared
curl -b auth.txt -c auth.txt -X POST http://localhost:8000/api/v1/auth/logout
```

**Browser:**

1. Visit `/admin/dashboard` — middleware redirects to `/login?next=/admin/dashboard`.
2. Sign in with the seeded credentials → hard navigation back to dashboard.
3. DevTools → Application → Cookies — `v92_access` + `v92_refresh` present, `HttpOnly` flag set.
4. Click Logout — cookies are cleared; `/admin/*` again redirects.
5. Wait > 30 minutes (or shorten `ACCESS_TOKEN_EXPIRE_MINUTES`) — next admin page load silently rotates the access cookie via the refresh flow.

**Forgot/reset flow:**

1. Visit `/forgot-password` and submit a known email — the backend logs a link like `http://localhost:3000/reset-password?token=...` to `docker-compose logs backend`.
2. Open the link; submit a new password (≥ 10 chars).
3. Sign in with the new password.

**Swagger UI** (`/api/docs`): the `Authorize` button accepts the access JWT as a Bearer token (auth dependencies fall back to `Authorization: Bearer …` when no cookie is present).
