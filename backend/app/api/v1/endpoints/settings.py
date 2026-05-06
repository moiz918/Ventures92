"""
Site Settings endpoints — Module 4
=====================================
Public:
  GET /settings/        — fetch all settings (e.g. whatsapp/call numbers for wa.me links)

Admin:
  PUT /settings/{key}   — update a specific setting value by its key
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.site_setting import SiteSetting
from app.schemas.setting import SettingResponse, SettingUpdate

router = APIRouter()


# ---------------------------------------------------------------------------
# PUBLIC — Fetch all site settings
# ---------------------------------------------------------------------------

@router.get(
    "/",
    response_model=List[SettingResponse],
    summary="Fetch all site settings (contact numbers, social links, etc.)",
)
def list_settings(db: Session = Depends(get_db)) -> List[SiteSetting]:
    stmt = select(SiteSetting).order_by(SiteSetting.setting_key)
    return list(db.scalars(stmt).all())


# ---------------------------------------------------------------------------
# ADMIN — Update a single setting by key
# ---------------------------------------------------------------------------

@router.put(
    "/{key}",
    response_model=SettingResponse,
    summary="[Admin] Update a site setting value by key",
)
def update_setting(
    key: str,
    payload: SettingUpdate,
    db: Session = Depends(get_db),
) -> SiteSetting:
    setting = db.scalars(
        select(SiteSetting).where(SiteSetting.setting_key == key)
    ).first()
    if setting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Setting with key '{key}' not found",
        )

    setting.setting_value = payload.setting_value
    db.commit()
    db.refresh(setting)
    return setting
