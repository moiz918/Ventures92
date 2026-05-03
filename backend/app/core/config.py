from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    PROJECT_NAME: str = "Ventures 92"

    # PostgreSQL connection string — override in .env
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/ventures92"


settings = Settings()
