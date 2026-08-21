from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class FocusDistraction(Base):
    __tablename__ = "focus_distractions"

    id = Column(Integer, primary_key=True, index=True)

    focus_session_id = Column(
        Integer,
        ForeignKey("focus_sessions.id"),
        nullable=False
    )

    detected_at = Column(
        DateTime,
        default=datetime.now,
        nullable=False
    )

    focus_session = relationship(
        "FocusSession"
    )