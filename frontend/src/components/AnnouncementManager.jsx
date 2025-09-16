import React, { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../api';
import { toast } from 'react-toastify';

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('Info');
  const [targetRole, setTargetRole] = useState('All Users');
  const [editingId, setEditingId] = useState(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await getAnnouncements();
      setAnnouncements(data);
    } catch {
      toast.error('Failed to fetch announcements');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const announcementData = { message, severity, targetRole, isActive };

    try {
      if (editingId) {
        await updateAnnouncement(editingId, announcementData);
        toast.success('Announcement updated successfully');
      } else {
        await createAnnouncement(announcementData);
        toast.success('Announcement created successfully');
      }
      resetForm();
      fetchAnnouncements();
    } catch {
      toast.error('Failed to save announcement');
    }
  };

  const handleEdit = (announcement) => {
    setEditingId(announcement._id);
    setMessage(announcement.message);
    setSeverity(announcement.severity);
    setTargetRole(announcement.targetRole);
    setIsActive(announcement.isActive);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
  await deleteAnnouncement(id);
  toast.success('Announcement deleted successfully');
        fetchAnnouncements();
      } catch {
        toast.error('Failed to delete announcement');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setMessage('');
    setSeverity('Info');
    setTargetRole('All Users');
    setIsActive(true);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {editingId ? 'Edit Announcement' : 'Create New Announcement'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 block w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white transition"
            rows="3"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Severity</label>
            <select
              id="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="mt-1 block w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white transition"
            >
              <option>Info</option>
              <option>Warning</option>
              <option>Error</option>
            </select>
          </div>
          <div>
            <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Audience</label>
            <select
              id="targetRole"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="mt-1 block w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white transition"
            >
              <option>All Users</option>
              <option>Patients Only</option>
              <option>Professionals Only</option>
            </select>
          </div>
        </div>
        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Set as Active
          </label>
        </div>
        <div className="flex items-center space-x-4 pt-2">
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">
            {editingId ? 'Update Announcement' : 'Publish Announcement'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-10">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Manage Announcements</h3>
        <div className="space-y-4">
          {announcements.length > 0 ? announcements.map((ann) => (
            <div key={ann._id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md flex justify-between items-center transition-colors duration-300">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{ann.message}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span>Severity: <span className="font-medium">{ann.severity}</span></span>
                  <span>Target: <span className="font-medium">{ann.targetRole}</span></span>
                  <span>Status: 
                    <span className={`font-medium px-2 py-0.5 rounded-full text-xs ml-1 ${ann.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                      {ann.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button onClick={() => handleEdit(ann)} className="p-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => handleDelete(ann._id)} className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          )) : <p className="text-gray-500 dark:text-gray-400">No announcements have been created yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementManager;
