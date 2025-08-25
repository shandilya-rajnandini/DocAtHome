import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPendingUsers, approveUser } from '../api';
import AnnouncementManager from '../components/AnnouncementManager';

const AdminDashboard = () => {
    const [pending, setPending] = useState([]);
    const [message, setMessage] = useState('');

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
                                    <li key={user._id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <div>
                                            <p className="font-bold text-lg text-gray-900 dark:text-white">{user.name} ({user.role})</p>
                                            <p className="text-gray-600 dark:text-gray-300">{user.email} | {user.specialty} | {user.city}</p>
                                        </div>
                                        <button onClick={() => handleApprove(user._id)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
                                            Approve
                                        </button>
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
