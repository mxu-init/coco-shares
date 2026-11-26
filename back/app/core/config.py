from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL

BYTES_PER_MEGABYTE = 1024 * 1024


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str
    APP_VERSION: str
    APP_DESCRIPTION: str
    API_V1_PREFIX: str = "/api/v1"

    DB_HOST: str
    DB_PORT: int = 5432
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    DRIVER_NAME: str = "postgresql+psycopg"

    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    CORS_ORIGINS: str = "http://localhost:5173"

    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_BYTES: int = 50 * BYTES_PER_MEGABYTE

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    REPRESENTATION_EMAIL: str = ""

    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str
    ADMIN_FULL_NAME: str = "Administrador"

    @property
    def database_url(self) -> URL:
        return URL.create(
            drivername=self.DRIVER_NAME,
            username=self.DB_USER,
            password=self.DB_PASSWORD,
            host=self.DB_HOST,
            port=self.DB_PORT,
            database=self.DB_NAME,
        )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
