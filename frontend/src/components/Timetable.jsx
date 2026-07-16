function Timetable({ timetable }) {
    console.log("Timetable prop:", timetable);

    return (

        <div className="mt-5">

            <h4 className="text-lg font-bold mb-3">
                📅 Study Timetable
            </h4>

            {timetable?.length > 0 ? (

                timetable.map((session) => (

                    <div
                        key={session.id}
                        className="border rounded p-3 mb-3 bg-white"
                    >

                        <p>
                            <strong>Date:</strong> {session.study_date}
                        </p>

                        <p>
                            <strong>Task:</strong> {session.task.title}
                        </p>

                        <p>
                            <strong>Duration:</strong> {session.duration_hours} Hours
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {session.completed ? "✅ Completed" : "⏳ Pending"}
                        </p>

                    </div>

                ))

            ) : (

                <p className="text-gray-500">
                    No timetable generated yet.
                </p>

            )}

        </div>

    );

}

export default Timetable;