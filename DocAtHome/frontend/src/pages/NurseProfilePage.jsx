import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNurseById, bookAppointment } from '../api'; // Correctly imports getNurseById
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// --- Mock Data ---
const timeSlots = ["09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM"];
const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        dates.push({
            dayName: futureDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            day: futureDate.getDate(),
            fullDate: futureDate.toISOString().split('T')[0],
        });
    }
    return dates;
};
const availableDates = generateDates();

const NurseProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [nurse, setNurse] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [selectedDate, setSelectedDate] = useState(availableDates[0].fullDate);
    const [selectedTime, setSelectedTime] = useState('');
    const [bookingDetails, setBookingDetails] = useState({ symptoms: '' });

    useEffect(() => {
        const fetchNurse = async () => {
            setLoading(true);
            try {
                // This now correctly calls the generic API endpoint via getNurseById
                const { data } = await getNurseById(id);
                setNurse(data);
            } catch (error) {
                toast.error("Could not load nurse details.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNurse();
    }, [id]);

    const handleBookAssignment = async () => {
        if (!user) {
            toast.error("You must be logged in to book an assignment.");
            return navigate('/login');
        }
        if (!selectedTime) return toast.error("Please select a time slot.");
        if (!bookingDetails.symptoms) return toast.error("Please describe the care required.");
        
        const toastId = toast.loading("Booking nurse assignment...");

        const appointmentData = {
            doctor: nurse._id, // The 'doctor' field holds the professional's ID
            appointmentDate: selectedDate,
            appointmentTime: selectedTime,
            bookingType: 'In-Home Visit',
            symptoms: bookingDetails.symptoms,
            fee: 600,
        };

        try {
            await bookAppointment(appointmentData);
            toast.success(`Nurse assignment booked successfully!`, { id: toastId });
            navigate('/my-appointments');
        } catch (error) {
            toast.error(error.response?.data?.msg || "Failed to book assignment.", { id: toastId });
        }
    };

    if (loading) return <div className="text-center p-10 text-white">Loading Nurse Profile...</div>;
    if (!nurse) return <div className="text-center p-10 text-red-500">Nurse not found.</div>;

    const fee = 600;

    return (
        <div className="bg-primary-dark min-h-screen">
            <div className="container mx-auto p-4 md:p-8">
                {/* Nurse Header */}
                <div className="bg-secondary-dark p-6 md:p-8 rounded-lg shadow-lg flex flex-col md:flex-row gap-8 items-center">
                    <img src="/nurse-avatar.jpg" alt={nurse.name} className="w-40 h-40 rounded-full object-cover border-4 border-teal-400" />
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-4xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
                            {nurse.name}
                            {nurse.isVerified && (
                                <span className="flex items-center gap-1 bg-green-700 bg-opacity-80 text-green-200 text-base font-semibold px-2 py-1 rounded ml-2">
                                    <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 6.293a1 1 0 00-1.414 0L9 12.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                                    Verified Professional
                                </span>
                            )}
                        </h1>
                        <p className="text-xl text-teal-400 mt-1">{nurse.specialty}</p>
                        <p className="text-md text-secondary-text">{nurse.experience} years experience in {nurse.city}</p>
                    </div>
                </div>

                {/* Booking Section */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-secondary-dark p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-4">Select Assignment Slot</h2>
                        <div className="flex space-x-2 overflow-x-auto pb-4">
                            {availableDates.map(date => (
                                <button key={date.fullDate} onClick={() => setSelectedDate(date.fullDate)} className={`p-4 rounded-lg text-center w-20 flex-shrink-0 ${selectedDate === date.fullDate ? 'bg-teal-500 text-white' : 'bg-primary-dark text-secondary-text'}`}>
                                    <p className="font-bold">{date.dayName}</p>
                                    <p className="text-2xl">{date.day}</p>
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                            {timeSlots.map(time => (
                                <button key={time} onClick={() => setSelectedTime(time)} className={`p-3 rounded-lg ${selectedTime === time ? 'bg-teal-500 text-white' : 'bg-primary-dark text-secondary-text border border-gray-700'}`}>
                                    {time}
                                </button>
                            ))}
                        </div>
                        <div className="mt-8 border-t border-gray-700 pt-6">
                            <h3 className="text-xl font-bold text-white mb-4">Describe Care Requirements</h3>
                            <textarea name="symptoms" onChange={(e) => setBookingDetails({symptoms: e.target.value})} placeholder="e.g., Post-operative wound care, vitals monitoring..." rows="4" className="w-full p-3 bg-primary-dark rounded-md border-gray-700 text-white"></textarea>
                        </div>
                    </div>
                    <div className="lg:col-span-1 bg-secondary-dark p-6 rounded-lg shadow-lg h-fit">
                        <h2 className="text-2xl font-bold text-white mb-4">Booking Summary</h2>
                        <div className="space-y-4 text-secondary-text">
                            <div className="flex justify-between"><span>Nurse:</span><span className="text-white">{nurse.name}</span></div>
                            <div className="flex justify-between"><span>Date:</span><span className="text-white">{selectedDate}</span></div>
                            <div className="flex justify-between"><span>Arrival Time:</span><span className="text-white">{selectedTime || 'Not Selected'}</span></div>
                        </div>
                        <div className="border-t border-gray-700 my-6"></div>
                        <div className="flex justify-between items-center text-xl">
                            <span className="font-semibold text-white">Service Fee (per day):</span>
                            <span className="font-bold text-teal-400">₹{fee}</span>
                        </div>
                        <button onClick={handleBookAssignment} className="w-full bg-green-600 text-white p-3 mt-6 rounded font-bold hover:bg-green-700 transition">
                            Confirm & Book Nurse
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NurseProfilePage;