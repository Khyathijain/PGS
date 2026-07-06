import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import GoalForm from "../components/GoalForm";
import AIPlan from "../components/AIPlan";
import GoalCard from "../components/GoalCard";

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

    // Load goals when dashboard opens
    useEffect(() => {
        fetchGoals();
    }, []);

    // Fetch all goals
    const fetchGoals = async () => {

        try {

            const response = await api.get("/goals/");

            setGoals(response.data);

            response.data.forEach((goal) => {

                fetchTasks(goal.id);
                fetchProgress(goal.id);

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

    } catch (error) {

        console.log(error);

        alert("Failed to generate AI tasks.");

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
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleAddTask={handleAddTask}
                        handleToggleTask={handleToggleTask}
                        handleDeleteTask={handleDeleteTask}
                        handleGenerateAITasks={handleGenerateAITasks}
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