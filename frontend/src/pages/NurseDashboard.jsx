import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSubscriptionStatus } from '../api';
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

const ProBenefitCard = ({ icon, title, description, isActive }) => (
    <div className={`p-4 rounded-lg border-2 ${isActive ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'}`}>
        <div className="flex items-start gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
                <h4 className={`font-semibold ${isActive ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-600 dark:text-gray-300'}`}>
                    {title}
                </h4>
                <p className={`text-sm ${isActive ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {description}
                </p>
                {isActive && (
                    <span className="inline-block mt-2 px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded-full font-medium">
                        ✓ Active
                    </span>
                )}
            </div>
        </div>
    </div>
);

const NurseDashboard = () => {
    const { user } = useAuth();
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscriptionStatus = async () => {
            try {
                if (user && ['doctor', 'nurse'].includes(user.role)) {
                    const { data } = await getSubscriptionStatus();
                    setSubscriptionStatus(data.data);
                }
            } catch (error) {
                console.error('Error fetching subscription status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptionStatus();
    }, [user]);

    // Helper function to check if subscription is active and not expired
    const isSubscriptionActive = () => {
        const hasProTier = user?.subscriptionTier === 'pro' || subscriptionStatus?.tier === 'pro';
        const hasValidExpiry = subscriptionStatus?.expiry && new Date(subscriptionStatus.expiry) > new Date();
        const isActiveStatus = subscriptionStatus?.subscription?.status === 'active';
        
        return hasProTier && hasValidExpiry && isActiveStatus;
    };

    // Alternative: Less strict validation (without requiring subscription status to be 'active')
    // const isSubscriptionActive = () => {
    //     const hasProTier = user?.subscriptionTier === 'pro' || subscriptionStatus?.tier === 'pro';
    //     const hasValidExpiry = subscriptionStatus?.expiry && new Date(subscriptionStatus.expiry) > new Date();
    //     return hasProTier && hasValidExpiry;
    // };

    // Pro subscription check: Must have pro tier AND valid expiry date AND active status
    // For less strict validation, remove the last condition: && subscriptionStatus?.subscription?.status === 'active'
    const isPro = isSubscriptionActive();

    return (
        <div className="bg-primary-dark">
            {/* --- Nurse Dashboard Header --- */}
            <div className="relative bg-[url('/nurse-dashboard-header.jpg')] bg-cover bg-center h-60">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-start p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-white">Nurse Dashboard</h1>
                        {isPro && (
                            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                                ⭐ PRO MEMBER
                            </span>
                        )}
                    </div>
                    <p className="text-lg text-gray-300 mt-2">Welcome back, {user?.name}!</p>
                    {isPro && subscriptionStatus?.expiry && (
                        <p className="text-sm text-yellow-400 mt-1">
                            Pro subscription active until {new Date(subscriptionStatus.expiry).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            <div className="container mx-auto p-4 md:p-8">
                {/* Pro Subscription Section */}
                {!loading && !isPro && ['doctor', 'nurse'].includes(user?.role) && (
                    <div className="mb-8 bg-gradient-to-r from-teal-600 to-blue-600 p-6 rounded-xl shadow-lg">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="text-white mb-4 md:mb-0">
                                <h3 className="text-2xl font-bold mb-2">🚀 Upgrade to Pro</h3>
                                <p className="text-teal-100">Get higher visibility, advanced analytics, and lower fees!</p>
                            </div>
                            <Link 
                                to="/upgrade-pro" 
                                className="bg-white text-teal-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                )}

                {/* Pro Features Status (for Pro users) */}
                {isPro && (
                    <div className="mb-8 bg-secondary-dark p-6 rounded-xl shadow-lg">
                        <h3 className="text-2xl font-bold text-white mb-6">Your Pro Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ProBenefitCard 
                                icon="🔍"
                                title="Higher Search Visibility"
                                description="Appear at the top of search results with Pro badge"
                                isActive={true}
                            />
                            <ProBenefitCard 
                                icon="📊"
                                title="Advanced Analytics"
                                description="Access to Demand Hotspot maps and insights"
                                isActive={true}
                            />
                            <ProBenefitCard 
                                icon="💰"
                                title="Lower Platform Fees"
                                description="Pay only 15% instead of 20% commission"
                                isActive={true}
                            />
                            <ProBenefitCard 
                                icon="👥"
                                title="Peer Review Forum"
                                description="Access to professional community features"
                                isActive={true}
                            />
                        </div>
                    </div>
                )}

                {/* --- Main Content Grid --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- Left Column: Stats & Quick Links --- */}
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        {/* Stats Section */}
                        <div className="bg-secondary-dark p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-white mb-4">Your Stats</h2>
                            <div className="space-y-4">
                                {/* Using placeholders for icons, replace with real icons if you have them */}
                                <VerticalStatCard value={<CountUp end={0} duration={2.5} />} label="Pending Requests" icon="🔔" />
                                <VerticalStatCard value={<CountUp end={0} duration={2.5} />} label="Upcoming Assignments" icon="🗓️" />
                                <VerticalStatCard value={<CountUp end={3200} duration={2.5} />} label="Earnings This Month" currency="₹" icon="💵" />
                                <VerticalStatCard value={<CountUp end={user?.averageRating?.toFixed(1) || 4.9} duration={2.5} decimals={1} />} label="Average Rating" icon="⭐" />
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
                                {isPro && (
                                    <Link to="/demand-hotspot" className="block w-full text-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-3 rounded font-bold hover:from-yellow-600 hover:to-yellow-700 transition">
                                        📊 Demand Hotspot Map
                                    </Link>
                                )}
                                {!isPro && ['doctor', 'nurse'].includes(user?.role) && (
                                    <Link to="/upgrade-pro" className="block w-full text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded font-bold hover:from-purple-700 hover:to-blue-700 transition">
                                        ⭐ Upgrade to Pro
                                    </Link>
                                )}
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