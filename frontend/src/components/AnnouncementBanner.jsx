import React, { useState, useEffect } from 'react';
// Correctly import the specific function you need with curly braces
import { getAnnouncements } from '../api/index.js';

const AnnouncementBanner = () => {
    const [announcement, setAnnouncement] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const { data } = await getAnnouncements();
                // Filter only active announcements, pick the most recent (assuming sorted or just first after filter)
                const active = (data || []).filter(a => a.isActive);
                if (active.length > 0) {
                    const latestAnnouncement = active[0];
                    // Check if this announcement has been dismissed before
                    const isDismissed = localStorage.getItem(`announcement_${latestAnnouncement._id}`);
                    if (!isDismissed) {
                        setAnnouncement(latestAnnouncement);
                        setIsVisible(true);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch announcements", error);
            }
        };
        fetchAnnouncements();
    }, []);

    const handleDismiss = () => {
        if (announcement) {
            // Remember that the user has dismissed this specific announcement
            localStorage.setItem(`announcement_${announcement._id}`, 'true');
        }
        setIsVisible(false);
    };

    if (!isVisible || !announcement) {
        return null;
    }

    // Determine color based on severity
    const bgColor = announcement.severity === 'Warning' ? 'bg-yellow-500' : 'bg-blue-500';

    return (
        <div className={`${bgColor} text-white text-center p-3 relative`}>
            <p>{announcement.message}</p>
            <button onClick={handleDismiss} className="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-xl">
                &times;
            </button>
        </div>
    );
};

export default AnnouncementBanner;