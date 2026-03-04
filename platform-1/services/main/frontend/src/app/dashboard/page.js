"use client";
import React, { useEffect, useState } from 'react';

export default function Dashboard() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        window.location.href = '/';
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('jwt');
            
            // If no token exists, boot them back to the login screen
            if (!token) {
                window.location.href = '/';
                return;
            }

            try {
                // Fetch the live profile data from the secure /me endpoint
                const response = await fetch('http://api.main.com/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Merge live DB data with our active assignments
                    setUserData({
                        ...data,
                        team: "Delta Node 5", // Can be moved to DB later
                        active_modules: [
                            { id: "maker-lab-iot", title: "Makers Lab: IoT Device Security", domain: "labs.main.com", type: "Live Range" },
                            { id: "dsa-algo-01", title: "DSA Subject Task: Array Parsing", domain: "academy.main.com", type: "Academy" },
                            { id: "pico-ctf-01", title: "Pico CTF Practice: Web Exploitation", domain: "academy.main.com", type: "Academy" }
                        ]
                    });
                } else {
                    // Token is invalid or expired
                    localStorage.removeItem('jwt');
                    window.location.href = '/';
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading encrypted profile...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                
                {/* Header Section */}
                <header className="flex justify-between items-center border-b border-gray-700 pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-green-400">CyberPlatform Command Center</h1>
                        <p className="text-gray-400 mt-1">Operator: {userData.username} | {userData.team}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">AI Rolling Score</p>
                        <p className="text-4xl font-mono font-bold text-green-500">{userData.rolling_score}</p>
                        <button 
                            onClick={handleLogout}
                            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-medium text-sm transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column: Skill Vectors */}
                    <div className="col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Skill Vectors</h2>
                        <div className="space-y-4">
                            {Object.entries(userData.skill_vectors).map(([skill, score]) => (
                                <div key={skill}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize">{skill.replace('_', ' ')}</span>
                                        <span className="font-mono text-green-400">{score}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${score}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-6 italic">
                            * Vectors are updated in real-time by the AI Scoring Engine based on response accuracy and behavioural patterns.
                        </p>
                    </div>

                    {/* Right Column: Active Modules & Jump Links */}
                    <div className="col-span-2 space-y-6">
                        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
                            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Active Assignments</h2>
                            <div className="space-y-3">
                                {userData.active_modules.map((module) => (
                                    <div key={module.id} className="flex justify-between items-center p-4 bg-gray-900 rounded border border-gray-700 hover:border-green-500 transition-colors">
                                        <div>
                                            <h3 className="font-medium">{module.title}</h3>
                                            <span className="text-xs px-2 py-1 bg-gray-700 rounded mt-2 inline-block">
                                                {module.type}
                                            </span>
                                        </div>
                                        {/* Cross-subdomain routing utilizing the Nginx proxy */}
                                        <a 
                                            href={`http://${module.domain}/course/${module.id}`}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-medium text-sm transition-colors"
                                        >
                                            Launch
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <a href="http://academy.main.com" className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg text-center hover:bg-blue-900/50 transition-colors">
                                <h3 className="font-bold text-blue-400 mb-1">🎓 Academy LMS</h3>
                                <p className="text-sm text-gray-400">Browse video courses and quizzes.</p>
                            </a>
                            <a href="http://labs.main.com" className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-center hover:bg-red-900/50 transition-colors">
                                <h3 className="font-bold text-red-400 mb-1">🔬 Live Cyber Range</h3>
                                <p className="text-sm text-gray-400">Access isolated SOC honeypots.</p>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
