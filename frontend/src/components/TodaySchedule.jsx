function TodaySchedule({ sessions }) {

    return (

        <div className="bg-white rounded-lg shadow p-6 mb-6">

            <h2 className="text-2xl font-bold mb-4">
                📅 Today's Study Schedule
            </h2>

            {sessions.length > 0 ? (

                sessions.map((session) => (

                    <div
                        key={session.id}
                        className="border rounded-lg p-4 mb-3"
                    >

                        <h3 className="font-semibold text-lg">
                            📚 {session.task.title}
                        </h3>

                        <p className="mt-2">
                            ⏱ Duration: {session.duration_hours} Hours
                        </p>

                        <p>
                            {session.completed
                                ? "✅ Completed"
                                : "⏳ Pending"}
                        </p>

                    </div>

                ))

            ) : (

                <p className="text-gray-500">
                    No study sessions scheduled for today.
                </p>

            )}

        </div>

    );

}

export default TodaySchedule;