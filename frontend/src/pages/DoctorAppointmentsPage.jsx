import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const respondReschedule = async (id, response) => {
    try {
      await axios.post(`/api/appointments/${id}/respond-reschedule`, { response });
      toast.success(`Reschedule ${response}`);
      fetchAppointments();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const requestReschedule = async (appointment) => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):');
    const newTime = prompt('Enter new time (HH:MM):');
    if (!newDate || !newTime) return;
    try {
      await axios.post(`/api/appointments/${appointment._id}/reschedule`, {
        requestedBy: 'doctor',
        newDate,
        newTime,
      });
      toast.success('Reschedule request sent');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to send request');
    }
  };

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div className="appointments-page">
      <h2>Doctor Dashboard</h2>
      {appointments.map((appointment) => (
        <div key={appointment._id} className="appointment-card">
          <h4>{appointment.bookingType}</h4>
          <p>Patient: {appointment.patient?.name}</p>
          <p>Date: {appointment.appointmentDate}</p>
          <p>Time: {appointment.appointmentTime}</p>
          <p>Status: {appointment.status}</p>

          {/* Handle reschedule requests */}
          {appointment.rescheduleRequest?.status === 'pending' ? (
            <>
              <p>
                Reschedule requested by {appointment.rescheduleRequest.requestedBy} to{' '}
                {appointment.rescheduleRequest.newDate} at {appointment.rescheduleRequest.newTime}
              </p>
              <button onClick={() => respondReschedule(appointment._id, 'approved')}>
                Approve
              </button>
              <button onClick={() => respondReschedule(appointment._id, 'denied')}>
                Deny
              </button>
            </>
          ) : appointment.rescheduleRequest?.status === 'approved' ? (
            <p className="approved">
              Rescheduled to {appointment.rescheduleRequest.newDate} at {appointment.rescheduleRequest.newTime}
            </p>
          ) : appointment.rescheduleRequest?.status === 'denied' ? (
            <p className="denied">Reschedule Request Denied</p>
          ) : (
            <button onClick={() => requestReschedule(appointment)}>Request Reschedule</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default DoctorAppointmentsPage;
