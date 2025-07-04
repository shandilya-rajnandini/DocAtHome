import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchDoctors } from '../api'; // We reuse the same API as the search page
import toast from 'react-hot-toast';

const VideoDoctorCard = ({ doctor }) => (
    <div className="bg-secondary-dark p-5 rounded-lg flex flex-col sm:flex-row items-center gap-5 transition-all hover:shadow-xl hover:bg-gray-700">
        <img src="/doctor-avatar.jpg" alt={doctor.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-600" />
        <div className="flex-grow text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">{doctor.name}</h3>
            <p className="text-secondary-text">{doctor.specialty}</p>
            <p className="text-sm text-gray-400">{doctor.experience} years of experience</p>
        </div>
        <div className="text-center sm:text-right mt-4 sm:mt-0">
            <p className="text-lg font-semibold text-white">₹{400} per consultation</p> {/* Example Fee */}
            <Link to={`/doctors/${doctor._id}`}>
                <button className="mt-2 w-full bg-accent-blue hover:bg-accent-blue-hover text-white font-bold py-2 px-6 rounded">
                    Book Video Call
                </button>
            </Link>
        </div>
    </div>
);

const VideoConsultPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideoDoctors = async () => {
            try {
                // Fetch all doctors for now. In a real app, you might have a specific API.
                const { data } = await searchDoctors({}); 
                setDoctors(data);
            } catch (error) {
                toast.error("Could not load available doctors.");
                console.error("Fetch video doctors error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideoDoctors();
    }, []);

    return (
        <div className="bg-primary-dark">
            {/* Header */}
            <div className="relative bg-[url('/video-consult-bg.jpg')] bg-cover bg-center h-72">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center text-center text-white p-4">
                    <h1 className="text-5xl font-bold">Online Video Consultation</h1>
                    <p className="mt-4 text-xl">Consult with top doctors from the comfort of your home.</p>
                </div>
            </div>
            
            <div className="container mx-auto p-8">
                {/* How it Works Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-white mb-8">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-center text-white">
                        <div className="bg-secondary-dark p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-accent-blue mb-2">1. Select a Doctor</h3>
                            <p className="text-secondary-text">Choose from our list of verified and experienced specialists.</p>
                        </div>
                        <div className="bg-secondary-dark p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-accent-blue mb-2">2. Book a Slot</h3>
                            <p className="text-secondary-text">Pick a convenient date and time on the doctor's profile.</p>
                        </div>
                        <div className="bg-secondary-dark p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-accent-blue mb-2">3. Start Your Call</h3>
                            <p className="text-secondary-text">Join the secure video call at the scheduled time from your dashboard.</p>
                        </div>
                    </div>
                </section>

                {/* Available Doctors Section */}
                <section>
                    <h2 className="text-3xl font-bold text-center text-white mb-8">Doctors Available for Video Consultation</h2>
                    {loading ? (
                        <p className="text-center text-white">Loading doctors...</p>
                    ) : (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            {doctors.length > 0 ? (
                                doctors.map(doc => <VideoDoctorCard key={doc._id} doctor={doc} />)
                            ) : (
                                <p className="text-center text-secondary-text">No doctors are currently available.</p>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default VideoConsultPage;