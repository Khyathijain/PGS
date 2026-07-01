from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.goal import Goal
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalResponse
from app.core.jwt_handler import get_current_user

router = APIRouter(
    prefix="/goals",
    tags=["Goals"]
)


@router.post("/", response_model=GoalResponse)
def create_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_goal = Goal(
        title=goal.title,
        description=goal.description,
        deadline=goal.deadline,
        priority=goal.priority,
        daily_hours=goal.daily_hours,
        user_id=current_user.id
    )

    db.add(new_goal)

    db.commit()

    db.refresh(new_goal)

    return new_goal

@router.get("/", response_model=list[GoalResponse])
def get_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).all()

    return goals

@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if existing_goal is None:
        raise HTTPException(
            status_code=404,
            detail="Goal not found"
        )
        
    existing_goal.title = goal.title

    existing_goal.description = goal.description

    existing_goal.deadline = goal.deadline

    existing_goal.priority = goal.priority

    existing_goal.daily_hours = goal.daily_hours
    
    db.commit()

    db.refresh(existing_goal)

    return existing_goal

@router.delete("/{goal_id}")
def delete_goal(
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

    db.delete(goal)

    db.commit()

    return {
        "message": "Goal deleted successfully"
    }
    