from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str


class TaskResponse(BaseModel):
    id: int
    title: str
    completed: bool
    goal_id: int

    class Config:
        from_attributes = True


class TaskUpdate(BaseModel):
    completed: bool