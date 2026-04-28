"use client";
import React, { useState } from 'react';

export default function CourseModule({ params }) {
    // Next.js App Router passes the URL parameters automatically
    const courseId = params.id;
    const [quizAnswer, setQuizAnswer] = useState('');
    const [score, setScore] = useState(null);

    // In a production environment, you would fetch this ID from your PostgreSQL 'courses' table
    const youtubeVideoId = "bMjpzQ-xebI"; // Example YouTube ID

    const handleQuizSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Proxies through Nginx to the AI Scoring Engine
            const response = await fetch('/api/submit-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: courseId,
                    answer: quizAnswer
                })
            });
            
            const result = await response.json();
            setScore(result.final_score);
        } catch (error) {
            console.error("Failed to grade submission", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto">
                
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Incident Response Fundamentals</h1>
                
                {/* YouTube Responsive Embed */}
                <div className="aspect-video w-full mb-8 rounded-xl overflow-hidden shadow-lg bg-black border border-gray-200">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`} 
                        title="Course Video Player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                </div>

                {/* AI Graded Assessment Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-2">Knowledge Check</h3>
                    <p className="text-gray-600 mb-6">
                        Describe the first step you should take when identifying a compromised host on a segmented subnet.
                    </p>
                    
                    <form onSubmit={handleQuizSubmit}>
                        <textarea 
                            rows="5" 
                            className="w-full mb-4 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            value={quizAnswer}
                            onChange={(e) => setQuizAnswer(e.target.value)}
                            placeholder="Type your response here for AI evaluation..."
                            required
                        />
                        <button 
                            type="submit" 
                            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                        >
                            Submit for AI Grading
                        </button>
                    </form>

                    {score && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                            <div className="text-green-800">
                                <strong>AI Evaluation Complete:</strong> Your Final Score is <span className="font-mono text-lg ml-1">{score}/100</span>.
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
