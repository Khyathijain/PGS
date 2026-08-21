import { useEffect, useState } from "react";
import api from "../services/api";

function FocusMode() {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState("");
    const [duration, setDuration] = useState(25);

    const [timeLeft, setTimeLeft] = useState(0);
    const [sessionId, setSessionId] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isTabActive, setIsTabActive] = useState(true);
    const [hasDistraction, setHasDistraction] = useState(false);
    const [distractionCount, setDistractionCount] = useState(0);
    const [isRestricted, setIsRestricted] = useState(false);
    const [statistics, setStatistics] = useState(null);
    const [distractionStats, setDistractionStats] = useState(null);
    const [efficiency, setEfficiency] = useState(null);
    const [sessionHistory, setSessionHistory] = useState([]);

    // Load pending tasks
    useEffect(() => {
        const loadTasks = async () => {
            try {
                const response = await api.get("/tasks/all");

                const pendingTasks = response.data.filter(
                    task => !task.completed
                );

                setTasks(pendingTasks);

                if (pendingTasks.length > 0) {
                    setSelectedTask(pendingTasks[0].id);
                }

            } catch (error) {
                console.error("Unable to load tasks:", error);
            }
        };

        loadTasks();
    }, []);

    //focus statistics
    useEffect(() => {
        const loadStatistics = async () => {
            try {
                const response = await api.get("/focus/statistics");
                setStatistics(response.data);
            } catch (error) {
                console.error("Unable to load focus statistics:", error);
            }
        };

        loadStatistics();
    }, []);

    // Distraction statistics
    useEffect(() => {
        const loadDistractionStats = async () => {
            try {
                const response = await api.get(
                    "/focus/distraction-statistics"
                );

                setDistractionStats(response.data);

            } catch (error) {
                console.error(
                    "Unable to load distraction statistics:",
                    error
                );
            }
        };

        loadDistractionStats();

    }, []);

    //focus efficiency
    useEffect(() => {
        const loadEfficiency = async () => {
            try {
                const response = await api.get("/focus/efficiency");
                setEfficiency(response.data);
            } catch (error) {
                console.error(
                    "Unable to load focus efficiency:",
                    error
                );
            }
        };

        loadEfficiency();
    }, []);

    // Load session history
    useEffect(() => {
        const loadSessionHistory = async () => {
            try {
                const response = await api.get("/focus/history");
                setSessionHistory(response.data);
            } catch (error) {
                console.error(
                    "Unable to load session history:",
                    error
                );
            }
        };

        loadSessionHistory();
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!isRunning || timeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(previous => previous - 1);
        }, 1000);

        return () => clearInterval(timer);

    }, [isRunning, timeLeft]);

    // Monitor whether the Focus Mode browser tab is active
    // Monitor browser tab activity
    useEffect(() => {
        if (!isRunning) {
            return;
        }

        const handleVisibilityChange = async () => {

            if (document.visibilityState === "hidden") {

                setIsTabActive(false);
                setHasDistraction(true);
                setDistractionCount(previous => {
                    const newCount = previous + 1;

                    if (newCount >= 3) {
                        setIsRestricted(true);
                    }

                    return newCount;
                });

                console.log("⚠️ Distraction detected");

                if (sessionId) {
                    try {
                        await api.post(
                            `/focus/${sessionId}/distraction`
                        );

                        console.log("✅ Distraction recorded");
                    } catch (error) {
                        console.error(
                            "❌ Failed to record distraction:",
                            error
                        );
                    }
                }
            }
            else {

                setIsTabActive(true);

                console.log("Focus tab active");
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };

    }, [isRunning]);

    const startFocus = async () => {
        if (!selectedTask) {
            alert("Please select a task.");
            return;
        }

        try {
            const response = await api.post("/focus/start", {
                task_id: Number(selectedTask),
                duration_minutes: Number(duration)
            });

            setSessionId(response.data.session_id);
            setTimeLeft(Number(duration) * 60);
            setIsTabActive(true);
            setHasDistraction(false);
            setDistractionCount(0);
            setIsRestricted(false); 
            setIsRunning(true);
        } catch (error) {
            console.error("Unable to start focus session:", error);
            alert("❌ Unable to start focus session.");
        }
    };

    const endFocus = () => {
        setIsRunning(false);
        setTimeLeft(0);
        setSessionId(null);
        setIsTabActive(true);
        setHasDistraction(false);
        setDistractionCount(0);
        setIsRestricted(false);
    };



    // Detect timer completion
    useEffect(() => {
        if (isRunning && timeLeft === 0) {
            setIsRunning(false);
            alert("🎉 Focus session completed!");
        }
    }, [timeLeft, isRunning]);


    const formatTime = (seconds) => {

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    return (
        <div className="max-w-3xl mx-auto p-6">

            <h1 className="text-3xl font-bold mb-6">
                🎯 Focus Mode
            </h1>

            <div className="bg-white rounded-xl shadow p-6">

                {!isRunning ? (

                    <>
                        <h2 className="text-xl font-semibold mb-4">
                            Start a Focus Session
                        </h2>

                        {/* Task selection */}

                        <label className="block mb-2 font-medium">
                            Select Task
                        </label>

                        <select
                            value={selectedTask}
                            onChange={(e) =>
                                setSelectedTask(e.target.value)
                            }
                            className="w-full border rounded-lg p-3 mb-5"
                        >

                            <option value="">
                                Select a task
                            </option>

                            {tasks.map(task => (
                                <option
                                    key={task.id}
                                    value={task.id}
                                >
                                    {task.title}
                                </option>
                            ))}

                        </select>

                        {/* Duration */}

                        <label className="block mb-2 font-medium">
                            Session Duration
                        </label>

                        <select
                            value={duration}
                            onChange={(e) =>
                                setDuration(e.target.value)
                            }
                            className="w-full border rounded-lg p-3 mb-6"
                        >

                            <option value={15}>
                                15 minutes
                            </option>

                            <option value={25}>
                                25 minutes
                            </option>

                            <option value={45}>
                                45 minutes
                            </option>

                            <option value={60}>
                                60 minutes
                            </option>

                            <option value={90}>
                                90 minutes
                            </option>

                        </select>

                        <button
                            onClick={startFocus}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                        >
                            ▶️ Start Focus
                        </button>

                    </>

                ) : (

                    <>
                        <div className="text-center">
                            {isRestricted && (
                                <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg mb-6">

                                    <h2 className="text-2xl font-bold mb-3">
                                        🚫 Focus Restriction Activated
                                    </h2>

                                    <p className="mb-2">
                                        You have left Focus Mode 3 times.
                                    </p>

                                    <p className="text-sm">
                                        Please return to your focus session and avoid switching
                                        away from Focus Mode.
                                    </p>

                                </div>
                            )}

                            <h2 className="text-xl font-semibold mb-2">
                                🔥 Focus Session Active
                            </h2>

                            <p className="text-gray-600 mb-8">
                                Stay focused on your selected task.
                            </p>

                            <div className="text-7xl font-bold mb-8">
                                {formatTime(timeLeft)}
                            </div>

                            <p className="text-gray-600 mb-6">
                                Focus session #{sessionId}
                            </p>
                            {hasDistraction && (
                                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 font-bold">
                                    ⚠️ You left Focus Mode!

                                    <div className="text-sm mt-1">
                                        Distractions detected: {distractionCount}
                                    </div>

                                    {distractionCount === 1 && (
                                        <div className="text-sm mt-1">
                                            Please return to your focus session.
                                        </div>
                                    )}

                                    {distractionCount === 2 && (
                                        <div className="text-sm mt-1">
                                            ⚠️ This is your second distraction. Stay focused!
                                        </div>
                                    )}

                                    {distractionCount >= 3 && (
                                        <div className="text-sm mt-1">
                                            🚫 Multiple distractions detected. Focus restrictions may be applied.
                                        </div>
                                    )}
                                </div>
                            )}


                            <button
                                onClick={endFocus}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
                            >
                                🛑 End Focus
                            </button>

                        </div>
                    </>
                )}
            </div>

            {/* Focus Statistics */}
            {statistics && (
                <div className="bg-white rounded-xl shadow p-6 mt-6">

                    <h2 className="text-xl font-semibold mb-5">
                        📊 Focus Statistics
                    </h2>

                    <div className="grid grid-cols-2 gap-4">

                        <div className="border rounded-lg p-4">
                            <p className="text-gray-500">
                                Total Sessions
                            </p>
                            <p className="text-2xl font-bold">
                                {statistics.total_sessions}
                            </p>
                        </div>

                        <div className="border rounded-lg p-4">
                            <p className="text-gray-500">
                                Completed Sessions
                            </p>
                            <p className="text-2xl font-bold">
                                {statistics.completed_sessions}
                            </p>
                        </div>

                        <div className="border rounded-lg p-4">
                            <p className="text-gray-500">
                                Total Focus Time
                            </p>
                            <p className="text-2xl font-bold">
                                {statistics.total_focus_minutes} min
                            </p>
                        </div>

                        <div className="border rounded-lg p-4">
                            <p className="text-gray-500">
                                Average Session
                            </p>
                            <p className="text-2xl font-bold">
                                {statistics.average_session_minutes} min
                            </p>
                        </div>

                        <div className="border rounded-lg p-4 col-span-2">
                            <p className="text-gray-500">
                                Total Distractions
                            </p>
                            <p className="text-2xl font-bold">
                                {statistics.total_distractions}
                            </p>
                        </div>

                    </div>
                </div>
            )}

            {/*Distraction Statistics*/}
            {distractionStats && (
                <div className="bg-white rounded-xl shadow p-6 mt-6">

                    <h2 className="text-xl font-semibold mb-5">
                        ⚠️ Distraction Statistics
                    </h2>

                    <div className="grid grid-cols-2 gap-4">

                        <div className="border rounded-lg p-4">
                            <p className="text-gray-500">
                                Total Distractions
                            </p>

                            <p className="text-2xl font-bold">
                                {distractionStats.total_distractions}
                            </p>
                        </div>

                        <div className="border rounded-lg p-4">
                            <p className="text-gray-500">
                                Sessions With Distractions
                            </p>

                            <p className="text-2xl font-bold">
                                {distractionStats.sessions_with_distractions}
                            </p>
                        </div>

                        <div className="border rounded-lg p-4">
                            <p className="text-gray-500">
                                Average Distractions
                            </p>

                            <p className="text-2xl font-bold">
                                {distractionStats.average_distractions}
                            </p>
                        </div>

                        <div className="border rounded-lg p-4">
                            <p className="text-gray-500">
                                Highest in One Session
                            </p>

                            <p className="text-2xl font-bold">
                                {distractionStats.highest_distractions}
                            </p>
                        </div>

                    </div>

                </div>
            )}

            {/* Focus Efficiency */}
            {efficiency && (
                <div className="bg-white rounded-xl shadow p-6 mt-6">

                    <h2 className="text-xl font-semibold mb-5">
                        🎯 Focus Efficiency
                    </h2>

                    <div className="text-center">

                        <p className="text-6xl font-bold">
                            {efficiency.efficiency_score}%
                        </p>

                        <p className="text-gray-500 mt-3">
                            Your current focus efficiency
                        </p>

                        <p className="text-sm text-gray-500 mt-2">
                            Average distractions:{" "}
                            {efficiency.average_distractions}
                        </p>

                    </div>

                </div>
            )}

            {/* Session History */}
            {sessionHistory.length > 0 && (
                <div className="bg-white rounded-xl shadow p-6 mt-6">

                    <h2 className="text-xl font-semibold mb-5">
                        📜 Focus Session History
                    </h2>

                    <div className="space-y-4">

                        {sessionHistory.map((session) => (

                            <div
                                key={session.session_id}
                                className="border rounded-lg p-4"
                            >

                                <div className="flex justify-between items-start">

                                    <div>

                                        <h3 className="font-semibold text-lg">
                                            {session.task_title}
                                        </h3>

                                        <p className="text-gray-500 text-sm mt-1">
                                            Session #{session.session_id}
                                        </p>

                                    </div>

                                    <span
                                        className={
                                            session.completed
                                                ? "text-green-600 font-semibold"
                                                : "text-gray-500 font-semibold"
                                        }
                                    >
                                        {session.completed
                                            ? "✅ Completed"
                                            : "⏳ Incomplete"}
                                    </span>

                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-4">

                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            Duration
                                        </p>

                                        <p className="font-semibold">
                                            {session.duration_minutes} min
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            Distractions
                                        </p>

                                        <p className="font-semibold">
                                            {session.distraction_count}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            Started
                                        </p>

                                        <p className="font-semibold">
                                            {new Date(
                                                session.start_time
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>
            )}


        </div>
    );
}

export default FocusMode;