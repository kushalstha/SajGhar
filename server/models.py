from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String

from database import Base


class WardrobeItem(Base):
    __tablename__ = "wardrobe_items"

    id = Column(Integer, primary_key=True, index=True)
    original_name = Column(String(255))
    image_path = Column(String(500), nullable=False)
    process_time = Column(Float)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )