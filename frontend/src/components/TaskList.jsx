import { useState } from "react";

function TaskList({
    tasks,
    goalId,
    handleAddTask,
    handleToggleTask,
    handleDeleteTask
}) {
    const [taskTitle, setTaskTitle] = useState("");

    return (

        <>

            <h4 className="font-bold mt-4">
                Tasks
            </h4>

            <ul className="mt-2">

                {tasks?.length > 0 ? (

                    tasks.map((task) => (

                        <li
                            key={task.id}
                            className="flex justify-between items-center mt-2"
                        >
                            <span
                                className="cursor-pointer hover:text-blue-600"
                                onClick={() =>
                                    handleToggleTask(
                                        task.id,
                                        task.completed,
                                        goalId
                                    )
                                }
                            >
                                {task.completed ? "✅" : "⬜"} {task.title}
                            </span>

                            <button
                                onClick={() =>
                                    handleDeleteTask(
                                        task.id,
                                        goalId
                                    )
                                }
                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>

                        </li>

                    ))

                ) : (

                    <li className="text-gray-500">
                        No tasks yet.
                    </li>

                )}

            </ul>
            <input
                type="text"
                placeholder="Enter Task Title"
                className="border p-2 w-full mt-4 rounded"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
            />
            <button
                onClick={() => {

                    handleAddTask(goalId, taskTitle);

                    setTaskTitle("");

                }}
                className="bg-green-500 text-white w-full py-2 mt-3 rounded hover:bg-green-600"
            >
                Add Task
            </button>

        </>

    );

}

export default TaskList;