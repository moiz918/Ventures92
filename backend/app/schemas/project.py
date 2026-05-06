import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.enums import ProjectStatus


class ProjectBase(BaseModel):
    title: str
    slug: str
    status: ProjectStatus
    completion_percentage: Optional[int] = None


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
