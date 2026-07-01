import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

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

    // Load goals when dashboard opens
    useEffect(() => {
        fetchGoals();
    }, []);

    // Fetch all goals
    const fetchGoals = async () => {

        try {

            const response = await api.get("/goals/");

            setGoals(response.data);

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

                <input
                    type="text"
                    placeholder="Goal Title"
                    className="border p-2 w-full mb-4 rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    placeholder="Goal Description"
                    className="border p-2 w-full mb-4 rounded"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <input
                    type="date"
                    className="border p-2 w-full mb-4 rounded"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />

                <select
                    className="border p-2 w-full mb-4 rounded"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>

                <input
                    type="number"
                    placeholder="Daily Hours"
                    className="border p-2 w-full mb-6 rounded"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(e.target.value)}
                />

                <button
                    onClick={handleCreateGoal}
                    className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-600 mb-6"
                >
                    {editingGoalId === null ? "Create Goal" : "Update Goal"}
                </button>

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

                        <div
                            key={goal.id}
                            className="border rounded-lg p-4 mb-4 bg-gray-100"
                        >

                            <h3 className="text-xl font-bold">
                                {goal.title}
                            </h3>

                            <p className="mt-2">
                                {goal.description}
                            </p>

                            <p className="mt-2">
                                <strong>Priority:</strong> {goal.priority}
                            </p>

                            <p>
                                <strong>Deadline:</strong> {goal.deadline}
                            </p>

                            <p>
                                <strong>Daily Hours:</strong> {goal.daily_hours}
                            </p>

                            <p>
                                <strong>Status:</strong> {goal.status}
                            </p>
                            <div className="flex gap-3 mt-3">

                            <button
                                onClick={() => handleEdit(goal)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Edit
                            </button>

                            <button
                                onClick={() => handleDelete(goal.id)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>

                        </div>

                        </div>

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