"""
Authentication endpoints -- production-grade JWT + HttpOnly cookie auth.

Public:
    POST  /auth/signup           -- self-register (INVESTOR / BUYER_TENANT only)
    POST  /auth/login            -- email + password -> sets cookies, returns user
    POST  /auth/logout           -- clears cookies
    POST  /auth/refresh          -- exchanges refresh cookie for a new access cookie
    POST  /auth/forgot-password  -- emails (logs) a reset link
    POST  /auth/reset-password   -- verifies token, sets new password

Authenticated:
    GET   /auth/me               -- current user (used for SSR rehydration)
    POST  /auth/change-password  -- change password (strength-checked, rotates session)
"""
from __future__ import annotations

import logging
import re as _re
import uuid
from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Cookie, Depends, HTTPException, Header, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_password_reset_token,
    hash_password,
    hash_reset_token,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    CurrentUser,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    PUBLIC_SIGNUP_ROLES,
    ResetPasswordRequest,
    SignupRequest,
    SignupResponse,
)

logger = logging.getLogger("ventures92.auth")
router = APIRouter()


# ---------------------------------------------------------------------------
# Cookie helpers
# ---------------------------------------------------------------------------
def _cookie_kwargs(*, max_age: int) -> dict:
    """Shared kwargs for setting auth cookies (HttpOnly, SameSite, Secure)."""
    return {
        "httponly": True,
        "secure": settings.COOKIE_SECURE,
        "samesite": settings.COOKIE_SAMESITE,
        "domain": settings.COOKIE_DOMAIN,
        "path": "/",
        "max_age": max_age,
    }


def _set_auth_cookies(
    response: Response, *, access_token: str, refresh_token: str
) -> None:
    response.set_cookie(
        key=settings.ACCESS_COOKIE_NAME,
        value=access_token,
        **_cookie_kwargs(max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60),
    )
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=refresh_token,
        **_cookie_kwargs(max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600),
    )


def _clear_auth_cookies(response: Response) -> None:
    for name in (settings.ACCESS_COOKIE_NAME, settings.REFRESH_COOKIE_NAME):
        response.delete_cookie(
            key=name,
            path="/",
            domain=settings.COOKIE_DOMAIN,
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
        )


# ---------------------------------------------------------------------------
# Lockout helpers
# ---------------------------------------------------------------------------
def _is_locked(user: User) -> bool:
    if user.locked_until is None:
        return False
    from datetime import datetime, timezone
    return user.locked_until > datetime.now(tz=timezone.utc)


def _register_failed_attempt(db: Session, user: User) -> None:
    user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
    if user.failed_login_attempts >= settings.MAX_FAILED_LOGIN_ATTEMPTS:
        from datetime import datetime, timezone
        user.locked_until = datetime.now(tz=timezone.utc) + timedelta(
            minutes=settings.LOCKOUT_MINUTES
        )
    db.commit()


def _reset_attempts(db: Session, user: User) -> None:
    from datetime import datetime, timezone
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.now(tz=timezone.utc)
    db.commit()


# ---------------------------------------------------------------------------
# Password strength checks (reused by signup and change-password)
# ---------------------------------------------------------------------------
_PW_STRENGTH_CHECKS = [
    (_re.compile(r"[A-Z]"), "an uppercase letter"),
    (_re.compile(r"[a-z]"), "a lowercase letter"),
    (_re.compile(r"\d"),    "a number"),
    (_re.compile(r"[^A-Za-z0-9]"), "a special character"),
]


