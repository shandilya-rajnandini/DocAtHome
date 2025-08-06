import React from 'react';
import toast from 'react-hot-toast';
// We don't actually need to import the booking function here,
// as the form is just a placeholder. But if we were to make it functional,
// we would import 'bookAppointment'.
// For now, let's just make a simple submit handler.

const AmbulanceHero = () => {

  const handleAmbulanceSubmit = (e) => {
    e.preventDefault();
    // This is a placeholder action. In a real app, this would collect
    // form data and send it to a specific ambulance booking API.
    toast.success("Thank you! Our team will contact you shortly.");
    e.target.reset(); // Resets the form fields
  };

  return (
    <div className="relative bg-[url('/ambulance-hero-bg.jpg')] bg-cover bg-center h-[80vh]">
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="relative z-10 container mx-auto flex items-center h-full p-4">
        <div className="w-full md:w-1/2 text-white">
          <h1 className="text-5xl md:text-7xl font-bold">BOOK AN AMBULANCE</h1>
          <p className="mt-4 text-lg">Fast, Reliable, and Professional Emergency Medical Transportation. Available 24/7.</p>
        </div>
        <div className="hidden md:flex w-1/2 justify-end">
          {/* We've added an onSubmit handler to the form */}
          <form onSubmit={handleAmbulanceSubmit} className="bg-black bg-opacity-70 p-8 rounded-lg w-full max-w-sm">
            <h2 className="text-2xl text-white font-bold mb-4">Quick Booking</h2>
            <p className="text-white mb-4">Or Call <a href="tel:+919700001298" className="text-red-500 font-bold hover:underline">+91 97000 01298</a></p>
            <div className="space-y-4">
              <input type="text" placeholder="Name*" required className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white" />
              <input type="text" placeholder="Contact Number*" required className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white" />
              <input type="email" placeholder="Email ID*" required className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white" />
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded">SUBMIT</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceHero;