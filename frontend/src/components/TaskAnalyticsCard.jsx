import { useEffect, useState } from "react";
import api from "../services/api";

function TaskAnalyticsCard() {

    const [stats, setStats] = useState(null);

    useEffect(() => {

        const fetchStats = async () => {

            try {

                const response = await api.get("/dashboard/stats");

                setStats(response.data);

            } catch (error) {

                console.error(error);

            }

        };

        fetchStats();

    }, []);

    if (!stats) return <p>Loading...</p>;

    const pendingTasks =
        stats.total_tasks - stats.completed_tasks;

    return (

        <div className="bg-white rounded-xl shadow p-5">

            <h2 className="text-lg font-semibold mb-5">
                Task Analytics
            </h2>

            <div className="grid grid-cols-2 gap-4">

                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <h3 className="text-gray-500">Total Tasks</h3>
                    <p className="text-3xl font-bold">
                        {stats.total_tasks}
                    </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <h3 className="text-gray-500">Completed</h3>
                    <p className="text-3xl font-bold">
                        {stats.completed_tasks}
                    </p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 text-center">
                    <h3 className="text-gray-500">Pending</h3>
                    <p className="text-3xl font-bold">
                        {pendingTasks}
                    </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <h3 className="text-gray-500">Completion</h3>
                    <p className="text-3xl font-bold">
                        {stats.completion_rate}%
                    </p>
                </div>

            </div>

        </div>

    );

}

export default TaskAnalyticsCard;