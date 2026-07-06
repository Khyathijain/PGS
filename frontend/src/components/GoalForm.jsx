function GoalForm({
    title,
    setTitle,
    description,
    setDescription,
    deadline,
    setDeadline,
    priority,
    setPriority,
    dailyHours,
    setDailyHours,
    editingGoalId,
    handleCreateGoal
}) {

    return (

        <>

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

        </>

    );

}

export default GoalForm;