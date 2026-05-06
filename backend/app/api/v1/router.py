from fastapi import APIRouter

from app.api.v1.endpoints import properties

api_router = APIRouter()

api_router.include_router(properties.router, prefix="/properties", tags=["Properties"])


@api_router.get("/ping", tags=["Utility"])
async def ping():
    """Simple liveness check for the v1 API."""
    return {"ping": "pong"}
