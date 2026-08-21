function GamificationCard({ gamification }) {
    if (!gamification) return null;

    const xp = gamification.xp;
    const level = gamification.level;
    const streak = gamification.streak;

    const currentLevelXP = (level - 1) * 100;
    const nextLevelXP = level * 100;

    const progress =
        ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    return (
        <div className="bg-white shadow-lg rounded-xl p-6">

            <h2 className="text-2xl font-bold mb-6">
                🏆 Gamification
            </h2>

            <div className="grid grid-cols-3 gap-4 text-center mb-6">

                <div className="bg-yellow-100 rounded-lg p-4">
                    <div className="text-3xl">⭐</div>
                    <p className="font-bold text-lg">{xp}</p>
                    <p className="text-sm">XP</p>
                </div>

                <div className="bg-blue-100 rounded-lg p-4">
                    <div className="text-3xl">🏅</div>
                    <p className="font-bold text-lg">{level}</p>
                    <p className="text-sm">Level</p>
                </div>

                <div className="bg-red-100 rounded-lg p-4">
                    <div className="text-3xl">🔥</div>
                    <p className="font-bold text-lg">{streak}</p>
                    <p className="text-sm">Days</p>
                </div>

            </div>

            <div>

                <div className="flex justify-between mb-2">
                    <span className="font-medium">
                        XP Progress
                    </span>

                    <span>
                        {xp} / {nextLevelXP}
                    </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4">

                    <div
                        className="bg-green-500 h-4 rounded-full"
                        style={{ width: `${progress}%` }}
                    ></div>

                </div>

                <p className="text-sm text-gray-600 mt-2">
                    {nextLevelXP - xp} XP to reach Level {level + 1}
                </p>

            </div>

        </div>
    );
}

export default GamificationCard;