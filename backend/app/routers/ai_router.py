from fastapi import APIRouter,HTTPException
from app.services.gemini_service import (
    generate_plan,
    generate_tasks
)
from app.schemas.ai import AIRequest

from sqlalchemy.orm import Session
from fastapi import Depends

from app.database import get_db
from app.models.task import Task
from app.models.goal import Goal
from app.models.user import User
from app.core.jwt_handler import get_current_user

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)

@router.get("/test")
def test_ai():

    return {
        "message": "AI Router Working!"
    }
    
@router.post("/generate-plan")
def generate_ai_plan(request: AIRequest):

    plan = generate_plan(request.goal)

    return {
        "plan": plan
    }
    
@router.post("/generate-tasks/{goal_id}")
def generate_ai_tasks(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if goal is None:

        raise HTTPException(
            status_code=404,
            detail="Goal not found"
        )
    goal_title = goal.title

    ai_response = generate_tasks(goal_title)
    print("========== AI RESPONSE ==========")
    print(ai_response)
    print("=================================")
    task_list = ai_response.split("\n")
   
    task_list = [

        task.strip()

        for task in task_list

        if task.strip()

    ]

    # Delete old tasks for this goal
    db.query(Task).filter(
        Task.goal_id == goal_id
    ).delete()

    # Save new AI-generated tasks
    for task_title in task_list:

        new_task = Task(

            title=task_title,

            goal_id=goal_id

        )

        db.add(new_task)

    db.commit()

    print(ai_response)

    return {

        "message": "AI Tasks Generated Successfully",

        "tasks": task_list

    }