import os

from dotenv import load_dotenv
from google import genai

# Load .env file
load_dotenv()

# Read API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Create Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)

# Gemini model
MODEL_NAME = "gemini-3.6-flash"


def generate_plan(goal: str):

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=f"""
Create a study plan for this goal:

{goal}

Divide it into weekly milestones.
"""
    )

    return response.text


def generate_tasks(goal: str):

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=f"""
Generate exactly 10 learning tasks for the following goal.

Goal:
{goal}

Rules:

- Return only task titles.
- One task per line.
- Do NOT number them.
- Do NOT add headings.
- Do NOT add explanations.
- Keep every task short.
"""
    )

    return response.text

def generate_coach_reply(
    message: str,
    goals: str,
    tasks: str,
    study_sessions: str
):

    prompt = f"""
You are the AI Productivity Coach inside a study planning application called PGS.

The user said:
"{message}"

Here is the user's current study information.

GOALS:
{goals}

TASKS:
{tasks}

STUDY SESSIONS:
{study_sessions}

Your job is to understand what the user means and give a personalized,
useful response.

IMPORTANT RULES:

1. Use the user's actual goals, tasks, deadlines, and study history when relevant.
2. Do NOT invent goals, tasks, deadlines, progress, or study history.
3. If the available data does not answer the question, clearly say that.
4. Give practical advice that the user can act on immediately.
5. Be supportive and encouraging, but do not be overly dramatic.
6. Keep responses concise and suitable for a chatbot.
7. Keep most responses under 120 words.
8. Prefer short paragraphs or 2-4 bullet points.
9. For motivation or overwhelm, recommend ONE specific task unless the user asks for options.
10. Give the user one clear next action.
11. If the user asks what to study, recommend specific pending tasks from their data.
12. If the user feels overwhelmed or unmotivated, acknowledge their feeling and
    suggest one small, realistic action.
13. If the user asks about progress, use completed tasks and study sessions
    from the provided data.
14. If the user asks about deadlines, use the actual goal deadlines provided.
15. If the user asks a general productivity question, you may provide general
    advice while still considering their study context.

Response style:
- Friendly
- Clear
- Concise
- Personalized
- Action-oriented
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    return response.text