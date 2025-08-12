import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
import { getPaymentHistory } from '../api/index';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const PaymentHistoryPage = () => {
    const { user } = useAuthStore();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            if (!user) return;

            setLoading(true);
            try {
                const { data } = await getPaymentHistory();
                setPayments(data?.data || []);
            } catch (error) {
                toast.error('Failed to fetch payment history.');
                console.error('Payment history fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [user]);

    if (loading) return <div className="text-center p-10 text-black dark:text-white">Loading payment history...</div>;

    return (
        <div className="bg-accent-cream dark:bg-primary-dark min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">📜 Your Payment History</h1>

                {payments.length === 0 ? (
                    <div className="text-center text-slate-600 dark:text-secondary-text">No payments found.</div>
                ) : (
                    <div className="bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg divide-y divide-gray-300 dark:divide-gray-700">
                        {payments.map((payment, idx) => (
                            <div key={payment._id || idx} className="py-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-black dark:text-white">
                                            Order ID: <span className="text-teal-600 dark:text-teal-400">{payment.razorpayOrderId}</span>
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-secondary-text">Payment ID: {payment.razorpayPaymentId}</p>
                                        <p className="text-sm text-slate-600 dark:text-secondary-text">
                                            Date: {new Date(payment.createdAt).toLocaleString()}
                                        </p>
                                        {payment.description && (
                                            <p className="text-sm text-slate-600 dark:text-secondary-text">Note: {payment.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                                            ₹{payment.amount / 100}
                                        </p>
                                        <p
                                            className={`text-sm font-medium ${
                                                payment.status === 'success'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}
                                        >
                                            {payment.status === 'success' ? 'Paid' : 'Failed'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistoryPage;
