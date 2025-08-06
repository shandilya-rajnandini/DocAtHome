import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAppointment } from '../../api';
import toast from 'react-hot-toast';

const AmbulanceBookingForm = () => {
    const navigate = useNavigate();
    const [bookingData, setBookingData] = useState({
        patientName: '',
        patientContact: '',
        pickupLocation: '',
    });

    const onChange = (e) => setBookingData({ ...bookingData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createAppointment({
                ...bookingData,
                bookingType: 'Ambulance',
                fee: 1500, // Example fee
            });
            toast.success('Ambulance booking request received! We will call you shortly to confirm.');
            navigate('/my-appointments');
        } catch (error) {
            toast.error('Booking failed. Please fill all required fields.');
            console.error("Ambulance booking error:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-black bg-opacity-70 p-8 rounded-lg w-full max-w-sm">
            <h2 className="text-2xl text-white font-bold mb-4">Quick Booking</h2>
            <p className="text-white mb-4">Or Call <a href="tel:+919700001298" className="text-red-500 font-bold hover:underline">+91 97000 01298</a></p>
            <div className="space-y-4">
                <input type="text" name="patientName" placeholder="Patient's Full Name*" onChange={onChange} required className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white" />
                <input type="text" name="patientContact" placeholder="Contact Number*" onChange={onChange} required className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white" />
                <textarea name="pickupLocation" placeholder="Full Pickup Address*" onChange={onChange} required rows="3" className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white"></textarea>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded">REQUEST AMBULANCE</button>
            </div>
        </form>
    );
};

export default AmbulanceBookingForm;