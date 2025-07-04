import { useState, useEffect } from 'react';
import { getPendingUsers, approveUser } from '../api';

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
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
            <h2 className="text-2xl text-accent-blue mb-4">Pending Approvals</h2>
            {message && <div className="bg-green-500 text-white p-3 rounded mb-4">{message}</div>}
            <div className="bg-secondary-dark p-4 rounded-lg">
                {pending.length === 0 ? <p className="text-secondary-text">No pending approvals.</p> : (
                    <ul className="space-y-4">
                        {pending.map(user => (
                            <li key={user._id} className="flex justify-between items-center bg-primary-dark p-4 rounded">
                                <div>
                                    <p className="font-bold text-lg text-white">{user.name} ({user.role})</p>
                                    <p className="text-secondary-text">{user.email} | {user.specialty} | {user.city}</p>
                                </div>
                                <button onClick={() => handleApprove(user._id)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                    Approve
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;