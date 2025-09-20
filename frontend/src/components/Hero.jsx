import React from 'react';

const Hero = () => {
  return (
    <section className="relative bg-[url('/hero-background.jpg')] bg-cover bg-center h-[60vh] text-white">
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">Your Trusted Healthcare at Home</h1>
        <div className="w-24 h-1 bg-accent-cream my-4"></div>
        <p className="text-lg md:text-xl lg:text-2xl leading-relaxed max-w-2xl">Connecting Patients with Verified Professionals</p>
      </div>
    </section>
  );
};

export default Hero;