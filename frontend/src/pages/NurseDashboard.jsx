import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// A new, vertical Stat Card component for this design
const VerticalStatCard = ({ value, label, currency = '', icon }) => (
    <div className="bg-secondary-dark p-6 rounded-lg text-center flex items-center gap-4">
        <div className="text-4xl text-teal-400">{icon}</div>
        <div>
            <p className="text-2xl font-bold text-white text-left">{currency}{value}</p>
            <p className="text-secondary-text text-left">{label}</p>
        </div>
    </div>
);

const NurseDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="bg-primary-dark">
            {/* --- Nurse Dashboard Header --- */}
            <div className="relative bg-[url('/nurse-dashboard-header.jpg')] bg-cover bg-center h-60">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-start p-8 md:p-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">Nurse Dashboard</h1>
                    <p className="text-lg text-gray-300 mt-2">Welcome back, {user?.name}!</p>
                </div>
            </div>

            <div className="container mx-auto p-4 md:p-8">
                {/* --- Main Content Grid --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- Left Column: Stats & Quick Links --- */}
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        {/* Stats Section */}
                        <div className="bg-secondary-dark p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-white mb-4">Your Stats</h2>
                            <div className="space-y-4">
                                {/* Using placeholders for icons, replace with real icons if you have them */}
                                <VerticalStatCard value="0" label="Pending Requests" icon="🔔" />
                                <VerticalStatCard value="0" label="Upcoming Assignments" icon="🗓️" />
                                <VerticalStatCard value="3200" label="Earnings This Month" currency="₹" icon="💵" />
                                <VerticalStatCard value={user?.averageRating?.toFixed(1) || '4.9'} label="Average Rating" icon="⭐" />
                            </div>
                        </div>

                        {/* Quick Links Section */}
                        <div className="bg-secondary-dark p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Link to="/nurse/appointments" className="block w-full text-center bg-teal-600 text-white p-3 rounded font-bold hover:bg-teal-700 transition">
                                    Manage Assignments
                                </Link>
                                <Link to="/nurse/availability" className="block w-full text-center bg-gray-700 text-white p-3 rounded font-bold hover:bg-gray-600 transition">
                                    Update Availability
                                </Link>
                                <Link to="/nurse/edit-profile" className="block w-full text-center bg-gray-700 text-white p-3 rounded font-bold hover:bg-gray-600 transition">
                                    Edit My Profile
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* --- Right Column: Today's Assignments --- */}
                    <div className="lg:col-span-2 bg-secondary-dark p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">Today's Assignments</h2>
                            <Link to="/nurse/appointments" className="text-teal-400 hover:underline">View All</Link>
                        </div>
                        
                        {/* Placeholder content - this is where you would map over real appointment data */}
                        <div className="text-center text-secondary-text py-20 border-2 border-dashed border-gray-700 rounded-lg">
                            <p className="text-lg">You have no assignments for today.</p>
                            <p className="mt-2">Your available slots will be visible to patients.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NurseDashboard;