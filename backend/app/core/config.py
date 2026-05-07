from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "Ventures 92"

    # PostgreSQL connection string — override in .env
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/ventures92"

    # ── JWT / Auth ──────────────────────────────────────────────────────────
    # IMPORTANT: override JWT_SECRET in production via environment variable.
    JWT_SECRET: str = "CHANGE_ME_IN_PROD_b1d4f7a2c89e4f1a8d9b3c5e7f0a1234567890abcdef"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14
    PASSWORD_RESET_EXPIRE_MINUTES: int = 30

    # Account lockout
    MAX_FAILED_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_MINUTES: int = 15

    # Cookies
    COOKIE_DOMAIN: str | None = None
    COOKIE_SECURE: bool = False  # Set True in HTTPS production environments
    COOKIE_SAMESITE: str = "lax"
    ACCESS_COOKIE_NAME: str = "v92_access"
    REFRESH_COOKIE_NAME: str = "v92_refresh"

    # CORS — comma-separated origins
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Public site URL — used inside reset-password emails
    FRONTEND_URL: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
