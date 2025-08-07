import React from 'react';

// Import all the homepage section components
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
// Notice we are NOT importing Footer here anymore.

const HomePage = () => {
  return (
    <div>
      {/* 
        This page now only assembles the sections specific to the homepage.
        The main layout (Navbar and Footer) is handled by App.jsx.
      */}
      <Hero />
      <About />
      <Services />
      <Testimonials />
      <Contact />
    </div>
  );
};

export default HomePage;