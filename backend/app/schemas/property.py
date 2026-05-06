import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.enums import AreaUnit, AvailabilityStatus


class PropertyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    price: Decimal
    area_size: Decimal
    area_unit: AreaUnit
    availability_status: AvailabilityStatus
    is_featured: bool
