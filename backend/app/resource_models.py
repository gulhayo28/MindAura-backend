# app/resource_models.py
# Bu faylni app/ papkasiga qo'ying
# YOKI mavjud models.py ga bu classni qo'shing

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum


class ContentType(str, enum.Enum):
    book    = "book"
    guide   = "guide"
    article = "article"


class Category(str, enum.Enum):
    anxiety       = "anxiety"
    self_growth   = "self_growth"
    relationships = "relationships"
    therapy       = "therapy"
    depression    = "depression"
    mindfulness   = "mindfulness"
    other         = "other"


class Resource(Base):
    __tablename__ = "resources"

    id             = Column(Integer, primary_key=True, index=True)
    title          = Column(String, nullable=False)
    description    = Column(Text, nullable=True)
    author         = Column(String, nullable=True)
    content_type   = Column(String, nullable=False)   # book / guide / article
    category       = Column(String, nullable=False)   # anxiety / self_growth / ...
    language       = Column(String, default="uz")     # uz / ru / en

    # Fayl
    file_path      = Column(String, nullable=True)
    file_size_kb   = Column(Integer, nullable=True)
    page_count     = Column(Integer, nullable=True)
    cover_image    = Column(String, nullable=True)

    # Meta
    is_published   = Column(Boolean, default=False)
    is_featured    = Column(Boolean, default=False)
    view_count     = Column(Integer, default=0)
    download_count = Column(Integer, default=0)

    uploaded_by    = Column(Integer, nullable=True)   # User.id
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), onupdate=func.now())
