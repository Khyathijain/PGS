function AIPlan({
    handleGenerateAIPlan,
    loadingAI,
    aiPlan
}) {

    return (

        <>

            <button
                onClick={handleGenerateAIPlan}
                className="bg-purple-600 text-white w-full py-2 rounded hover:bg-purple-700 mb-6"
            >
                🤖 Generate AI Plan
            </button>

            {loadingAI && (

                <p className="text-blue-600 mb-4">
                    Generating AI Study Plan...
                </p>

            )}

            {aiPlan && (

                <div className="bg-gray-100 p-4 rounded-lg mb-6">

                    <h2 className="text-xl font-bold mb-3">
                        🤖 AI Study Plan
                    </h2>

                    <pre className="whitespace-pre-wrap">
                        {aiPlan}
                    </pre>

                </div>

            )}

        </>

    );

}

export default AIPlan;