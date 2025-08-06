import React, { useState, useEffect } from 'react';
import { getMyCareCircle, inviteToCareCircle } from '../api';
import toast from 'react-hot-toast';
import IconUserPlus from '../components/icons/IconUserPlus.jsx';
import IconUserShield from '../components/icons/IconUserShield.jsx';
import IconUserMd from '../components/icons/IconUserMd.jsx';
import IconStethoscope from '../components/icons/IconStethoscope.jsx';

const CareCirclePage = () => {
    const [circle, setCircle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('Family');

    const fetchCircle = async () => {
        try {
            const { data } = await getMyCareCircle();
            setCircle(data);
        } catch (error) {
            toast.error("Could not load your Care Circle.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCircle();
    }, []);

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail) return toast.error("Please enter an email to invite.");
        
        try {
            await inviteToCareCircle({ email: inviteEmail, role: inviteRole });
            toast.success(`${inviteEmail} has been invited!`);
            setInviteEmail('');
            fetchCircle();
        } catch (error) {
            toast.error("Failed to send invite. Ensure the user has a Doc@Home account.");
        }
    };

    if (loading) return <div className="text-center p-10 text-white">Loading Your Care Circle...</div>;

    const roleIcons = {
        Family: <IconUserShield className="text-green-400" />,
        Doctor: <IconUserMd className="text-blue-400" />,
        Nurse: <IconStethoscope className="text-teal-400" />,
    };

    return (
        <div>
            {/* Page Header */}
            <div className="relative bg-[url('/care-circle-bg.jpg')] bg-cover bg-center h-60">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
                    <h1 className="text-5xl font-bold text-white">My Proactive Care Circle</h1>
                </div>
            </div>

            <div className="container mx-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Invite Form */}
                    <div className="lg:col-span-1 bg-secondary-dark p-6 rounded-lg shadow-lg h-fit">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <IconUserPlus className="mr-3 text-accent-blue"/> Invite a Member
                        </h2>
                        <p className="text-secondary-text text-sm mb-4">Add family members, doctors, or nurses to your circle to collaboratively manage your health.</p>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-secondary-text mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="Enter member's email" 
                                    className="w-full p-3 bg-primary-dark rounded-md border-gray-700 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-secondary-text mb-1">Role in Circle</label>
                                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full p-3 bg-primary-dark rounded-md border-gray-700 text-white">
                                    <option>Family</option>
                                    <option>Doctor</option>
                                    <option>Nurse</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-accent-blue text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-blue-hover">Send Invite</button>
                        </form>
                    </div>

                    {/* Right Column: Members List & Vitals */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-secondary-dark p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-white mb-4">Circle Members ({circle?.members.length || 0})</h2>
                            <div className="space-y-3">
                                {circle?.members.length > 0 ? (
                                    circle.members.map(member => (
                                        <div key={member._id} className="flex items-center justify-between bg-primary-dark p-3 rounded-md">
                                            <div className="flex items-center">
                                                <div className="text-2xl mr-4 w-8 text-center">{roleIcons[member.role]}</div>
                                                <div>
                                                    <p className="font-semibold text-white">{member.user ? member.user.name : member.email}</p>
                                                    <p className="text-sm text-secondary-text">{member.role}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${member.status === 'Active' ? 'bg-green-800 text-green-300' : 'bg-yellow-800 text-yellow-300'}`}>
                                                {member.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-secondary-text text-center py-4">Your circle is empty. Use the form to invite someone!</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-secondary-dark p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-white mb-4">Recent Vitals & Trends</h2>
                            <div className="text-center text-secondary-text py-16 border-2 border-dashed border-gray-700 rounded-lg">
                               <p>Vitals logged by your doctor or nurse will appear here.</p>
                               <p className="mt-2 text-sm">(A chart visualizing health trends will be available soon)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareCirclePage;