"""
Projects endpoints — Module 2
================================
Public:
  GET  /projects/                       — list, optional status filter
  GET  /projects/{slug}                 — detail with ordered milestones
  GET  /projects/{slug}/properties      — all properties for a project

Admin:
  POST /projects/{id}/milestones        — log a new construction milestone
"""

import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.enums import MilestoneStatus, ProjectStatus
from app.models.project import Project, ProjectMilestone
from app.models.property import Property
from app.schemas.project import ProjectResponse
from app.schemas.property import PropertyResponse

router = APIRouter()


# ---------------------------------------------------------------------------
# Inline schemas for milestone operations (project-specific, small)
# ---------------------------------------------------------------------------

class MilestoneCreate(BaseModel):
    title: str
    description: Optional[str] = None
    completion_percentage: Optional[int] = None
    status_update: MilestoneStatus
    milestone_date: str          # ISO-8601 date string e.g. "2026-06-01"
    media_url: Optional[str] = None


class MilestoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    title: str
    description: Optional[str] = None
    completion_percentage: Optional[int] = None
    status_update: MilestoneStatus
    milestone_date: Any           # date — serialised as string by Pydantic
    media_url: Optional[str] = None


class ProjectDetailResponse(ProjectResponse):
    description: Optional[str] = None
    launch_date: Optional[Any] = None
    location: Optional[Dict[str, Any]] = None
    milestones: List[MilestoneResponse] = []


# ---------------------------------------------------------------------------
# PUBLIC — List
# ---------------------------------------------------------------------------

@router.get("/", response_model=List[ProjectResponse], summary="List projects")
def list_projects(
    status: Optional[ProjectStatus] = Query(None, description="PLANNING | UNDER_CONSTRUCTION | COMPLETED"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> List[Project]:
    stmt = select(Project)

    if status is not None:
        stmt = stmt.where(Project.status == status)

    stmt = stmt.order_by(Project.created_at.desc()).offset(offset).limit(limit)
    return list(db.scalars(stmt).all())


# ---------------------------------------------------------------------------
# PUBLIC — Detail (with milestones ordered by date asc)
# ---------------------------------------------------------------------------

@router.get("/{slug}", response_model=ProjectDetailResponse, summary="Get project detail by slug")
def get_project(slug: str, db: Session = Depends(get_db)) -> Project:
    stmt = (
        select(Project)
        .where(Project.slug == slug)
        .options(
            selectinload(Project.milestones),
            selectinload(Project.location),
        )
    )
    project = db.scalars(stmt).first()
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{slug}' not found",
        )

    # Sort milestones chronologically in Python so we don't need an extra
    # query — the collection is already loaded.
    project.milestones.sort(key=lambda m: m.milestone_date)
    return project


# ---------------------------------------------------------------------------
# PUBLIC — Properties belonging to a project
# ---------------------------------------------------------------------------

@router.get(
    "/{slug}/properties",
    response_model=List[PropertyResponse],
    summary="List all properties for a project",
)
def get_project_properties(
    slug: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> List[Property]:
    # Verify the project exists first so we return 404 instead of an empty list
    project = db.scalars(select(Project).where(Project.slug == slug)).first()
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{slug}' not found",
        )

    stmt = (
        select(Property)
        .where(Property.project_id == project.id)
        .order_by(Property.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


# ---------------------------------------------------------------------------
# ADMIN — Log a construction milestone
# ---------------------------------------------------------------------------

@router.post(
    "/{id}/milestones",
    response_model=MilestoneResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Add a construction progress milestone",
)
def create_milestone(
    id: uuid.UUID,
    payload: MilestoneCreate,
    db: Session = Depends(get_db),
) -> ProjectMilestone:
    project = db.scalars(select(Project).where(Project.id == id)).first()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if payload.completion_percentage is not None and not (0 <= payload.completion_percentage <= 100):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="completion_percentage must be between 0 and 100",
        )

    from datetime import date as _date
    try:
        parsed_date = _date.fromisoformat(payload.milestone_date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid milestone_date format '{payload.milestone_date}'. Use ISO-8601 (YYYY-MM-DD).",
        )

    milestone = ProjectMilestone(
        project_id=project.id,
        title=payload.title,
        description=payload.description,
        completion_percentage=payload.completion_percentage,
        status_update=payload.status_update,
        milestone_date=parsed_date,
        media_url=payload.media_url,
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone
