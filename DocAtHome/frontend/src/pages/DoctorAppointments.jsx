import React, { useState, useEffect, useMemo } from 'react';
import { getDoctorAppointments, updateAppointmentStatus } from '../api';
import toast from 'react-hot-toast';

const AppointmentCard = ({ appointment, onUpdate }) => {
    // ... (This component is very similar to the patient's version, but with doctor actions)
    return (
        <div className="bg-primary-dark p-5 rounded-lg">
            {/* ... Card Content ... */}
            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end items-center gap-3">
                {appointment.status === 'Payment Pending' && (
                    <>
                        <button onClick={() => onUpdate(appointment._id, 'Confirmed')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Accept</button>
                        <button onClick={() => onUpdate(appointment._id, 'Cancelled')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Decline</button>
                    </>
                )}
                 {appointment.status === 'Confirmed' && (
                    <button onClick={() => onUpdate(appointment._id, 'Completed')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Mark as Completed</button>
                 )}
            </div>
        </div>
    );
};


const DoctorAppointments = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const { data } = await getDoctorAppointments();
            setAppointments(data.data || []);
        } catch (error) {
            toast.error("Could not fetch appointments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateAppointmentStatus(id, status);
            toast.success(`Appointment has been ${status.toLowerCase()}.`);
            fetchAppointments(); // Refresh the list
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };
    
    const filteredAppointments = useMemo(() => {
        if (activeTab === 'pending') return appointments.filter(a => a.status === 'Payment Pending');
        if (activeTab === 'upcoming') return appointments.filter(a => a.status === 'Confirmed');
        if (activeTab === 'completed') return appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled');
        return [];
    }, [activeTab, appointments]);

    return (
        <div className="bg-primary-dark min-h-screen p-8">
            <div className="container mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">Manage Appointments</h1>
                {/* ... (Tab Navigation JSX similar to patient's page) ... */}
                {/* ... (Appointments List JSX using filteredAppointments and AppointmentCard) ... */}
            </div>
        </div>
    );
};

export default DoctorAppointments;