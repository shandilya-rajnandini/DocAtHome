import React, { useState } from 'react';
import axios from 'axios';
import './RescheduleModal.css'; // optional if you want to style it

function RescheduleModal({ appointment, onClose }) {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const handleSubmit = async () => {
    if (!newDate || !newTime) {
      alert('Please select both date and time.');
      return;
    }

    try {
      await axios.post(`/api/appointments/${appointment._id}/reschedule`, {
        requestedBy: localStorage.getItem('userRole'), // 'doctor' or 'patient'
        newDate,
        newTime,
      });
      alert('Reschedule request submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting reschedule request:', error);
      alert('Failed to submit reschedule request.');
    }
  };

  return (
    <div className="reschedule-modal-overlay">
      <div className="reschedule-modal">
        <h3>Reschedule Appointment</h3>

        <label>New Date</label>
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
        />

        <label>New Time</label>
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
        />

        <div className="modal-buttons">
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default RescheduleModal;
