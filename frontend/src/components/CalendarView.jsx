import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState } from "react";

function CalendarView({ sessions }) {

    const [selectedDate, setSelectedDate] = useState(new Date());

    console.log("Calendar Sessions:", sessions);

    const hasSession = (date) => {

        const formattedDate = date.toISOString().split("T")[0];

        return sessions.some(
            (session) => session.study_date === formattedDate
        );

    };
    const selectedDateString = selectedDate
        .toISOString()
        .split("T")[0];

    const selectedSessions = sessions.filter(
        (session) => session.study_date === selectedDateString
    );

    return (

        <div className="bg-white rounded-lg shadow p-6 mt-6">

            <h2 className="text-2xl font-bold mb-4">
                📅 Study Calendar
            </h2>

            <Calendar
                value={selectedDate}
                onChange={setSelectedDate}
                tileContent={({ date }) =>

                    hasSession(date) ? (

                        <div className="flex justify-center">

                            <span className="text-blue-500 text-lg">
                                ●
                            </span>

                        </div>

                    ) : null

                }
            />
            <div className="mt-6">

                <h3 className="text-xl font-bold mb-3">
                    Study Sessions
                </h3>

                {selectedSessions.length > 0 ? (

                    selectedSessions.map((session) => (

                        <div
                            key={session.id}
                            className="border rounded-lg p-4 mb-3"
                        >

                            <h4 className="font-semibold">
                                📚 {session.task.title}
                            </h4>

                            <p>
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
                        No study sessions for this date.
                    </p>

                )}

            </div>

        </div>

    );

}

export default CalendarView;