import { useEffect, useState } from "react";
import api from "../services/api";

function AIInsightsCard() {

    const [insights, setInsights] = useState([]);

    useEffect(() => {

        const fetchInsights = async () => {

            try {

                const response = await api.get("/dashboard/ai-insights");

                console.log("AI Insights:", response.data);

                setInsights(response.data);

            } catch (error) {

                console.error(error);

            }

        };

        fetchInsights();

    }, []);

    const getStyle = (type) => {

        switch (type) {

            case "success":
                return "bg-green-50 border-green-500";

            case "warning":
                return "bg-yellow-50 border-yellow-500";

            default:
                return "bg-blue-50 border-blue-500";

        }

    };

    const getIcon = (type) => {

        switch (type) {

            case "success":
                return "✅";

            case "warning":
                return "⚠️";

            default:
                return "ℹ️";

        }

    };

    return (

        <div className="bg-white rounded-xl shadow p-5">

            <h2 className="text-lg font-semibold mb-5">

                🧠 Smart Productivity Coach

            </h2>

            <div className="space-y-4">

                {insights.map((item, index) => (

                    <div
                        key={index}
                        className={`border-l-4 rounded-lg p-4 ${getStyle(item.type)}`}
                    >

                        <div className="flex items-start gap-3">

                            <span className="text-xl">

                                {getIcon(item.type)}

                            </span>

                            <p className="text-gray-700">

                                {item.message}

                            </p>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default AIInsightsCard;