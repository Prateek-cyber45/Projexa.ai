"use client";
import React, { useEffect, useState } from 'react';

const MOCK_COURSES = [
    { id: 1, title: "Incident Response Fundamentals", description: "Learn the core concepts of identifying and containing network breaches.", module_count: 5, difficulty: "Beginner", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=500&q=60" },
    { id: 2, title: "Advanced SOC Playbooks", description: "Hands-on threat hunting using ELK stack and live honeypot data.", module_count: 8, difficulty: "Advanced", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=60" },
    { id: 3, title: "IoT Device Exploitation", description: "Reverse engineering embedded firmware and hardware interfaces.", module_count: 4, difficulty: "Intermediate", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=60" }
];

export default function CourseCatalog() {
    const [courses, setCourses] = useState(MOCK_COURSES);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchCatalog = async () => {
            try {
                // Attempt to fetch from the Redis-backed Academy API
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                
                const response = await fetch('http://api.academy.main.com/api/courses', { signal: controller.signal });
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data && Array.isArray(data) && data.length > 0) {
                        setCourses(data);
                    }
                }
            } catch (err) {
                // Silently fall back to mock data
                console.log('API unavailable, using mock data');
            }
        };

        fetchCatalog();
    }, []);


    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading catalog...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">CyberPlatform Academy</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Build your knowledge before entering the live range. Select a module below to begin your training.
                    </p>
                </header>

                {error && <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-xl text-center">{error}</div>}

                {/* Aesthetic Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(course => (
                        <a 
                            key={course.id} 
                            href={`/course/${course.id}`} 
                            className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                        >
                            <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                                {/* Using placeholder images to establish the visual style */}
                                <img 
                                    src={course.image} 
                                    alt={course.title} 
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 uppercase tracking-wider shadow-sm">
                                    {course.difficulty}
                                </div>
                            </div>
                            
                            <div className="p-8 flex flex-col flex-grow">
                                <h2 className="text-2xl font-bold mb-3 text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                                    {course.title}
                                </h2>
                                <p className="text-gray-500 mb-6 flex-grow leading-relaxed">
                                    {course.description}
                                </p>
                                <div className="flex items-center justify-between text-sm font-medium text-gray-400 border-t border-gray-100 pt-4">
                                    <span>{course.module_count} Modules</span>
                                    <span className="flex items-center text-blue-600 group-hover:translate-x-1 transition-transform">
                                        Start Learning <span className="ml-1">→</span>
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
                
            </div>
        </div>
    );
}

