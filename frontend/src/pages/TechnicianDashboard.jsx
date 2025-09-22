import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTechnicianLabTests } from '../api';
import CountUp from "react-countup";

// A new, vertical Stat Card component for this design
const VerticalStatCard = ({ value, label, currency = '', icon }) => (
    <div className="bg-secondary-dark p-6 rounded-lg text-center flex items-center gap-4">
        <div className="text-4xl text-teal-400">{icon}</div>
        <div>
            <p className="text-2xl font-bold text-white text-left">{currency}{typeof value === 'number' ? <CountUp end={value} duration={2.5} decimals={value % 1 !== 0 ? 1 : 0} /> : value}</p>
            <p className="text-secondary-text text-left">{label}</p>
        </div>
    </div>
);

const TechnicianDashboard = () => {
    const { user } = useAuth();
    const [labTests, setLabTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLabTests = async () => {
            try {
                const { data } = await getTechnicianLabTests();
                setLabTests(data.data);
            } catch (error) {
                console.error('Error fetching lab tests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLabTests();
    }, []);

    const today = new Date().toISOString().split('T')[0];
    const todaysCollections = labTests.filter(test => test.collectionDate === today && test.status !== 'Completed');
    const upcomingCollections = labTests.filter(test => test.collectionDate > today && test.status !== 'Completed');
    const completedCollections = labTests.filter(test => test.status === 'Completed');

    return (
        <div className="bg-primary-dark">
            {/* --- Technician Dashboard Header --- */}
            <div className="relative bg-[url('/nurse-dashboard-header.jpg')] bg-cover bg-center h-60">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-start p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-white">Technician Dashboard</h1>
                    </div>
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
                                <VerticalStatCard value={todaysCollections.length} label="Today's Collections" icon="🧪" />
                                <VerticalStatCard value={upcomingCollections.length} label="Upcoming Collections" icon="🗓️" />
                                <VerticalStatCard value={completedCollections.length} label="Completed Collections" icon="✅" />
                                <VerticalStatCard value={user?.averageRating?.toFixed(1) || 4.9} label="Average Rating" icon="⭐" />
                            </div>
                        </div>

                        {/* Quick Links Section */}
                        <div className="bg-secondary-dark p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Link to="/technician/schedule" className="block w-full text-center bg-teal-600 text-white p-3 rounded font-bold hover:bg-teal-700 transition">
                                    Manage Schedule
                                </Link>
                                <Link to="/technician/profile" className="block w-full text-center bg-gray-700 text-white p-3 rounded font-bold hover:bg-gray-600 transition">
                                    Edit My Profile
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* --- Right Column: Collections --- */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Today's Collections */}
                        <div className="bg-secondary-dark p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-white mb-4">Today's Collections</h2>
                            {todaysCollections.length > 0 ? (
                                <div className="space-y-4">
                                    {todaysCollections.map(test => (
                                        <div key={test._id} className="bg-gray-800 p-4 rounded-lg">
                                            <h3 className="text-white font-semibold">{test.testName}</h3>
                                            <p className="text-secondary-text">Patient: {test.patient.name}</p>
                                            <p className="text-secondary-text">Time: {test.collectionTime}</p>
                                            <p className="text-secondary-text">Address: {test.patientAddress}</p>
                                            <p className="text-secondary-text">Status: {test.status}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-secondary-text py-10 border-2 border-dashed border-gray-700 rounded-lg">
                                    <p className="text-lg">No collections scheduled for today.</p>
                                </div>
                            )}
                        </div>

                        {/* Upcoming Collections */}
                        <div className="bg-secondary-dark p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-white mb-4">Upcoming Collections</h2>
                            {upcomingCollections.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingCollections.slice(0, 5).map(test => (
                                        <div key={test._id} className="bg-gray-800 p-4 rounded-lg">
                                            <h3 className="text-white font-semibold">{test.testName}</h3>
                                            <p className="text-secondary-text">Patient: {test.patient.name}</p>
                                            <p className="text-secondary-text">Date: {test.collectionDate}</p>
                                            <p className="text-secondary-text">Time: {test.collectionTime}</p>
                                            <p className="text-secondary-text">Address: {test.patientAddress}</p>
                                            <p className="text-secondary-text">Status: {test.status}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-secondary-text py-10 border-2 border-dashed border-gray-700 rounded-lg">
                                    <p className="text-lg">No upcoming collections.</p>
                                </div>
                            )}
                        </div>

                        {/* Completed Collections */}
                        <div className="bg-secondary-dark p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-white mb-4">Recent Completed Collections</h2>
                            {completedCollections.length > 0 ? (
                                <div className="space-y-4">
                                    {completedCollections.slice(0, 5).map(test => (
                                        <div key={test._id} className="bg-gray-800 p-4 rounded-lg">
                                            <h3 className="text-white font-semibold">{test.testName}</h3>
                                            <p className="text-secondary-text">Patient: {test.patient.name}</p>
                                            <p className="text-secondary-text">Date: {test.collectionDate}</p>
                                            <p className="text-secondary-text">Status: {test.status}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-secondary-text py-10 border-2 border-dashed border-gray-700 rounded-lg">
                                    <p className="text-lg">No completed collections yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechnicianDashboard;