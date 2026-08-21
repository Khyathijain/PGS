function AchievementsCard({ achievements }) {
    if (!achievements || achievements.length === 0) return null;

    return (
        <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">
                🏆 Achievements
            </h2>

            <div className="space-y-5">
                {achievements.map((achievement, index) => (
                    <div key={index}>

                        <div className="flex justify-between mb-2">
                            <span className="font-semibold">
                                {achievement.title}
                            </span>

                            <span>
                                {achievement.current} / {achievement.target}
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                                style={{
                                    width: `${achievement.progress}%`
                                }}
                            ></div>
                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                            {achievement.progress.toFixed(0)}% Complete
                        </p>

                    </div>
                ))}
            </div>
        </div>
    );
}

export default AchievementsCard;