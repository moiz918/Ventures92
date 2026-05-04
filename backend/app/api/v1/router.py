from fastapi import APIRouter

api_router = APIRouter()


@api_router.get("/ping", tags=["Utility"])
async def ping():
    """Simple liveness check for the v1 API."""
    return {"ping": "pong"}
