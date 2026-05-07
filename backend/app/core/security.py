"""
Security primitives: bcrypt password hashing, JWT access/refresh token
encoding & decoding, and password reset token generation.

Conventions
-----------
- Bcrypt cost factor 12 — matches the seed.sql hashes.
- Access tokens carry: sub (user UUID), role, email, type="access", exp.
- Refresh tokens carry: sub, type="refresh", exp.
- Password reset tokens are RANDOM URL-safe strings; only their SHA-256 hash
  is persisted on the user row.  The raw token is shown to the user once.
"""
from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Literal, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Constant-time bcrypt verification.  Never raises — returns False on bad hashes."""
    try:
        return pwd_context.verify(plain, hashed)
    except (ValueError, TypeError):
        return False


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------
TokenType = Literal["access", "refresh"]


def _utcnow() -> datetime:
    return datetime.now(tz=timezone.utc)


def _encode_jwt(claims: Dict[str, Any]) -> str:
    return jwt.encode(claims, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_access_token(*, user_id: uuid.UUID, role: str, email: str) -> str:
    expires = _utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return _encode_jwt(
        {
            "sub": str(user_id),
            "role": role,
            "email": email,
            "type": "access",
            "iat": int(_utcnow().timestamp()),
            "exp": int(expires.timestamp()),
        }
    )


def create_refresh_token(*, user_id: uuid.UUID) -> str:
    expires = _utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return _encode_jwt(
        {
            "sub": str(user_id),
            "type": "refresh",
            "iat": int(_utcnow().timestamp()),
            "exp": int(expires.timestamp()),
        }
    )


def decode_token(token: str, *, expected_type: TokenType) -> Optional[Dict[str, Any]]:
    """Returns the decoded payload or None if signature/expiry/type fails."""
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
    except JWTError:
        return None
    if payload.get("type") != expected_type:
        return None
    return payload


# ---------------------------------------------------------------------------
# Password reset tokens
# ---------------------------------------------------------------------------
def generate_password_reset_token() -> str:
    """43-char URL-safe random string (~256 bits of entropy)."""
    return secrets.token_urlsafe(32)


def hash_reset_token(raw: str) -> str:
    """Stable SHA-256 hex digest used to look the token up in the DB."""
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()
