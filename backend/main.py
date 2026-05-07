import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings

# ---------------------------------------------------------------------------
# Logging — auth events emit at WARNING so they show up in `docker compose logs`
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the Ventures 92 Real Estate Portfolio Portal",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ---------------------------------------------------------------------------
# CORS
# allow_credentials=True is REQUIRED so the browser includes our HttpOnly auth
# cookies on cross-origin XHR.  When credentials are allowed, allow_origins
# MUST be an explicit allowlist (wildcard is rejected by browsers).
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(api_router, prefix="/api/v1")


# ---------------------------------------------------------------------------
# Root & health-check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def root():
    return {"message": f"{settings.PROJECT_NAME} API is running."}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}
