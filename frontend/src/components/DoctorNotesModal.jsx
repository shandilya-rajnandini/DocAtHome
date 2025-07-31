import React, { useState } from 'react';

const DoctorNotesModal = ({ isOpen, onClose, onSubmit }) => {
  const [notes, setNotes] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    onSubmit(notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-secondary-dark rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h3 className="text-2xl font-bold text-white mb-4">Add Your Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 bg-primary-dark rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white"
          rows="6"
          placeholder="Enter your observations, diagnosis, and prescription..."
        ></textarea>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="text-gray-400 hover:text-white mr-4">Cancel</button>
          <button onClick={handleSubmit} className="bg-accent-blue hover:bg-accent-blue-hover text-white font-bold py-2 px-4 rounded">
            Submit & Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorNotesModal;
