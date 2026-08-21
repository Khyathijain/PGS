from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db

from app.models.focus_session import FocusSession
from app.models.focus_distraction import FocusDistraction
from app.models.task import Task
from app.models.goal import Goal
from app.models.user import User
from app.core.jwt_handler import get_current_user


router = APIRouter(
    prefix="/focus",
    tags=["Focus Enforcement"]
)


class FocusSessionCreate(BaseModel):
    task_id: int
    duration_minutes: int


@router.post("/start")
def start_focus_session(
    request: FocusSessionCreate,
    db: Session = Depends(get_db)
):

    # Check whether the selected task exists
    task = (
        db.query(Task)
        .filter(Task.id == request.task_id)
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    # Validate duration
    if request.duration_minutes <= 0:
        raise HTTPException(
            status_code=400,
            detail="Duration must be greater than 0 minutes"
        )

    # Create focus session
    focus_session = FocusSession(
        start_time=datetime.now(),
        duration_minutes=request.duration_minutes,
        task_id=request.task_id,
        completed=False,
        distraction_count=0
    )

    db.add(focus_session)
    db.commit()
    db.refresh(focus_session)

    return {
        "message": "Focus session started",
        "session_id": focus_session.id,
        "task_id": focus_session.task_id,
        "task_title": task.title,
        "duration_minutes": focus_session.duration_minutes,
        "start_time": focus_session.start_time
    }

@router.post("/{session_id}/distraction")
def record_distraction(
    session_id: int,
    db: Session = Depends(get_db)
):
    session = (
        db.query(FocusSession)
        .filter(FocusSession.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Focus session not found"
        )

    session.distraction_count += 1

    distraction = FocusDistraction(
        focus_session_id=session_id
    )

    db.add(distraction)
    db.commit()
    db.refresh(distraction)

    return {
        "message": "Distraction recorded",
        "session_id": session_id,
        "distraction_count": session.distraction_count
    }
    
@router.get("/statistics")
def get_focus_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    sessions = (
        db.query(FocusSession)
        .join(Task)
        .join(Goal)
        .filter(Goal.user_id == current_user.id)
        .all()
    )

    total_sessions = len(sessions)

    completed_sessions = sum(
        1 for session in sessions
        if session.completed
    )

    total_focus_minutes = sum(
        session.duration_minutes
        for session in sessions
    )

    average_session_minutes = (
        total_focus_minutes / total_sessions
        if total_sessions > 0
        else 0
    )

    total_distractions = sum(
        session.distraction_count or 0
        for session in sessions
    )

    return {
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "total_focus_minutes": total_focus_minutes,
        "average_session_minutes": round(
            average_session_minutes,
            2
        ),
        "total_distractions": total_distractions
    }

@router.get("/distraction-statistics")
def get_distraction_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    sessions = (
        db.query(FocusSession)
        .join(Task)
        .join(Goal)
        .filter(Goal.user_id == current_user.id)
        .all()
    )

    total_sessions = len(sessions)

    total_distractions = sum(
        session.distraction_count or 0
        for session in sessions
    )

    sessions_with_distractions = sum(
        1
        for session in sessions
        if (session.distraction_count or 0) > 0
    )

    average_distractions = (
        total_distractions / total_sessions
        if total_sessions > 0
        else 0
    )

    highest_distractions = max(
        (session.distraction_count or 0 for session in sessions),
        default=0
    )

    return {
        "total_distractions": total_distractions,
        "sessions_with_distractions": sessions_with_distractions,
        "average_distractions": round(
            average_distractions,
            2
        ),
        "highest_distractions": highest_distractions
    }
    
@router.get("/efficiency")
def get_focus_efficiency(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    sessions = (
        db.query(FocusSession)
        .join(Task)
        .join(Goal)
        .filter(Goal.user_id == current_user.id)
        .all()
    )

    if not sessions:
        return {
            "efficiency_score": 0,
            "total_sessions": 0
        }

    total_sessions = len(sessions)

    total_distractions = sum(
        session.distraction_count or 0
        for session in sessions
    )

    # Average distractions per session
    average_distractions = (
        total_distractions / total_sessions
    )

    # Calculate efficiency
    # 0 distractions = 100%
    # Each average distraction reduces the score by 10%
    efficiency_score = max(
        0,
        100 - (average_distractions * 10)
    )

    return {
        "efficiency_score": round(efficiency_score, 2),
        "total_sessions": total_sessions,
        "average_distractions": round(
            average_distractions,
            2
        )
    }
    
@router.get("/history")
def get_focus_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    sessions = (
        db.query(FocusSession)
        .join(Task)
        .join(Goal)
        .filter(Goal.user_id == current_user.id)
        .order_by(FocusSession.start_time.desc())
        .all()
    )

    history = []

    for session in sessions:
        history.append({
            "session_id": session.id,
            "task_id": session.task_id,
            "task_title": session.task.title,
            "duration_minutes": session.duration_minutes,
            "distraction_count": session.distraction_count or 0,
            "completed": session.completed,
            "start_time": session.start_time,
            "end_time": session.end_time
        })

    return history