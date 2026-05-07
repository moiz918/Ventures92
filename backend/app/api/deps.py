"""
Reusable FastAPI dependencies for authentication & authorization.

Every protected endpoint should `Depends(...)` one of:
    - get_current_user        — any authenticated, active user
    - require_admin           — SUPER_ADMIN or AGENT
    - require_super_admin     — SUPER_ADMIN only

The access token is read from the HttpOnly cookie set by /auth/login.
A standard `Authorization: Bearer <token>` header is also accepted as a
fallback so that /api/docs and curl-based testing keep working.
"""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import Cookie, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_token
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User

# Roles allowed inside /admin/*
ADMIN_ROLES: set[UserRole] = {UserRole.SUPER_ADMIN, UserRole.AGENT}


def _extract_access_token(
    cookie_token: Optional[str],
    auth_header: Optional[str],
) -> Optional[str]:
    if cookie_token:
        return cookie_token
    if auth_header and auth_header.lower().startswith("bearer "):
        return auth_header.split(" ", 1)[1].strip() or None
    return None


def get_current_user(
    db: Session = Depends(get_db),
    cookie_token: Optional[str] = Cookie(None, alias=settings.ACCESS_COOKIE_NAME),
    authorization: Optional[str] = Header(None),
) -> User:
    token = _extract_access_token(cookie_token, authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(token, expected_type="access")
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token",
        )

    user = db.scalars(select(User).where(User.id == user_id)).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer active",
        )
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ADMIN_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def require_super_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super-admin access required",
        )
    return current_user
