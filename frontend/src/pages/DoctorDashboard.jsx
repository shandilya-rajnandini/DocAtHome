import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSubscriptionStatus } from '../api';
import EmptyState from "../components/EmptyState";
import { Calendar } from "lucide-react";
import CountUp from "react-countup";

const StatCard = ({ value, label, currency = "" }) => (
  <div className="bg-secondary-dark p-4 md:p-6 rounded-xl text-center shadow-lg">
    <p className="text-3xl md:text-4xl font-bold text-accent-blue">
      {currency}
      {typeof value === 'number' ? <CountUp end={value} duration={2.5} decimals={value % 1 !== 0 ? 1 : 0} /> : value}
    </p>
    <p className="text-secondary-text mt-1 text-sm md:text-base">{label}</p>
  </div>
);

const ProBenefitCard = ({ icon, title, description, isActive }) => (
    <div className={`p-3 md:p-4 rounded-lg border-2 ${isActive ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'}`}>
        <div className="flex items-start gap-2 md:gap-3">
            <span className="text-xl md:text-2xl">{icon}</span>
            <div>
                <h4 className={`font-semibold text-sm md:text-base ${isActive ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-600 dark:text-gray-300'}`}>
                    {title}
                </h4>
                <p className={`text-xs md:text-sm ${isActive ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
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

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const role = user?.role || 'professional'; // 'doctor' or 'nurse'

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
        <div className="bg-primary-dark min-h-full pt-24 pb-12 px-4">
            <div className="container mx-auto">
                <div className="mb-8 md:mb-12">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mb-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                            {role.charAt(0).toUpperCase() + role.slice(1)}'s Dashboard
                        </h1>
                        {isPro && (
                            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-2">
                                ⭐ PRO MEMBER
                            </span>
                        )}
                    </div>
                    <p className="text-base md:text-lg text-secondary-text mt-2">Welcome, {user?.name}!</p>
                    {isPro && subscriptionStatus?.expiry && (
                        <p className="text-xs md:text-sm text-yellow-400 mt-1">
                            Pro subscription active until {new Date(subscriptionStatus.expiry).toLocaleDateString()}
                        </p>
                    )}
                </div>

                {/* Pro Subscription Section */}
                {!loading && !isPro && ['doctor', 'nurse'].includes(user?.role) && (
                    <div className="mb-6 md:mb-8 bg-gradient-to-r from-blue-600 to-purple-600 p-4 md:p-6 rounded-xl shadow-lg">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="text-white mb-4 md:mb-0">
                                <h3 className="text-xl md:text-2xl font-bold mb-2">🚀 Upgrade to Pro</h3>
                                <p className="text-blue-100 text-sm md:text-base">Get higher visibility, advanced analytics, and lower fees!</p>
                            </div>
                            <Link
                                to="/upgrade-pro"
                                className="bg-white text-blue-600 px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold hover:bg-blue-50 transition text-sm md:text-base"
                            >
                                Upgrade Now
                            </Link>
                        </div>
                    </div>
                )}

                {/* Pro Benefits Section */}
                {isPro && (
                    <div className="mb-6 md:mb-8">
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Pro Benefits</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                            <ProBenefitCard
                                icon="⭐"
                                title="Higher Visibility"
                                description="Your profile appears first in search results"
                                isActive={true}
                            />
                            <ProBenefitCard
                                icon="📊"
                                title="Advanced Analytics"
                                description="Detailed insights about your performance"
                                isActive={true}
                            />
                            <ProBenefitCard
                                icon="💰"
                                title="Lower Fees"
                                description="Reduced platform fees on all transactions"
                                isActive={true}
                            />
                        </div>
                    </div>
                )}

                {/* --- Stats Section --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                    <StatCard
                        value="0"
                        label={
                            role === "doctor" ? "Pending Requests" : "Pending Assignments"
                        }
                    />
                    <StatCard value="0" label="Upcoming Appointments" />
                    <StatCard
                        value={role === "doctor" ? "24,500" : "15,800"}
                        label="Earnings This Month"
                        currency="₹"
                    />
                    <StatCard
                        value={<CountUp end={user?.patientsTreated || 0} duration={2.5} />}
                        label="Total patients you have treated"
                    />
                    <StatCard
                        value={<CountUp end={user?.appointmentsCompleted || 0} duration={2.5} />}
                        label="Appointments completed successfully"
                    />
                    <StatCard
                        value={<CountUp end={user?.averageRating?.toFixed(1) || 4.9} duration={2.5} decimals={1} />}
                        label="Your average patient rating"
                    />
                </div>

                {/* --- Actions & Schedule --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Quick Links */}
                    <div className="md:col-span-1 lg:col-span-1 bg-secondary-dark p-4 md:p-6 rounded-xl shadow-lg h-fit">
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                            Quick Actions
                        </h2>
                        <div className="space-y-2 md:space-y-3">
                            <Link
                                to={user.role === 'patient' ? '/my-appointments' : `/${role}/appointments`}
                                className="block w-full text-left p-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                            >
                                Manage Appointments
                            </Link>
                            <Link
                                to={`/${role}/availability`}
                                className="block w-full text-left p-4 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition"
                            >
                                Update Availability
                            </Link>
                            <Link
                                to={`/${role}/edit-profile`}
                                className="block w-full text-left p-4 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition"
                            >
                                Edit My Profile
                            </Link>
                            <Link
                                to="/specialist/second-opinions"
                                className="block w-full text-left p-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
                            >
                                🔍 Second Opinions
                            </Link>
                        </div>
                    </div>
                    {/* Today's Appointments */}
                    <div className="md:col-span-1 lg:col-span-2 bg-secondary-dark p-4 md:p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                            Today's Schedule
                        </h2>
                        <div className="text-center text-secondary-text py-12 md:py-20 border-2 border-dashed border-gray-700 rounded-lg">
                            <EmptyState
                                icon={Calendar}
                                title="No Appointments Today"
                                message="Your confirmed visits for today will appear here."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;