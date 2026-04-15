from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# ✅ Neon.tech uchun SSL + pool_pre_ping
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,       # ← uzilgan connectionni avtomatik yangilaydi
    pool_recycle=300,         # ← 5 daqiqada bir yangilanadi
    pool_size=5,
    max_overflow=10,
    connect_args={
        "sslmode": "require", # ← Neon SSL talab qiladi
        "connect_timeout": 30,
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()