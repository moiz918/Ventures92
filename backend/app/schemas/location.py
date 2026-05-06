import uuid
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class LocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    city: str
    region_or_society: str
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
