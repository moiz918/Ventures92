"""
Properties endpoints — Module 1
================================
Public:
  GET  /properties/          — filtered search
  GET  /properties/{slug}    — detail view with media + amenities (eager-loaded)

Admin:
  POST   /properties/        — create
  PUT    /properties/{id}    — update (partial)
  DELETE /properties/{id}    — delete
"""

import re
import unicodedata
import uuid
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.enums import AvailabilityStatus, PropertyCategory, PropertyType
from app.models.project import Project
from app.models.property import Amenity, Property
from app.models.user import User
from app.schemas.property import (
    PropertyCreate,
    PropertyDetailResponse,
    PropertyResponse,
    PropertyUpdate,
)


def _slugify(text: str) -> str:
    """Convert an arbitrary title to a URL-safe slug."""
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^\w\s-]', '', text.lower())
    return re.sub(r'[-\s]+', '-', text).strip('-') or 'property'


def _unique_slug(base: str, db: Session) -> str:
    """Append an incrementing counter until the slug is unique in the DB."""
    slug = base
    counter = 1
    while db.scalars(select(Property).where(Property.slug == slug)).first():
        slug = f"{base}-{counter}"
        counter += 1
    return slug

router = APIRouter()


# ---------------------------------------------------------------------------
# PUBLIC — Search / List
# ---------------------------------------------------------------------------

@router.get("/", response_model=List[PropertyResponse], summary="List & search properties")
def list_properties(
    property_type: Optional[PropertyType] = Query(None, description="RESIDENTIAL | COMMERCIAL"),
    property_category: Optional[PropertyCategory] = Query(None, description="PLOT | HOUSE | APARTMENT | OFFICE | SHOP"),
    location_id: Optional[uuid.UUID] = Query(None, description="Filter by location (joins through project)"),
    min_price: Optional[Decimal] = Query(None, ge=0),
    max_price: Optional[Decimal] = Query(None, ge=0),
    availability_status: Optional[AvailabilityStatus] = Query(None),
    is_featured: Optional[bool] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> List[Property]:
    stmt = select(Property)

    # location_id lives on Project, not Property — join only when needed
    if location_id is not None:
        stmt = stmt.join(Property.project).where(Project.location_id == location_id)

    if property_type is not None:
        stmt = stmt.where(Property.property_type == property_type)
    if property_category is not None:
        stmt = stmt.where(Property.property_category == property_category)
    if min_price is not None:
        stmt = stmt.where(Property.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Property.price <= max_price)
    if availability_status is not None:
        stmt = stmt.where(Property.availability_status == availability_status)
    if is_featured is not None:
        stmt = stmt.where(Property.is_featured == is_featured)

    stmt = stmt.order_by(Property.created_at.desc()).offset(offset).limit(limit)

    return list(db.scalars(stmt).all())


# ---------------------------------------------------------------------------
# PUBLIC — Detail
# ---------------------------------------------------------------------------

@router.get("/{slug}", response_model=PropertyDetailResponse, summary="Get property detail by slug")
def get_property(slug: str, db: Session = Depends(get_db)) -> Property:
    # Use selectinload for collections (media, amenities) to avoid N+1 queries;
    # joinedload for the single-row project relationship.
    stmt = (
        select(Property)
        .where(Property.slug == slug)
        .options(
            joinedload(Property.project),
            selectinload(Property.media),
            selectinload(Property.amenities),
        )
    )
    prop = db.scalars(stmt).first()
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Property '{slug}' not found")
    return prop


# ---------------------------------------------------------------------------
# ADMIN — Create
# ---------------------------------------------------------------------------

@router.post(
    "/",
    response_model=PropertyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Create a new property",
)
def create_property(
    payload: PropertyCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Property:
    # Resolve slug — auto-generate from title if not provided, ensure uniqueness.
    base_slug = _slugify(payload.slug or payload.title)
    slug = _unique_slug(base_slug, db)

    # Build scalar columns — exclude M2M and the slug (set manually above).
    data = payload.model_dump(exclude={'amenity_ids', 'slug'})
    data['slug'] = slug

    prop = Property(**data)
    db.add(prop)
    db.flush()  # materialise property.id before linking M2M

    # Link amenities via the property_amenities association table.
    if payload.amenity_ids:
        amenities = list(db.scalars(
            select(Amenity).where(Amenity.id.in_(payload.amenity_ids))
        ).all())
        prop.amenities = amenities

    db.commit()
    db.refresh(prop)
    return prop


# ---------------------------------------------------------------------------
# ADMIN — Update (partial)
# ---------------------------------------------------------------------------

@router.put("/{id}", response_model=PropertyResponse, summary="[Admin] Update a property")
def update_property(
    id: uuid.UUID,
    payload: PropertyUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Property:
    prop = db.scalars(select(Property).where(Property.id == id)).first()
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update")

    # Check slug uniqueness if being changed
    if "slug" in update_data and update_data["slug"] != prop.slug:
        clash = db.scalars(select(Property).where(Property.slug == update_data["slug"])).first()
        if clash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A property with slug '{update_data['slug']}' already exists",
            )

    for field, value in update_data.items():
        setattr(prop, field, value)

    db.commit()
    db.refresh(prop)
    return prop


# ---------------------------------------------------------------------------
# ADMIN — Delete
# ---------------------------------------------------------------------------

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="[Admin] Delete a property")
def delete_property(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> None:
    prop = db.scalars(select(Property).where(Property.id == id)).first()
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    db.delete(prop)
    db.commit()
