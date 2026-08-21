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
from sqlalchemy import extract, func

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
    
@router.get("/gamification")
def gamification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    completed_sessions = (
        db.query(StudySession)
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id,
            StudySession.completed == True
        )
        .order_by(StudySession.study_date.desc())
        .all()
    )

    # -------------------------
    # XP
    # -------------------------

    xp = len(completed_sessions) * 10

    # -------------------------
    # Level
    # -------------------------

    level = (xp // 100) + 1

    # -------------------------
    # Daily Streak
    # -------------------------

    streak = 0

    completed_dates = sorted(
        list(
            {
                session.study_date
                for session in completed_sessions
            }
        ),
        reverse=True
    )

    today = date.today()

    current_day = today

    # If today has no completed session,
    # start checking from yesterday
    if current_day not in completed_dates:
        current_day = current_day - timedelta(days=1)

    while current_day in completed_dates:

        streak += 1

        current_day = current_day - timedelta(days=1)

    return {

        "xp": xp,

        "level": level,

        "streak": streak

    }
    
@router.get("/badges")
def badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Completed Study Sessions
    completed_sessions = (
        db.query(StudySession)
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id,
            StudySession.completed == True
        )
        .count()
    )

    # XP and Level
    xp = completed_sessions * 10
    level = (xp // 100) + 1

    # Completed Goals
    completed_goals = (
        db.query(Goal)
        .filter(
            Goal.user_id == current_user.id,
            Goal.status == "Completed"
        )
        .count()
    )

    # Current Streak
    completed = (
        db.query(StudySession)
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id,
            StudySession.completed == True
        )
        .order_by(StudySession.study_date.desc())
        .all()
    )

    completed_dates = sorted(
        list({s.study_date for s in completed}),
        reverse=True
    )

    streak = 0
    current_day = date.today()

    if current_day not in completed_dates:
        current_day -= timedelta(days=1)

    while current_day in completed_dates:
        streak += 1
        current_day -= timedelta(days=1)

    badges = [

        {
            "name": "First Step",
            "icon": "🥇",
            "earned": completed_sessions >= 1
        },

        {
            "name": "7-Day Warrior",
            "icon": "🔥",
            "earned": streak >= 7
        },

        {
            "name": "Goal Crusher",
            "icon": "🎯",
            "earned": completed_goals >= 1
        },

        {
            "name": "Study Master",
            "icon": "📚",
            "earned": completed_sessions >= 100
        },

        {
            "name": "Productivity Hero",
            "icon": "⭐",
            "earned": level >= 10
        }

    ]

    return badges

@router.get("/achievements")
def achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # -------------------------
    # Completed Tasks
    # -------------------------
    completed_tasks = (
        db.query(Task)
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id,
            Task.completed == True
        )
        .count()
    )

    # -------------------------
    # Completed Study Sessions
    # -------------------------
    completed_sessions = (
        db.query(StudySession)
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id,
            StudySession.completed == True
        )
        .count()
    )

    # -------------------------
    # XP & Level
    # -------------------------
    xp = completed_sessions * 10
    level = (xp // 100) + 1

    # -------------------------
    # Streak
    # -------------------------
    completed = (
        db.query(StudySession)
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id,
            StudySession.completed == True
        )
        .order_by(StudySession.study_date.desc())
        .all()
    )

    completed_dates = sorted(
        list({s.study_date for s in completed}),
        reverse=True
    )

    streak = 0
    current_day = date.today()

    if current_day not in completed_dates:
        current_day -= timedelta(days=1)

    while current_day in completed_dates:
        streak += 1
        current_day -= timedelta(days=1)

    achievements = [
        {
            "title": "🎯 Task Master",
            "current": completed_tasks,
            "target": 10,
            "progress": min((completed_tasks / 10) * 100, 100)
        },
        {
            "title": "📚 Study Master",
            "current": completed_sessions,
            "target": 100,
            "progress": min((completed_sessions / 100) * 100, 100)
        },
        {
            "title": "🔥 7-Day Warrior",
            "current": streak,
            "target": 7,
            "progress": min((streak / 7) * 100, 100)
        },
        {
            "title": "⭐ Level Up",
            "current": level,
            "target": 5,
            "progress": min((level / 5) * 100, 100)
        }
    ]

    return achievements