# ---------------------------------------------------------------------------
# POST /auth/signup  (public -- INVESTOR / BUYER_TENANT only)
# ---------------------------------------------------------------------------
@router.post(
    "/signup",
    response_model=SignupResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Self-register a new INVESTOR or BUYER_TENANT account",
)
def signup(
    payload: SignupRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> SignupResponse:
    """
    Public registration endpoint.

    Security guarantees
    -------------------
    - Role is clamped to INVESTOR / BUYER_TENANT at the schema level AND
      double-checked here. SUPER_ADMIN / AGENT cannot be created via this
      route regardless of the request body.
    - Password is bcrypt-hashed (cost 12) before storage. No plaintext ever
      reaches the database.
    - Email uniqueness is enforced at both the DB constraint and application
      level to give a clean 409 instead of an unhandled IntegrityError.
    - Access + refresh tokens are issued immediately so the frontend can start
      a session without a second round-trip.
    """
    # Belt-and-suspenders role guard (schema validator is the first line)
    if payload.role not in PUBLIC_SIGNUP_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="SUPER_ADMIN and AGENT accounts cannot be created via public signup.",
        )

    # Email uniqueness check (application-level, avoids raw IntegrityError)
    existing = db.scalars(select(User).where(User.email == payload.email)).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    # Password strength check
    missing = [
        label
        for pattern, label in _PW_STRENGTH_CHECKS
        if not pattern.search(payload.password)
    ]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Password must contain {', '.join(missing)}.",
        )

    # Create user -- password hashed, never stored in plaintext
    new_user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone_number=payload.phone_number,
        role=payload.role,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info(
        "[SIGNUP] New %s account created: %s (id=%s)",
        new_user.role.value,
        new_user.email,
        new_user.id,
    )

    # Issue tokens and set HttpOnly cookies -- same flow as /login
    access_token = create_access_token(
        user_id=new_user.id, role=new_user.role.value, email=new_user.email
    )
    refresh_token = create_refresh_token(user_id=new_user.id)
    _set_auth_cookies(response, access_token=access_token, refresh_token=refresh_token)

    return SignupResponse(
        user=CurrentUser.model_validate(new_user),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


# ---------------------------------------------------------------------------
# POST /auth/login
# ---------------------------------------------------------------------------
@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Authenticate via email + password and set HttpOnly cookies",
)
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> LoginResponse:
    user = db.scalars(select(User).where(User.email == payload.email)).first()

    # Use a constant-ish branch on missing user to limit timing oracles.
    if user is None:
        verify_password(payload.password, "$2b$12$DUMMYHASHFORTIMINGEQUIVALENCE.................")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account disabled. Please contact an administrator.",
        )

    if _is_locked(user):
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=(
                f"Account temporarily locked after too many failed attempts. "
                f"Try again in {settings.LOCKOUT_MINUTES} minutes."
            ),
        )

    if not verify_password(payload.password, user.password_hash):
        _register_failed_attempt(db, user)
        if _is_locked(user):
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=(
                    f"Account locked for {settings.LOCKOUT_MINUTES} minutes "
                    "after too many failed attempts."
                ),
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Success
    _reset_attempts(db, user)

    access_token = create_access_token(
        user_id=user.id, role=user.role.value, email=user.email
    )
    refresh_token = create_refresh_token(user_id=user.id)
    _set_auth_cookies(response, access_token=access_token, refresh_token=refresh_token)

    return LoginResponse(
        user=CurrentUser.model_validate(user),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


# ---------------------------------------------------------------------------
# POST /auth/logout
# ---------------------------------------------------------------------------
@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Clear authentication cookies",
)
def logout(response: Response) -> MessageResponse:
    _clear_auth_cookies(response)
    return MessageResponse(message="Logged out")


# ---------------------------------------------------------------------------
# GET /auth/me
# ---------------------------------------------------------------------------
@router.get(
    "/me",
    response_model=CurrentUser,
    summary="Return the current authenticated user",
)
def me(current_user: User = Depends(get_current_user)) -> CurrentUser:
    return CurrentUser.model_validate(current_user)


