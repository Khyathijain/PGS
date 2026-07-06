import TaskList from "./TaskList";

function GoalCard({
    goal,
    tasks,
    progress,
    handleEdit,
    handleDelete,
    handleAddTask,
    handleToggleTask,
    handleDeleteTask,
    handleGenerateAITasks
}) {

    return (

        <div className="border rounded-lg p-4 mb-4 bg-gray-100">

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

            {/* Progress Section */}

            <div className="mt-4">

                <p className="font-semibold">
                    Progress: {progress?.progress || 0}%
                </p>

                <div className="w-full bg-gray-300 rounded-full h-4 mt-2">

                    <div
                        className="bg-green-500 h-4 rounded-full"
                        style={{
                            width: `${progress?.progress || 0}%`
                        }}
                    ></div>

                </div>

                <p className="text-sm mt-2 text-gray-700">

                    {progress?.completed_tasks || 0} / {progress?.total_tasks || 0} Tasks Completed

                </p>

            </div>

            <TaskList
                tasks={tasks}
                goalId={goal.id}
                handleAddTask={handleAddTask}
                handleToggleTask={handleToggleTask}
                handleDeleteTask={handleDeleteTask}
            />

            <div className="flex gap-3 mt-4">

                <button
                    onClick={() => handleGenerateAITasks(goal.id)}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                    🤖 Generate AI Tasks
                </button>

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

    );

}

export default GoalCard;