@router.get("/monthly-study-trend")
def monthly_study_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    results = (
        db.query(
            extract("month", StudySession.study_date).label("month"),
            func.sum(StudySession.duration_hours).label("hours")
        )
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id,
            StudySession.completed == True
        )
        .group_by(extract("month", StudySession.study_date))
        .order_by(extract("month", StudySession.study_date))
        .all()
    )

    month_names = {
        1: "Jan",
        2: "Feb",
        3: "Mar",
        4: "Apr",
        5: "May",
        6: "Jun",
        7: "Jul",
        8: "Aug",
        9: "Sep",
        10: "Oct",
        11: "Nov",
        12: "Dec"
    }

    trend = []

    for month, hours in results:
        trend.append(
            {
                "month": month_names[int(month)],
                "hours": hours
            }
        )

    return trend

@router.get("/study-time-distribution")
def study_time_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    results = (
        db.query(
            Goal.title,
            func.sum(StudySession.duration_hours).label("hours")
        )
        .join(StudySession, Goal.id == StudySession.goal_id)
        .filter(
            Goal.user_id == current_user.id,
            StudySession.completed == True
        )
        .group_by(Goal.title)
        .all()
    )

    distribution = []

    for title, hours in results:
        distribution.append(
            {
                "goal": title,
                "hours": hours
            }
        )

    return distribution

@router.get("/productivity-heatmap")
def productivity_heatmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    results = (
        db.query(StudySession)
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id,
            StudySession.completed == True
        )
        .all()
    )

    days = {
        "Mon": 0,
        "Tue": 0,
        "Wed": 0,
        "Thu": 0,
        "Fri": 0,
        "Sat": 0,
        "Sun": 0
    }

    for session in results:
        day = session.study_date.strftime("%a")
        days[day] += session.duration_hours

    heatmap = []

    for day, hours in days.items():
        heatmap.append({
            "day": day,
            "hours": hours
        })

    return heatmap

@router.get("/time-analytics")
def time_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    today = date.today()

    start_of_week = today - timedelta(days=today.weekday())

    start_of_month = today.replace(day=1)

    sessions = (
        db.query(StudySession)
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id,
            StudySession.completed == True
        )
        .all()
    )

    today_hours = 0
    week_hours = 0
    month_hours = 0
    total_hours = 0

    for session in sessions:

        total_hours += session.duration_hours

        if session.study_date == today:
            today_hours += session.duration_hours

        if session.study_date >= start_of_week:
            week_hours += session.duration_hours

        if session.study_date >= start_of_month:
            month_hours += session.duration_hours

    return {
        "today_hours": today_hours,
        "week_hours": week_hours,
        "month_hours": month_hours,
        "total_hours": total_hours
    }
    
@router.get("/ai-insights")
def ai_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    goal_ids = (
        db.query(Goal.id)
        .filter(Goal.user_id == current_user.id)
        .all()
    )

    goal_ids = [g.id for g in goal_ids]

    total_tasks = (
        db.query(Task)
        .filter(Task.goal_id.in_(goal_ids))
        .count()
    )

    completed_tasks = (
        db.query(Task)
        .filter(
            Task.goal_id.in_(goal_ids),
            Task.completed == True
        )
        .count()
    )

    pending_tasks = total_tasks - completed_tasks

    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())

    week_hours = (
        db.query(func.sum(StudySession.duration_hours))
        .join(Goal)
        .filter(
            Goal.user_id == current_user.id,
            StudySession.completed == True,
            StudySession.study_date >= start_of_week
        )
        .scalar()
    ) or 0

    insights = []

    if total_tasks == 0:
        insights.append({
            "type": "info",
            "message": "Create your first goal to begin tracking your progress."
        })
    else:

        completion = (
            completed_tasks / total_tasks
        ) * 100

        if completion < 50:
            insights.append({
                "type": "warning",
                "message": f"Only {completed_tasks} of {total_tasks} tasks are completed. Try finishing a few pending tasks today."
            })

        if pending_tasks >= 10:
            insights.append({
                "type": "warning",
                "message": f"You have {pending_tasks} pending tasks. Consider prioritizing the oldest ones."
            })

    if week_hours < 5:
        insights.append({
            "type": "warning",
            "message": f"You've studied only {week_hours} hours this week. Aim for at least 7–10 hours."
        })
    else:
        insights.append({
            "type": "success",
            "message": f"Great job! You've studied {week_hours} hours this week."
        })

    completed_goals = (
        db.query(Goal)
        .filter(
            Goal.user_id == current_user.id,
            Goal.status == "Completed"
        )
        .count()
    )

    if completed_goals > 0:
        insights.append({
            "type": "success",
            "message": f"You've completed {completed_goals} goal(s). Keep up the momentum!"
        })

    return insights