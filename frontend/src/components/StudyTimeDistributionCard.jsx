import { useEffect, useState } from "react";
import api from "../services/api";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from "recharts";

function StudyTimeDistributionCard() {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#06B6D4"
    ];

    useEffect(() => {

        const fetchDistribution = async () => {

            try {

                const response = await api.get(
                    "/dashboard/study-time-distribution"
                );

                console.log("Study Time Distribution:", response.data);

                setData(response.data);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        };

        fetchDistribution();

    }, []);

    return (
        <div className="bg-white rounded-xl shadow p-5">

            <h2 className="text-lg font-semibold mb-4">
                Study Time Distribution
            </h2>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>

                        <Pie
                            data={data}
                            dataKey="hours"
                            nameKey="goal"
                            innerRadius={60}
                            outerRadius={100}
                            label={({ percent }) =>
                                `${(percent * 100).toFixed(0)}%`
                            }
                            isAnimationActive={true}
                            animationDuration={1000}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={
                                        COLORS[index % COLORS.length]
                                    }
                                />
                            ))}
                        </Pie>

                        <Tooltip
                            formatter={(value) => [`${value} Hours`, "Study Time"]}
                        />

                        <Legend />

                    </PieChart>
                </ResponsiveContainer>
            )}

        </div>
    );
}

export default StudyTimeDistributionCard;