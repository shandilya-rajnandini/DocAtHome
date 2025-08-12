import React, { useState, useEffect } from 'react';
import { getMyAppointments, updateAppointmentStatus, getAppointmentSummary } from '../api';
import toast from 'react-hot-toast';
import DoctorNotesModal from '../components/DoctorNotesModal';
import Modal from '../components/Modal';
import useAuthStore from '../store/useAuthStore';

const DoctorAppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    const [filter, setFilter] = useState('Pending'); // To filter by status
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [selectedApptId, setSelectedApptId] = useState(null);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [summary, setSummary] = useState('');
    const [summaryLoading, setSummaryLoading] = useState(false);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const { data } = await getMyAppointments();
            // The API returns an object like { success, count, data: [...] }
            // We need to set the inner 'data' array to the state.
            setAppointments(data.data || []);
        } catch (error) {
            toast.error("Could not fetch appointments.");
            setAppointments([]); // Ensure state is an array even on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleStatusUpdate = async (id, newStatus, doctorNotes = '') => {
        const originalAppointments = [...appointments];
        
        // Optimistically update the UI
        const updatedAppointments = appointments.map(appt => 
            appt._id === id ? { ...appt, status: newStatus, doctorNotes } : appt
        );
        setAppointments(updatedAppointments);
        
        try {
            await updateAppointmentStatus(id, { status: newStatus, doctorNotes });
            toast.success(`Appointment successfully ${newStatus.toLowerCase()}!`);
        } catch (error) {
            toast.error("Failed to update status. Please try again.");
            setAppointments(originalAppointments);
        }
    };

    const openNotesModal = (id) => {
        setSelectedApptId(id);
        setIsNotesModalOpen(true);
    };

    const handleNotesSubmit = (notes) => {
        if (selectedApptId) {
            handleStatusUpdate(selectedApptId, 'Completed', notes);
        }
    };

    const handleViewSummary = async (id) => {
        setSummaryLoading(true);
        setIsSummaryModalOpen(true);
        try {
            const { data } = await getAppointmentSummary(id);
            setSummary(data.summary);
        } catch (error) {
            toast.error("Could not fetch summary.");
            setSummary('Failed to load summary.');
        } finally {
            setSummaryLoading(false);
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
                                            {appt.status !== 'Cancelled' && (
                                                <button onClick={() => handleViewSummary(appt._id)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 px-3 rounded">
                                                    View Summary
                                                </button>
                                            )}
                                            {appt.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => handleStatusUpdate(appt._id, 'Confirmed')} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-3 rounded">Confirm</button>
                                                    <button onClick={() => handleStatusUpdate(appt._id, 'Cancelled')} className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-3 rounded">Cancel</button>
                                                </>
                                            )}
                                            {appt.status === 'Confirmed' && (
                                                 <button onClick={() => openNotesModal(appt._id)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-3 rounded">Mark as Complete</button>
                                            )}
                                        </div>
                                    </div>
                                    {/* --- Display Doctor's Notes for Completed Appointments --- */}
                                    {appt.status === 'Completed' && appt.doctorNotes && (
                                        <div className="border-t border-gray-700 mt-4 pt-4">
                                            <h4 className="font-bold text-white mb-2">Your Notes:</h4>
                                            <p className="text-secondary-text bg-primary-dark p-3 rounded">{appt.doctorNotes}</p>
                                        </div>
                                    )}
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

            <DoctorNotesModal
                isOpen={isNotesModalOpen}
                onClose={() => setIsNotesModalOpen(false)}
                onSubmit={handleNotesSubmit}
            />

            <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="AI-Generated Patient Summary">
                {summaryLoading ? <p>Loading summary...</p> : <pre className="whitespace-pre-wrap font-sans">{summary}</pre>}
            </Modal>
        </div>
    );
};

export default DoctorAppointmentsPage;
