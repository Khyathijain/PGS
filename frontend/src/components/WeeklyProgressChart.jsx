import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function WeeklyProgressChart({ data }) {

    return (

        <div className="bg-white rounded-lg shadow p-6 mt-6">

            <h2 className="text-2xl font-bold mb-4">
                📊 Weekly Progress
            </h2>

            <ResponsiveContainer
                width="100%"
                height={300}
            >

                <BarChart data={data}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="day" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                        dataKey="completed"
                        fill="#3B82F6"
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>

    );

}

export default WeeklyProgressChart;