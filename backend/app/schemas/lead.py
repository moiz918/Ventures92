import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.enums import LeadStatus, PropertyType


class LeadCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr
    message: Optional[str] = None
    property_id: Optional[uuid.UUID] = None
    preferred_property_type: Optional[PropertyType] = None
    min_budget: Optional[Decimal] = None
    max_budget: Optional[Decimal] = None
    preferred_location: Optional[str] = None


class LeadResponse(BaseModel):
    """
    Response shape mirrors the Lead ORM model column names exactly
    so that ConfigDict(from_attributes=True) maps without any shim.
    """
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    first_name: str
    last_name: str
    phone: str
    email: str
    message: Optional[str] = None
    property_id: Optional[uuid.UUID] = None
    preferred_property_type: Optional[PropertyType] = None
    min_budget: Optional[Decimal] = None
    max_budget: Optional[Decimal] = None
    preferred_location: Optional[str] = None
    status: LeadStatus
    assigned_agent_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
