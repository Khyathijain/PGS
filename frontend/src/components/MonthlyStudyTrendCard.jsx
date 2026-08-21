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

function MonthlyStudyTrendCard() {
    const [trend, setTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrend = async () => {
            try {
                const response = await api.get("/dashboard/monthly-study-trend");

                console.log("Monthly Study Trend:", response.data);

                setTrend(response.data);
            } catch (error) {
                console.error("Monthly Study Trend Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrend();
    }, []);

    return (
        <div className="bg-white rounded-xl shadow p-5">
            <h2 className="text-lg font-semibold mb-4">
                Monthly Study Trend
            </h2>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trend}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="month" />

                        <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />

                        <Tooltip formatter={(value) => [`${value} Hours`, "Study Time"]} />

                        <Bar
                            dataKey="hours"
                            fill="#3B82F6"
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
export default MonthlyStudyTrendCard;