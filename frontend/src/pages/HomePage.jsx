import React from "react";
import { Link } from "react-router-dom";

// Import all the homepage section components
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Chatbot from '../components/Chatbot';

const HomePage = () => {
  return (
    <main role="main" className="home-page" tabIndex="-1">
      <h1 className="sr-only" id="homepage-title">DocAtHome - Your Healthcare Platform</h1>
      <Hero />
      <section aria-labelledby="start-section" className="bg-primary-dark text-center py-16 px-4">
        <h2 id="start-section" className="text-3xl font-bold text-white mb-4">Not Sure Where to Start?</h2>
        <p className="text-secondary-text mb-8 max-w-2xl mx-auto">Let our Care Navigator guide you to the right professional based on your needs.</p>
        <Link
          to="/care-navigator"
          className="bg-accent-blue hover:bg-accent-blue-hover text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 inline-block focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:outline-none"
          role="button"
          aria-label="Get help choosing the right healthcare professional"
          tabIndex="0"
        >
          Help Me Choose
        </Link>
      </section>
      <About />
      <Services />
      <Testimonials />
      <Contact />
      <Chatbot />
    </main>
  );
};

export default HomePage;