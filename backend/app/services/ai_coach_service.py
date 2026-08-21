import datetime
from datetime import date
from email import message
from sqlalchemy.orm import Session
from app.models.goal import Goal
from app.models.task import Task
from app.models.study_session import StudySession
from app.services.gemini_service import generate_coach_reply

class AICoachService:

    def generate_reply(self, message: str, db: Session) -> str:

        message = message.lower()

        priority_score = {
            "high": 3,
            "medium": 2,
            "low": 1
        }

        pending_tasks = db.query(Task).filter(Task.completed == False).all()
        pending_count = len(pending_tasks)
        
        completed_tasks = db.query(Task).filter(Task.completed == True).all()
        completed_count = len(completed_tasks)

        goals = db.query(Goal).all()
        goal_count = len(goals)

        # Store last studied date for each goal
        last_studied = {}

        for goal in goals:
            latest_session = (
                db.query(StudySession)
                .filter(StudySession.goal_id == goal.id)
                .order_by(StudySession.study_date.desc())
                .first()
            )

            if latest_session:
                last_studied[goal.id] = latest_session.study_date
            else:
                last_studied[goal.id] = None

        # Sort by Priority -> Deadline -> Last Studied
        goals.sort(
            key=lambda goal: (
                -priority_score.get(goal.priority.strip().lower(), 0),
                goal.deadline,
                last_studied.get(goal.id) or date.min
            )
        )

        ###
        if (
            "motivate me" in message
            or "motivation" in message
            or "encourage me" in message
            or "i am tired" in message
        ):

            completed_tasks = (
                db.query(Task)
                .filter(Task.completed == True)
                .count()
            )

            pending_tasks = (
                db.query(Task)
                .filter(Task.completed == False)
                .count()
            )

            if completed_tasks >= pending_tasks:

                return (
                    "🌟 You're doing an amazing job!\n\n"
                    "You've completed many tasks already. "
                    "Keep going—you are getting closer to your goals! 💪"
                )

            elif completed_tasks > 0:

                return (
                    "💪 You've already completed some tasks.\n\n"
                    "Take one step at a time and keep moving forward!"
                )

            else:

                return (
                    "🚀 Every expert was once a beginner.\n\n"
                    "Start with a single task today and build momentum!"
                )
                
        ###Goal completion percentage
        if (
            "goal progress" in message
            or "show my progress" in message
            or "completion percentage" in message
            or "how much have i completed" in message
        ):

            goals = db.query(Goal).all()

            if not goals:
                return "You don't have any goals yet."

            reply = "🎯 Goal Progress\n\n"

            for goal in goals:

                total_tasks = (
                    db.query(Task)
                    .filter(Task.goal_id == goal.id)
                    .count()
                )

                completed_tasks = (
                    db.query(Task)
                    .filter(
                        Task.goal_id == goal.id,
                        Task.completed == True
                    )
                    .count()
                )

                if total_tasks == 0:
                    percentage = 0
                else:
                    percentage = int(
                        (completed_tasks / total_tasks) * 100
                    )

                reply += (
                    f"📚 {goal.title}: "
                    f"{percentage}% complete\n"
                )

            return reply
        
        ###Estimated Time Remaining---
        if (
            "due soon" in message
            or "deadline" in message
            or "which goals are due" in message
            or "upcoming goals" in message
        ):

            today = date.today()

            goals = (
                db.query(Goal)
                .order_by(Goal.deadline.asc())
                .all()
            )

            reply = "⚠️ Upcoming Deadlines\n\n"

            count = 0

            for goal in goals:

                if goal.deadline:

                    days_left = (goal.deadline - today).days

                    if days_left >= 0:

                        count += 1

                        reply += (
                            f"{count}. {goal.title}\n"
                            f"📅 Deadline: {goal.deadline}\n"
                            f"⏳ {days_left} day(s) left\n\n"
                        )

                if count == 5:
                    break

            if count == 0:
                return "🎉 No upcoming deadlines found."

            return reply
        
        # ==========================
        # What should I study today?
        # ==========================
        if (
            "study today" in message
            or "what should i study" in message
            or "what to study" in message
        ):

            for goal in goals:

                goal_tasks = (
                    db.query(Task)
                    .filter(
                        Task.goal_id == goal.id,
                        Task.completed == False
                    )
                    .all()
                )

                if goal_tasks:

                    latest = last_studied.get(goal.id)

                    reply = (
                        f"📚 I recommend focusing on: {goal.title}\n"
                        f"⭐ Priority: {goal.priority}\n"
                        f"📅 Deadline: {goal.deadline}\n"
                    )

                    if latest:
                        reply += f"🕒 Last Studied: {latest}\n\n"
                    else:
                        reply += "🕒 Last Studied: Never\n\n"

                    reply += "Your next tasks are:\n"

                    for index, task in enumerate(goal_tasks[:3], start=1):
                        reply += f"{index}. {task.title}\n"

                    return reply

            return "🎉 Great job! You don't have any pending tasks."

        # --------------------- Task Statistics ---------------------
        if (
            "task statistics" in message
            or "task stats" in message
            or "task report" in message
            or "task summary" in message
        ):

            total_tasks = db.query(Task).count()

            completed_tasks = (
                db.query(Task)
                .filter(Task.completed == True)
                .count()
            )

            pending_tasks = (
                db.query(Task)
                .filter(Task.completed == False)
                .count()
            )

            if total_tasks == 0:
                return (
                    "📊 Task Statistics\n\n"
                    "You don't have any tasks yet."
                )

            completion_rate = round((completed_tasks / total_tasks) * 100)

            reply = (
                "📊 Task Statistics\n\n"
                f"📋 Total Tasks: {total_tasks}\n"
                f"✅ Completed Tasks: {completed_tasks}\n"
                f"⌛ Pending Tasks: {pending_tasks}\n"
                f"📈 Completion Rate: {completion_rate}%\n\n"
            )

            if completion_rate >= 80:
                reply += "🌟 Excellent! You're completing most of your tasks."
            elif completion_rate >= 50:
                reply += "👏 Great progress! Keep going."
            elif completion_rate >= 20:
                reply += "👍 You're making progress. Stay consistent!"
            else:
                reply += "💪 Every completed task counts. Keep working towards your goals!"

            return reply
        
        
        # --------------------- Study Streak ---------------------

        if (
            "study streak" in message
            or "streak" in message
            or "consistency" in message
        ):

            sessions = (
                db.query(StudySession)
                .filter(StudySession.completed == True)
                .order_by(StudySession.study_date.desc())
                .all()
            )

            if not sessions:
                return "🔥 You don't have any completed study sessions yet."

            study_dates = []

            for session in sessions:
                if session.study_date not in study_dates:
                    study_dates.append(session.study_date)

            streak = 1

            for i in range(len(study_dates) - 1):

                current_day = study_dates[i]
                previous_day = study_dates[i + 1]

                if current_day - previous_day == datetime.timedelta(days=1):
                    streak += 1
                else:
                    break

            reply = (
                f"🔥 Study Streak\n\n"
                f"Current streak: {streak} day(s)\n\n"
            )

            if streak >= 7:
                reply += "🌟 Amazing consistency! Keep it up!"
            elif streak >= 3:
                reply += "👏 Great job! Stay consistent."
            else:
                reply += "💪 Study today to increase your streak!"

            return reply
        
        if (
            "estimated time" in message
            or "time remaining" in message
            or "how much time is left" in message
            or "hours remaining" in message
        ):
            pending_tasks = (
                db.query(Task)
                .filter(Task.completed == False)
                .all()
            )

            total_hours = sum(
                task.estimated_hours
                for task in pending_tasks
            )

            return (
                f"⏱️ Estimated Time Remaining\n\n"
                f"📋 Pending Tasks: {len(pending_tasks)}\n"
                f"⌛ Estimated Hours Needed: {total_hours} hours\n\n"
                "💪 Keep studying consistently!"
            )
        
        
        # ==========================
        # Pending Tasks
        # ==========================
        if "pending" in message or "task" in message:

            reply = f"You currently have {pending_count} pending task(s).\n\n"

            if pending_count > 0:
                reply += "Here are your next tasks:\n"

                for index, task in enumerate(pending_tasks[:5], start=1):
                    reply += f"{index}. {task.title}\n"

            return reply
        
        # ==========================
        # Productivity Score
        # ==========================
        
        if (
            "productivity score" in message
            or "score" in message
            or "how productive" in message
        ):

            total_tasks = pending_count + completed_count

            if total_tasks == 0:
                return (
                    "📊 Productivity Score\n\n"
                    "You don't have any tasks yet.\n"
                    "Create some tasks to start tracking your productivity!"
                )

            score = int((completed_count / total_tasks) * 100)

            reply = (
                f"🏆 Productivity Score: {score}/100\n\n"
                f"✅ Completed Tasks: {completed_count}\n"
                f"📋 Pending Tasks: {pending_count}\n\n"
            )

            if score >= 80:
                reply += "🌟 Excellent! You're highly productive. Keep it up!"
            elif score >= 60:
                reply += "🚀 Great job! You're making good progress."
            elif score >= 40:
                reply += "👍 You're on the right track. Try completing a few more tasks."
            else:
                reply += "💪 Every small step counts. Complete a few tasks today to boost your productivity!"

            return reply
        
        
        # ---------------- Goal Completion ----------------
        
        if (
            "goal completion" in message
            or "goal progress" in message
            or "completed goals" in message
        ):

            goals = db.query(Goal).all()

            if not goals:
                return "You don't have any goals."

            completed_goals = 0

            reply = "🎯 Goal Progress\n\n"

            for goal in goals:

                total_tasks = (
                    db.query(Task)
                    .filter(Task.goal_id == goal.id)
                    .count()
                )

                completed_tasks = (
                    db.query(Task)
                    .filter(
                        Task.goal_id == goal.id,
                        Task.completed == True
                    )
                    .count()
                )

                if total_tasks == 0:
                    progress = 0
                else:
                    progress = int(
                        (completed_tasks / total_tasks) * 100
                    )

                if progress == 100:
                    completed_goals += 1

                reply += (
                    f"📚 {goal.title}\n"
                    f"Progress: {progress}% "
                    f"({completed_tasks}/{total_tasks} tasks)\n\n"
                )

            overall = int(
                (completed_goals / len(goals)) * 100
            )

            reply += (
                f"🏆 Overall Goal Completion: {overall}%"
            )

            return reply
                
        
        # ==========================
        # Progress Block
        # ==========================
                
        if (
            "progress" in message
            or "how am i doing" in message
        ):

            reply = (
                "📊 Your Progress Summary\n\n"
                f"🎯 Goals: {goal_count}\n"
                f"📋 Pending Tasks: {pending_count}\n"
                f"✅ Completed Tasks: {completed_count}\n\n"
            )

            if completed_count > pending_count:
                reply += (
                    "Excellent work! 🎉\n"
                    "You've completed more tasks than you have remaining. Keep up the momentum!"
                )

            elif completed_count == pending_count:
                reply += (
                    "You're halfway there! 💪\n"
                    "Stay consistent and you'll reach your goals."
                )

            else:
                reply += (
                    "You're making steady progress. 📚\n"
                    "Try completing a few pending tasks today to move closer to your goals."
                )

            return reply
        
        #==========================
        # Upcoming Goal
        #==========================
        if (
            "next deadline" in message
            or "due next" in message
            or "upcoming deadline" in message
        ):

            upcoming_goal = (
                db.query(Goal)
                .order_by(Goal.deadline.asc())
                .first()
            )

            if not upcoming_goal:
                return "🎉 You don't have any goals yet."

            pending_for_goal = (
                db.query(Task)
                .filter(
                    Task.goal_id == upcoming_goal.id,
                    Task.completed == False
                )
                .count()
            )

            return (
                "⚠️ Upcoming Goal\n\n"
                f"📚 Goal: {upcoming_goal.title}\n"
                f"⭐ Priority: {upcoming_goal.priority}\n"
                f"📅 Deadline: {upcoming_goal.deadline}\n"
                f"📋 Pending Tasks: {pending_for_goal}"
            )
            
        # ==========================
        # Overdue Goals
        # ==========================
            
        if (
            "overdue" in message
            or "missed deadline" in message
            or "overdue goals" in message
        ):

            today = date.today()

            overdue_goals = (
                db.query(Goal)
                .filter(Goal.deadline < today)
                .order_by(Goal.deadline.asc())
                .all()
            )

            if not overdue_goals:
                return "🎉 Great news! You don't have any overdue goals."

            reply = "🚨 Overdue Goals\n\n"

            for goal in overdue_goals:
                pending = (
                    db.query(Task)
                    .filter(
                        Task.goal_id == goal.id,
                        Task.completed == False
                    )
                    .count()
                )

                reply += (
                    f"📚 {goal.title}\n"
                    f"📅 Deadline: {goal.deadline}\n"
                    f"📋 Pending Tasks: {pending}\n\n"
                )

            reply += "⚠️ Try to prioritize these goals."

            return reply
        
        # ==========================
        # Days Left for Next Goal   
        # ==========================
        if (
            "days left" in message
            or "days remaining" in message
            or "time left" in message
            or "how many days" in message
        ):

            today = date.today()

            next_goal = (
                db.query(Goal)
                .filter(Goal.deadline >= today)
                .order_by(Goal.deadline.asc())
                .first()
            )

            if not next_goal:
                return "🎉 You don't have any upcoming goals."

            days_left = (next_goal.deadline - today).days

            if days_left == 0:
                status = "🚨 Deadline is today!"
            elif days_left == 1:
                status = "⚠️ Only 1 day remaining!"
            elif days_left <= 7:
                status = f"⚠️ Only {days_left} days remaining!"
            else:
                status = f"📅 {days_left} days remaining."

            return (
                "⏳ Time Remaining\n\n"
                f"📚 Goal: {next_goal.title}\n"
                f"📅 Deadline: {next_goal.deadline}\n\n"
                f"{status}"
            )
            
        # ==========================
        # Study Plan
        # ==========================
       
        if (
            "study plan" in message
            or "plan my study" in message
            or "plan for today" in message
            or "what should i do today" in message
        ):

            study_tasks = (
                db.query(Task)
                .filter(Task.completed == False)
                .order_by(Task.id.asc())
                .limit(5)
                .all()
            )

            if not study_tasks:
                return (
                    "🎉 Great job!\n\n"
                    "You don't have any pending tasks for today."
                )

            reply = "📅 Today's Study Plan\n\n"

            for i, task in enumerate(study_tasks, start=1):

                reply += f"{i}. 📖 {task.title}\n"

                if task.goal:
                    reply += (
                        f"   🎯 Goal: {task.goal.title}\n"
                        f"   ⭐ Priority: {task.goal.priority}\n"
                        f"   📅 Deadline: {task.goal.deadline}\n"
                    )

                reply += "\n"

            reply += (
                "🎯 Focus on completing these tasks first before starting anything new.\n\n"
                "You've got this! 💪"
            )

            return reply
        
        # --------------------- Weekly Study Summary ---------------------
        if (
            "weekly study" in message
            or "study summary" in message
            or "study report" in message
            or "this week" in message
        ):

            from datetime import timedelta

            today = date.today()
            week_start = today - timedelta(days=6)

            sessions = (
                db.query(StudySession)
                .filter(StudySession.study_date >= week_start)
                .all()
            )

            if not sessions:
                return (
                    "📅 Weekly Study Summary\n\n"
                    "You haven't recorded any study sessions this week."
                )

            total_sessions = len(sessions)
            total_hours = sum(session.duration_hours for session in sessions)
            completed_sessions = sum(
                1 for session in sessions if session.completed
            )

            reply = (
                "📅 Weekly Study Summary\n\n"
                f"📚 Study Sessions: {total_sessions}\n"
                f"⏱️ Total Hours Studied: {total_hours} hours\n"
                f"✅ Completed Sessions: {completed_sessions}\n\n"
            )

            if total_hours >= 20:
                reply += "🌟 Outstanding dedication! Keep up the amazing work!"
            elif total_hours >= 10:
                reply += "👏 Great job! You're maintaining a consistent study routine."
            elif total_hours >= 5:
                reply += "👍 Nice progress. Try to add a few more study hours this week."
            else:
                reply += "💪 Every hour counts. Let's aim for a little more study time this week."

            return reply
        


        # ==========================
        # Goals
        # ==========================
        if "goal" in message:

            reply = f"You currently have {goal_count} goal(s).\n\n"

            if goal_count > 0:

                reply += "Your goals are:\n"

                for index, goal in enumerate(goals, start=1):
                    reply += f"{index}. {goal.title}\n"

            return reply

        # ==========================
        # Greeting
        # ==========================
        if "hello" in message or "hi" in message:

            return (
                f"Hello! 👋 You currently have {pending_count} pending task(s).\n\n"
                "How can I help you today?"
            )

        # ==========================
        # Motivation
        # ==========================
        if (
            "motivate" in message
            or "motivation" in message
            or "encourage" in message
        ):

            return (
                "🌟 Remember why you started.\n\n"
                "Every study session brings you one step closer to your goal.\n"
                "Don't aim for perfection—aim for consistency.\n"
                "Even studying for 20 minutes today is better than skipping the day.\n\n"
                "You've got this! 💪"
            )
            
        if "tired" in message:

            return (
                "😌 It's okay to feel tired.\n\n"
                "Take a short 10–15 minute break, drink some water, "
                "stretch a little, and come back refreshed.\n\n"
                "Remember, consistency is more important than studying for long hours."
            )
            
        if "stress" in message or "stressed" in message:

            return (
                "💙 Don't worry. You don't have to finish everything today.\n\n"
                "Focus on completing just one task at a time.\n"
                "Small progress every day leads to big achievements."
            )
            
        if (
            "procrastinating" in message
            or "procrastinate" in message
        ):

            return (
                "🚀 The hardest part is getting started.\n\n"
                "Commit to studying for just 5 minutes.\n"
                "Once you begin, you'll usually find it much easier to continue."
            )
            
        if (
            "can't focus" in message
            or "cannot focus" in message
            or "focus" in message
        ):

            return (
                "🎯 Try the Pomodoro Technique:\n\n"
                "• Study for 25 minutes\n"
                "• Take a 5-minute break\n"
                "• Repeat 4 times\n\n"
                "This helps improve concentration and prevents burnout."
            )
            
        if (
            "study tip" in message
            or "tips" in message
            or "study tips" in message
        ):

            return (
                "📖 Study Tip:\n\n"
                "Review what you've learned within 24 hours.\n"
                "Regular revision strengthens long-term memory and helps you retain concepts better."
            )

        # ==========================
        # Default Response
        # ==========================
        return (
            "🤖 I'm your AI Productivity Coach.\n\n"
            "You can ask me things like:\n\n"
            "• What should I study today?\n"
            "• Show my pending tasks\n"
            "• Show my goals\n"
            "• Motivate me\n"
            "• Hello"
        )

    def generate_gemini_reply(self, message: str, db: Session) -> str:
        """Generate a focused Gemini response using relevant user data."""

        # ==========================================
        # 1. GET GOALS
        # ==========================================

        goals = db.query(Goal).all()

        priority_score = {
            "high": 3,
            "medium": 2,
            "low": 1
        }

        # Ignore completed/finished goals when possible
        active_goals = [
            goal for goal in goals
            if not goal.status
            or goal.status.lower() not in ["completed", "complete"]
        ]

        # Put high-priority and soonest-deadline goals first
        active_goals.sort(
            key=lambda goal: (
                -priority_score.get(
                    (goal.priority or "").strip().lower(),
                    0
                ),
                goal.deadline or date.max
            )
        )

        # Keep only the most relevant goals
        relevant_goals = active_goals[:8]

        goal_data = []

        for goal in relevant_goals:

            total_tasks = (
                db.query(Task)
                .filter(Task.goal_id == goal.id)
                .count()
            )

            completed_goal_tasks = (
                db.query(Task)
                .filter(
                    Task.goal_id == goal.id,
                    Task.completed == True
                )
                .count()
            )

            if total_tasks > 0:
                progress = int(
                    (completed_goal_tasks / total_tasks) * 100
                )
            else:
                progress = 0

            goal_data.append(
                f"Goal: {goal.title}\n"
                f"Priority: {goal.priority}\n"
                f"Deadline: {goal.deadline}\n"
                f"Status: {goal.status}\n"
                f"Progress: {progress}%"
            )

        # ==========================================
        # 2. GET PENDING TASKS
        # ==========================================

        pending_tasks = (
            db.query(Task)
            .filter(Task.completed == False)
            .all()
        )

        # Sort tasks according to their goal priority
        pending_tasks.sort(
            key=lambda task: -priority_score.get(
                (
                    task.goal.priority
                    if task.goal and task.goal.priority
                    else ""
                ).strip().lower(),
                0
            )
        )

        # Only send the most relevant pending tasks
        relevant_tasks = pending_tasks[:12]

        task_data = []

        for task in relevant_tasks:

            goal_name = (
                task.goal.title
                if task.goal
                else "No goal assigned"
            )

            task_data.append(
                f"Task: {task.title}\n"
                f"Goal: {goal_name}\n"
                f"Estimated Hours: {task.estimated_hours}"
            )

        # ==========================================
        # 3. GET RECENT STUDY SESSIONS
        # ==========================================

        recent_sessions = (
            db.query(StudySession)
            .order_by(
                StudySession.study_date.desc()
            )
            .limit(10)
            .all()
        )

        session_data = []

        for session in recent_sessions:

            goal_name = (
                session.goal.title
                if session.goal
                else "Unknown goal"
            )

            session_data.append(
                f"Date: {session.study_date}\n"
                f"Goal: {goal_name}\n"
                f"Duration: {session.duration_hours} hours\n"
                f"Completed: {session.completed}"
            )

        # ==========================================
        # 4. OVERALL SUMMARY
        # ==========================================

        total_tasks = db.query(Task).count()

        completed_tasks = (
            db.query(Task)
            .filter(Task.completed == True)
            .count()
        )

        pending_count = (
            db.query(Task)
            .filter(Task.completed == False)
            .count()
        )

        # ==========================================
        # 5. SEND FOCUSED CONTEXT TO GEMINI
        # ==========================================

        return generate_coach_reply(
            message,
            "\n\n".join(goal_data)
            if goal_data
            else "No active goals available.",

            "\n\n".join(task_data)
            if task_data
            else "No pending tasks available.",

            (
                f"Overall task summary:\n"
                f"Total tasks: {total_tasks}\n"
                f"Completed tasks: {completed_tasks}\n"
                f"Pending tasks: {pending_count}\n\n"
                f"Recent study sessions:\n"
                +
                (
                    "\n\n".join(session_data)
                    if session_data
                    else "No study sessions available."
                )
            )
        )