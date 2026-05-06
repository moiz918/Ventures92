import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SettingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    setting_key: str
    setting_value: str
    description: Optional[str] = None
    updated_at: datetime


class SettingUpdate(BaseModel):
    setting_value: str
