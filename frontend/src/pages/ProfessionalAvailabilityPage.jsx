import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getAvailability, updateAvailability } from '../api';

const Calendar = ({ availableDays, onDayClick }) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className="grid grid-cols-7 gap-2 text-center">
      {days.map((day) => (
        <div key={day} className="font-bold text-secondary-text">
          {day}
        </div>
      ))}
      {[...Array(30).keys()].map((i) => {
        const day = i + 1;
        const isAvailable = availableDays.includes(day);
        return (
          <button
            key={i}
            onClick={() => onDayClick(day)}
            className={`p-4 rounded-lg transition-colors ${isAvailable ? "bg-green-500 text-white" : "bg-primary-dark hover:bg-gray-700 text-gray-500"}`}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
};

const ProfessionalAvailabilityPage = () => {
    const { user } = useAuth();
    const [availableDays, setAvailableDays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        getAvailability(user._id)
            .then(res => {
                // Assume availableDates is array of { date: "YYYY-MM-DD" }
                const days = res.data.availableDates?.map(d => new Date(d.date).getDate()) || [];
                setAvailableDays(days);
            })
            .catch(() => toast.error("Could not fetch availability."))
            .finally(() => setLoading(false));
    }, [user]);

  const toggleDay = (day) => {
    setAvailableDays((prevDays) =>
      prevDays.includes(day)
        ? prevDays.filter((d) => d !== day)
        : [...prevDays, day],
    );
  };

    const handleSaveChanges = async () => {
        if (!user) return toast.error("You must be logged in.");
        // Convert availableDays to array of date strings for current month
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const availableDates = availableDays.map(day => {
            const date = new Date(year, month, day);
            return { date: date.toISOString().split('T')[0] };
        });
        try {
            await updateAvailability(user._id, { availableDates });
            toast.success("Availability updated successfully!");
        } catch {
            toast.error("Failed to update availability.");
        }
    };

    if (loading) return <div className="text-center p-10 text-white">Loading availability...</div>;

  return (
    <div>
      <div className="relative bg-[url('/availability-header-bg.jpg')] bg-cover bg-center h-60">
        <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
          <h1 className="text-5xl font-bold text-white">
            Update Your Availability
          </h1>
        </div>
      </div>
      <div className="container mx-auto p-8">
        <div className="max-w-4xl mx-auto bg-secondary-dark p-8 rounded-lg shadow-lg">
          <p className="text-secondary-text mb-6">
            Click on the dates in the calendar below to toggle your
            availability. Green dates indicate you are available for bookings.
          </p>
          <Calendar availableDays={availableDays} onDayClick={toggleDay} />
          <div className="text-right mt-8">
            <button
              onClick={handleSaveChanges}
              className="bg-accent-blue hover:bg-accent-blue-hover text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAvailabilityPage;
