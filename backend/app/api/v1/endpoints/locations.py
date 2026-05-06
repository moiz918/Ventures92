"""
Locations endpoints — Module 6
================================
Public:
  GET /locations/   — all cities + societies for frontend search dropdowns
"""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.location import Location
from app.schemas.location import LocationResponse

router = APIRouter()


# ---------------------------------------------------------------------------
# PUBLIC — All locations for dropdown population
# ---------------------------------------------------------------------------

@router.get(
    "/",
    response_model=List[LocationResponse],
    summary="Fetch all locations for search filter dropdowns",
)
def list_locations(db: Session = Depends(get_db)) -> List[Location]:
    stmt = select(Location).order_by(Location.city.asc(), Location.region_or_society.asc())
    return list(db.scalars(stmt).all())
