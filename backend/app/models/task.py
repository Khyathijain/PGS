from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    completed = Column(Boolean, default=False)

    estimated_hours = Column(Integer, default=2)

    goal_id = Column(Integer, ForeignKey("goals.id"))

    goal = relationship("Goal", back_populates="tasks")