from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.task import Task
from app.models.goal import Goal
from app.models.user import User
from app.models.study_session import StudySession

from app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskUpdate
)

from app.core.jwt_handler import get_current_user


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


# --------------------------------------------------
# CREATE TASK
# --------------------------------------------------

@router.post("/{goal_id}", response_model=TaskResponse)
def create_task(
    goal_id: int,
    task: TaskCreate,
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

    new_task = Task(
        title=task.title,
        goal_id=goal_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


# --------------------------------------------------
# GET ALL TASKS OF A GOAL
# --------------------------------------------------

@router.get("/{goal_id}", response_model=list[TaskResponse])
def get_tasks(
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

    tasks = db.query(Task).filter(
        Task.goal_id == goal_id
    ).all()

    return tasks


# --------------------------------------------------
# UPDATE TASK
# --------------------------------------------------

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing_task = db.query(Task).join(Goal).filter(
        Task.id == task_id,
        Goal.user_id == current_user.id
    ).first()

    if existing_task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    existing_task.completed = task.completed
    
    print("Task Completed:", existing_task.completed)

    # Update the linked study session
    study_session = db.query(StudySession).filter(
        StudySession.task_id == existing_task.id
    ).first()

    print("Study Session:", study_session)

    if study_session:
        study_session.completed = task.completed
        print("Updated Study Session:", study_session.completed)
    else:
        print("No Study Session Found")

    db.commit()

    db.refresh(existing_task)

    return existing_task


# --------------------------------------------------
# DELETE TASK
# --------------------------------------------------

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing_task = db.query(Task).join(Goal).filter(
        Task.id == task_id,
        Goal.user_id == current_user.id
    ).first()

    if existing_task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(existing_task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }