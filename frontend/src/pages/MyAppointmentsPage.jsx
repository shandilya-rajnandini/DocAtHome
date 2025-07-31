import React, { useState, useEffect } from 'react';
import { getMyAppointments } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import IconCalendarCheck from '../components/icons/IconCalendarCheck';
import IconHistory from '../components/icons/IconHistory';
import IconStethoscope from '../components/icons/IconStethoscope';

const AppointmentCard = ({ appointment }) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const isPast = appointmentDate < new Date();

    return (
        <div className="bg-primary-dark p-5 rounded-lg shadow-lg border border-gray-700 hover:border-accent transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                    <IconStethoscope className="w-8 h-8 text-accent mr-4" />
                    <div>
                        <h3 className="text-xl font-bold text-white">{appointment.doctor.name}</h3>
                        <p className="text-secondary-text">{appointment.doctor.specialty}</p>
                    </div>
                </div>
                <div className={`text-sm font-semibold px-3 py-1 rounded-full h-fit ${
                    appointment.status === 'Completed' ? 'bg-green-900 text-green-300' :
                    appointment.status === 'Confirmed' ? 'bg-blue-900 text-blue-300' :
                    'bg-yellow-900 text-yellow-300'
                }`}>
                    {appointment.status}
                </div>
            </div>
            <div className="border-t border-gray-700 my-4"></div>
            <div className="flex justify-between items-center text-secondary-text">
                <div>
                    <p className="font-semibold text-white">{appointmentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p>{appointment.appointmentTime}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-white">Booking Type</p>
                    <p>{appointment.bookingType}</p>
                </div>
            </div>
            {appointment.status === 'Completed' && appointment.doctorNotes && (
                <>
                    <div className="border-t border-gray-700 my-4"></div>
                    <div>
                        <h4 className="font-bold text-white mb-2">Doctor's Notes:</h4>
                        <p className="text-secondary-text bg-primary-dark rounded">{appointment.doctorNotes}</p>
                    </div>
                </>
            )}
        </div>
    );
};

const MyAppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Upcoming');
    const { user } = useAuth();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const { data } = await getMyAppointments();
                setAppointments(data.data || []); // Handle the case where data.data might not exist
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

    const filteredAppointments = appointments.filter(appt => {
        const appointmentDate = new Date(appt.appointmentDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        if (activeTab === 'Upcoming') {
            return appointmentDate >= now;
        } else { // 'Past'
            return appointmentDate < now;
        }
    });

    if (loading) {
        return <div className="text-center p-10 text-white">Loading your appointments...</div>;
    }

    return (
        <div className="bg-background-dark min-h-screen">
            <div className="relative bg-my-appointments-bg bg-cover bg-center h-60">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
                    <h1 className="text-5xl font-bold text-white tracking-wider">My Appointments</h1>
                </div>
            </div>
            <div className="container mx-auto p-4 sm:p-8">
                <div className="bg-secondary-dark p-6 rounded-lg shadow-2xl">
                    <div className="flex border-b border-gray-700 mb-6">
                        <button
                            onClick={() => setActiveTab('Upcoming')}
                            className={`flex items-center py-3 px-6 font-semibold text-lg transition-all duration-300 ${activeTab === 'Upcoming' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-white'}`}
                        >
                            <IconCalendarCheck className="w-5 h-5 mr-2" />
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab('Past')}
                            className={`flex items-center py-3 px-6 font-semibold text-lg transition-all duration-300 ${activeTab === 'Past' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-white'}`}
                        >
                            <IconHistory className="w-5 h-5 mr-2" />
                            Past
                        </button>
                    </div>

                    {filteredAppointments.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredAppointments.map(appt => (
                                <AppointmentCard key={appt._id} appointment={appt} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-secondary-text py-20">
                            <h2 className="text-2xl font-semibold mb-2">No {activeTab} Appointments</h2>
                            <p>It looks like you don't have any appointments here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyAppointmentsPage;
