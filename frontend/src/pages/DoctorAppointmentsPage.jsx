import React, { useState, useEffect } from 'react';
import { getMyAppointments, updateAppointmentStatus } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DoctorAppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [filter, setFilter] = useState('Pending'); // To filter by status

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const { data } = await getMyAppointments();
            setAppointments(data);
        } catch (error) {
            toast.error("Could not fetch appointments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        const originalAppointments = [...appointments];
        
        // Optimistically update the UI for a faster user experience
        const updatedAppointments = appointments.map(appt => 
            appt._id === id ? { ...appt, status: newStatus } : appt
        );
        setAppointments(updatedAppointments);
        
        try {
            await updateAppointmentStatus(id, newStatus);
            toast.success(`Appointment successfully ${newStatus.toLowerCase()}!`);
        } catch (error) {
            toast.error("Failed to update status. Please try again.");
            // Revert the UI if the API call fails
            setAppointments(originalAppointments);
        }
    };

    const filteredAppointments = appointments.filter(appt => appt.status === filter);

    return (
        <div className="bg-primary-dark min-h-screen">
            <div className="container mx-auto p-4 md:p-8">
                <h1 className="text-4xl font-bold text-white mb-8">Manage Your Appointments</h1>

                {/* --- Filter Tabs --- */}
                <div className="flex border-b border-gray-700 mb-6">
                    {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(status => (
                        <button 
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`py-2 px-6 font-semibold ${filter === status ? 'border-b-2 border-accent-blue text-accent-blue' : 'text-secondary-text'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* --- Appointments List --- */}
                {loading ? (
                    <div className="text-center text-white">Loading...</div>
                ) : (
                    <div className="space-y-4">
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map(appt => (
                                <div key={appt._id} className="bg-secondary-dark p-4 rounded-lg shadow-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
                                        {/* Patient Details */}
                                        <div className="lg:col-span-2">
                                            <p className="font-bold text-lg text-white">{appt.patient.name}</p>
                                            <p className="text-sm text-gray-400">{appt.symptoms.substring(0, 50)}...</p>
                                        </div>
                                        {/* Date & Time */}
                                        <div>
                                            <p className="font-semibold text-white">{new Date(appt.appointmentDate).toLocaleDateString()}</p>
                                            <p className="text-secondary-text">{appt.appointmentTime}</p>
                                        </div>
                                        {/* Booking Type */}
                                        <div className="text-center">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${appt.bookingType === 'In-Home Visit' ? 'bg-blue-900 text-blue-300' : 'bg-teal-900 text-teal-300'}`}>
                                                {appt.bookingType}
                                            </span>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex flex-col md:flex-row gap-2 justify-end">
                                            {appt.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => handleStatusUpdate(appt._id, 'Confirmed')} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-3 rounded">Confirm</button>
                                                    <button onClick={() => handleStatusUpdate(appt._id, 'Cancelled')} className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-3 rounded">Cancel</button>
                                                </>
                                            )}
                                            {appt.status === 'Confirmed' && (
                                                 <button onClick={() => handleStatusUpdate(appt._id, 'Completed')} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-3 rounded">Mark as Complete</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-secondary-text py-16">
                                <p className="text-lg">No appointments with "{filter}" status.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorAppointmentsPage;