import React, { useState, useEffect } from 'react';
import { getMyAppointments } from '../api'; // This import will now work
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MyAppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const { data } = await getMyAppointments();
                setAppointments(data);
            } catch (error) {
                toast.error("Could not fetch your appointments.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchAppointments();
        }
    }, [user]);

    if (loading) return <div className="text-center p-10 text-white">Loading your appointments...</div>;

    return (
        <div>
            <div className="relative bg-primary-dark bg-cover bg-center h-60">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
                    <h1 className="text-5xl font-bold text-white">My Appointments</h1>
                </div>
            </div>
            <div className="container mx-auto p-8">
                <div className="bg-secondary-dark p-6 rounded-lg shadow-lg">
                    {appointments.length > 0 ? (
                        <div className="space-y-4">
                            {appointments.map(appt => (
                                <div key={appt._id} className="bg-primary-dark p-4 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                    {/* Column 1: Date */}
                                    <div className="text-center md:text-left">
                                        <p className="font-bold text-white">{new Date(appt.appointmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p className="text-secondary-text">{appt.appointmentTime}</p>
                                    </div>
                                    {/* Column 2: Professional Details */}
                                    <div>
                                        <p className="font-semibold text-white">{appt.doctor.name}</p>
                                        <p className="text-sm text-gray-400">{appt.doctor.specialty}</p>
                                    </div>
                                    {/* Column 3: Appointment Type */}
                                    <div className="text-center">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${appt.bookingType === 'In-Home Visit' ? 'bg-blue-900 text-blue-300' : 'bg-teal-900 text-teal-300'}`}>
                                            {appt.bookingType}
                                        </span>
                                    </div>
                                    {/* Column 4: Status */}
                                    <div className="text-center">
                                        <span className={`font-bold ${appt.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-secondary-text py-16">
                            <p className="text-lg">You have not booked any appointments yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyAppointmentsPage;