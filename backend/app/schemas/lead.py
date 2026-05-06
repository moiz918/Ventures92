import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.enums import LeadStatus


class LeadCreate(BaseModel):
    full_name: str
    phone_number: str
    email: EmailStr
    message: str
    property_id: uuid.UUID
    preferred_property_type: Optional[str] = None
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    preferred_location: Optional[str] = None


class LeadResponse(LeadCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: LeadStatus
    created_at: datetime
    assigned_agent_id: Optional[uuid.UUID] = None
