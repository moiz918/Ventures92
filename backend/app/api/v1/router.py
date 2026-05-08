"""
API v1 Router
=============
Wires all endpoint sub-routers into the central api_router.
This module is imported by main.py via:

    app.include_router(api_router, prefix="/api/v1")

Resulting base paths:
  /api/v1/ping
  /api/v1/auth/*
  /api/v1/properties/
  /api/v1/projects/
  /api/v1/leads/
  /api/v1/settings/
  /api/v1/partners/
  /api/v1/locations/
  /api/v1/media/
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    amenities,
    auth,
    leads,
    locations,
    media,
    partners,
    projects,
    properties,
    settings,
)

api_router = APIRouter()

# -- Utility ------------------------------------------------------------------
@api_router.get("/ping", tags=["Utility"])
async def ping():
    """Simple liveness check for the v1 API."""
    return {"ping": "pong"}


# -- Authentication -----------------------------------------------------------
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)


# -- Public Portal ------------------------------------------------------------
api_router.include_router(
    properties.router,
    prefix="/properties",
    tags=["Properties"],
)

api_router.include_router(
    projects.router,
    prefix="/projects",
    tags=["Projects"],
)

api_router.include_router(
    locations.router,
    prefix="/locations",
    tags=["Locations"],
)

api_router.include_router(
    partners.router,
    prefix="/partners",
    tags=["Corporate Partners"],
)

api_router.include_router(
    settings.router,
    prefix="/settings",
    tags=["Site Settings"],
)

api_router.include_router(
    amenities.router,
    prefix="/amenities",
    tags=["Amenities"],
)

# -- CRM / Admin --------------------------------------------------------------
api_router.include_router(
    leads.router,
    prefix="/leads",
    tags=["Leads (CRM)"],
)

# -- Media Upload -------------------------------------------------------------
api_router.include_router(
    media.router,
    prefix="/media",
    tags=["Media Upload"],
)
