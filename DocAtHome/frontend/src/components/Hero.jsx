import React from 'react';

const Hero = () => {
  return (
    // You will need a good background image. Replace 'hero-background.jpg'
    <div className="relative bg-[url('/hero-background.jpg')] bg-cover bg-center h-[60vh] text-white">
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center">
        <h1 className="text-5xl md:text-7xl font-bold">Your Trusted Healthcare at Home</h1>
        <div className="w-24 h-1 bg-accent-cream my-4"></div>
        <p className="text-xl md:text-2xl">Connecting Patients with Verified Professionals</p>
      </div>
    </div>
  );
};

export default Hero;