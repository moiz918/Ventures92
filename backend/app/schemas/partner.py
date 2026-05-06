import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class PartnerBase(BaseModel):
    name: str
    logo_url: str
    website_url: Optional[str] = None
    is_active: bool = True
    display_order: int = 0


class PartnerCreate(PartnerBase):
    pass


class PartnerUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class PartnerResponse(PartnerBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
