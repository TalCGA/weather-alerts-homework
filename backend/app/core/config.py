from pydantic import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./weather.db"
    SECRET_KEY: str = "change_me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    TOMORROW_IO_API_KEY: str = "change_me"

    class Config:
        env_file = ".env"


settings = Settings()
