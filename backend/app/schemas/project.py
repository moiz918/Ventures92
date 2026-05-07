import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.enums import ProjectStatus


class LocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    city: str
    region_or_society: str


class ProjectBase(BaseModel):
    title: str
    slug: str
    status: ProjectStatus


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    description: Optional[str] = None
    location_id: Optional[uuid.UUID] = None
    location: Optional[LocationResponse] = None
    created_at: datetime
    updated_at: datetime
