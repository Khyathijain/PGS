from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.database import get_db

from app.models.goal import Goal
from app.models.task import Task
from app.models.study_session import StudySession
from app.models.user import User

from app.schemas.study_session import (
    StudySessionResponse
)

from app.core.jwt_handler import get_current_user


router = APIRouter(
    prefix="/timetable",
    tags=["Timetable"]
)

@router.post("/generate/{goal_id}")
def generate_timetable(
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
    
    if len(tasks) == 0:

        raise HTTPException(
            status_code=400,
            detail="No tasks found for this goal"
        )
        
    deadline = goal.deadline
    daily_hours = goal.daily_hours
    today = date.today()
    days_available = (deadline - today).days
    
    if days_available <= 0:

        raise HTTPException(
            status_code=400,
            detail="Deadline has already passed"
        )
        
    print("Today:", today)
    print("Deadline:", deadline)
    print("Available Days:", days_available)
    print("Number of Tasks:", len(tasks))

    # Delete old timetable if it exists
    db.query(StudySession).filter(
        StudySession.goal_id == goal_id
    ).delete()

    current_date = today

    # Create one study session per task
    for task in tasks:

        session = StudySession(

            study_date=current_date,

            duration_hours=daily_hours,

            goal_id=goal_id,

            task_id=task.id

        )

        db.add(session)

        current_date += timedelta(days=1)

    # Save all sessions
    db.commit()

    return {
        "message": "Timetable Created Successfully"
    }
    
@router.get("/today", response_model=list[StudySessionResponse])
def get_today_schedule(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    today_sessions = (
        db.query(StudySession)
        .options(joinedload(StudySession.task))
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id,
            StudySession.study_date == today
        )
        .all()
    )
    return today_sessions

@router.get("/all", response_model=list[StudySessionResponse])
def get_all_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    sessions = (
        db.query(StudySession)
        .options(joinedload(StudySession.task))
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id
        )
        .order_by(StudySession.study_date)
        .all()
    )

    return sessions

@router.get(
    "/overdue",
    response_model=list[StudySessionResponse]
)
def get_overdue_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    today = date.today()

    overdue_sessions = (

        db.query(StudySession)

        .options(joinedload(StudySession.task))

        .join(Goal)

        .filter(

            Goal.user_id == current_user.id,

            StudySession.study_date < today,

            StudySession.completed == False

        )

        .order_by(StudySession.study_date)

        .all()

    )

    return overdue_sessions

@router.get("/{goal_id}", response_model=list[StudySessionResponse])
def get_timetable(
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

    sessions = (
    db.query(StudySession)
    .options(joinedload(StudySession.task))
    .filter(StudySession.goal_id == goal_id)
    .all()
    )

    return sessions

