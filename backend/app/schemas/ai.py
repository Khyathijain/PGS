from pydantic import BaseModel


class AIRequest(BaseModel):

    goal: str