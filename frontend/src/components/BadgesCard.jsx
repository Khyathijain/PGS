function BadgesCard({ badges }) {
    if (!badges) return null;

    return (
        <div className="bg-white shadow-md rounded-lg p-5">
            <h2 className="text-xl font-bold mb-4">
                🏅 Badges
            </h2>

            <div className="space-y-3">
                {badges.map((badge, index) => (
                    <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                            badge.earned
                                ? "bg-green-50 border-green-300"
                                : "bg-gray-100 border-gray-300 opacity-60"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">
                                {badge.icon}
                            </span>

                            <span className="font-medium">
                                {badge.name}
                            </span>
                        </div>

                        <span className="font-semibold">
                            {badge.earned ? "✅ Earned" : "🔒 Locked"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BadgesCard;