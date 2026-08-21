from sqlalchemy.orm import Session
from fastapi import Depends
from app.database import get_db
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_coach_service import AICoachService
from app.services.gemini_service import client, MODEL_NAME

router = APIRouter(
    prefix="/ai-coach",
    tags=["AI Coach"]
)

ai_coach_service = AICoachService()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
def chat(request: ChatRequest, db: Session = Depends(get_db)):

    reply = ai_coach_service.generate_reply(request.message,db)

    return {
        "reply": reply
    }
    
@router.get("/gemini-test")
def gemini_test():

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents="Say hello and confirm that Gemini is working with my FastAPI backend."
    )

    return {
        "reply": response.text
    }
    
@router.post("/gemini-chat")
def gemini_chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):

    try:
        # Try Gemini first
        reply = ai_coach_service.generate_gemini_reply(
            request.message,
            db
        )

        return {
            "reply": reply,
            "source": "gemini"
        }

    except Exception as e:

        print(f"Gemini failed: {e}")

        # Gemini failed → use existing rule-based system
        fallback_reply = ai_coach_service.generate_reply(
            request.message,
            db
        )

        return {
            "reply": fallback_reply,
            "source": "rule-based"
        }