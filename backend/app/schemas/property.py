import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict

from app.models.enums import AreaUnit, AvailabilityStatus, PropertyCategory, PropertyType


class AmenityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    icon_name: Optional[str] = None


class PropertyMediaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    property_id: uuid.UUID
    media_url: str
    media_type: str
    is_primary: bool
    sort_order: int


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
    # slug is auto-generated from title on the backend if not provided
    slug: Optional[str] = None  # type: ignore[assignment]
    description: Optional[str] = None
    project_id: Optional[uuid.UUID] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    address_details: Optional[str] = None
    # UUIDs resolved from GET /amenities/ — linked via M2M after row insert
    amenity_ids: Optional[List[uuid.UUID]] = None


class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    area_size: Optional[Decimal] = None
    area_unit: Optional[AreaUnit] = None
    availability_status: Optional[AvailabilityStatus] = None
    is_featured: Optional[bool] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    address_details: Optional[str] = None
    project_id: Optional[uuid.UUID] = None


class PropertyResponse(PropertyBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    description: Optional[str] = None
    project_id: Optional[uuid.UUID] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    address_details: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class PropertyDetailResponse(PropertyResponse):
    media: List[PropertyMediaResponse] = []
    amenities: List[AmenityResponse] = []
