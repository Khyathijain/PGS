import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";

function GoalProgressChart({ data }) {

    return (

        <div className="bg-white rounded-lg shadow p-6 mt-6">

            <h2 className="text-2xl font-bold mb-4">

                🎯 Goal Progress

            </h2>

            <ResponsiveContainer
                width="100%"
                height={320}
            >

                <BarChart
                    data={data}
                    layout="vertical"
                >

                    <CartesianGrid strokeDasharray="3 3"/>

                    <XAxis
                        type="number"
                        domain={[0,100]}
                    />

                    <YAxis
                        type="category"
                        dataKey="goal"
                        width={180}
                    />

                    <Tooltip formatter={(value)=>`${value}%`} />

                    <Bar
                        dataKey="progress"
                        fill="#10B981"
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>

    );

}

export default GoalProgressChart;