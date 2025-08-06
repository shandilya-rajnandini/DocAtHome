import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorById, bookAppointment } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// --- Mock Data ---
const timeSlots = ["11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM"];
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

const DoctorProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [selectedDate, setSelectedDate] = useState(availableDates[0].fullDate);
    const [selectedTime, setSelectedTime] = useState('');
    const [bookingType, setBookingType] = useState('In-Home Visit');
    const [bookingDetails, setBookingDetails] = useState({
        symptoms: '',
        previousMeds: '',
        reportImage: null,
    });

    useEffect(() => {
        const fetchDoctor = async () => {
            setLoading(true);
            try {
                const { data } = await getDoctorById(id);
                setDoctor(data);
            } catch (error) {
                console.error("Failed to fetch doctor details", error);
                toast.error("Could not load doctor details.");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [id]);

    const handleBookingDetailChange = (e) => {
        if (e.target.name === 'reportImage') {
            setBookingDetails({ ...bookingDetails, reportImage: e.target.files[0] });
        } else {
            setBookingDetails({ ...bookingDetails, [e.target.name]: e.target.value });
        }
    };

    // --- MODIFIED BOOKING LOGIC (NO PAYMENT) ---
    const handleBookAppointment = async () => {
        if (!user) {
            toast.error("You must be logged in to book an appointment.");
            return navigate('/login');
        }
        if (!selectedTime) return toast.error("Please select a time slot.");
        if (!bookingDetails.symptoms) return toast.error("Please describe your symptoms.");

        const toastId = toast.loading("Booking your appointment...");

        const appointmentData = {
            doctor: doctor._id,
            appointmentDate: selectedDate,
            appointmentTime: selectedTime,
            bookingType,
            symptoms: bookingDetails.symptoms,
            previousMeds: bookingDetails.previousMeds,
            fee: bookingType === 'In-Home Visit' ? 2000 : 400,
        };

        try {
            await bookAppointment(appointmentData);
            toast.success(`Appointment successfully booked!`, { id: toastId });
            navigate('/my-appointments');
        } catch (error) {
            toast.error(error.response?.data?.msg || "Failed to book appointment.", { id: toastId });
            console.error("Booking failed:", error);
        }
    };

    if (loading) return <div className="text-center p-10 text-white text-xl">Loading Doctor's Profile...</div>;
    if (!doctor) return <div className="text-center p-10 text-red-500 text-xl">Could not find doctor details.</div>;

    const fee = bookingType === 'In-Home Visit' ? 2000 : 400;

    return (
        <div className="bg-primary-dark min-h-screen">
            <div className="container mx-auto p-4 md:p-8">
                {/* Doctor Header Card */}
                <div className="bg-secondary-dark p-6 md:p-8 rounded-lg shadow-lg flex flex-col md:flex-row gap-8">
                    <img src="/doctor-avatar.jpg" alt={doctor.name} className="w-40 h-40 rounded-full object-cover mx-auto md:mx-0 border-4 border-accent-blue" />
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-4xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
                            {doctor.name}
                            {doctor.isVerified && (
                                <span className="flex items-center gap-1 bg-green-700 bg-opacity-80 text-green-200 text-base font-semibold px-2 py-1 rounded ml-2">
                                    <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 6.293a1 1 0 00-1.414 0L9 12.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                                    Verified Professional
                                </span>
                            )}
                        </h1>
                        <p className="text-xl text-accent-blue mt-1">{doctor.specialty}</p>
                        <p className="text-md text-secondary-text">{doctor.experience} years experience in {doctor.city}</p>
                        <p className="text-secondary-text mt-4 max-w-2xl">A highly dedicated professional focusing on comprehensive medical care.</p>
                    </div>
                </div>

                {/* Booking Section */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-secondary-dark p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-4">Select Appointment Slot</h2>
                        <div className="flex space-x-2 overflow-x-auto pb-4">
                            {availableDates.map(date => (
                                <button key={date.fullDate} onClick={() => setSelectedDate(date.fullDate)} className={`p-4 rounded-lg text-center w-20 flex-shrink-0 ${selectedDate === date.fullDate ? 'bg-accent-blue text-white' : 'bg-primary-dark text-secondary-text'}`}>
                                    <p className="font-bold">{date.dayName}</p>
                                    <p className="text-2xl">{date.day}</p>
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-6">
                            {timeSlots.map(time => (
                                <button key={time} onClick={() => setSelectedTime(time)} className={`p-3 rounded-lg ${selectedTime === time ? 'bg-accent-blue text-white' : 'bg-primary-dark text-secondary-text border border-gray-700'}`}>
                                    {time}
                                </button>
                            ))}
                        </div>
                        <div className="mt-8 border-t border-gray-700 pt-6">
                            <h3 className="text-xl font-bold text-white mb-4">Tell us about your condition</h3>
                            <div className="space-y-4">
                                <textarea name="symptoms" onChange={handleBookingDetailChange} placeholder="Describe your symptoms or reason for visit..." rows="4" className="w-full p-3 bg-primary-dark rounded-md border-gray-700 text-white"></textarea>
                                <input type="text" name="previousMeds" onChange={handleBookingDetailChange} placeholder="List any previous medications (optional)" className="w-full p-3 bg-primary-dark rounded-md border-gray-700 text-white"/>
                                <div>
                                    <label className="block text-secondary-text mb-2">Upload previous report/photo (optional)</label>
                                    <input type="file" name="reportImage" onChange={handleBookingDetailChange} className="w-full text-secondary-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-blue file:text-white hover:file:bg-accent-blue-hover"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-secondary-dark p-6 rounded-lg shadow-lg h-fit">
                        <h2 className="text-2xl font-bold text-white mb-4">Booking Summary</h2>
                        <div className="space-y-4 text-secondary-text">
                            <div className="flex justify-between"><span>Doctor:</span><span className="text-white">{doctor.name}</span></div>
                            <div className="flex justify-between"><span>Date:</span><span className="text-white">{selectedDate}</span></div>
                            <div className="flex justify-between"><span>Time:</span><span className="text-white">{selectedTime || 'Not Selected'}</span></div>
                        </div>
                        <div className="mt-6">
                            <label className="block text-secondary-text mb-2 font-semibold">Appointment Type</label>
                            <div className="flex rounded-lg border border-gray-700">
                                <button onClick={() => setBookingType('In-Home Visit')} className={`w-1/2 p-3 rounded-l-lg ${bookingType === 'In-Home Visit' ? 'bg-accent-blue text-white' : 'bg-primary-dark'}`}>In-Home</button>
                                <button onClick={() => setBookingType('Video Consultation')} className={`w-1/2 p-3 rounded-r-lg ${bookingType === 'Video Consultation' ? 'bg-accent-blue text-white' : 'bg-primary-dark'}`}>Video Call</button>
                            </div>
                        </div>
                        <div className="border-t border-gray-700 my-6"></div>
                        <div className="flex justify-between items-center text-xl">
                            <span className="font-semibold text-white">Total Fee:</span>
                            <span className="font-bold text-accent-blue">₹{fee}</span>
                        </div>
                        <button onClick={handleBookAppointment} className="w-full bg-green-600 text-white p-3 mt-6 rounded font-bold hover:bg-green-700 transition duration-300">
                            Confirm & Book Appointment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfilePage;