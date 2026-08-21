import { useEffect, useState } from "react";
import api from "../services/api";

function ProductivityHeatmapCard() {

    const [heatmap, setHeatmap] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchHeatmap = async () => {

            try {

                const response = await api.get(
                    "/dashboard/productivity-heatmap"
                );

                console.log("Heatmap:", response.data);

                setHeatmap(response.data);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        };

        fetchHeatmap();

    }, []);

    const getColor = (hours) => {

        if (hours === 0) return "#E5E7EB";
        if (hours <= 2) return "#BFDBFE";
        if (hours <= 4) return "#60A5FA";
        if (hours <= 6) return "#2563EB";
        return "#1E3A8A";

    };

    return (
        <div className="bg-white rounded-xl shadow p-5">

            <h2 className="text-lg font-semibold mb-4">
                Productivity Heatmap
            </h2>

            {loading ? (

                <p>Loading...</p>

            ) : (

                <div className="grid grid-cols-7 gap-3">

                    {heatmap.map((item) => (

                        <div
                            key={item.day}
                            className="rounded-lg p-4 text-center font-semibold"
                            style={{
                                backgroundColor: getColor(item.hours),
                                color: item.hours === 0 ? "#374151" : "#FFFFFF"
                            }}
                        >
                            <div>{item.day}</div>
                            <div>{item.hours}h</div>
                        </div>

                    ))}

                </div>

            )}

        </div>
    );

}

export default ProductivityHeatmapCard;