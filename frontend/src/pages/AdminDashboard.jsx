import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPendingUsers, approveUser } from '../api';
import AnnouncementManager from '../components/AnnouncementManager';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
    const [pending, setPending] = useState([]);
    const [message, setMessage] = useState('');

    // Helper function to get flag descriptions
    const getFlagDescription = (flag) => {
        const flagDescriptions = {
            'DUPLICATE_GOV_ID': 'Duplicate Government ID detected',
            'DUPLICATE_PHONE': 'Duplicate phone number detected',
            'DISPOSABLE_EMAIL': 'Disposable/temporary email detected',
            'INVALID_LICENSE_FORMAT': 'License number format appears invalid',
            'SUSPICIOUS_ACTIVITY': 'Suspicious activity detected'
        };
        return flagDescriptions[flag] || flag;
    };

    const fetchPending = async () => {
        try {
            const { data } = await getPendingUsers();
            setPending(data);
        } catch (error) {
            console.error("Failed to fetch pending users", error);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (id) => {
        try {
            const { data } = await approveUser(id);
            setMessage(data.msg);
            // Refresh the list
            fetchPending();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Approval failed", error);
            setMessage('Approval failed');
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
            <div className="flex flex-wrap justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
                <Link 
                    to="/admin/edit-profile" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md"
                >
                    Edit Profile
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Approvals Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pending Approvals</h2>
                    {message && <div className="bg-green-500 text-white p-3 rounded-lg mb-4">{message}</div>}
                    <div>
                        {pending.length === 0 ? <p className="text-gray-500 dark:text-gray-400">No pending approvals.</p> : (
                            <ul className="space-y-4">
                                {pending.map(user => (
                                    <li key={user._id} className={`p-4 rounded-lg border-2 ${user.flags && user.flags.length > 0 ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <p className="font-bold text-lg text-gray-900 dark:text-white">{user.name} ({user.role})</p>
                                                    {user.flags && user.flags.length > 0 && (
                                                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" aria-label="Fraud detection flags present" />                                                    )}
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 mb-2">{user.email} | {user.specialty} | {user.city}</p>
                                                {user.flags && user.flags.length > 0 && (
                                                    <div className="mb-2">
                                                        <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">⚠️ Fraud Detection Flags:</p>
                                                        <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                                                            {user.flags.map((flag, index) => (
                                                                <li key={index} className="flex items-center gap-1">
                                                                    <span>•</span>
                                                                    <span>{getFlagDescription(flag)}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Registered: {new Date(user.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleApprove(user._id)}
                                                className={`font-bold py-2 px-4 rounded-lg transition ml-4 ${user.flags && user.flags.length > 0 ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                            >
                                                {user.flags && user.flags.length > 0 ? 'Review & Approve' : 'Approve'}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Announcement Manager Section */}
                <div>
                    <AnnouncementManager />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
