import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdherenceData } from '../api';

// --- New Reusable Feature Card Component ---
// This new card has a gradient background and a cleaner look.
const NewFeatureCard = ({ icon, title, description, link, color }) => (
    <Link 
        to={link} 
        className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300 flex flex-col focus:ring-2 focus:ring-offset-2 focus:outline-none`}
        role="article"
        aria-labelledby={`card-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
        <span className="text-4xl mb-4" role="img" aria-label={title}>{icon}</span>
        <h3 id={`card-title-${title.toLowerCase().replace(/\s+/g, '-')}`} className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-200 text-sm flex-grow">{description}</p>
    </Link>
);

const PatientDashboard = () => {
  const { user } = useAuth();
  const [adherenceData, setAdherenceData] = useState(null);

  useEffect(() => {
    const fetchAdherence = async () => {
      try {
        const { data } = await getAdherenceData(30);
        setAdherenceData(data);
      } catch (error) {
        console.error('Error fetching adherence data:', error);
      }
    };
    fetchAdherence();
  }, []);

  return (
    <main className="bg-amber-200 dark:bg-primary-dark min-h-full pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white">Hello, {user?.name}!</h1>
          <p className="text-lg text-gray-800 dark:text-secondary-text mt-2">Your personal health command center.</p>
        </header>

        {/* Medication Adherence Section */}
        {adherenceData && (
          <section className="mb-12 bg-gradient-to-r from-green-500 to-blue-600 text-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold">Medication Adherence</h2>
                <p className="text-green-100">Track your medication routine</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold">{adherenceData.adherenceScore}%</div>
                <div className="text-lg text-green-100">
                  {adherenceData.streak > 0 ? `🔥 ${adherenceData.streak} day streak!` : 'Keep it up!'}
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full h-4 mb-4">
              <div 
                className="bg-white h-4 rounded-full transition-all duration-1000"
                style={{ width: `${adherenceData.adherenceScore}%` }}
              ></div>
            </div>
            <Link
              to="/my-prescriptions"
              className="inline-block bg-white text-green-600 font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Today's Checklist
            </Link>
          </section>
        )}

        <section aria-labelledby="care-navigator-title" className="mb-12 bg-secondary-dark text-center py-12 px-4 rounded-lg">
          <h2 id="care-navigator-title" className="text-3xl font-bold text-white mb-4">Not Sure Where to Start?</h2>
          <p className="text-secondary-text mb-8 max-w-2xl mx-auto">Let our Care Navigator guide you to the right professional based on your needs.</p>
          <Link
            to="/care-navigator"
            className="bg-accent-blue hover:bg-accent-blue-hover text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 inline-block focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:outline-none"
            role="button"
            aria-label="Get help choosing the right healthcare professional"
          >
            Help Me Choose
          </Link>
        </section>

        <section aria-label="Healthcare Services" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <NewFeatureCard 
            icon="🩺"
            title="Find a Doctor"
            description="Search for specialists and book in-home visits."
            link="/search"
            color="from-blue-600 to-blue-800"
          />
          <NewFeatureCard 
            icon="👩‍⚕️"
            title="Find a Nurse"
            description="Book skilled nurses for post-operative or elderly care."
            link="/search-nurses"
            color="from-teal-600 to-teal-800"
          />
          <NewFeatureCard 
            icon="🔬"
            title="Book a Lab Test"
            description="Schedule convenient at-home sample collection."
            link="/book-lab-test"
            color="from-purple-600 to-purple-800"
          />
          <NewFeatureCard 
            icon="👨‍👩‍👧‍👦"
            title="Care Circle"
            description="Manage health collaboratively with your family."
            link="/care-circle"
            color="from-green-600 to-green-800"
          />
          <NewFeatureCard 
            icon="🗓️"
            title="My Appointments"
            description="View your upcoming and past appointment history."
            link="/my-appointments"
            color="from-gray-800 to-gray-900"
          />
          <NewFeatureCard 
            icon="📄"
            title="My Prescriptions"
            description="Access all your digital prescriptions in one place."
            link="/my-prescriptions"
            color="from-gray-800 to-gray-900"
          />
          <NewFeatureCard 
            icon="📹"
            title="Video Consultation"
            description="Connect with doctors instantly via a video call."
            link="/video-consult"
            color="from-gray-800 to-gray-900"
          />
          <NewFeatureCard 
            icon="🚑"
            title="Book Ambulance"
            description="Quick access to emergency ambulance services."
            link="/book-ambulance"
            color="from-red-600 to-red-800"
          />
          <NewFeatureCard 
            icon="💰"
            title="Care Fund"
            description="Manage your community-funded care balance."
            link="/care-fund"
            color="from-pink-600 to-pink-800"
          />
          <NewFeatureCard 
            icon="📋"
            title="Health Records"
            description="Securely store and manage your medical documents."
            link="/my-health-records"
            color="from-indigo-600 to-indigo-800"
          />
          <NewFeatureCard 
            icon="💰"
            title="Payment History"
            description="Quick access to all your payment history."
            link="/payment-history"
            color="from-blue-600 to-blue-800"
          />
          <NewFeatureCard
            icon="🤝"
            title="Support Community"
            description="Connect anonymously with others facing similar health challenges."
            link="/support-community"
            color="from-orange-600 to-orange-800"
          />
          <NewFeatureCard
            icon="🔍"
            title="Second Opinion"
            description="Get expert analysis from top specialists within 48 hours."
            link="/second-opinion-request"
            color="from-purple-600 to-purple-800"
          />
        </section>
      </div>
    </main>
  );
};
export default PatientDashboard;