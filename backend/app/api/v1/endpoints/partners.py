"""
Corporate Partners endpoints — Module 5
=========================================
Public:
  GET /partners/         — active partners ordered by display_order (carousel data)

Admin:
  POST   /partners/      — add a partner
  PUT    /partners/{id}  — update partner details / toggle active
  DELETE /partners/{id}  — remove a partner
"""

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.corporate_partner import CorporatePartner
from app.schemas.partner import PartnerCreate, PartnerResponse, PartnerUpdate

router = APIRouter()


# ---------------------------------------------------------------------------
# PUBLIC — Active partners for the carousel
# ---------------------------------------------------------------------------

@router.get(
    "/",
    response_model=List[PartnerResponse],
    summary="List active corporate partners ordered by display_order",
)
def list_partners(db: Session = Depends(get_db)) -> List[CorporatePartner]:
    stmt = (
        select(CorporatePartner)
        .where(CorporatePartner.is_active == True)  # noqa: E712
        .order_by(CorporatePartner.display_order.asc(), CorporatePartner.created_at.asc())
    )
    return list(db.scalars(stmt).all())


# ---------------------------------------------------------------------------
# ADMIN — Create
# ---------------------------------------------------------------------------

@router.post(
    "/",
    response_model=PartnerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Add a corporate partner",
)
def create_partner(payload: PartnerCreate, db: Session = Depends(get_db)) -> CorporatePartner:
    partner = CorporatePartner(**payload.model_dump())
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner


# ---------------------------------------------------------------------------
# ADMIN — Update (partial)
# ---------------------------------------------------------------------------

@router.put(
    "/{id}",
    response_model=PartnerResponse,
    summary="[Admin] Update corporate partner details",
)
def update_partner(
    id: uuid.UUID,
    payload: PartnerUpdate,
    db: Session = Depends(get_db),
) -> CorporatePartner:
    partner = db.scalars(select(CorporatePartner).where(CorporatePartner.id == id)).first()
    if partner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Corporate partner not found")

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update")

    for field, value in update_data.items():
        setattr(partner, field, value)

    db.commit()
    db.refresh(partner)
    return partner


# ---------------------------------------------------------------------------
# ADMIN — Delete
# ---------------------------------------------------------------------------

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="[Admin] Remove a corporate partner",
)
def delete_partner(id: uuid.UUID, db: Session = Depends(get_db)) -> None:
    partner = db.scalars(select(CorporatePartner).where(CorporatePartner.id == id)).first()
    if partner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Corporate partner not found")

    db.delete(partner)
    db.commit()
