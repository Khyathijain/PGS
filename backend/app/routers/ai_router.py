from fastapi import APIRouter
from app.services.gemini_service import generate_plan
from app.schemas.ai import AIRequest

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