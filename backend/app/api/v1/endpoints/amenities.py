"""
Amenities endpoint
==================
Public:
  GET /amenities/   — all amenities, ordered by name (used by admin PropertyForm)
"""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.property import Amenity
from app.schemas.property import AmenityResponse

router = APIRouter()


@router.get("/", response_model=List[AmenityResponse], summary="List all amenities")
def list_amenities(db: Session = Depends(get_db)) -> List[Amenity]:
    return list(db.scalars(select(Amenity).order_by(Amenity.name)).all())
