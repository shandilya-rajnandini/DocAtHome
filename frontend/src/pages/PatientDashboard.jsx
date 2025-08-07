import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- New Reusable Feature Card Component ---
// This new card has a gradient background and a cleaner look.
const NewFeatureCard = ({ icon, title, description, link, color }) => (
    <Link 
        to={link} 
        className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300 flex flex-col`}
    >
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-200 text-sm flex-grow">{description}</p>
    </Link>
);


const PatientDashboard = () => {
  const { user } = useAuth();

  return (
    // The background is now a clean, dark slate color from our tailwind config
    <div className="bg-amber-200 dark:bg-primary-dark min-h-full py-12 px-4">
      <div className="container mx-auto">
        <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white">Hello, {user?.name}!</h1>
            <p className="text-lg text-gray-800 dark:text-secondary-text mt-2">Your personal health command center.</p>
        </div>
        <div className="mb-12 bg-secondary-dark text-center py-12 px-4 rounded-lg">
            <h2 className="text-3xl font-bold text-white mb-4">Not Sure Where to Start?</h2>
            <p className="text-secondary-text mb-8 max-w-2xl mx-auto">Let our Care Navigator guide you to the right professional based on your needs.</p>
            <Link
              to="/care-navigator"
              className="bg-accent-blue hover:bg-accent-blue-hover text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 inline-block"
            >
              Help Me Choose
            </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            <NewFeatureCard 
                icon="🩺"
                title="Find a Doctor"
                description="Search for specialists and book in-home visits."
                link="/search"
                color="from-blue-500 to-blue-700"
            />
            <NewFeatureCard 
                icon="👩‍⚕️"
                title="Find a Nurse"
                description="Book skilled nurses for post-operative or elderly care."
                link="/search-nurses"
                color="from-teal-500 to-teal-700"
            />
            <NewFeatureCard 
                icon="🔬"
                title="Book a Lab Test"
                description="Schedule convenient at-home sample collection."
                link="/book-lab-test"
                color="from-purple-500 to-purple-700"
            />
            <NewFeatureCard 
                icon="👨‍👩‍👧‍👦"
                title="Care Circle"
                description="Manage health collaboratively with your family."
                link="/care-circle"
                color="from-green-500 to-green-700"
            />
            <NewFeatureCard 
                icon="🗓️"
                title="My Appointments"
                description="View your upcoming and past appointment history."
                link="/my-appointments"
                color="from-gray-700 to-gray-800"
            />
            <NewFeatureCard 
                icon="📄"
                title="My Prescriptions"
                description="Access all your digital prescriptions in one place."
                link="/my-prescriptions"
                color="from-gray-700 to-gray-800"
            />
            <NewFeatureCard 
                icon="📹"
                title="Video Consultation"
                description="Connect with doctors instantly via a video call."
                link="/video-consult"
                color="from-gray-700 to-gray-800"
            />
            <NewFeatureCard 
                icon="🚑"
                title="Book Ambulance"
                description="Quick access to emergency ambulance services."
                link="/book-ambulance"
                color="from-red-500 to-red-700"
            />
            <NewFeatureCard 
                icon="💰"
                title="Care Fund"
                description="Manage your community-funded care balance."
                link="/care-fund"
                color="from-pink-500 to-pink-700"
            />

        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
