from sqlalchemy import Column, Integer, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)

    study_date = Column(Date, nullable=False)

    duration_hours = Column(Integer, nullable=False)

    completed = Column(Boolean, default=False)

    goal_id = Column(Integer, ForeignKey("goals.id"))

    task_id = Column(Integer, ForeignKey("tasks.id"))

    goal = relationship("Goal")

    task = relationship("Task")