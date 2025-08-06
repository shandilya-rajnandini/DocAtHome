import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookLabTest } from '../api';
import toast from 'react-hot-toast';

const timeSlots = ["08:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "12:00 PM - 02:00 PM", "02:00 PM - 04:00 PM"];

const BookLabTestPage = () => {
    const navigate = useNavigate();
    const [bookingData, setBookingData] = useState({
        testName: '',
        collectionDate: new Date().toISOString().split('T')[0],
        collectionTime: '',
        patientAddress: ''
    });

    const onChange = (e) => {
        setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bookingData.collectionTime || !bookingData.testName || !bookingData.patientAddress) {
            return toast.error("Please fill out all required fields.");
        }
        try {
            await bookLabTest(bookingData);
            toast.success("Lab test booked successfully! Our partner lab will contact you shortly.");
            navigate('/my-appointments'); // We can create a unified history page later
        } catch (error) {
            toast.error("Failed to book lab test. Please try again.");
            console.error(error);
        }
    };

    return (
        <div>
            {/* Page Header */}
            <div className="relative bg-[url('/lab-test-bg.jpg')] bg-cover bg-center h-72">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center text-center p-4">
                    <h1 className="text-4xl md:text-6xl font-bold text-white">Book an In-Home Lab Test</h1>
                    <p className="text-lg md:text-xl text-gray-300 mt-4">Convenient sample collection from the comfort of your home.</p>
                </div>
            </div>

            {/* Booking Form Section */}
            <div className="container mx-auto p-8">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-secondary-dark p-8 rounded-lg shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Column 1: Test & Address Details */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-secondary-text mb-2 font-semibold">Test Name*</label>
                                <input type="text" name="testName" value={bookingData.testName} onChange={onChange} placeholder="e.g., Complete Blood Count (CBC), Thyroid Profile" className="w-full p-3 bg-primary-dark rounded-md border-gray-700 text-white" />
                            </div>
                            <div>
                                <label className="block text-secondary-text mb-2 font-semibold">Collection Address*</label>
                                <textarea name="patientAddress" value={bookingData.patientAddress} onChange={onChange} placeholder="Enter your full address for sample collection" rows="4" className="w-full p-3 bg-primary-dark rounded-md border-gray-700 text-white"></textarea>
                            </div>
                        </div>

                        {/* Column 2: Schedule */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-secondary-text mb-2 font-semibold">Preferred Collection Date*</label>
                                <input type="date" name="collectionDate" value={bookingData.collectionDate} onChange={onChange} className="w-full p-3 bg-primary-dark rounded-md border-gray-700 text-white" />
                            </div>
                             <div>
                                <label className="block text-secondary-text mb-2 font-semibold">Preferred Time Slot*</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {timeSlots.map(time => (
                                        <button key={time} type="button" onClick={() => setBookingData({...bookingData, collectionTime: time})}
                                            className={`p-3 rounded-lg text-center transition-colors ${bookingData.collectionTime === time ? 'bg-accent-blue text-white' : 'bg-primary-dark text-secondary-text border border-gray-700 hover:border-accent-blue'}`}>
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fee and Submit Section */}
                    <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col items-center">
                         <div className="text-center">
                            <p className="text-secondary-text">Total Payable Amount</p>
                            <p className="text-4xl font-bold text-accent-blue mt-1">₹800</p>
                            <p className="text-xs text-gray-500">(Includes Visit & Transportation Charges)</p>
                         </div>
                        <button type="submit" className="w-full md:w-1/2 mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition">
                            Confirm & Book Test
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookLabTestPage;