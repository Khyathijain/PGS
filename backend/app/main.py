from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .models.user import User
from .models.goal import Goal
from .routers import user_router
from .routers import goal_router
from .routers import ai_router

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

@app.get("/")
def home():
    return {"message": "FastAPI is connected successfully!"}