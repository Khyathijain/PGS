import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import GoalForm from "../components/GoalForm";
import AIPlan from "../components/AIPlan";
import GoalCard from "../components/GoalCard";
import DashboardStats from "../components/DashboardStats";
import TodaySchedule from "../components/TodaySchedule";
import CalendarView from "../components/CalendarView";
import OverdueSessions from "../components/OverdueSessions";
import WeeklyProgressChart from "../components/WeeklyProgressChart";
import GoalProgressChart from "../components/GoalProgressChart";
import ProcrastinationCard from "../components/ProcrastinationCard";
import GamificationCard from "../components/GamificationCard";
import BadgesCard from "../components/BadgesCard";
import AchievementsCard from "../components/AchievementsCard";
import MonthlyStudyTrendCard from "../components/MonthlyStudyTrendCard";
import StudyTimeDistributionCard from "../components/StudyTimeDistributionCard";
import ProductivityHeatmapCard from "../components/ProductivityHeatmapCard";
import GoalAnalyticsCard from "../components/GoalAnalyticsCard";
import TaskAnalyticsCard from "../components/TaskAnalyticsCard";
import TimeAnalyticsCard from "../components/TimeAnalyticsCard";
import AIInsightsCard from "../components/AIInsightsCard";

function Dashboard() {

    const navigate = useNavigate();

    // Form States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [priority, setPriority] = useState("High");
    const [dailyHours, setDailyHours] = useState(2);

    // Goals State
    const [goals, setGoals] = useState([]);
    const [editingGoalId, setEditingGoalId] = useState(null);

    const [aiPlan, setAiPlan] = useState("");
    const [loadingAI, setLoadingAI] = useState(false);

    const [tasks, setTasks] = useState({});
    const [progress, setProgress] = useState({});
    const [timetable, setTimetable] = useState({});
    const [stats, setStats] = useState({});
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [allSessions, setAllSessions] = useState([]);
    const [overdueSessions, setOverdueSessions] = useState([]);
    const [weeklyProgress, setWeeklyProgress] = useState([]);
    const [goalProgress, setGoalProgress] = useState([]);
    const [procrastination, setProcrastination] = useState(null);
    const [gamification, setGamification] = useState(null);
    const [badges, setBadges] = useState([]);
    const [achievements, setAchievements] = useState([]);


    // Load goals when dashboard opens
    useEffect(() => {
        fetchGoals();
        fetchDashboardStats();
        fetchTodaySchedule();
        fetchAllSessions();
        fetchOverdueSessions();
        fetchWeeklyProgress();
        fetchGoalProgress();
        fetchProcrastination();
        fetchGamification();
        fetchBadges();
        fetchAchievements();

    }, []);

    // Fetch all goals
    const fetchGoals = async () => {

        try {

            const response = await api.get("/goals/");

            setGoals(response.data);

            response.data.forEach((goal) => {

                fetchTasks(goal.id);
                fetchProgress(goal.id);
                fetchTimetable(goal.id);

        });
        } catch (error) {

            console.log(error);

        }

    };

    const fetchTasks = async (goalId) => {

        try {

            const response = await api.get(`/tasks/${goalId}`);

            setTasks(prev => ({
                ...prev,
                [goalId]: response.data
            }));

        } catch (error) {

            console.log(error);

        }

    };

    const fetchProgress = async (goalId) => {

    try {

        const response = await api.get(
            `/goals/progress/${goalId}`
        );

        setProgress(prev => ({
            ...prev,
            [goalId]: response.data
        }));

    } catch (error) {

        console.log(error);

    }

};
    const fetchTimetable = async (goalId) => {

    try {

        const response = await api.get(`/timetable/${goalId}`);

        console.log("Goal ID:", goalId);
        console.log("Timetable Response:", response.data);

        setTimetable(prev => ({
            ...prev,
            [goalId]: response.data
        }));

    } catch (error) {

        console.log(error);

    }

};

    const fetchDashboardStats = async () => {

    try {

        const response = await api.get("/dashboard/stats");

        console.log("Dashboard Stats:", response.data);

        setStats(response.data);

    } catch (error) {

        console.log(error);

    }

};

    const fetchTodaySchedule = async () => {

    try {

        const response = await api.get("/timetable/today");

        console.log("Today's Schedule:", response.data);

        setTodaySchedule(response.data);

    } catch (error) {

        console.log(error);

    }

};

    const fetchAllSessions = async () => {

    try {

        const response = await api.get("/timetable/all");

        setAllSessions(response.data);

    } catch (error) {

        console.log(error);

    }

};

    const fetchOverdueSessions = async () => {

    try {

        const response = await api.get("/timetable/overdue");

        console.log("Overdue Sessions:", response.data);

        setOverdueSessions(response.data);

    } catch (error) {

        console.log(error);

    }

};

    const fetchWeeklyProgress = async () => {

    try {

        const response = await api.get(
            "/dashboard/weekly-progress"
        );

        console.log("Weekly Progress:", response.data);

        setWeeklyProgress(response.data);

    } catch (error) {

        console.log(error);

    }

};

    const fetchGoalProgress = async () => {

    try {

        const response = await api.get(
            "/dashboard/goal-progress"
        );

        console.log("Goal Progress:", response.data);

        setGoalProgress(response.data);

    } catch (error) {

        console.log(error);

    }

};

    const fetchProcrastination = async () => {

    try {

        const response = await api.get(
            "/dashboard/procrastination-score"
        );

        console.log("Procrastination:", response.data);

        setProcrastination(response.data);

    } catch (error) {

        console.log(error);

    }

};

    const fetchGamification = async () => {
    try {
        const response = await api.get("/dashboard/gamification");
        setGamification(response.data);
    } catch (error) {
        console.error("Error fetching gamification:", error);
    }
};

    const fetchBadges = async () => {
    try {
        const response = await api.get("/dashboard/badges");
        setBadges(response.data);
    } catch (error) {
        console.error("Error fetching badges:", error);
    }
};

    const fetchAchievements = async () => {
    try {
        const response = await api.get("/dashboard/achievements");
        setAchievements(response.data);
    } catch (error) {
        console.error("Error fetching achievements:", error);
    }
};

    const handleEdit = (goal) => {

        console.log("Edit clicked:", goal);

        setEditingGoalId(goal.id);

        setTitle(goal.title);

        setDescription(goal.description);

        setDeadline(goal.deadline);

        setPriority(goal.priority);

        setDailyHours(goal.daily_hours);

};

const handleDelete = async (goalId) => {

    try {

        await api.delete(`/goals/${goalId}`);

        alert("Goal Deleted Successfully!");

        fetchGoals();
        fetchDashboardStats();

    } catch (error) {

        console.log(error);

        alert("Failed to delete goal!");

    }

};

const handleAddTask = async (goalId, taskTitle) => {

    if (taskTitle.trim() === "") {

        alert("Please enter a task title.");

        return;

    }

    try {

        await api.post(

            `/tasks/${goalId}`,

            {
                title: taskTitle
            }

        );

        // Reload tasks for this goal
        fetchTasks(goalId);
        fetchProgress(goalId);
        fetchDashboardStats();

    } catch (error) {

        console.log(error);

        alert("Failed to add task.");

    }

};

const handleToggleTask = async (taskId, completed, goalId) => {

    try {

        await api.put(

            `/tasks/${taskId}`,

            {
                completed: !completed
            }

        );

        // Reload tasks
        fetchTasks(goalId);
        fetchProgress(goalId);
        fetchTimetable(goalId);
        fetchDashboardStats();

    } catch (error) {

        console.log(error);

        alert("Failed to update task.");

    }

};

const handleDeleteTask = async (taskId, goalId) => {

    try {

        await api.delete(`/tasks/${taskId}`);

        // Reload tasks for this goal
        fetchTasks(goalId);
        fetchProgress(goalId);
        fetchDashboardStats();

    } catch (error) {

        console.log(error);

        alert("Failed to delete task.");

    }

};
const handleGenerateAITasks = async (goalId) => {

    try {

        await api.post(`/ai/generate-tasks/${goalId}`);

        alert("AI Tasks Generated Successfully!");

        // Reload tasks for this goal
        fetchTasks(goalId);
        fetchProgress(goalId);
        fetchDashboardStats();

    } catch (error) {

        console.log(error);

        alert("Failed to generate AI tasks.");

    }

};

const handleGenerateTimetable = async (goalId) => {

    try {

        const response = await api.post(
            `/timetable/generate/${goalId}`
        );

        alert("Timetable Generated Successfully!");

        fetchTimetable(goalId);
        fetchDashboardStats();

    } catch (error) {

    console.log(error);

    console.log(error.response);

    console.log(error.response.data);

    alert(error.response?.data?.detail || "Failed to generate timetable.");

    }

};

    // Create Goal
    const handleCreateGoal = async () => {

    try {

        if (editingGoalId === null) {

            // Create New Goal
            await api.post(
                "/goals/",
                {
                    title: title,
                    description: description,
                    deadline: deadline,
                    priority: priority,
                    daily_hours: Number(dailyHours)
                }
            );

            alert("Goal Created Successfully!");

        } else {

            // Update Existing Goal
            await api.put(
                `/goals/${editingGoalId}`,
                {
                    title: title,
                    description: description,
                    deadline: deadline,
                    priority: priority,
                    daily_hours: Number(dailyHours)
                }
            );

            alert("Goal Updated Successfully!");

            // Exit edit mode
            setEditingGoalId(null);

        }

        

        // Clear Form
        setTitle("");
        setDescription("");
        setDeadline("");
        setPriority("High");
        setDailyHours(2);

        // Reload goals
        fetchGoals();
        fetchDashboardStats();

    } catch (error) {

        console.log(error);

        alert("Operation Failed!");

    }

};
    //AI Plan Generation
    const handleGenerateAIPlan = async () => {

    if (title.trim() === "") {

        alert("Please enter a goal title first!");

        return;

    }

    try {

        setLoadingAI(true);

        const response = await api.post(
            "/ai/generate-plan",
            {
                goal: title
            }
        );

        setAiPlan(response.data.plan);

    } catch (error) {

        console.log(error);

        alert("Failed to generate AI plan.");

    } finally {

        setLoadingAI(false);

    }

};
   

    // Logout
    const handleLogout = () => {

        localStorage.removeItem("token");

        navigate("/");

    };

    return (

        <div className="min-h-screen bg-blue-100 p-10">

            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">

                <h1 className="text-3xl font-bold text-center mb-6">
                    Dashboard
                </h1>
                <DashboardStats stats={stats} />
                <TodaySchedule sessions={todaySchedule} />
                <CalendarView sessions={allSessions} />
                <OverdueSessions sessions={overdueSessions} />
                <WeeklyProgressChart data={weeklyProgress} />
                <GoalProgressChart data={goalProgress} />
                <ProcrastinationCard data={procrastination} />
                <GamificationCard gamification={gamification} />
                <BadgesCard badges={badges} />
                <AchievementsCard achievements={achievements} />
                <MonthlyStudyTrendCard />
                <StudyTimeDistributionCard />
                <ProductivityHeatmapCard />
                <GoalAnalyticsCard />
                <TaskAnalyticsCard />
                <TimeAnalyticsCard />
                <AIInsightsCard />

                
                {/* Goal Form */}
                <GoalForm
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    deadline={deadline}
                    setDeadline={setDeadline}
                    priority={priority}
                    setPriority={setPriority}
                    dailyHours={dailyHours}
                    setDailyHours={setDailyHours}
                    editingGoalId={editingGoalId}
                    handleCreateGoal={handleCreateGoal}
                />

               <AIPlan
                    handleGenerateAIPlan={handleGenerateAIPlan}
                    loadingAI={loadingAI}
                    aiPlan={aiPlan}
                />

                

                <hr className="mb-6" />

                {/* Goal List */}

                <h2 className="text-2xl font-bold mb-4">
                    My Goals
                </h2>

                {goals.length === 0 ? (

                    <p className="text-gray-500">
                        No goals created yet.
                    </p>

                ) : (

                goals.map((goal) => (
                    <GoalCard
                        key={goal.id}
                        goal={goal}
                        tasks={tasks[goal.id]}
                        progress={progress[goal.id]}
                        timetable={timetable[goal.id]}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleAddTask={handleAddTask}
                        handleToggleTask={handleToggleTask}
                        handleDeleteTask={handleDeleteTask}
                        handleGenerateAITasks={handleGenerateAITasks}
                        handleGenerateTimetable={handleGenerateTimetable}   
                    />

                ))   

                )}

                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white w-full py-2 rounded hover:bg-red-600 mt-6"
                >
                    Logout
                </button>

            </div>

        </div>

    );

}

export default Dashboard;