import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import api from '../api';
import useAuthStore from '../store/useAuthStore';

const AnnouncementCard = ({ announcement, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Allow time for fade-out animation before calling parent dismiss
    setTimeout(() => onDismiss(announcement._id), 500);
  };

  const getBannerStyles = (severity) => {
    switch (severity) {
      case 'Warning':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900',
          border: 'border-yellow-500',
          iconColor: 'text-yellow-500',
          textColor: 'text-yellow-800 dark:text-yellow-200',
        };
      case 'Error':
        return {
          bg: 'bg-red-100 dark:bg-red-900',
          border: 'border-red-500',
          iconColor: 'text-red-500',
          textColor: 'text-red-800 dark:text-red-200',
        };
      default: // Info
        return {
          bg: 'bg-blue-100 dark:bg-blue-900',
          border: 'border-blue-500',
          iconColor: 'text-blue-500',
          textColor: 'text-blue-800 dark:text-blue-200',
        };
    }
  };

  const styles = getBannerStyles(announcement.severity);

  return (
    <div
      className={`w-full max-w-md rounded-lg shadow-2xl border-l-4 ${styles.bg} ${styles.border} transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
    >
      <div className="p-4 flex items-start">
        <div className={`flex-shrink-0 ${styles.iconColor}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${styles.textColor}`}>{announcement.message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className={`inline-flex rounded-md p-1.5 ${styles.textColor} hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white`}
          >
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const { user, loading: authLoading } = useAuthStore();

  useEffect(() => {
    const fetchAndFilterAnnouncements = async () => {
      if (authLoading || !user) {
        setAnnouncements([]);
        return;
      }

      try {
        const { data: activeAnnouncements } = await api.get('/announcements/active');
        if (!activeAnnouncements || activeAnnouncements.length === 0) return;

        const userRole = user?.role; // Can be 'patient', 'doctor', etc.
        const userId = user?._id;
        const relevantAnnouncements = activeAnnouncements.filter(ann => {
          const dismissed = localStorage.getItem(`announcement_${userId}_${ann._id}`);
          if (dismissed) {
            return false;
          }

          // Check against the announcement's target audience
          switch (ann.targetRole) {
            case 'All Users':
              return true;
            case 'Patients Only':
              return userRole === 'patient';
            case 'Professionals Only':
              return userRole === 'doctor' || userRole === 'nurse';
            default:
              return false;
          }
        });
        
        setAnnouncements(relevantAnnouncements);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    };

    fetchAndFilterAnnouncements();
  }, [user, authLoading]);

  const handleDismiss = (id) => {
    const userId = user?._id;
    if (userId) {
      localStorage.setItem(`announcement_${userId}_${id}`, 'true');
    }
    setAnnouncements(prev => prev.filter(ann => ann._id !== id));
  };

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-5 z-50 flex flex-col items-end space-y-4">
      {announcements.map(ann => (
        <AnnouncementCard key={ann._id} announcement={ann} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};

export default AnnouncementBanner;
