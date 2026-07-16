function ProcrastinationCard({ data }) {

    if (!data) return null;

    const riskColor = {
        Low: "text-green-600",
        Medium: "text-yellow-600",
        High: "text-red-600"
    };

    return (

        <div className="bg-white rounded-lg shadow p-6 mt-6">

            <h2 className="text-2xl font-bold mb-4">
                🧠 Procrastination Detection
            </h2>

            <div className="mb-4">

                <h1 className="text-5xl font-bold">

                    {data.score}%

                </h1>

            </div>

            <div className="w-full bg-gray-200 rounded-full h-4">

                <div
                    className="bg-red-500 h-4 rounded-full"
                    style={{
                        width: `${data.score}%`
                    }}
                />

            </div>

            <p
                className={`mt-4 text-xl font-semibold ${riskColor[data.risk]}`}
            >
                {data.risk} Risk
            </p>

            <div className="mt-4 space-y-2">

                <p>

                    ✅ Completion Rate:
                    <strong> {data.completion_rate}%</strong>

                </p>

                <p>

                    ⚠️ Overdue Sessions:
                    <strong> {data.overdue_sessions}</strong>

                </p>

            </div>

        </div>

    );

}

export default ProcrastinationCard;