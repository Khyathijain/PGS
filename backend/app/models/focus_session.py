from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id = Column(Integer, primary_key=True, index=True)

    start_time = Column(DateTime, nullable=False)

    end_time = Column(DateTime, nullable=True)

    duration_minutes = Column(Integer, nullable=False)

    completed = Column(Boolean, default=False)

    distraction_count = Column(Integer, default=0)

    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)

    task = relationship("Task")