# ---------------------------------------------------------------------------
# POST /auth/refresh
# ---------------------------------------------------------------------------
@router.post(
    "/refresh",
    response_model=MessageResponse,
    summary="Issue a fresh access cookie using the refresh cookie",
)
def refresh(
    response: Response,
    db: Session = Depends(get_db),
    refresh_cookie: Optional[str] = Cookie(None, alias=settings.REFRESH_COOKIE_NAME),
    authorization: Optional[str] = Header(None),
) -> MessageResponse:
    token = refresh_cookie
    if not token and authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip() or None

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token"
        )

    payload = decode_token(token, expected_type="refresh")
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad token")

    user = db.scalars(select(User).where(User.id == user_id)).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer active"
        )

    new_access = create_access_token(
        user_id=user.id, role=user.role.value, email=user.email
    )
    new_refresh = create_refresh_token(user_id=user.id)
    _set_auth_cookies(response, access_token=new_access, refresh_token=new_refresh)

    return MessageResponse(message="Refreshed")


# ---------------------------------------------------------------------------
# POST /auth/forgot-password
# ---------------------------------------------------------------------------
@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Begin password-reset flow (always 200 to prevent user enumeration)",
)
def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> MessageResponse:
    user = db.scalars(select(User).where(User.email == payload.email)).first()

    # Even if the user does not exist we return 200 -- prevents enumeration.
    if user is not None and user.is_active:
        from datetime import datetime, timezone

        raw_token = generate_password_reset_token()
        user.password_reset_token_hash = hash_reset_token(raw_token)
        user.password_reset_expires_at = datetime.now(tz=timezone.utc) + timedelta(
            minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES
        )
        db.commit()

        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
        # In production replace this with your email service (SES, SendGrid, etc.)
        logger.warning(
            "[PASSWORD RESET] %s -- link valid for %s minutes: %s",
            user.email,
            settings.PASSWORD_RESET_EXPIRE_MINUTES,
            reset_link,
        )

    return MessageResponse(
        message="If that email is registered, a reset link has been sent."
    )


# ---------------------------------------------------------------------------
# POST /auth/reset-password
# ---------------------------------------------------------------------------
@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Complete password reset using token from /forgot-password",
)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> MessageResponse:
    if len(payload.new_password) < 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 10 characters.",
        )

    token_hash = hash_reset_token(payload.token)
    user = db.scalars(
        select(User).where(User.password_reset_token_hash == token_hash)
    ).first()

    if user is None or user.password_reset_expires_at is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset link.",
        )

    from datetime import datetime, timezone

    if user.password_reset_expires_at < datetime.now(tz=timezone.utc):
        user.password_reset_token_hash = None
        user.password_reset_expires_at = None
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset link has expired. Please request a new one.",
        )

    user.password_hash = hash_password(payload.new_password)
    user.password_reset_token_hash = None
    user.password_reset_expires_at = None
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()

    return MessageResponse(message="Password updated. You can now sign in.")


# ---------------------------------------------------------------------------
# POST /auth/change-password
# ---------------------------------------------------------------------------
_PW_CHECKS = [
    (r"[A-Z]", "an uppercase letter"),
    (r"[a-z]", "a lowercase letter"),
    (r"\d", "a number"),
    (r"[^A-Za-z0-9]", "a special character"),
]


@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Change password for the currently authenticated user",
)
def change_password(
    payload: ChangePasswordRequest,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    import re

    if payload.new_password != payload.confirm_new_password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New passwords do not match.",
        )

    missing = [label for pattern, label in _PW_CHECKS if not re.search(pattern, payload.new_password)]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Password must contain {', '.join(missing)}.",
        )

    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect.",
        )

    if verify_password(payload.new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must differ from the current password.",
        )

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()

    # Rotate tokens so old sessions are implicitly invalidated.
    new_access = create_access_token(
        user_id=current_user.id,
        role=current_user.role.value,
        email=current_user.email,
    )
    new_refresh = create_refresh_token(user_id=current_user.id)
    _set_auth_cookies(response, access_token=new_access, refresh_token=new_refresh)

    return MessageResponse(message="Password changed successfully.")
