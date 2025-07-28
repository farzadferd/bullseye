from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    ALEMBIC_URL: str
    ALPHA_ADVANTAGE_API_KEY: str
    SECRET_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
