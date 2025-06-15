from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    ALEMBIC_URL: str

    class Config:
        env_file = ".env"
        validate_by_name = True

settings = Settings()
