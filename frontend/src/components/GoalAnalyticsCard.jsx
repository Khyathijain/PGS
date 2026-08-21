import { useEffect, useState } from "react";
import api from "../services/api";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

function GoalAnalyticsCard() {

    const [data, setData] = useState([]);

    useEffect(() => {

        const fetchGoalAnalytics = async () => {

            try {

                const response = await api.get("/dashboard/goal-progress");

                console.log("Goal Analytics:", response.data);

                setData(response.data);

            } catch (error) {

                console.error(error);

            }

        };

        fetchGoalAnalytics();

    }, []);

    return (

        <div className="bg-white rounded-xl shadow p-5">

            <h2 className="text-lg font-semibold mb-4">

                Goal Analytics

            </h2>

            <ResponsiveContainer width="100%" height={300}>

                <BarChart
                    data={data}
                    layout="vertical"
                >

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        type="number"
                        domain={[0,100]}
                    />

                    <YAxis
                        type="category"
                        dataKey="goal"
                        width={220}
                    />

                    <Tooltip
                        formatter={(value) => [`${value}%`, "Completion"]}
                    />

                    <Bar
                        dataKey="progress"
                        fill="#10B981"
                        label={{ position: "right", formatter: (v) => `${v}%` }}
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>

    );

}

export default GoalAnalyticsCard;