import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ value, label, currency = '' }) => (
    <div className="bg-secondary-dark p-6 rounded-xl text-center shadow-lg">
        <p className="text-4xl font-bold text-accent-blue">{currency}{value}</p>
        <p className="text-secondary-text mt-1">{label}</p>
    </div>
);

const DoctorDashboard = () => {
    const { user } = useAuth();
    const role = user?.role || 'professional'; // 'doctor' or 'nurse'

    return (
        <div className="bg-primary-dark min-h-full py-12 px-4">
            <div className="container mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                        {role.charAt(0).toUpperCase() + role.slice(1)}'s Dashboard
                    </h1>
                    <p className="text-lg text-secondary-text mt-2">Welcome, {user?.name}!</p>
                </div>

                {/* --- Stats Section --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard value="0" label={role === 'doctor' ? "Pending Requests" : "Pending Assignments"} />
                    <StatCard value="0" label="Upcoming Appointments" />
                    <StatCard value={role === 'doctor' ? "24,500" : "15,800"} label="Earnings This Month" currency="₹" />
                    <StatCard value={user?.averageRating?.toFixed(1) || 'N/A'} label="Average Rating" />
                </div>

                {/* --- Actions & Schedule --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Links */}
                    <div className="lg:col-span-1 bg-secondary-dark p-6 rounded-xl shadow-lg h-fit">
                        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link to={`/${role}/appointments`} className="block w-full text-left p-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
                                Manage Appointments
                            </Link>
                            <Link to={`/${role}/availability`} className="block w-full text-left p-4 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition">
                                Update Availability
                            </Link>
                            <Link to={`/${role}/edit-profile`} className="block w-full text-left p-4 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition">
                                Edit My Profile
                            </Link>
                        </div>
                    </div>
                    {/* Today's Appointments */}
                    <div className="lg:col-span-2 bg-secondary-dark p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-4">Today's Schedule</h2>
                        <div className="text-center text-secondary-text py-20 border-2 border-dashed border-gray-700 rounded-lg">
                            <p className="text-lg">No appointments scheduled for today.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;