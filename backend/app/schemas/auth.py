"""
Pydantic v2 schemas for the authentication subsystem.

These are the only request / response shapes the auth endpoints accept or
return.  Tokens themselves are sent as HttpOnly cookies — the response
bodies only carry the user's profile and a non-sensitive flag.
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import UserRole


# ── Requests ─────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10, max_length=128)
    new_password: str = Field(min_length=10, max_length=128)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=10, max_length=128)
    confirm_new_password: str = Field(min_length=1, max_length=128)


# ── Responses ────────────────────────────────────────────────────────────────
class CurrentUser(BaseModel):
    """Public view of the authenticated user, returned by /auth/me & /auth/login."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    role: UserRole
    is_active: bool
    last_login_at: Optional[datetime] = None


class LoginResponse(BaseModel):
    user: CurrentUser
    expires_in: int  # access-token lifetime in seconds, hint for the client


class MessageResponse(BaseModel):
    message: str
