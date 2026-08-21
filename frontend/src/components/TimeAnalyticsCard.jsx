import { useEffect, useState } from "react";
import api from "../services/api";

function TimeAnalyticsCard() {

    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {

        const fetchAnalytics = async () => {

            try {

                const response = await api.get(
                    "/dashboard/time-analytics"
                );

                console.log("Time Analytics:", response.data);

                setAnalytics(response.data);

            } catch (error) {

                console.error(error);

            }

        };

        fetchAnalytics();

    }, []);

    if (!analytics) {

        return <p>Loading...</p>;

    }

    return (

        <div className="bg-white rounded-xl shadow p-5">

            <h2 className="text-lg font-semibold mb-5">
                Time Analytics
            </h2>

            <div className="grid grid-cols-2 gap-4">

                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <h3 className="text-gray-500">Today</h3>
                    <p className="text-3xl font-bold">
                        {analytics.today_hours} hrs
                    </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <h3 className="text-gray-500">This Week</h3>
                    <p className="text-3xl font-bold">
                        {analytics.week_hours} hrs
                    </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <h3 className="text-gray-500">This Month</h3>
                    <p className="text-3xl font-bold">
                        {analytics.month_hours} hrs
                    </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <h3 className="text-gray-500">Total Hours</h3>
                    <p className="text-3xl font-bold">
                        {analytics.total_hours} hrs
                    </p>
                </div>

            </div>

        </div>

    );

}

export default TimeAnalyticsCard;