import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createProSubscription, verifySubscription, getSubscriptionStatus } from '../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProUpgradePage = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [fetchingStatus, setFetchingStatus] = useState(true);

    useEffect(() => {
        // Redirect if not a professional
        if (user && !['doctor', 'nurse'].includes(user.role)) {
            toast.error('Pro subscription is only available for healthcare professionals');
            navigate('/dashboard');
            return;
        }

        // Fetch current subscription status
        fetchSubscriptionStatus();
    }, [user, navigate]);

    const fetchSubscriptionStatus = async () => {
        try {
            const { data } = await getSubscriptionStatus();
            setSubscriptionStatus(data.data);
        } catch (error) {
            console.error('Error fetching subscription status:', error);
        } finally {
            setFetchingStatus(false);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async () => {
        if (!user) {
            toast.error('Please login to upgrade');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Setting up your Pro subscription...');

        try {
            // For development testing, use test mode
            const isDevelopment = import.meta.env.DEV;
            const testMode = isDevelopment ? '?test=true' : '';
            
            // Create subscription
            const { data } = await createProSubscription(testMode);
            const { subscriptionId, shortUrl, testMode: isTestMode } = data.data;

            // If in test mode, skip Razorpay and directly verify
            if (isTestMode) {
                // Mock verification for test mode
                const verifyResponse = await verifySubscription({
                    razorpay_payment_id: 'test_payment_' + Date.now(),
                    razorpay_subscription_id: subscriptionId,
                    razorpay_signature: 'test_signature'
                });

                toast.dismiss(toastId);
                toast.success('Pro subscription activated successfully! (Test Mode)');
                
                // Update user context
                if (setUser) {
                    setUser(verifyResponse.data.user);
                }
                
                // Redirect to dashboard
                navigate('/nurse-dashboard');
                return;
            }

            // Load Razorpay script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    subscription_id: subscriptionId,
                    name: 'Doc@Home Pro',
                    description: 'Monthly Pro subscription',
                    image: '/vite.svg',
                    handler: async function (response) {
                        try {
                            const verifyResponse = await verifySubscription({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_subscription_id: response.razorpay_subscription_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            toast.dismiss(toastId);
                            toast.success('Pro subscription activated successfully!');
                            
                            // Update user context
                            if (setUser) {
                                setUser(verifyResponse.data.user);
                            }
                            
                            // Redirect to dashboard
                            navigate('/nurse-dashboard');
                        } catch (error) {
                            toast.dismiss(toastId);
                            toast.error('Payment verification failed');
                            console.error('Verification error:', error);
                        }
                    },
                    prefill: {
                        email: user.email,
                        name: user.name
                    },
                    theme: {
                        color: '#3B82F6'
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            };

        } catch (error) {
            toast.dismiss(toastId);
            toast.error('Failed to create subscription');
            console.error('Subscription creation error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingStatus) {
        return (
            <div className="min-h-screen bg-accent-cream dark:bg-primary-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading subscription status...</p>
                </div>
            </div>
        );
    }

    // If already Pro subscriber
    if (subscriptionStatus?.tier === 'pro') {
        return (
            <div className="min-h-screen bg-accent-cream dark:bg-primary-dark py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            You're Already a Pro! 🎉
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                            You have access to all Pro features until {new Date(subscriptionStatus.expiry).toLocaleDateString()}
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="bg-accent-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent-blue-hover transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-accent-cream dark:bg-primary-dark py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Upgrade to Doc@Home Pro
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        Unlock premium features and grow your practice
                    </p>
                </div>

                {/* Pricing Card */}
                <div className="bg-white dark:bg-secondary-dark rounded-xl shadow-2xl overflow-hidden max-w-md mx-auto mb-12">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Pro Plan</h2>
                        <div className="text-5xl font-bold text-white mb-2">₹999</div>
                        <p className="text-blue-100">per month</p>
                        <p className="text-sm text-blue-100 mt-2">Lower platform fees • Higher visibility</p>
                    </div>
                    <div className="px-6 py-8">
                        <button
                            onClick={handleUpgrade}
                            disabled={loading}
                            className="w-full bg-accent-blue text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-accent-blue-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Upgrade to Pro'}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                            Cancel anytime • No setup fees
                        </p>
                    </div>
                </div>

                {/* Features Section */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-lg p-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pro Features</h3>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4 mt-1">
                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Higher Visibility in Search Results</h4>
                                    <p className="text-gray-600 dark:text-gray-300">Get "Pro" badge and appear at the top of search results</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4 mt-1">
                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Access to Advanced Analytics</h4>
                                    <p className="text-gray-600 dark:text-gray-300">Get insights with the "Demand Hotspot" map feature</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4 mt-1">
                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Lower Platform Commission</h4>
                                    <p className="text-gray-600 dark:text-gray-300">Pay only 15% instead of 20% platform fees</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4 mt-1">
                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Peer-to-Peer Case Review Forum</h4>
                                    <p className="text-gray-600 dark:text-gray-300">Access exclusive professional community features</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-lg p-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Why Upgrade?</h3>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📈 Increase Your Patient Base</h4>
                                <p className="text-gray-600 dark:text-gray-300">Pro doctors get 3x more visibility in search results and patient inquiries.</p>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💰 Save on Fees</h4>
                                <p className="text-gray-600 dark:text-gray-300">Lower commission means more earnings from each consultation.</p>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🎯 Data-Driven Insights</h4>
                                <p className="text-gray-600 dark:text-gray-300">See where demand is highest and optimize your service areas.</p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">👥 Professional Network</h4>
                                <p className="text-gray-600 dark:text-gray-300">Connect with peers and share knowledge in exclusive forums.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h3>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Can I cancel anytime?</h4>
                            <p className="text-gray-600 dark:text-gray-300">Yes, you can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing cycle.</p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What payment methods do you accept?</h4>
                            <p className="text-gray-600 dark:text-gray-300">We accept all major credit cards, debit cards, UPI, and net banking through our secure payment partner Razorpay.</p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Will I see results immediately?</h4>
                            <p className="text-gray-600 dark:text-gray-300">Yes! Your Pro badge and higher search ranking will be active immediately after successful payment.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProUpgradePage;
