import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict

from app.models.enums import AreaUnit, AvailabilityStatus, PropertyCategory, PropertyType


class PropertyBase(BaseModel):
    title: str
    slug: str
    property_type: PropertyType
    property_category: PropertyCategory
    price: Decimal
    area_size: Decimal
    area_unit: AreaUnit
    availability_status: AvailabilityStatus
    is_featured: bool


class PropertyCreate(PropertyBase):
    """
    Inherits all PropertyBase fields.  property_type and property_category
    are now required — they map directly to non-nullable DB columns.
    Optional fields (description, bedrooms, bathrooms, etc.) can be added
    here if the admin form exposes them.
    """
    description: Optional[str] = None
    project_id: Optional[uuid.UUID] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    address_details: Optional[str] = None


class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    price: Optional[Decimal] = None
    area_size: Optional[Decimal] = None
    area_unit: Optional[AreaUnit] = None
    availability_status: Optional[AvailabilityStatus] = None
    is_featured: Optional[bool] = None


class PropertyResponse(PropertyBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class PropertyDetailResponse(PropertyResponse):
    project: Optional[Dict[str, Any]] = None
    amenities: List[Dict[str, Any]] = []
