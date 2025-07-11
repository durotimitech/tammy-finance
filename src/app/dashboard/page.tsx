"use client";

export default function DashboardPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white">
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">Dashboard</h1>
            <p className="text-gray-600 text-center">Welcome to your dashboard! This is a protected area for logged-in users.</p>
        </div>
    );
} 