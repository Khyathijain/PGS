function DashboardStats({ stats }) {

    return (

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

            <div className="bg-blue-500 text-white rounded-lg p-4 shadow">

                <h3 className="text-lg font-semibold">
                    🎯 Goals
                </h3>

                <p className="text-3xl font-bold mt-2">
                    {stats.total_goals}
                </p>

            </div>

            <div className="bg-green-500 text-white rounded-lg p-4 shadow">

                <h3 className="text-lg font-semibold">
                    ✅ Completed Tasks
                </h3>

                <p className="text-3xl font-bold mt-2">
                    {stats.completed_tasks}
                </p>

            </div>

            <div className="bg-purple-500 text-white rounded-lg p-4 shadow">

                <h3 className="text-lg font-semibold">
                    📅 Today's Sessions
                </h3>

                <p className="text-3xl font-bold mt-2">
                    {stats.today_sessions}
                </p>

            </div>

            <div className="bg-orange-500 text-white rounded-lg p-4 shadow">

                <h3 className="text-lg font-semibold">
                    📈 Completion
                </h3>

                <p className="text-3xl font-bold mt-2">
                    {stats.completion_rate}%
                </p>

            </div>

        </div>

    );

}

export default DashboardStats;