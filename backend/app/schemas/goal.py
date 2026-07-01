from pydantic import BaseModel
from datetime import date

class GoalCreate(BaseModel):
    title: str
    description: str
    deadline: date
    priority: str
    daily_hours: int


class GoalResponse(BaseModel):
    id: int
    title: str
    description: str
    deadline: date
    priority: str
    daily_hours: int
    status: str

    class Config:
        from_attributes = True