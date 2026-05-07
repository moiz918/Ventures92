"""
Leads endpoints — Module 3  (CRM & Matchmaking Core)
======================================================
Public:
  POST /leads/                  — submit client requirements form (auto-status NEW)

Admin:
  GET  /leads/                  — list with filters (status, assigned_agent_id)
  PUT  /leads/{id}/status       — update lead status + assign agent
  POST /leads/{id}/interactions — log a CRM note / call / meeting
"""

import uuid
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.enums import InteractionType, LeadStatus
from app.models.lead import Lead, LeadInteraction
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadResponse

router = APIRouter()


# ---------------------------------------------------------------------------
# Inline schemas for lead-specific operations
# ---------------------------------------------------------------------------

class LeadStatusUpdate(BaseModel):
    """Admin: update pipeline status and optionally assign an agent."""
    status: LeadStatus
    assigned_agent_id: Optional[uuid.UUID] = None


class InteractionCreate(BaseModel):
    """Admin/Agent: log a CRM touch-point against a lead."""
    agent_id: uuid.UUID
    interaction_type: InteractionType
    summary: str


class InteractionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    lead_id: uuid.UUID
    agent_id: uuid.UUID
    interaction_type: InteractionType
    summary: str
    created_at: Any


class LeadDetailResponse(LeadResponse):
    """Extended response that includes CRM interaction history."""
    interactions: List[InteractionResponse] = []


# ---------------------------------------------------------------------------
# PUBLIC — Submit client requirements / enquiry form
# ---------------------------------------------------------------------------

@router.post(
    "/",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a client enquiry (public)",
)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)) -> Lead:
    # Schema field names now match the ORM model exactly — pass through directly.
    # status is always forced to NEW regardless of any future payload changes.
    lead = Lead(**payload.model_dump(), status=LeadStatus.NEW)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


# ---------------------------------------------------------------------------
# ADMIN — List leads (with CRM filters)
# ---------------------------------------------------------------------------

@router.get(
    "/",
    response_model=List[LeadDetailResponse],
    summary="[Admin] List all leads with optional filters",
)
def list_leads(
    status: Optional[LeadStatus] = Query(None, description="NEW | CONTACTED | IN_PROGRESS | QUALIFIED | LOST | CLOSED"),
    assigned_agent_id: Optional[uuid.UUID] = Query(None, description="Filter by assigned agent UUID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> List[Lead]:
    stmt = (
        select(Lead)
        .options(selectinload(Lead.interactions))
        .order_by(Lead.created_at.desc())
    )

    if status is not None:
        stmt = stmt.where(Lead.status == status)
    if assigned_agent_id is not None:
        stmt = stmt.where(Lead.assigned_agent_id == assigned_agent_id)

    stmt = stmt.offset(offset).limit(limit)
    return list(db.scalars(stmt).all())


# ---------------------------------------------------------------------------
# ADMIN — Update lead status + assign agent
# ---------------------------------------------------------------------------

@router.put(
    "/{id}/status",
    response_model=LeadResponse,
    summary="[Admin] Update lead status and/or assign to an agent",
)
def update_lead_status(
    id: uuid.UUID,
    payload: LeadStatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Lead:
    lead = db.scalars(select(Lead).where(Lead.id == id)).first()
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    lead.status = payload.status
    if payload.assigned_agent_id is not None:
        lead.assigned_agent_id = payload.assigned_agent_id

    db.commit()
    db.refresh(lead)
    return lead


# ---------------------------------------------------------------------------
# ADMIN/AGENT — Log a CRM interaction
# ---------------------------------------------------------------------------

@router.post(
    "/{id}/interactions",
    response_model=InteractionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin/Agent] Log a CRM interaction for a lead",
)
def create_interaction(
    id: uuid.UUID,
    payload: InteractionCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> LeadInteraction:
    lead = db.scalars(select(Lead).where(Lead.id == id)).first()
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    # agent_id is FK → users with ON DELETE RESTRICT — the DB will raise
    # IntegrityError if the UUID doesn't exist; let that propagate naturally.
    interaction = LeadInteraction(
        lead_id=lead.id,
        agent_id=payload.agent_id,
        interaction_type=payload.interaction_type,
        summary=payload.summary,
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction
