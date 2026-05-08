"""
Pydantic v2 schemas for the authentication subsystem.

These are the only request / response shapes the auth endpoints accept or
return.  Tokens themselves are sent as HttpOnly cookies -- the response
bodies only carry the user profile and a non-sensitive expiry flag.
"""
import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.enums import UserRole

# Roles the public signup endpoint may assign.  SUPER_ADMIN and AGENT
# can only be created by a SUPER_ADMIN via internal admin tooling.
PUBLIC_SIGNUP_ROLES = frozenset({UserRole.INVESTOR, UserRole.BUYER_TENANT})


# ---------------------------------------------------------------------------
# Requests
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class SignupRequest(BaseModel):
    """Public self-registration -- restricted to INVESTOR and BUYER_TENANT."""

    email: EmailStr
    password: str = Field(
        min_length=10,
        max_length=128,
        description="Min 10 chars; must contain upper, lower, digit, special char.",
    )
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone_number: Optional[str] = Field(default=None, max_length=20)
    # Only INVESTOR or BUYER_TENANT -- validated below.
    role: Literal[UserRole.INVESTOR, UserRole.BUYER_TENANT] = UserRole.BUYER_TENANT

    @field_validator("role", mode="before")
    @classmethod
    def _block_privileged_roles(cls, v: object) -> object:
        """Reject SUPER_ADMIN / AGENT even if somehow serialised correctly."""
        role = UserRole(v) if not isinstance(v, UserRole) else v
        if role not in PUBLIC_SIGNUP_ROLES:
            raise ValueError(
                "Role must be INVESTOR or BUYER_TENANT for public sign-up."
            )
        return role


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10, max_length=128)
    new_password: str = Field(min_length=10, max_length=128)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=10, max_length=128)
    confirm_new_password: str = Field(min_length=1, max_length=128)


# ---------------------------------------------------------------------------
# Responses
# ---------------------------------------------------------------------------

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


class SignupResponse(BaseModel):
    """Returned by POST /auth/signup -- mirrors LoginResponse so the frontend
    can immediately hydrate a session after successful registration."""

    user: CurrentUser
    expires_in: int  # access-token lifetime in seconds


class MessageResponse(BaseModel):
    message: str
