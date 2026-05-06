from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.property import Property
from app.schemas.property import PropertyResponse

router = APIRouter()


@router.get("/", response_model=List[PropertyResponse])
def list_properties(db: Session = Depends(get_db)):
    return db.query(Property).all()


@router.get("/{slug}", response_model=PropertyResponse)
def get_property(slug: str, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.slug == slug).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop
