from pydantic_settings import BaseSettings
from dotenv import load_dotenv
load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256" 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GEMINI_API_KEY: str = "AIzaSyBcX5X6pPmwzjJB08-uo-b1NQAT4p6k2ro"

    class Config:
        env_file = ".env"

settings = Settings()  # ← SHU QATORNI QO'SHING
