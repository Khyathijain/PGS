import os

from dotenv import load_dotenv

import google.generativeai as genai

# Load .env file
load_dotenv()

# Read API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Create model
model = genai.GenerativeModel("gemini-2.5-flash")

def generate_plan(goal: str):

    response = model.generate_content(
        f"""
        Create a study plan for this goal:

        {goal}

        Divide it into weekly milestones.
        """
    )

    return response.text