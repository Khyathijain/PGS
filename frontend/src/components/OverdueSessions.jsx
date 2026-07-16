function OverdueSessions({ sessions }) {

    return (

        <div className="bg-red-50 border border-red-300 rounded-lg shadow p-6 mt-6">

            <h2 className="text-2xl font-bold text-red-600 mb-4">
                🔴 Overdue Study Sessions
            </h2>

            {sessions.length > 0 ? (

                sessions.map((session) => (

                    <div
                        key={session.id}
                        className="border rounded-lg p-4 mb-3 bg-white"
                    >

                        <h3 className="font-semibold">
                            📚 {session.task.title}
                        </h3>

                        <p>
                            📅 {session.study_date}
                        </p>

                        <p>
                            ⏱ {session.duration_hours} Hours
                        </p>

                    </div>

                ))

            ) : (

                <p className="text-gray-500">
                    🎉 No overdue study sessions.
                </p>

            )}

        </div>

    );

}

export default OverdueSessions;