import React, { useState, useEffect, useCallback } from 'react';
import { getMyCareCircle, inviteToCareCircle } from '../api';
import { getCallHistory, getActiveCall, joinVideoCall } from '../api';
import toast from 'react-hot-toast';
import IconUserPlus from '../components/icons/IconUserPlus.jsx';
import IconUserShield from '../components/icons/IconUserShield.jsx';
import IconUserMd from '../components/icons/IconUserMd.jsx';
import IconStethoscope from '../components/icons/IconStethoscope.jsx';
import VideoCall from '../components/VideoCall.jsx';
import CallNotification from '../components/CallNotification.jsx';

const CareCirclePage = () => {
    const [circle, setCircle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('Family');
    const [callHistory, setCallHistory] = useState([]);
    const [activeCall, setActiveCall] = useState(null);
    const [currentCall, setCurrentCall] = useState(null);

    const fetchCircle = async () => {
        try {
            const { data } = await getMyCareCircle();
            setCircle(data);
            
            // Fetch call history
            try {
                const historyResponse = await getCallHistory(data.patient || 'me');
                setCallHistory(historyResponse.data.calls || []);
            } catch (historyError) {
                console.error('Error fetching call history:', historyError);
            }
            
            // Check for active calls
            try {
                const activeResponse = await getActiveCall(data.patient || 'me');
                setActiveCall(activeResponse.data.call || null);
            } catch (activeError) {
                console.error('Error fetching active call:', activeError);
            }
        } catch {
            toast.error("Could not load your Care Circle.");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinCall = useCallback(async (callId) => {
        try {
            await joinVideoCall(callId);
            setCurrentCall(callId);
        } catch (error) {
            console.error('Error joining call:', error);
            toast.error('Failed to join call');
        }
    }, []);

    useEffect(() => {
        fetchCircle();
        
        // Poll for active calls every 30 seconds
        const pollInterval = setInterval(async () => {
            try {
                const activeResponse = await getActiveCall(circle?.patient || 'me');
                const newActiveCall = activeResponse.data.call || null;
                
                // Show notification if there's a new active call
                if (newActiveCall && !activeCall && !currentCall) {
                    toast.custom((t) => (
                        <CallNotification
                            call={newActiveCall}
                            onJoin={(callId) => {
                                handleJoinCall(callId);
                                toast.dismiss(t.id);
                            }}
                            onDismiss={() => toast.dismiss(t.id)}
                        />
                    ), {
                        duration: 30000, // 30 seconds
                        position: 'top-right'
                    });
                }
                
                setActiveCall(newActiveCall);
            } catch (error) {
                console.error('Error polling for active calls:', error);
            }
        }, 30000); // Poll every 30 seconds
        
        return () => clearInterval(pollInterval);
    }, [circle?.patient, circle, activeCall, currentCall, handleJoinCall]);

    const handleCallEnd = () => {
        setCurrentCall(null);
        fetchCircle(); // Refresh data
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        try {
            await inviteToCareCircle({ email: inviteEmail });
            toast.success('Invitation sent successfully!');
            setInviteEmail('');
            fetchCircle(); // Refresh the circle data
        } catch (error) {
            console.error('Error sending invitation:', error);
            toast.error('Failed to send invitation');
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
            {/* Video Call Modal */}
            {currentCall && (
                <VideoCall
                    callId={currentCall}
                    patientId={circle?.patient}
                    onCallEnd={handleCallEnd}
                />
            )}

            {/* Page Header */}
            <div className="relative bg-[url('/care-circle-bg.jpg')] bg-cover bg-center h-60">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
                    <h1 className="text-5xl font-bold text-white">My Proactive Care Circle</h1>
                </div>
            </div>

            <div className="container mx-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Invite Form */}
                    <div className="lg:col-span-1 bg-accent-cream dark:bg-secondary-dark p-6 rounded-lg shadow-lg h-fit">
                        <h2 className="text-2xl font-bold text-black dark:text-white mb-4 flex items-center">
                            <IconUserPlus className="mr-3 text-accent-blue"/> Invite a Member
                        </h2>
                        <p className="text-secondary-text text-sm mb-4">Add family members, doctors, or nurses to your circle to collaboratively manage your health.</p>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block  text-black dark:text-secondary-text  mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="Enter member's email" 
                                    className="w-full p-3 bg-gray-300 dark:bg-primary-dark text-black dark:text-white rounded-md border-gray-700 "
                                />
                            </div>
                            <div>
                                <label className="block text-black dark:text-secondary-text mb-1">Role in Circle</label>
                                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full p-3 bg-gray-300 dark:bg-primary-dark rounded-md border-gray-700 text-black dark:text-white">
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
                        <div className=" bg-accent-cream dark:bg-secondary-dark p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Circle Members ({circle?.members.length || 0})</h2>
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

                        {/* Active Call Notification */}
                        {activeCall && !currentCall && (
                            <div className="bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <strong className="font-bold">📹 Active Family Bridge Call!</strong>
                                        <span className="block sm:inline ml-0 sm:ml-2">
                                            {activeCall.professional?.name} is currently in a call with the patient.
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleJoinCall(activeCall.callId)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                                    >
                                        Join Call
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Call History */}
                        <div className="bg-accent-cream dark:bg-secondary-dark p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Call History</h2>
                            {callHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {callHistory.slice(0, 5).map((call, index) => (
                                        <div key={index} className="flex items-center justify-between bg-primary-dark p-3 rounded-md">
                                            <div className="flex items-center">
                                                <div className="text-2xl mr-4">📹</div>
                                                <div>
                                                    <p className="font-semibold text-white">
                                                        {new Date(call.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-sm text-secondary-text">
                                                        {call.professional?.name} • {call.participants.length} participants • 
                                                        {call.status === 'ended' ? `${Math.floor((call.duration || 0) / 60)}m ${((call.duration || 0) % 60)}s` : call.status}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                call.status === 'ended' 
                                                    ? 'bg-gray-800 text-gray-300' 
                                                    : call.status === 'active'
                                                    ? 'bg-green-800 text-green-300'
                                                    : 'bg-yellow-800 text-yellow-300'
                                            }`}>
                                                {call.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-secondary-text text-center py-4">
                                    No call history available. Family Bridge Calls will appear here.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareCirclePage;