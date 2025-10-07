import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get('/api/appointments/my-appointments');
      setAppointments(data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load appointments');
      setLoading(false);
    }
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const submitReschedule = async () => {
    if (!newDate || !newTime) return toast.warn('Select both date and time!');
    try {
      await axios.post(`/api/appointments/${selectedAppointment._id}/reschedule`, {
        requestedBy: 'patient',
        newDate,
        newTime,
      });
      toast.success('Reschedule request submitted');
      setModalOpen(false);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to request reschedule');
    }
  };

  const respondReschedule = async (id, response) => {
    try {
      await axios.post(`/api/appointments/${id}/respond-reschedule`, { response });
      toast.success(`Reschedule ${response}`);
      fetchAppointments();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div className="appointments-page">
      <h2>My Appointments</h2>
      {appointments.map((appointment) => (
        <div key={appointment._id} className="appointment-card">
          <h4>{appointment.bookingType}</h4>
          <p>Date: {appointment.appointmentDate}</p>
          <p>Time: {appointment.appointmentTime}</p>
          <p>Status: {appointment.status}</p>

          {/* Handle reschedule logic */}
          {appointment.rescheduleRequest?.status === 'pending' ? (
            <p className="pending">Reschedule Requested (Waiting for doctor)</p>
          ) : appointment.rescheduleRequest?.status === 'approved' ? (
            <p className="approved">Rescheduled to {appointment.rescheduleRequest.newDate} at {appointment.rescheduleRequest.newTime}</p>
          ) : appointment.rescheduleRequest?.status === 'denied' ? (
            <p className="denied">Reschedule Request Denied</p>
          ) : (
            appointment.status !== 'Cancelled' && (
              <button onClick={() => openRescheduleModal(appointment)}>Reschedule</button>
            )
          )}
        </div>
      ))}

      {/* Reschedule Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <h3>Reschedule Appointment</h3>
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
        />
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={submitReschedule}>Submit</button>
          <button onClick={() => setModalOpen(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default MyAppointmentsPage;
