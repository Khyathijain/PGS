from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.goal import Goal
from app.models.task import Task
from app.models.study_session import StudySession
from app.models.user import User

from app.core.jwt_handler import get_current_user
from datetime import date, timedelta
from collections import defaultdict

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total Goals
    total_goals = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).count()

    # Get all goal IDs of the current user
    goal_ids = db.query(Goal.id).filter(
        Goal.user_id == current_user.id
    ).all()

    goal_ids = [goal.id for goal in goal_ids]

    # Total Tasks
    total_tasks = db.query(Task).filter(
        Task.goal_id.in_(goal_ids)
    ).count()

    # Completed Tasks
    completed_tasks = db.query(Task).filter(
        Task.goal_id.in_(goal_ids),
        Task.completed == True
    ).count()

    # Today's Study Sessions
    today_sessions = db.query(StudySession).filter(
        StudySession.goal_id.in_(goal_ids),
        StudySession.study_date == date.today()
    ).count()

    # Completion Rate
    completion_rate = 0

    if total_tasks > 0:
        completion_rate = round(
            (completed_tasks / total_tasks) * 100,
            2
        )

    return {
        "total_goals": total_goals,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "today_sessions": today_sessions,
        "completion_rate": completion_rate
    }
    
@router.get("/weekly-progress")
def weekly_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    today = date.today()

    start_of_week = today - timedelta(days=today.weekday())

    end_of_week = start_of_week + timedelta(days=6)

    sessions = (
        db.query(StudySession)
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id,
            StudySession.completed == True,
            StudySession.study_date >= start_of_week,
            StudySession.study_date <= end_of_week
        )
        .all()
    )

    progress = defaultdict(int)

    for session in sessions:

        day = session.study_date.strftime("%a")

        progress[day] += 1

    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    result = []

    for day in days:

        result.append({

            "day": day,

            "completed": progress[day]

        })

    return result

@router.get("/goal-progress")
def goal_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).all()

    result = []

    for goal in goals:

        total_tasks = db.query(Task).filter(
            Task.goal_id == goal.id
        ).count()

        completed_tasks = db.query(Task).filter(
            Task.goal_id == goal.id,
            Task.completed == True
        ).count()

        if total_tasks == 0:
            percentage = 0
        else:
            percentage = round(
                (completed_tasks / total_tasks) * 100,
                2
            )

        result.append({

            "goal": goal.title,

            "progress": percentage

        })

    return result

@router.get("/procrastination-score")
def procrastination_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # -----------------------------
    # Total Tasks
    # -----------------------------

    total_tasks = (
        db.query(Task)
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id
        )
        .count()
    )

    # -----------------------------
    # Completed Tasks
    # -----------------------------

    completed_tasks = (
        db.query(Task)
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id,
            Task.completed == True
        )
        .count()
    )

    # -----------------------------
    # Overdue Sessions
    # -----------------------------

    overdue_sessions = (
        db.query(StudySession)
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id,
            StudySession.completed == False,
            StudySession.study_date < date.today()
        )
        .count()
    )

    # -----------------------------
    # Completion %
    # -----------------------------

    if total_tasks == 0:
        completion_rate = 0
    else:
        completion_rate = (
            completed_tasks / total_tasks
        ) * 100

    # -----------------------------
    # Rule-Based Score
    # -----------------------------

    score = 0

    # Overdue contributes up to 40 marks
    score += min(overdue_sessions * 8, 40)

    # Poor completion contributes up to 60 marks
    score += (100 - completion_rate) * 0.6

    score = round(score)

    # -----------------------------
    # Risk Level
    # -----------------------------

    if score <= 30:

        risk = "Low"

    elif score <= 60:

        risk = "Medium"

    else:

        risk = "High"

    return {

        "score": score,

        "risk": risk,

        "completion_rate": round(completion_rate),

        "overdue_sessions": overdue_sessions

    }