from datetime import date

from pydantic import BaseModel

class TaskInfo(BaseModel):
    title: str

    class Config:
        from_attributes = True
        
class StudySessionCreate(BaseModel):

    study_date: date

    duration_hours: int

    goal_id: int

    task_id: int


class StudySessionResponse(BaseModel):

    id: int

    study_date: date

    duration_hours: int

    completed: bool

    goal_id: int

    task_id: int
    
    task: TaskInfo

    class Config:

        from_attributes = True


class StudySessionUpdate(BaseModel):

    completed: bool