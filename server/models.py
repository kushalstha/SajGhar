from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String

from database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class WardrobeItem(Base):
    __tablename__ = "wardrobe_items"

    id = Column(Integer, primary_key=True, index=True)
    # nullable for now so the app keeps working; made required in Task 4
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    original_name = Column(String(255))
    image_path = Column(String(500), nullable=False)
    process_time = Column(Float)
    created_at = Column(DateTime(timezone=True), default=utcnow)