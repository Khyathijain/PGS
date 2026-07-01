from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    description = Column(String)

    deadline = Column(Date)

    priority = Column(String)

    daily_hours = Column(Integer)

    status = Column(String, default="Not Started")

    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="goals")