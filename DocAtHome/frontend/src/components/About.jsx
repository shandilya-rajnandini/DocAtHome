import React from 'react';

const About = () => {
  return (
    <section className="bg-primary-dark text-primary-text py-20 px-4">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Replace with a relevant image */}
        <div className="w-full">
          <img src="/about-us-image.jpg" alt="Doctor listening to patient" className="rounded-lg shadow-lg w-full" />
        </div>
        <div>
          <h2 className="text-4xl font-bold mb-4">About Doc@Home</h2>
          <div className="w-20 h-1 bg-accent-cream mb-6"></div>
          <p className="text-secondary-text leading-relaxed">
            Doc@Home is your reliable platform connecting patients with verified healthcare professionals, facilitating premium, attentive medical services in the comfort of patients' homes. Whether it's elder care, chronic illness management, or in-home consultations, our trusted professionals ensure every patient receives precise, personalized care. Empowering skilled doctors and nurses, we aim to deliver exceptional healthcare experiences while addressing service accessibility effectively.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;