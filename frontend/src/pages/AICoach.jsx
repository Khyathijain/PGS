import { useState } from "react";
import api from "../services/api";

function AICoach() {

    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: "👋 Hello! I'm your AI Productivity Coach. Ask me anything about your goals, tasks, or study schedule."
        }
    ]);

    const [input, setInput] = useState("");

    // Suggested questions shown in the sidebar
    const suggestions = [
        "What should I study today?",
        "Show pending tasks",
        "Task statistics",
        "Goal progress",
        "Study streak",
        "Which goals are due soon?",
        "Estimated time remaining",
        "Motivate me"
    ];

    const sendMessage = async (text = input) => {

        if (!text.trim()) return;

        const userMessage = text;

        // Show user's message immediately
        setMessages(prev => [
            ...prev,
            {
                sender: "user",
                text: userMessage
            }
        ]);

        setInput("");

        try {

            const response = await api.post("/ai-coach/gemini-chat", {
                message: userMessage
            });

            setMessages(prev => [
                ...prev,
                {
                    sender: "ai",
                    text: response.data.reply
                }
            ]);

        } catch (error) {

            setMessages(prev => [
                ...prev,
                {
                    sender: "ai",
                    text: "❌ Unable to connect to the AI Coach."
                }
            ]);

            console.error(error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">

            <h1 className="text-3xl font-bold mb-6">
                🤖 AI Productivity Coach
            </h1>

            <div className="flex gap-5 h-[600px]">

                {/* ================= SIDEBAR ================= */}

                <div className="w-64 bg-white rounded-xl shadow p-4">

                    <h2 className="text-lg font-semibold mb-2">
                        💡 Try asking
                    </h2>

                    <p className="text-sm text-gray-500 mb-4">
                        Choose a question to get started
                    </p>

                    <div className="space-y-2">

                        {suggestions.map((question, index) => (

                            <button
                                key={index}
                                onClick={() => sendMessage(question)}
                                className="w-full text-left text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 rounded-lg px-3 py-2 transition"
                            >
                                {question}
                            </button>

                        ))}

                    </div>

                </div>


                {/* ================= CHAT ================= */}

                <div className="bg-white rounded-xl shadow flex-1 flex flex-col">

                    {/* Chat Messages */}

                    <div className="flex-1 overflow-y-auto p-5 space-y-4">

                        {messages.map((message, index) => (

                            <div
                                key={index}
                                className={`flex ${
                                    message.sender === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >

                                <div
                                    className={`max-w-[75%] rounded-lg px-4 py-3 ${
                                        message.sender === "user"
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >

                                    <p style={{ whiteSpace: "pre-wrap" }}>
                                        {message.text}
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>


                    {/* Input Area */}

                    <div className="border-t p-4 flex gap-3">

                        <input
                            type="text"
                            placeholder="Ask your AI coach..."
                            className="flex-1 border rounded-lg p-3"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    sendMessage();
                                }
                            }}
                        />

                        <button
                            onClick={() => sendMessage()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg"
                        >
                            Send
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default AICoach;