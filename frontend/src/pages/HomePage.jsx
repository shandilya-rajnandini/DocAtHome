import React from 'react';
import { Link } from 'react-router-dom';

// Import all the homepage section components
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Chatbot from '../components/Chatbot';
// Notice we are NOT importing Footer here anymore.

const HomePage = () => {
  return (
    <div>
      {/* This page now only assembles the sections specific to the homepage. */}
      <Hero />
  <div className="bg-[#A6CFD5] dark:bg-primary-dark text-center py-16 px-4">
        <h2 className="text-3xl font-bold text-black dark:text-white mb-4">Not Sure Where to Start?</h2>
        <p className="text-slate-700 dark:text-secondary-text mb-8 max-w-2xl mx-auto">Let our Care Navigator guide you to the right professional based on your needs.</p>
        <Link
          to="/care-navigator"
          className="bg-accent-blue hover:bg-accent-blue-hover text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 inline-block"
        >
          Help Me Choose
        </Link>
      </div>
      <About />
      <Services />
      <Testimonials />
      <Contact />
      <Chatbot />
    </div>
  );
};

export default HomePage;
