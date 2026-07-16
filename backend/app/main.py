from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .models.user import User
from .models.goal import Goal
from .routers import user_router
from .routers import goal_router
from .routers import ai_router
from .models.task import Task

from .models.task import Task
from .routers import task_router
from app.models.study_session import StudySession
from app.routers.timetable_router import router as timetable_router
from app.routers.dashboard_router import router as dashboard_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(user_router.router)
app.include_router(goal_router.router)
app.include_router(ai_router.router)

app.include_router(user_router.router)
app.include_router(goal_router.router)
app.include_router(ai_router.router)
app.include_router(task_router.router)
app.include_router(timetable_router)
app.include_router(dashboard_router)

@app.get("/")
def home():
    return {"message": "FastAPI is connected successfully!"}